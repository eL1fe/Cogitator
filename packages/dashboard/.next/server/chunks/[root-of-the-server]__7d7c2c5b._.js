module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},65969,e=>e.a(async(t,a)=>{try{let t=await e.y("pg-7e2a21e93ebd274c");e.n(t),a()}catch(e){a(e)}},!0),16995,e=>e.a(async(t,a)=>{try{var r=e.i(65969),n=t([r]);[r]=n.then?(await n)():n;let E=null;function s(){return E||(E=new r.Pool({host:process.env.POSTGRES_HOST||"localhost",port:parseInt(process.env.POSTGRES_PORT||"5432"),user:process.env.POSTGRES_USER||"cogitator",password:process.env.POSTGRES_PASSWORD||"cogitator",database:process.env.POSTGRES_DB||"cogitator",max:20,idleTimeoutMillis:3e4,connectionTimeoutMillis:2e3})),E}async function o(e,t){let a=s();return(await a.query(e,t)).rows}async function i(e,t){return(await o(e,t))[0]||null}async function d(e,t){let a=s();return(await a.query(e,t)).rowCount||0}async function l(){let e=s();await e.query(`
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
  `)}e.s(["execute",()=>d,"getPool",()=>s,"initializeSchema",()=>l,"query",()=>o,"queryOne",()=>i]),a()}catch(e){a(e)}},!1),54056,e=>e.a(async(t,a)=>{try{var r=e.i(16995),n=t([r]);async function s(e){let t=await (0,r.queryOne)("SELECT value FROM dashboard_config WHERE key = $1",[e]);return t?.value||null}async function o(e,t){await (0,r.execute)(`INSERT INTO dashboard_config (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,[e,JSON.stringify(t)])}async function i(){let e=await (0,r.query)("SELECT key, value FROM dashboard_config"),t={};for(let a of e)t[a.key]=a.value;return t}async function d(){return s("cogitator")}async function l(e){await o("cogitator",e)}[r]=n.then?(await n)():n,e.s(["getAllConfig",()=>i,"getCogitatorConfig",()=>d,"getConfig",()=>s,"setCogitatorConfig",()=>l,"setConfig",()=>o]),a()}catch(e){a(e)}},!1),62031,e=>e.a(async(t,a)=>{try{var r=e.i(95897),n=e.i(54056),s=e.i(16995),o=t([n,s]);[n,s]=o.then?(await o)():o;let E=!1;async function i(){if(!E)try{await (0,s.initializeSchema)(),E=!0}catch(e){console.error("Failed to initialize database:",e)}}async function d(){try{await i();let e=await (0,n.getCogitatorConfig)(),t=await (0,n.getAllConfig)(),a={POSTGRES_HOST:process.env.POSTGRES_HOST||"localhost",POSTGRES_PORT:process.env.POSTGRES_PORT||"5432",REDIS_HOST:process.env.REDIS_HOST||"localhost",REDIS_PORT:process.env.REDIS_PORT||"6379",OPENAI_API_KEY:process.env.OPENAI_API_KEY?"***":void 0,ANTHROPIC_API_KEY:process.env.ANTHROPIC_API_KEY?"***":void 0,GOOGLE_API_KEY:process.env.GOOGLE_API_KEY?"***":void 0};return r.NextResponse.json({cogitator:e||{llm:{provider:"openai",model:"gpt-4o-mini",temperature:.7,maxTokens:4096},memory:{adapter:"postgres",postgres:{url:`postgresql://${process.env.POSTGRES_USER||"cogitator"}:${process.env.POSTGRES_PASSWORD||"cogitator"}@${process.env.POSTGRES_HOST||"localhost"}:${process.env.POSTGRES_PORT||"5432"}/${process.env.POSTGRES_DB||"cogitator"}`}},sandbox:{enabled:!1,type:"docker",timeout:3e4},limits:{maxTurns:10,maxTokens:1e5,maxCost:1}},all:t,environment:a})}catch(e){return console.error("Failed to fetch config:",e),r.NextResponse.json({error:"Failed to fetch config"},{status:500})}}async function l(e){try{await i();let t=await e.json();if(!t.llm?.provider||!t.llm?.model)return r.NextResponse.json({error:"llm.provider and llm.model are required"},{status:400});await (0,n.setCogitatorConfig)(t);let a=await (0,n.getCogitatorConfig)();return r.NextResponse.json(a)}catch(e){return console.error("Failed to update config:",e),r.NextResponse.json({error:"Failed to update config"},{status:500})}}e.s(["GET",()=>d,"PUT",()=>l]),a()}catch(e){a(e)}},!1),51171,e=>e.a(async(t,a)=>{try{var r=e.i(51710),n=e.i(74963),s=e.i(81706),o=e.i(98867),i=e.i(5893),d=e.i(46463),l=e.i(23368),E=e.i(34613),T=e.i(40066),u=e.i(11516),c=e.i(40564),p=e.i(73827),_=e.i(73483),N=e.i(12582),R=e.i(74641),S=e.i(93695);e.i(48763);var O=e.i(4458),h=e.i(62031),g=t([h]);[h]=g.then?(await g)():g;let C=new r.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/config/route",pathname:"/api/config",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/packages/dashboard/src/app/api/config/route.ts",nextConfigOutput:"",userland:h}),{workAsyncStorage:f,workUnitAsyncStorage:v,serverHooks:x}=C;function A(){return(0,s.patchFetch)({workAsyncStorage:f,workUnitAsyncStorage:v})}async function I(e,t,a){C.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/config/route";r=r.replace(/\/index$/,"")||"/";let s=await C.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!s)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:h,params:g,nextConfig:A,parsedUrl:I,isDraftMode:f,prerenderManifest:v,routerServerContext:x,isOnDemandRevalidate:m,revalidateOnlyGenerated:y,resolvedPathname:b,clientReferenceManifest:L,serverActionsManifest:P}=s,X=(0,l.normalizeAppPath)(r),w=!!(v.dynamicRoutes[X]||v.routes[b]),D=async()=>((null==x?void 0:x.render404)?await x.render404(e,t,I,!1):t.end("This page could not be found"),null);if(w&&!f){let e=!!v.routes[b],t=v.dynamicRoutes[X];if(t&&!1===t.fallback&&!e){if(A.experimental.adapterPath)return await D();throw new S.NoFallbackError}}let F=null;!w||C.isDev||f||(F=b,F="/index"===F?"/":F);let U=!0===C.isDev||!w,M=w&&!U;P&&L&&(0,d.setManifestsSingleton)({page:r,clientReferenceManifest:L,serverActionsManifest:P});let k=e.method||"GET",G=(0,i.getTracer)(),H=G.getActiveScopeSpan(),q={params:g,prerenderManifest:v,renderOpts:{experimental:{authInterrupts:!!A.experimental.authInterrupts},cacheComponents:!!A.cacheComponents,supportsDynamicResponse:U,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:A.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>C.onRequestError(e,t,r,n,x)},sharedContext:{buildId:h}},K=new E.NodeNextRequest(e),j=new E.NodeNextResponse(t),B=T.NextRequestAdapter.fromNodeNextRequest(K,(0,T.signalFromNodeResponse)(t));try{let s=async e=>C.handle(B,q).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=G.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let t=`${k} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${k} ${r}`)}),d=!!(0,o.getRequestMeta)(e,"minimalMode"),l=async o=>{var i,l;let E=async({previousCacheEntry:n})=>{try{if(!d&&m&&y&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await s(o);e.fetchMetrics=q.renderOpts.fetchMetrics;let i=q.renderOpts.pendingWaitUntil;i&&a.waitUntil&&(a.waitUntil(i),i=void 0);let l=q.renderOpts.collectedTags;if(!w)return await (0,p.sendResponse)(K,j,r,q.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,_.toNodeOutgoingHttpHeaders)(r.headers);l&&(t[R.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==q.renderOpts.collectedRevalidate&&!(q.renderOpts.collectedRevalidate>=R.INFINITE_CACHE)&&q.renderOpts.collectedRevalidate,n=void 0===q.renderOpts.collectedExpire||q.renderOpts.collectedExpire>=R.INFINITE_CACHE?void 0:q.renderOpts.collectedExpire;return{value:{kind:O.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await C.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:m})},!1,x),t}},T=await C.handleResponse({req:e,nextConfig:A,cacheKey:F,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:v,isRoutePPREnabled:!1,isOnDemandRevalidate:m,revalidateOnlyGenerated:y,responseGenerator:E,waitUntil:a.waitUntil,isMinimalMode:d});if(!w)return null;if((null==T||null==(i=T.value)?void 0:i.kind)!==O.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==T||null==(l=T.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});d||t.setHeader("x-nextjs-cache",m?"REVALIDATED":T.isMiss?"MISS":T.isStale?"STALE":"HIT"),f&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,_.fromNodeOutgoingHttpHeaders)(T.value.headers);return d&&w||u.delete(R.NEXT_CACHE_TAGS_HEADER),!T.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,N.getCacheControlHeader)(T.cacheControl)),await (0,p.sendResponse)(K,j,new Response(T.value.body,{headers:u,status:T.value.status||200})),null};H?await l(H):await G.withPropagatedContext(e.headers,()=>G.trace(u.BaseServerSpan.handleRequest,{spanName:`${k} ${r}`,kind:i.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},l))}catch(t){if(t instanceof S.NoFallbackError||await C.onRequestError(e,t,{routerKind:"App Router",routePath:X,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:m})},!1,x),w)throw t;return await (0,p.sendResponse)(K,j,new Response(null,{status:500})),null}}e.s(["handler",()=>I,"patchFetch",()=>A,"routeModule",()=>C,"serverHooks",()=>x,"workAsyncStorage",()=>f,"workUnitAsyncStorage",()=>v]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__7d7c2c5b._.js.map