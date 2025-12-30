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
  `)}e.s(["execute",()=>d,"getPool",()=>n,"initializeSchema",()=>l,"query",()=>o,"queryOne",()=>i]),a()}catch(e){a(e)}},!1),89531,e=>e.a(async(t,a)=>{try{var r=e.i(95897),s=e.i(16995),n=e.i(60750),o=t([s]);async function i(){let e={status:"healthy",services:{database:{status:"down"},redis:{status:"down"},ollama:{status:"down"}},uptime:process.uptime(),timestamp:new Date().toISOString()};try{let t=(0,s.getPool)(),a=Date.now();await t.query("SELECT 1"),e.services.database={status:"up",latency:Date.now()-a}}catch{e.services.database={status:"down"},e.status="degraded"}try{let t=(0,n.getRedis)(),a=Date.now();await t.ping(),e.services.redis={status:"up",latency:Date.now()-a}}catch{e.services.redis={status:"down"},e.status="degraded"}try{let t=process.env.OLLAMA_URL||"http://localhost:11434",a=await fetch(`${t}/api/tags`,{signal:AbortSignal.timeout(5e3)});if(a.ok){let t=await a.json();e.services.ollama={status:"up",models:t.models?.map(e=>e.name)||[]}}}catch{e.services.ollama={status:"down"}}"down"===e.services.database.status&&(e.status="unhealthy");let t="healthy"===e.status||"degraded"===e.status?200:503;return r.NextResponse.json(e,{status:t})}[s]=o.then?(await o)():o,e.s(["GET",()=>i]),a()}catch(e){a(e)}},!1),96348,e=>e.a(async(t,a)=>{try{var r=e.i(51710),s=e.i(74963),n=e.i(81706),o=e.i(98867),i=e.i(5893),d=e.i(46463),l=e.i(23368),u=e.i(34613),E=e.i(40066),T=e.i(11516),c=e.i(40564),p=e.i(73827),h=e.i(73483),N=e.i(12582),_=e.i(74641),R=e.i(93695);e.i(48763);var A=e.i(4458),I=e.i(89531),S=t([I]);[I]=S.then?(await S)():S;let x=new r.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/health/route",pathname:"/api/health",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/packages/dashboard/src/app/api/health/route.ts",nextConfigOutput:"",userland:I}),{workAsyncStorage:C,workUnitAsyncStorage:m,serverHooks:b}=x;function O(){return(0,n.patchFetch)({workAsyncStorage:C,workUnitAsyncStorage:m})}async function g(e,t,a){x.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/health/route";r=r.replace(/\/index$/,"")||"/";let n=await x.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!n)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:I,params:S,nextConfig:O,parsedUrl:g,isDraftMode:C,prerenderManifest:m,routerServerContext:b,isOnDemandRevalidate:v,revalidateOnlyGenerated:L,resolvedPathname:w,clientReferenceManifest:y,serverActionsManifest:X}=n,f=(0,l.normalizeAppPath)(r),D=!!(m.dynamicRoutes[f]||m.routes[w]),U=async()=>((null==b?void 0:b.render404)?await b.render404(e,t,g,!1):t.end("This page could not be found"),null);if(D&&!C){let e=!!m.routes[w],t=m.dynamicRoutes[f];if(t&&!1===t.fallback&&!e){if(O.experimental.adapterPath)return await U();throw new R.NoFallbackError}}let P=null;!D||x.isDev||C||(P=w,P="/index"===P?"/":P);let F=!0===x.isDev||!D,M=D&&!F;X&&y&&(0,d.setManifestsSingleton)({page:r,clientReferenceManifest:y,serverActionsManifest:X});let k=e.method||"GET",q=(0,i.getTracer)(),H=q.getActiveScopeSpan(),B={params:S,prerenderManifest:m,renderOpts:{experimental:{authInterrupts:!!O.experimental.authInterrupts},cacheComponents:!!O.cacheComponents,supportsDynamicResponse:F,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:O.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,s)=>x.onRequestError(e,t,r,s,b)},sharedContext:{buildId:I}},K=new u.NodeNextRequest(e),j=new u.NodeNextResponse(t),G=E.NextRequestAdapter.fromNodeNextRequest(K,(0,E.signalFromNodeResponse)(t));try{let n=async e=>x.handle(G,B).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=q.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==T.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=a.get("next.route");if(s){let t=`${k} ${s}`;e.setAttributes({"next.route":s,"http.route":s,"next.span_name":t}),e.updateName(t)}else e.updateName(`${k} ${r}`)}),d=!!(0,o.getRequestMeta)(e,"minimalMode"),l=async o=>{var i,l;let u=async({previousCacheEntry:s})=>{try{if(!d&&v&&L&&!s)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await n(o);e.fetchMetrics=B.renderOpts.fetchMetrics;let i=B.renderOpts.pendingWaitUntil;i&&a.waitUntil&&(a.waitUntil(i),i=void 0);let l=B.renderOpts.collectedTags;if(!D)return await (0,p.sendResponse)(K,j,r,B.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,h.toNodeOutgoingHttpHeaders)(r.headers);l&&(t[_.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=_.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,s=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=_.INFINITE_CACHE?void 0:B.renderOpts.collectedExpire;return{value:{kind:A.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:s}}}}catch(t){throw(null==s?void 0:s.isStale)&&await x.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:v})},!1,b),t}},E=await x.handleResponse({req:e,nextConfig:O,cacheKey:P,routeKind:s.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:m,isRoutePPREnabled:!1,isOnDemandRevalidate:v,revalidateOnlyGenerated:L,responseGenerator:u,waitUntil:a.waitUntil,isMinimalMode:d});if(!D)return null;if((null==E||null==(i=E.value)?void 0:i.kind)!==A.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(l=E.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});d||t.setHeader("x-nextjs-cache",v?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),C&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let T=(0,h.fromNodeOutgoingHttpHeaders)(E.value.headers);return d&&D||T.delete(_.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||T.get("Cache-Control")||T.set("Cache-Control",(0,N.getCacheControlHeader)(E.cacheControl)),await (0,p.sendResponse)(K,j,new Response(E.value.body,{headers:T,status:E.value.status||200})),null};H?await l(H):await q.withPropagatedContext(e.headers,()=>q.trace(T.BaseServerSpan.handleRequest,{spanName:`${k} ${r}`,kind:i.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},l))}catch(t){if(t instanceof R.NoFallbackError||await x.onRequestError(e,t,{routerKind:"App Router",routePath:f,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:v})},!1,b),D)throw t;return await (0,p.sendResponse)(K,j,new Response(null,{status:500})),null}}e.s(["handler",()=>g,"patchFetch",()=>O,"routeModule",()=>x,"serverHooks",()=>b,"workAsyncStorage",()=>C,"workUnitAsyncStorage",()=>m]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__447703a6._.js.map