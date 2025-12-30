module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},65969,e=>e.a(async(t,a)=>{try{let t=await e.y("pg-7e2a21e93ebd274c");e.n(t),a()}catch(e){a(e)}},!0),16995,e=>e.a(async(t,a)=>{try{var r=e.i(65969),s=t([r]);[r]=s.then?(await s)():s;let l=null;function n(){return l||(l=new r.Pool({host:process.env.POSTGRES_HOST||"localhost",port:parseInt(process.env.POSTGRES_PORT||"5432"),user:process.env.POSTGRES_USER||"cogitator",password:process.env.POSTGRES_PASSWORD||"cogitator",database:process.env.POSTGRES_DB||"cogitator",max:20,idleTimeoutMillis:3e4,connectionTimeoutMillis:2e3})),l}async function o(e,t){let a=n();return(await a.query(e,t)).rows}async function i(e,t){return(await o(e,t))[0]||null}async function d(e,t){let a=n();return(await a.query(e,t)).rowCount||0}async function E(){let e=n();await e.query(`
    -- Agents table
    CREATE TABLE IF NOT EXISTS dashboard_agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      model TEXT NOT NULL,
      description TEXT,
      instructions TEXT,
      status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy')),
      total_runs INTEGER DEFAULT 0,
      total_tokens BIGINT DEFAULT 0,
      total_cost DECIMAL(12, 6) DEFAULT 0,
      last_run_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Runs table
    CREATE TABLE IF NOT EXISTS dashboard_runs (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL REFERENCES dashboard_agents(id) ON DELETE CASCADE,
      thread_id TEXT,
      status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
      input TEXT NOT NULL,
      output TEXT,
      started_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      duration INTEGER,
      input_tokens INTEGER DEFAULT 0,
      output_tokens INTEGER DEFAULT 0,
      total_tokens INTEGER DEFAULT 0,
      cost DECIMAL(12, 6) DEFAULT 0,
      error TEXT
    );

    -- Tool calls table
    CREATE TABLE IF NOT EXISTS dashboard_tool_calls (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES dashboard_runs(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      arguments JSONB,
      result JSONB,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error')),
      duration INTEGER,
      started_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      error TEXT
    );

    -- Spans table (for tracing)
    CREATE TABLE IF NOT EXISTS dashboard_spans (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES dashboard_runs(id) ON DELETE CASCADE,
      trace_id TEXT NOT NULL,
      parent_id TEXT,
      name TEXT NOT NULL,
      kind TEXT DEFAULT 'internal',
      status TEXT DEFAULT 'unset' CHECK (status IN ('ok', 'error', 'unset')),
      start_time BIGINT NOT NULL,
      end_time BIGINT,
      duration INTEGER,
      attributes JSONB,
      events JSONB
    );

    -- Logs table
    CREATE TABLE IF NOT EXISTS dashboard_logs (
      id TEXT PRIMARY KEY,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
      message TEXT NOT NULL,
      source TEXT,
      agent_id TEXT,
      run_id TEXT,
      metadata JSONB
    );

    -- Messages table (conversation history)
    CREATE TABLE IF NOT EXISTS dashboard_messages (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES dashboard_runs(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
      content TEXT NOT NULL,
      tool_call_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Config table (key-value store)
    CREATE TABLE IF NOT EXISTS dashboard_config (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_dashboard_runs_agent_id ON dashboard_runs(agent_id);
    CREATE INDEX IF NOT EXISTS idx_dashboard_runs_status ON dashboard_runs(status);
    CREATE INDEX IF NOT EXISTS idx_dashboard_runs_started_at ON dashboard_runs(started_at DESC);
    CREATE INDEX IF NOT EXISTS idx_dashboard_tool_calls_run_id ON dashboard_tool_calls(run_id);
    CREATE INDEX IF NOT EXISTS idx_dashboard_spans_run_id ON dashboard_spans(run_id);
    CREATE INDEX IF NOT EXISTS idx_dashboard_spans_trace_id ON dashboard_spans(trace_id);
    CREATE INDEX IF NOT EXISTS idx_dashboard_logs_timestamp ON dashboard_logs(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_dashboard_logs_level ON dashboard_logs(level);
    CREATE INDEX IF NOT EXISTS idx_dashboard_logs_run_id ON dashboard_logs(run_id);
    CREATE INDEX IF NOT EXISTS idx_dashboard_messages_run_id ON dashboard_messages(run_id);
  `)}e.s(["execute",()=>d,"getPool",()=>n,"initializeSchema",()=>E,"query",()=>o,"queryOne",()=>i]),a()}catch(e){a(e)}},!1),42439,e=>e.a(async(t,a)=>{try{var r=e.i(16995),s=t([r]);async function n(e=24){return(await (0,r.query)(`
    WITH hours AS (
      SELECT generate_series(
        date_trunc('hour', NOW() - INTERVAL '${e} hours'),
        date_trunc('hour', NOW()),
        INTERVAL '1 hour'
      ) AS hour
    )
    SELECT 
      h.hour,
      COALESCE(COUNT(r.id), 0) as runs,
      COALESCE(SUM(r.total_tokens), 0) as tokens,
      COALESCE(SUM(r.cost), 0) as cost
    FROM hours h
    LEFT JOIN dashboard_runs r ON date_trunc('hour', r.started_at) = h.hour
    GROUP BY h.hour
    ORDER BY h.hour
  `)).map(e=>({hour:e.hour.toISOString(),runs:parseInt(e.runs),tokens:parseInt(e.tokens),cost:parseFloat(e.cost)}))}async function o(e="day"){return(await (0,r.query)(`
    SELECT 
      a.model,
      COUNT(r.id) as runs,
      COALESCE(SUM(r.total_tokens), 0) as tokens,
      COALESCE(SUM(r.cost), 0) as cost
    FROM dashboard_runs r
    JOIN dashboard_agents a ON r.agent_id = a.id
    WHERE r.started_at >= ${{day:"NOW() - INTERVAL '1 day'",week:"NOW() - INTERVAL '7 days'",month:"NOW() - INTERVAL '30 days'"}[e]}
    GROUP BY a.model
    ORDER BY cost DESC
  `)).map(e=>({model:e.model,runs:parseInt(e.runs),tokens:parseInt(e.tokens),cost:parseFloat(e.cost)}))}async function i(e=10,t="week"){return(await (0,r.query)(`
    SELECT 
      a.id,
      a.name,
      a.model,
      COUNT(r.id) as runs,
      COALESCE(SUM(r.total_tokens), 0) as tokens,
      COALESCE(SUM(r.cost), 0) as cost,
      COALESCE(AVG(r.duration), 0) as avg_duration,
      COALESCE(
        SUM(CASE WHEN r.status = 'completed' THEN 1 ELSE 0 END)::float / NULLIF(COUNT(r.id), 0) * 100,
        0
      ) as success_rate
    FROM dashboard_agents a
    LEFT JOIN dashboard_runs r ON r.agent_id = a.id AND r.started_at >= ${{day:"NOW() - INTERVAL '1 day'",week:"NOW() - INTERVAL '7 days'",month:"NOW() - INTERVAL '30 days'"}[t]}
    GROUP BY a.id, a.name, a.model
    ORDER BY runs DESC
    LIMIT $1
  `,[e])).map(e=>({id:e.id,name:e.name,model:e.model,runs:parseInt(e.runs),tokens:parseInt(e.tokens),cost:parseFloat(e.cost),avgDuration:parseFloat(e.avg_duration),successRate:parseFloat(e.success_rate)}))}async function d(){let e=await (0,r.queryOne)(`
    SELECT
      (SELECT COUNT(*) FROM dashboard_runs WHERE started_at >= NOW() - INTERVAL '24 hours') as total_runs,
      (SELECT COUNT(*) FROM dashboard_agents WHERE status != 'offline') as active_agents,
      (SELECT COALESCE(SUM(total_tokens), 0) FROM dashboard_runs WHERE started_at >= NOW() - INTERVAL '24 hours') as total_tokens,
      (SELECT COALESCE(SUM(cost), 0) FROM dashboard_runs WHERE started_at >= NOW() - INTERVAL '24 hours') as total_cost,
      (SELECT COUNT(*) FROM dashboard_runs WHERE status = 'running') as running_runs,
      (SELECT COALESCE(AVG(duration), 0) FROM dashboard_runs WHERE started_at >= NOW() - INTERVAL '24 hours' AND duration IS NOT NULL) as avg_duration
  `);return{totalRuns:parseInt(e?.total_runs||"0"),activeAgents:parseInt(e?.active_agents||"0"),totalTokens:parseInt(e?.total_tokens||"0"),totalCost:parseFloat(e?.total_cost||"0"),runningRuns:parseInt(e?.running_runs||"0"),avgDuration:parseFloat(e?.avg_duration||"0")}}[r]=s.then?(await s)():s,e.s(["getDashboardStats",()=>d,"getHourlyStats",()=>n,"getModelStats",()=>o,"getTopAgents",()=>i]),a()}catch(e){a(e)}},!1),20108,e=>e.a(async(t,a)=>{try{var r=e.i(95897),s=e.i(42439),n=e.i(16995),o=t([s,n]);[s,n]=o.then?(await o)():o;let E=!1;async function i(){if(!E)try{await (0,n.initializeSchema)(),E=!0}catch(e){console.error("Failed to initialize database:",e)}}async function d(e){try{await i();let t=e.nextUrl.searchParams,a=t.get("period")||"day",n=parseInt(t.get("hours")||"24"),[o,d,E,l]=await Promise.all([(0,s.getHourlyStats)(n),(0,s.getModelStats)(a),(0,s.getTopAgents)(10,a),(0,s.getDashboardStats)()]);return r.NextResponse.json({hourly:o,models:d,topAgents:E,dashboard:l,period:a})}catch(e){return console.error("Failed to fetch analytics:",e),r.NextResponse.json({error:"Failed to fetch analytics"},{status:500})}}e.s(["GET",()=>d]),a()}catch(e){a(e)}},!1),61981,e=>e.a(async(t,a)=>{try{var r=e.i(51710),s=e.i(74963),n=e.i(81706),o=e.i(98867),i=e.i(5893),d=e.i(46463),E=e.i(23368),l=e.i(34613),u=e.i(40066),T=e.i(11516),c=e.i(40564),p=e.i(73827),N=e.i(73483),_=e.i(12582),h=e.i(74641),R=e.i(93695);e.i(48763);var O=e.i(4458),S=e.i(20108),A=t([S]);[S]=A.then?(await A)():A;let L=new r.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/analytics/route",pathname:"/api/analytics",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/packages/dashboard/src/app/api/analytics/route.ts",nextConfigOutput:"",userland:S}),{workAsyncStorage:g,workUnitAsyncStorage:m,serverHooks:y}=L;function I(){return(0,n.patchFetch)({workAsyncStorage:g,workUnitAsyncStorage:m})}async function C(e,t,a){L.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/analytics/route";r=r.replace(/\/index$/,"")||"/";let n=await L.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!n)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:S,params:A,nextConfig:I,parsedUrl:C,isDraftMode:g,prerenderManifest:m,routerServerContext:y,isOnDemandRevalidate:b,revalidateOnlyGenerated:x,resolvedPathname:v,clientReferenceManifest:U,serverActionsManifest:f}=n,F=(0,E.normalizeAppPath)(r),D=!!(m.dynamicRoutes[F]||m.routes[v]),X=async()=>((null==y?void 0:y.render404)?await y.render404(e,t,C,!1):t.end("This page could not be found"),null);if(D&&!g){let e=!!m.routes[v],t=m.dynamicRoutes[F];if(t&&!1===t.fallback&&!e){if(I.experimental.adapterPath)return await X();throw new R.NoFallbackError}}let M=null;!D||L.isDev||g||(M=v,M="/index"===M?"/":M);let w=!0===L.isDev||!D,P=D&&!w;f&&U&&(0,d.setManifestsSingleton)({page:r,clientReferenceManifest:U,serverActionsManifest:f});let k=e.method||"GET",H=(0,i.getTracer)(),W=H.getActiveScopeSpan(),q={params:A,prerenderManifest:m,renderOpts:{experimental:{authInterrupts:!!I.experimental.authInterrupts},cacheComponents:!!I.cacheComponents,supportsDynamicResponse:w,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:I.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,s)=>L.onRequestError(e,t,r,s,y)},sharedContext:{buildId:S}},B=new l.NodeNextRequest(e),G=new l.NodeNextResponse(t),K=u.NextRequestAdapter.fromNodeNextRequest(B,(0,u.signalFromNodeResponse)(t));try{let n=async e=>L.handle(K,q).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=H.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==T.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=a.get("next.route");if(s){let t=`${k} ${s}`;e.setAttributes({"next.route":s,"http.route":s,"next.span_name":t}),e.updateName(t)}else e.updateName(`${k} ${r}`)}),d=!!(0,o.getRequestMeta)(e,"minimalMode"),E=async o=>{var i,E;let l=async({previousCacheEntry:s})=>{try{if(!d&&b&&x&&!s)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await n(o);e.fetchMetrics=q.renderOpts.fetchMetrics;let i=q.renderOpts.pendingWaitUntil;i&&a.waitUntil&&(a.waitUntil(i),i=void 0);let E=q.renderOpts.collectedTags;if(!D)return await (0,p.sendResponse)(B,G,r,q.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,N.toNodeOutgoingHttpHeaders)(r.headers);E&&(t[h.NEXT_CACHE_TAGS_HEADER]=E),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==q.renderOpts.collectedRevalidate&&!(q.renderOpts.collectedRevalidate>=h.INFINITE_CACHE)&&q.renderOpts.collectedRevalidate,s=void 0===q.renderOpts.collectedExpire||q.renderOpts.collectedExpire>=h.INFINITE_CACHE?void 0:q.renderOpts.collectedExpire;return{value:{kind:O.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:s}}}}catch(t){throw(null==s?void 0:s.isStale)&&await L.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:b})},!1,y),t}},u=await L.handleResponse({req:e,nextConfig:I,cacheKey:M,routeKind:s.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:m,isRoutePPREnabled:!1,isOnDemandRevalidate:b,revalidateOnlyGenerated:x,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:d});if(!D)return null;if((null==u||null==(i=u.value)?void 0:i.kind)!==O.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==u||null==(E=u.value)?void 0:E.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});d||t.setHeader("x-nextjs-cache",b?"REVALIDATED":u.isMiss?"MISS":u.isStale?"STALE":"HIT"),g&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let T=(0,N.fromNodeOutgoingHttpHeaders)(u.value.headers);return d&&D||T.delete(h.NEXT_CACHE_TAGS_HEADER),!u.cacheControl||t.getHeader("Cache-Control")||T.get("Cache-Control")||T.set("Cache-Control",(0,_.getCacheControlHeader)(u.cacheControl)),await (0,p.sendResponse)(B,G,new Response(u.value.body,{headers:T,status:u.value.status||200})),null};W?await E(W):await H.withPropagatedContext(e.headers,()=>H.trace(T.BaseServerSpan.handleRequest,{spanName:`${k} ${r}`,kind:i.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},E))}catch(t){if(t instanceof R.NoFallbackError||await L.onRequestError(e,t,{routerKind:"App Router",routePath:F,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:b})},!1,y),D)throw t;return await (0,p.sendResponse)(B,G,new Response(null,{status:500})),null}}e.s(["handler",()=>C,"patchFetch",()=>I,"routeModule",()=>L,"serverHooks",()=>y,"workAsyncStorage",()=>g,"workUnitAsyncStorage",()=>m]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__ddf293bc._.js.map