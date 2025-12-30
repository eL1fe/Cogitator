module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},65969,e=>e.a(async(t,a)=>{try{let t=await e.y("pg-7e2a21e93ebd274c");e.n(t),a()}catch(e){a(e)}},!0),16995,e=>e.a(async(t,a)=>{try{var n=e.i(65969),r=t([n]);[n]=r.then?(await r)():r;let u=null;function s(){return u||(u=new n.Pool({host:process.env.POSTGRES_HOST||"localhost",port:parseInt(process.env.POSTGRES_PORT||"5432"),user:process.env.POSTGRES_USER||"cogitator",password:process.env.POSTGRES_PASSWORD||"cogitator",database:process.env.POSTGRES_DB||"cogitator",max:20,idleTimeoutMillis:3e4,connectionTimeoutMillis:2e3})),u}async function o(e,t){let a=s();return(await a.query(e,t)).rows}async function i(e,t){return(await o(e,t))[0]||null}async function d(e,t){let a=s();return(await a.query(e,t)).rowCount||0}async function l(){let e=s();await e.query(`
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
  `)}e.s(["execute",()=>d,"getPool",()=>s,"initializeSchema",()=>l,"query",()=>o,"queryOne",()=>i]),a()}catch(e){a(e)}},!1),66680,(e,t,a)=>{t.exports=e.x("node:crypto",()=>require("node:crypto"))},71004,e=>{"use strict";let t,a;var n=e.i(66680);function r(e=21){var s;s=e|=0,!t||t.length<s?(t=Buffer.allocUnsafe(128*s),n.webcrypto.getRandomValues(t),a=0):a+s>t.length&&(n.webcrypto.getRandomValues(t),a=0),a+=s;let o="";for(let n=a-e;n<a;n++)o+="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict"[63&t[n]];return o}e.s(["nanoid",()=>r],71004)},33812,e=>e.a(async(t,a)=>{try{var n=e.i(16995),r=e.i(71004),s=t([n]);function o(e){return{id:e.id,name:e.name,model:e.model,status:e.status,totalRuns:e.total_runs,totalTokens:parseInt(e.total_tokens)||0,totalCost:parseFloat(e.total_cost)||0,lastRunAt:e.last_run_at?.toISOString()||null,createdAt:e.created_at.toISOString()}}async function i(){return(await (0,n.query)("SELECT * FROM dashboard_agents ORDER BY created_at DESC")).map(o)}async function d(e){let t=await (0,n.queryOne)("SELECT * FROM dashboard_agents WHERE id = $1",[e]);return t?o(t):null}async function l(e){let t=`agent_${(0,r.nanoid)(12)}`;return await (0,n.execute)(`INSERT INTO dashboard_agents (id, name, model, description, instructions)
     VALUES ($1, $2, $3, $4, $5)`,[t,e.name,e.model,e.description||null,e.instructions||null]),await d(t)}async function u(e,t){let a=[],r=[],s=1;return void 0!==t.name&&(a.push(`name = $${s++}`),r.push(t.name)),void 0!==t.model&&(a.push(`model = $${s++}`),r.push(t.model)),void 0!==t.description&&(a.push(`description = $${s++}`),r.push(t.description)),void 0!==t.instructions&&(a.push(`instructions = $${s++}`),r.push(t.instructions)),void 0!==t.status&&(a.push(`status = $${s++}`),r.push(t.status)),0===a.length||(a.push("updated_at = NOW()"),r.push(e),await (0,n.execute)(`UPDATE dashboard_agents SET ${a.join(", ")} WHERE id = $${s}`,r)),d(e)}async function E(e){return await (0,n.execute)("DELETE FROM dashboard_agents WHERE id = $1",[e])>0}async function c(e,t,a){await (0,n.execute)(`UPDATE dashboard_agents 
     SET total_runs = total_runs + 1, 
         total_tokens = total_tokens + $1,
         total_cost = total_cost + $2,
         last_run_at = NOW(),
         updated_at = NOW()
     WHERE id = $3`,[t,a,e])}async function T(){let e=await (0,n.queryOne)("SELECT COUNT(*) as count FROM dashboard_agents");return parseInt(e?.count||"0")}async function p(){let e=await T();if(0===e)for(let e of[{name:"Research Agent",model:"gpt-4o",description:"Analyzes data and provides comprehensive research reports"},{name:"Code Assistant",model:"claude-3-5-sonnet",description:"Helps with code reviews, refactoring, and documentation"},{name:"Data Analyst",model:"gpt-4o-mini",description:"Processes data and generates analytical insights"}])await l(e)}[n]=s.then?(await s)():s,e.s(["createAgent",()=>l,"deleteAgent",()=>E,"getAgentById",()=>d,"getAllAgents",()=>i,"incrementAgentStats",()=>c,"seedDefaultAgents",()=>p,"updateAgent",()=>u]),a()}catch(e){a(e)}},!1),99406,e=>e.a(async(t,a)=>{try{var n=e.i(95897),r=e.i(33812),s=e.i(16995),o=t([r,s]);[r,s]=o.then?(await o)():o;let u=!1;async function i(){if(!u)try{await (0,s.initializeSchema)(),await (0,r.seedDefaultAgents)(),u=!0}catch(e){console.error("Failed to initialize database:",e)}}async function d(){try{await i();let e=await (0,r.getAllAgents)();return n.NextResponse.json(e)}catch(e){return console.error("Failed to fetch agents:",e),n.NextResponse.json({error:"Failed to fetch agents"},{status:500})}}async function l(e){try{await i();let t=await e.json();if(!t.name||!t.model)return n.NextResponse.json({error:"Name and model are required"},{status:400});let a=await (0,r.createAgent)({name:t.name,model:t.model,description:t.description,instructions:t.instructions});return n.NextResponse.json(a,{status:201})}catch(e){return console.error("Failed to create agent:",e),n.NextResponse.json({error:"Failed to create agent"},{status:500})}}e.s(["GET",()=>d,"POST",()=>l]),a()}catch(e){a(e)}},!1),34037,e=>e.a(async(t,a)=>{try{var n=e.i(51710),r=e.i(74963),s=e.i(81706),o=e.i(98867),i=e.i(5893),d=e.i(46463),l=e.i(23368),u=e.i(34613),E=e.i(40066),c=e.i(11516),T=e.i(40564),p=e.i(73827),_=e.i(73483),h=e.i(12582),N=e.i(74641),R=e.i(93695);e.i(48763);var g=e.i(4458),A=e.i(99406),S=t([A]);[A]=S.then?(await S)():S;let m=new n.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/agents/route",pathname:"/api/agents",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/packages/dashboard/src/app/api/agents/route.ts",nextConfigOutput:"",userland:A}),{workAsyncStorage:x,workUnitAsyncStorage:C,serverHooks:f}=m;function I(){return(0,s.patchFetch)({workAsyncStorage:x,workUnitAsyncStorage:C})}async function O(e,t,a){m.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/agents/route";n=n.replace(/\/index$/,"")||"/";let s=await m.prepare(e,t,{srcPage:n,multiZoneDraftMode:!1});if(!s)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:A,params:S,nextConfig:I,parsedUrl:O,isDraftMode:x,prerenderManifest:C,routerServerContext:f,isOnDemandRevalidate:y,revalidateOnlyGenerated:b,resolvedPathname:v,clientReferenceManifest:w,serverActionsManifest:L}=s,X=(0,l.normalizeAppPath)(n),D=!!(C.dynamicRoutes[X]||C.routes[v]),F=async()=>((null==f?void 0:f.render404)?await f.render404(e,t,O,!1):t.end("This page could not be found"),null);if(D&&!x){let e=!!C.routes[v],t=C.dynamicRoutes[X];if(t&&!1===t.fallback&&!e){if(I.experimental.adapterPath)return await F();throw new R.NoFallbackError}}let U=null;!D||m.isDev||x||(U=v,U="/index"===U?"/":U);let P=!0===m.isDev||!D,M=D&&!P;L&&w&&(0,d.setManifestsSingleton)({page:n,clientReferenceManifest:w,serverActionsManifest:L});let k=e.method||"GET",$=(0,i.getTracer)(),q=$.getActiveScopeSpan(),H={params:S,prerenderManifest:C,renderOpts:{experimental:{authInterrupts:!!I.experimental.authInterrupts},cacheComponents:!!I.cacheComponents,supportsDynamicResponse:P,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:I.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,n,r)=>m.onRequestError(e,t,n,r,f)},sharedContext:{buildId:A}},B=new u.NodeNextRequest(e),j=new u.NodeNextResponse(t),K=E.NextRequestAdapter.fromNodeNextRequest(B,(0,E.signalFromNodeResponse)(t));try{let s=async e=>m.handle(K,H).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=$.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${k} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t)}else e.updateName(`${k} ${n}`)}),d=!!(0,o.getRequestMeta)(e,"minimalMode"),l=async o=>{var i,l;let u=async({previousCacheEntry:r})=>{try{if(!d&&y&&b&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await s(o);e.fetchMetrics=H.renderOpts.fetchMetrics;let i=H.renderOpts.pendingWaitUntil;i&&a.waitUntil&&(a.waitUntil(i),i=void 0);let l=H.renderOpts.collectedTags;if(!D)return await (0,p.sendResponse)(B,j,n,H.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,_.toNodeOutgoingHttpHeaders)(n.headers);l&&(t[N.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==H.renderOpts.collectedRevalidate&&!(H.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&H.renderOpts.collectedRevalidate,r=void 0===H.renderOpts.collectedExpire||H.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:H.renderOpts.collectedExpire;return{value:{kind:g.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==r?void 0:r.isStale)&&await m.onRequestError(e,t,{routerKind:"App Router",routePath:n,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:y})},!1,f),t}},E=await m.handleResponse({req:e,nextConfig:I,cacheKey:U,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:y,revalidateOnlyGenerated:b,responseGenerator:u,waitUntil:a.waitUntil,isMinimalMode:d});if(!D)return null;if((null==E||null==(i=E.value)?void 0:i.kind)!==g.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(l=E.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});d||t.setHeader("x-nextjs-cache",y?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),x&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,_.fromNodeOutgoingHttpHeaders)(E.value.headers);return d&&D||c.delete(N.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,h.getCacheControlHeader)(E.cacheControl)),await (0,p.sendResponse)(B,j,new Response(E.value.body,{headers:c,status:E.value.status||200})),null};q?await l(q):await $.withPropagatedContext(e.headers,()=>$.trace(c.BaseServerSpan.handleRequest,{spanName:`${k} ${n}`,kind:i.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},l))}catch(t){if(t instanceof R.NoFallbackError||await m.onRequestError(e,t,{routerKind:"App Router",routePath:X,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:y})},!1,f),D)throw t;return await (0,p.sendResponse)(B,j,new Response(null,{status:500})),null}}e.s(["handler",()=>O,"patchFetch",()=>I,"routeModule",()=>m,"serverHooks",()=>f,"workAsyncStorage",()=>x,"workUnitAsyncStorage",()=>C]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__652f865e._.js.map