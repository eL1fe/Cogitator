module.exports=[70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},24361,(e,t,a)=>{t.exports=e.x("util",()=>require("util"))},14747,(e,t,a)=>{t.exports=e.x("path",()=>require("path"))},65969,e=>e.a(async(t,a)=>{try{let t=await e.y("pg-7e2a21e93ebd274c");e.n(t),a()}catch(e){a(e)}},!0),16995,e=>e.a(async(t,a)=>{try{var r=e.i(65969),s=t([r]);[r]=s.then?(await s)():s;let u=null;function n(){return u||(u=new r.Pool({host:process.env.POSTGRES_HOST||"localhost",port:parseInt(process.env.POSTGRES_PORT||"5432"),user:process.env.POSTGRES_USER||"cogitator",password:process.env.POSTGRES_PASSWORD||"cogitator",database:process.env.POSTGRES_DB||"cogitator",max:20,idleTimeoutMillis:3e4,connectionTimeoutMillis:2e3})),u}async function o(e,t){let a=n();return(await a.query(e,t)).rows}async function i(e,t){return(await o(e,t))[0]||null}async function d(e,t){let a=n();return(await a.query(e,t)).rowCount||0}async function l(){let e=n();await e.query(`
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
  `)}e.s(["execute",()=>d,"getPool",()=>n,"initializeSchema",()=>l,"query",()=>o,"queryOne",()=>i]),a()}catch(e){a(e)}},!1),66680,(e,t,a)=>{t.exports=e.x("node:crypto",()=>require("node:crypto"))},71004,e=>{"use strict";let t,a;var r=e.i(66680);function s(e=21){var n;n=e|=0,!t||t.length<n?(t=Buffer.allocUnsafe(128*n),r.webcrypto.getRandomValues(t),a=0):a+n>t.length&&(r.webcrypto.getRandomValues(t),a=0),a+=n;let o="";for(let r=a-e;r<a;r++)o+="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict"[63&t[r]];return o}e.s(["nanoid",()=>s],71004)},3489,e=>e.a(async(t,a)=>{try{var r=e.i(16995),s=e.i(71004),n=t([r]);function o(e){return{id:e.id,timestamp:e.timestamp.toISOString(),level:e.level,message:e.message,source:e.source||void 0,agentId:e.agent_id||void 0,runId:e.run_id||void 0,metadata:e.metadata||void 0}}async function i(e){let t="SELECT * FROM dashboard_logs WHERE 1=1",a=[],s=1;return e?.level&&(t+=` AND level = $${s++}`,a.push(e.level)),e?.source&&(t+=` AND source = $${s++}`,a.push(e.source)),e?.runId&&(t+=` AND run_id = $${s++}`,a.push(e.runId)),e?.since&&(t+=` AND timestamp >= $${s++}`,a.push(e.since.toISOString())),t+=" ORDER BY timestamp DESC",e?.limit&&(t+=` LIMIT $${s++}`,a.push(e.limit)),e?.offset&&(t+=` OFFSET $${s++}`,a.push(e.offset)),(await (0,r.query)(t,a)).map(o)}async function d(e){let t=`log_${(0,s.nanoid)(12)}`;await (0,r.execute)(`INSERT INTO dashboard_logs (id, level, message, source, agent_id, run_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,[t,e.level,e.message,e.source||null,e.agentId||null,e.runId||null,e.metadata?JSON.stringify(e.metadata):null]);let a=await (0,r.queryOne)("SELECT * FROM dashboard_logs WHERE id = $1",[t]);return o(a)}async function l(){let e=await (0,r.queryOne)(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN level = 'debug' THEN 1 ELSE 0 END) as debug,
      SUM(CASE WHEN level = 'info' THEN 1 ELSE 0 END) as info,
      SUM(CASE WHEN level = 'warn' THEN 1 ELSE 0 END) as warn,
      SUM(CASE WHEN level = 'error' THEN 1 ELSE 0 END) as error
    FROM dashboard_logs
    WHERE timestamp >= NOW() - INTERVAL '24 hours'
  `);return{total:parseInt(e?.total||"0"),debug:parseInt(e?.debug||"0"),info:parseInt(e?.info||"0"),warn:parseInt(e?.warn||"0"),error:parseInt(e?.error||"0")}}[r]=n.then?(await n)():n,e.s(["createLog",()=>d,"getAllLogs",()=>i,"getLogStats",()=>l]),a()}catch(e){a(e)}},!1),42512,e=>e.a(async(t,a)=>{try{var r=e.i(95897),s=e.i(3489),n=e.i(16995),o=e.i(60750),i=t([s,n]);[s,n]=i.then?(await i)():i;let E=!1;async function d(){if(!E)try{await (0,n.initializeSchema)(),E=!0}catch(e){console.error("Failed to initialize database:",e)}}async function l(e){try{await d();let t=e.nextUrl.searchParams,a=t.get("level")||void 0,n=t.get("source")||void 0,o=t.get("runId")||void 0,i=parseInt(t.get("limit")||"100"),l=parseInt(t.get("offset")||"0"),u=t.get("since"),E=await (0,s.getAllLogs)({level:a,source:n,runId:o,limit:i,offset:l,since:u?new Date(u):void 0}),T=await (0,s.getLogStats)();return r.NextResponse.json({logs:E,stats:T,pagination:{limit:i,offset:l}})}catch(e){return console.error("Failed to fetch logs:",e),r.NextResponse.json({error:"Failed to fetch logs"},{status:500})}}async function u(e){try{await d();let t=await e.json();if(!t.level||!t.message)return r.NextResponse.json({error:"level and message are required"},{status:400});let a=await (0,s.createLog)({level:t.level,message:t.message,source:t.source,agentId:t.agentId,runId:t.runId,metadata:t.metadata});try{await (0,o.publish)(o.CHANNELS.LOG_ENTRY,a)}catch{}return r.NextResponse.json(a,{status:201})}catch(e){return console.error("Failed to create log:",e),r.NextResponse.json({error:"Failed to create log"},{status:500})}}e.s(["GET",()=>l,"POST",()=>u]),a()}catch(e){a(e)}},!1),72788,e=>e.a(async(t,a)=>{try{var r=e.i(51710),s=e.i(74963),n=e.i(81706),o=e.i(98867),i=e.i(5893),d=e.i(46463),l=e.i(23368),u=e.i(34613),E=e.i(40066),T=e.i(11516),c=e.i(40564),p=e.i(73827),N=e.i(73483),g=e.i(12582),h=e.i(74641),_=e.i(93695);e.i(48763);var R=e.i(4458),I=e.i(42512),S=t([I]);[I]=S.then?(await S)():S;let m=new r.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/logs/route",pathname:"/api/logs",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/packages/dashboard/src/app/api/logs/route.ts",nextConfigOutput:"",userland:I}),{workAsyncStorage:v,workUnitAsyncStorage:C,serverHooks:x}=m;function A(){return(0,n.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:C})}async function O(e,t,a){m.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/logs/route";r=r.replace(/\/index$/,"")||"/";let n=await m.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!n)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:I,params:S,nextConfig:A,parsedUrl:O,isDraftMode:v,prerenderManifest:C,routerServerContext:x,isOnDemandRevalidate:L,revalidateOnlyGenerated:f,resolvedPathname:b,clientReferenceManifest:y,serverActionsManifest:w}=n,D=(0,l.normalizeAppPath)(r),X=!!(C.dynamicRoutes[D]||C.routes[b]),U=async()=>((null==x?void 0:x.render404)?await x.render404(e,t,O,!1):t.end("This page could not be found"),null);if(X&&!v){let e=!!C.routes[b],t=C.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(A.experimental.adapterPath)return await U();throw new _.NoFallbackError}}let F=null;!X||m.isDev||v||(F=b,F="/index"===F?"/":F);let M=!0===m.isDev||!X,P=X&&!M;w&&y&&(0,d.setManifestsSingleton)({page:r,clientReferenceManifest:y,serverActionsManifest:w});let H=e.method||"GET",q=(0,i.getTracer)(),k=q.getActiveScopeSpan(),$={params:S,prerenderManifest:C,renderOpts:{experimental:{authInterrupts:!!A.experimental.authInterrupts},cacheComponents:!!A.cacheComponents,supportsDynamicResponse:M,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:A.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,s)=>m.onRequestError(e,t,r,s,x)},sharedContext:{buildId:I}},B=new u.NodeNextRequest(e),j=new u.NodeNextResponse(t),K=E.NextRequestAdapter.fromNodeNextRequest(B,(0,E.signalFromNodeResponse)(t));try{let n=async e=>m.handle(K,$).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=q.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==T.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=a.get("next.route");if(s){let t=`${H} ${s}`;e.setAttributes({"next.route":s,"http.route":s,"next.span_name":t}),e.updateName(t)}else e.updateName(`${H} ${r}`)}),d=!!(0,o.getRequestMeta)(e,"minimalMode"),l=async o=>{var i,l;let u=async({previousCacheEntry:s})=>{try{if(!d&&L&&f&&!s)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await n(o);e.fetchMetrics=$.renderOpts.fetchMetrics;let i=$.renderOpts.pendingWaitUntil;i&&a.waitUntil&&(a.waitUntil(i),i=void 0);let l=$.renderOpts.collectedTags;if(!X)return await (0,p.sendResponse)(B,j,r,$.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,N.toNodeOutgoingHttpHeaders)(r.headers);l&&(t[h.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==$.renderOpts.collectedRevalidate&&!($.renderOpts.collectedRevalidate>=h.INFINITE_CACHE)&&$.renderOpts.collectedRevalidate,s=void 0===$.renderOpts.collectedExpire||$.renderOpts.collectedExpire>=h.INFINITE_CACHE?void 0:$.renderOpts.collectedExpire;return{value:{kind:R.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:s}}}}catch(t){throw(null==s?void 0:s.isStale)&&await m.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:L})},!1,x),t}},E=await m.handleResponse({req:e,nextConfig:A,cacheKey:F,routeKind:s.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:L,revalidateOnlyGenerated:f,responseGenerator:u,waitUntil:a.waitUntil,isMinimalMode:d});if(!X)return null;if((null==E||null==(i=E.value)?void 0:i.kind)!==R.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(l=E.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});d||t.setHeader("x-nextjs-cache",L?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),v&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let T=(0,N.fromNodeOutgoingHttpHeaders)(E.value.headers);return d&&X||T.delete(h.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||T.get("Cache-Control")||T.set("Cache-Control",(0,g.getCacheControlHeader)(E.cacheControl)),await (0,p.sendResponse)(B,j,new Response(E.value.body,{headers:T,status:E.value.status||200})),null};k?await l(k):await q.withPropagatedContext(e.headers,()=>q.trace(T.BaseServerSpan.handleRequest,{spanName:`${H} ${r}`,kind:i.SpanKind.SERVER,attributes:{"http.method":H,"http.target":e.url}},l))}catch(t){if(t instanceof _.NoFallbackError||await m.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:L})},!1,x),X)throw t;return await (0,p.sendResponse)(B,j,new Response(null,{status:500})),null}}e.s(["handler",()=>O,"patchFetch",()=>A,"routeModule",()=>m,"serverHooks",()=>x,"workAsyncStorage",()=>v,"workUnitAsyncStorage",()=>C]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__4169e4a0._.js.map