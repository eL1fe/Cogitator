# Disaster Recovery Guide

This document outlines backup strategies, recovery procedures, and failure scenarios for Cogitator deployments.

## Backup Strategies

### PostgreSQL Backup

PostgreSQL stores agent configurations, run history, and long-term memory.

#### Automated Backups (pg_dump)

```bash
#!/bin/bash
# backup-postgres.sh
BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/cogitator_${TIMESTAMP}.sql.gz"

pg_dump -h $PGHOST -U $PGUSER -d cogitator | gzip > $BACKUP_FILE

# Keep last 7 daily backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_FILE s3://cogitator-backups/postgres/
```

#### Point-in-Time Recovery (WAL Archiving)

Enable WAL archiving in `postgresql.conf`:
```
wal_level = replica
archive_mode = on
archive_command = 'aws s3 cp %p s3://cogitator-backups/wal/%f'
```

Recovery:
```bash
# Restore base backup
pg_restore -d cogitator /backups/base_backup.tar

# Apply WAL logs up to target time
recovery_target_time = '2025-01-15 10:00:00 UTC'
```

### Redis Backup

Redis stores short-term memory and session state.

#### RDB Snapshots

```bash
# redis.conf
save 900 1      # Save if 1 key changed in 900 seconds
save 300 10     # Save if 10 keys changed in 300 seconds
save 60 10000   # Save if 10000 keys changed in 60 seconds

dbfilename dump.rdb
dir /var/lib/redis/
```

#### AOF Persistence

```bash
# redis.conf
appendonly yes
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

#### Backup Script

```bash
#!/bin/bash
# backup-redis.sh
BACKUP_DIR="/backups/redis"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Trigger background save
redis-cli BGSAVE
sleep 10

# Copy RDB file
cp /var/lib/redis/dump.rdb "${BACKUP_DIR}/dump_${TIMESTAMP}.rdb"

# Upload to S3
aws s3 cp "${BACKUP_DIR}/dump_${TIMESTAMP}.rdb" s3://cogitator-backups/redis/
```

## Recovery Procedures

### Complete System Recovery

1. **Provision Infrastructure**
   ```bash
   # Using Terraform or manual setup
   terraform apply -var-file=prod.tfvars
   ```

2. **Restore PostgreSQL**
   ```bash
   # Download latest backup
   aws s3 cp s3://cogitator-backups/postgres/latest.sql.gz /tmp/

   # Restore
   gunzip -c /tmp/latest.sql.gz | psql -h $PGHOST -U $PGUSER -d cogitator
   ```

3. **Restore Redis**
   ```bash
   # Stop Redis
   systemctl stop redis

   # Download and restore RDB
   aws s3 cp s3://cogitator-backups/redis/latest.rdb /var/lib/redis/dump.rdb
   chown redis:redis /var/lib/redis/dump.rdb

   # Start Redis
   systemctl start redis
   ```

4. **Deploy Application**
   ```bash
   # Using Kubernetes
   kubectl apply -f deploy/kubernetes/

   # Or Docker Compose
   docker compose up -d
   ```

5. **Verify Health**
   ```bash
   curl http://localhost:3000/api/health
   ```

### Partial Failure Recovery

#### Database Connection Lost

**Symptoms**: API returns 503, health check shows database "down"

**Resolution**:
1. Check PostgreSQL status: `systemctl status postgresql`
2. Check connection limits: `SELECT count(*) FROM pg_stat_activity;`
3. Restart if needed: `systemctl restart postgresql`
4. Application auto-reconnects via connection pool

#### Redis Connection Lost

**Symptoms**: Short-term memory unavailable, degraded mode active

**Resolution**:
1. Check Redis status: `redis-cli ping`
2. Check memory: `redis-cli info memory`
3. Restart if needed: `systemctl restart redis`
4. Cogitator continues with in-memory fallback

#### LLM Provider Unavailable

**Symptoms**: Circuit breaker open, fallback providers in use

**Resolution**:
1. Check circuit breaker status in health endpoint
2. Verify provider status (Ollama, OpenAI, Anthropic)
3. Circuit breaker auto-resets after timeout (default: 30s)
4. Fallback chain: Ollama → OpenAI → Anthropic

## Failure Scenarios

### Scenario 1: Database Corruption

**Detection**: Query errors, inconsistent data

**Response**:
1. Stop all Cogitator instances
2. Assess damage: `pg_dump --schema-only cogitator > /tmp/schema.sql`
3. Restore from latest backup
4. Apply WAL logs for point-in-time recovery
5. Restart services

**Prevention**:
- Enable checksums: `initdb --data-checksums`
- Regular VACUUM and ANALYZE
- Monitor disk health

### Scenario 2: Memory Exhaustion

**Detection**: OOMKilled containers, slow responses

**Response**:
1. Scale horizontally: `kubectl scale deployment cogitator --replicas=3`
2. Clear Redis cache: `redis-cli FLUSHDB`
3. Implement memory TTLs
4. Increase container limits

**Prevention**:
- Set resource limits in Kubernetes
- Configure memory TTLs for Redis keys
- Monitor memory usage with Prometheus

### Scenario 3: Cascading LLM Failures

**Detection**: All LLM providers failing, circuit breakers open

**Response**:
1. Check provider status pages
2. Manually close circuit breakers if needed: `POST /api/admin/circuit-breakers/reset`
3. Switch to local Ollama if cloud providers down
4. Enable queue mode to buffer requests

**Prevention**:
- Multiple LLM provider fallbacks
- Local Ollama as last resort
- Request queueing for transient failures

### Scenario 4: Complete Data Center Failure

**Detection**: All services unreachable

**Response**:
1. Activate disaster recovery site
2. Update DNS to point to DR site
3. Restore from off-site backups
4. Verify data consistency
5. Notify users of recovery status

**Prevention**:
- Multi-region deployment
- Cross-region backup replication
- Regular DR drills

## Monitoring and Alerts

### Key Metrics to Monitor

```yaml
# Prometheus alerting rules
groups:
  - name: cogitator
    rules:
      - alert: DatabaseDown
        expr: cogitator_health_database_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection lost"

      - alert: RedisDown
        expr: cogitator_health_redis_up == 0
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Redis connection lost (degraded mode)"

      - alert: CircuitBreakerOpen
        expr: cogitator_circuit_breaker_state{state="open"} == 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Circuit breaker open for {{ $labels.service }}"

      - alert: HighErrorRate
        expr: rate(cogitator_requests_errors_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
```

### Health Check Endpoint

The `/api/health` endpoint returns:
```json
{
  "status": "healthy|degraded|unhealthy",
  "services": {
    "database": { "status": "up", "latency": 5 },
    "redis": { "status": "up", "latency": 2 },
    "ollama": { "status": "up", "models": ["llama3.2"] },
    "wasm": { "status": "up", "available": true }
  },
  "circuitBreakers": {
    "ollama": "closed",
    "openai": "closed",
    "anthropic": "closed"
  }
}
```

## Recovery Time Objectives

| Component | RTO | RPO | Backup Frequency |
|-----------|-----|-----|------------------|
| PostgreSQL | 1 hour | 5 minutes | Continuous WAL |
| Redis | 15 minutes | 1 minute | Every minute |
| Application | 5 minutes | N/A | Container images |
| Configuration | 5 minutes | N/A | Git repository |

## Runbook Checklist

### Daily
- [ ] Verify backup completion
- [ ] Check health endpoint status
- [ ] Review error logs

### Weekly
- [ ] Test backup restoration (non-prod)
- [ ] Review circuit breaker events
- [ ] Check disk space usage

### Monthly
- [ ] Full DR drill
- [ ] Update runbooks
- [ ] Review RTO/RPO targets

### Quarterly
- [ ] Cross-region failover test
- [ ] Security audit
- [ ] Capacity planning review
