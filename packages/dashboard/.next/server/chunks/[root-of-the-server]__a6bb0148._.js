module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},86673,e=>e.a(async(t,a)=>{try{var n=e.i(16995),s=e.i(71004),r=t([n]);function o(e){return{id:e.id,agentId:e.agent_id,agentName:e.agent_name,model:e.agent_model,status:e.status,input:e.input,output:e.output||void 0,startedAt:e.started_at.toISOString(),completedAt:e.completed_at?.toISOString(),duration:e.duration||void 0,inputTokens:e.input_tokens,outputTokens:e.output_tokens,totalTokens:e.total_tokens,cost:parseFloat(e.cost)||0,error:e.error||void 0}}function i(e){return{id:e.id,name:e.name,arguments:e.arguments||{},result:e.result,status:e.status,duration:e.duration||void 0,error:e.error||void 0}}function d(e){return{id:e.id,role:e.role,content:e.content,toolCallId:e.tool_call_id||void 0,createdAt:e.created_at.toISOString()}}async function u(e){let t=`
    SELECT r.*, a.name as agent_name, a.model as agent_model
    FROM dashboard_runs r
    LEFT JOIN dashboard_agents a ON r.agent_id = a.id
    WHERE 1=1
  `,a=[],s=1;return e?.status&&(t+=` AND r.status = $${s++}`,a.push(e.status)),e?.agentId&&(t+=` AND r.agent_id = $${s++}`,a.push(e.agentId)),t+=" ORDER BY r.started_at DESC",e?.limit&&(t+=` LIMIT $${s++}`,a.push(e.limit)),e?.offset&&(t+=` OFFSET $${s++}`,a.push(e.offset)),(await (0,n.query)(t,a)).map(o)}async function l(e){let t=await (0,n.queryOne)(`SELECT r.*, a.name as agent_name, a.model as agent_model
     FROM dashboard_runs r
     LEFT JOIN dashboard_agents a ON r.agent_id = a.id
     WHERE r.id = $1`,[e]);return t?o(t):null}async function E(e){return(await (0,n.query)("SELECT * FROM dashboard_tool_calls WHERE run_id = $1 ORDER BY started_at",[e])).map(i)}async function c(e){return(await (0,n.query)("SELECT * FROM dashboard_messages WHERE run_id = $1 ORDER BY created_at",[e])).map(d)}async function T(e){let t=`run_${(0,s.nanoid)(12)}`;return await (0,n.execute)(`INSERT INTO dashboard_runs (id, agent_id, thread_id, input, status)
     VALUES ($1, $2, $3, $4, 'running')`,[t,e.agentId,e.threadId||null,e.input]),await l(t)}async function p(e,t){let a=[],s=[],r=1;return void 0!==t.status&&(a.push(`status = $${r++}`),s.push(t.status),("completed"===t.status||"failed"===t.status||"cancelled"===t.status)&&a.push("completed_at = NOW()")),void 0!==t.output&&(a.push(`output = $${r++}`),s.push(t.output)),void 0!==t.duration&&(a.push(`duration = $${r++}`),s.push(t.duration)),void 0!==t.inputTokens&&(a.push(`input_tokens = $${r++}`),s.push(t.inputTokens)),void 0!==t.outputTokens&&(a.push(`output_tokens = $${r++}`),s.push(t.outputTokens)),void 0!==t.totalTokens&&(a.push(`total_tokens = $${r++}`),s.push(t.totalTokens)),void 0!==t.cost&&(a.push(`cost = $${r++}`),s.push(t.cost)),void 0!==t.error&&(a.push(`error = $${r++}`),s.push(t.error)),0===a.length||(s.push(e),await (0,n.execute)(`UPDATE dashboard_runs SET ${a.join(", ")} WHERE id = $${r}`,s)),l(e)}async function _(e="day"){let t=await (0,n.queryOne)(`
    SELECT 
      COUNT(*) as total_runs,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_runs,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_runs,
      COALESCE(SUM(total_tokens), 0) as total_tokens,
      COALESCE(SUM(cost), 0) as total_cost
    FROM dashboard_runs
    WHERE started_at >= ${{day:"NOW() - INTERVAL '1 day'",week:"NOW() - INTERVAL '7 days'",month:"NOW() - INTERVAL '30 days'"}[e]}
  `);return{totalRuns:parseInt(t?.total_runs||"0"),completedRuns:parseInt(t?.completed_runs||"0"),failedRuns:parseInt(t?.failed_runs||"0"),totalTokens:parseInt(t?.total_tokens||"0"),totalCost:parseFloat(t?.total_cost||"0")}}[n]=r.then?(await r)():r,e.s(["createRun",()=>T,"getAllRuns",()=>u,"getRunById",()=>l,"getRunMessages",()=>c,"getRunStats",()=>_,"getRunToolCalls",()=>E,"updateRun",()=>p]),a()}catch(e){a(e)}},!1),65969,e=>e.a(async(t,a)=>{try{let t=await e.y("pg-7e2a21e93ebd274c");e.n(t),a()}catch(e){a(e)}},!0),16995,e=>e.a(async(t,a)=>{try{var n=e.i(65969),s=t([n]);[n]=s.then?(await s)():s;let l=null;function r(){return l||(l=new n.Pool({host:process.env.POSTGRES_HOST||"localhost",port:parseInt(process.env.POSTGRES_PORT||"5432"),user:process.env.POSTGRES_USER||"cogitator",password:process.env.POSTGRES_PASSWORD||"cogitator",database:process.env.POSTGRES_DB||"cogitator",max:20,idleTimeoutMillis:3e4,connectionTimeoutMillis:2e3})),l}async function o(e,t){let a=r();return(await a.query(e,t)).rows}async function i(e,t){return(await o(e,t))[0]||null}async function d(e,t){let a=r();return(await a.query(e,t)).rowCount||0}async function u(){let e=r();await e.query(`
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
  `)}e.s(["execute",()=>d,"getPool",()=>r,"initializeSchema",()=>u,"query",()=>o,"queryOne",()=>i]),a()}catch(e){a(e)}},!1),66680,(e,t,a)=>{t.exports=e.x("node:crypto",()=>require("node:crypto"))},71004,e=>{"use strict";let t,a;var n=e.i(66680);function s(e=21){var r;r=e|=0,!t||t.length<r?(t=Buffer.allocUnsafe(128*r),n.webcrypto.getRandomValues(t),a=0):a+r>t.length&&(n.webcrypto.getRandomValues(t),a=0),a+=r;let o="";for(let n=a-e;n<a;n++)o+="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict"[63&t[n]];return o}e.s(["nanoid",()=>s],71004)},33812,e=>e.a(async(t,a)=>{try{var n=e.i(16995),s=e.i(71004),r=t([n]);function o(e){return{id:e.id,name:e.name,model:e.model,status:e.status,totalRuns:e.total_runs,totalTokens:parseInt(e.total_tokens)||0,totalCost:parseFloat(e.total_cost)||0,lastRunAt:e.last_run_at?.toISOString()||null,createdAt:e.created_at.toISOString()}}async function i(){return(await (0,n.query)("SELECT * FROM dashboard_agents ORDER BY created_at DESC")).map(o)}async function d(e){let t=await (0,n.queryOne)("SELECT * FROM dashboard_agents WHERE id = $1",[e]);return t?o(t):null}async function u(e){let t=`agent_${(0,s.nanoid)(12)}`;return await (0,n.execute)(`INSERT INTO dashboard_agents (id, name, model, description, instructions)
     VALUES ($1, $2, $3, $4, $5)`,[t,e.name,e.model,e.description||null,e.instructions||null]),await d(t)}async function l(e,t){let a=[],s=[],r=1;return void 0!==t.name&&(a.push(`name = $${r++}`),s.push(t.name)),void 0!==t.model&&(a.push(`model = $${r++}`),s.push(t.model)),void 0!==t.description&&(a.push(`description = $${r++}`),s.push(t.description)),void 0!==t.instructions&&(a.push(`instructions = $${r++}`),s.push(t.instructions)),void 0!==t.status&&(a.push(`status = $${r++}`),s.push(t.status)),0===a.length||(a.push("updated_at = NOW()"),s.push(e),await (0,n.execute)(`UPDATE dashboard_agents SET ${a.join(", ")} WHERE id = $${r}`,s)),d(e)}async function E(e){return await (0,n.execute)("DELETE FROM dashboard_agents WHERE id = $1",[e])>0}async function c(e,t,a){await (0,n.execute)(`UPDATE dashboard_agents 
     SET total_runs = total_runs + 1, 
         total_tokens = total_tokens + $1,
         total_cost = total_cost + $2,
         last_run_at = NOW(),
         updated_at = NOW()
     WHERE id = $3`,[t,a,e])}async function T(){let e=await (0,n.queryOne)("SELECT COUNT(*) as count FROM dashboard_agents");return parseInt(e?.count||"0")}async function p(){let e=await T();if(0===e)for(let e of[{name:"Research Agent",model:"gpt-4o",description:"Analyzes data and provides comprehensive research reports"},{name:"Code Assistant",model:"claude-3-5-sonnet",description:"Helps with code reviews, refactoring, and documentation"},{name:"Data Analyst",model:"gpt-4o-mini",description:"Processes data and generates analytical insights"}])await u(e)}[n]=r.then?(await r)():r,e.s(["createAgent",()=>u,"deleteAgent",()=>E,"getAgentById",()=>d,"getAllAgents",()=>i,"incrementAgentStats",()=>c,"seedDefaultAgents",()=>p,"updateAgent",()=>l]),a()}catch(e){a(e)}},!1),38133,e=>e.a(async(t,a)=>{try{var n=e.i(95897),s=e.i(33812),r=e.i(86673),o=t([s,r]);async function i(e,{params:t}){try{let{id:e}=await t,a=await (0,s.getAgentById)(e);if(!a)return n.NextResponse.json({error:"Agent not found"},{status:404});let o=await (0,r.getAllRuns)({agentId:e,limit:20});return n.NextResponse.json({...a,recentRuns:o})}catch(e){return console.error("Failed to fetch agent:",e),n.NextResponse.json({error:"Failed to fetch agent"},{status:500})}}async function d(e,{params:t}){try{let{id:a}=await t,r=await e.json(),o=await (0,s.updateAgent)(a,{name:r.name,model:r.model,description:r.description,instructions:r.instructions,status:r.status});if(!o)return n.NextResponse.json({error:"Agent not found"},{status:404});return n.NextResponse.json(o)}catch(e){return console.error("Failed to update agent:",e),n.NextResponse.json({error:"Failed to update agent"},{status:500})}}async function u(e,{params:t}){try{let{id:e}=await t;if(!await (0,s.deleteAgent)(e))return n.NextResponse.json({error:"Agent not found"},{status:404});return n.NextResponse.json({success:!0})}catch(e){return console.error("Failed to delete agent:",e),n.NextResponse.json({error:"Failed to delete agent"},{status:500})}}[s,r]=o.then?(await o)():o,e.s(["DELETE",()=>u,"GET",()=>i,"PATCH",()=>d]),a()}catch(e){a(e)}},!1),48525,e=>e.a(async(t,a)=>{try{var n=e.i(51710),s=e.i(74963),r=e.i(81706),o=e.i(98867),i=e.i(5893),d=e.i(46463),u=e.i(23368),l=e.i(34613),E=e.i(40066),c=e.i(11516),T=e.i(40564),p=e.i(73827),_=e.i(73483),h=e.i(12582),R=e.i(74641),N=e.i(93695);e.i(48763);var g=e.i(4458),A=e.i(38133),S=t([A]);[A]=S.then?(await S)():S;let O=new n.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/agents/[id]/route",pathname:"/api/agents/[id]",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/packages/dashboard/src/app/api/agents/[id]/route.ts",nextConfigOutput:"",userland:A}),{workAsyncStorage:f,workUnitAsyncStorage:C,serverHooks:y}=O;function m(){return(0,r.patchFetch)({workAsyncStorage:f,workUnitAsyncStorage:C})}async function I(e,t,a){O.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/agents/[id]/route";n=n.replace(/\/index$/,"")||"/";let r=await O.prepare(e,t,{srcPage:n,multiZoneDraftMode:!1});if(!r)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:A,params:S,nextConfig:m,parsedUrl:I,isDraftMode:f,prerenderManifest:C,routerServerContext:y,isOnDemandRevalidate:x,revalidateOnlyGenerated:v,resolvedPathname:L,clientReferenceManifest:b,serverActionsManifest:w}=r,D=(0,u.normalizeAppPath)(n),F=!!(C.dynamicRoutes[D]||C.routes[L]),$=async()=>((null==y?void 0:y.render404)?await y.render404(e,t,I,!1):t.end("This page could not be found"),null);if(F&&!f){let e=!!C.routes[L],t=C.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(m.experimental.adapterPath)return await $();throw new N.NoFallbackError}}let X=null;!F||O.isDev||f||(X=L,X="/index"===X?"/":X);let U=!0===O.isDev||!F,M=F&&!U;w&&b&&(0,d.setManifestsSingleton)({page:n,clientReferenceManifest:b,serverActionsManifest:w});let k=e.method||"GET",P=(0,i.getTracer)(),H=P.getActiveScopeSpan(),q={params:S,prerenderManifest:C,renderOpts:{experimental:{authInterrupts:!!m.experimental.authInterrupts},cacheComponents:!!m.cacheComponents,supportsDynamicResponse:U,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:m.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,n,s)=>O.onRequestError(e,t,n,s,y)},sharedContext:{buildId:A}},B=new l.NodeNextRequest(e),j=new l.NodeNextResponse(t),W=E.NextRequestAdapter.fromNodeNextRequest(B,(0,E.signalFromNodeResponse)(t));try{let r=async e=>O.handle(W,q).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=P.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=a.get("next.route");if(s){let t=`${k} ${s}`;e.setAttributes({"next.route":s,"http.route":s,"next.span_name":t}),e.updateName(t)}else e.updateName(`${k} ${n}`)}),d=!!(0,o.getRequestMeta)(e,"minimalMode"),u=async o=>{var i,u;let l=async({previousCacheEntry:s})=>{try{if(!d&&x&&v&&!s)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await r(o);e.fetchMetrics=q.renderOpts.fetchMetrics;let i=q.renderOpts.pendingWaitUntil;i&&a.waitUntil&&(a.waitUntil(i),i=void 0);let u=q.renderOpts.collectedTags;if(!F)return await (0,p.sendResponse)(B,j,n,q.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,_.toNodeOutgoingHttpHeaders)(n.headers);u&&(t[R.NEXT_CACHE_TAGS_HEADER]=u),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==q.renderOpts.collectedRevalidate&&!(q.renderOpts.collectedRevalidate>=R.INFINITE_CACHE)&&q.renderOpts.collectedRevalidate,s=void 0===q.renderOpts.collectedExpire||q.renderOpts.collectedExpire>=R.INFINITE_CACHE?void 0:q.renderOpts.collectedExpire;return{value:{kind:g.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:s}}}}catch(t){throw(null==s?void 0:s.isStale)&&await O.onRequestError(e,t,{routerKind:"App Router",routePath:n,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:x})},!1,y),t}},E=await O.handleResponse({req:e,nextConfig:m,cacheKey:X,routeKind:s.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:x,revalidateOnlyGenerated:v,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:d});if(!F)return null;if((null==E||null==(i=E.value)?void 0:i.kind)!==g.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(u=E.value)?void 0:u.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});d||t.setHeader("x-nextjs-cache",x?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),f&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,_.fromNodeOutgoingHttpHeaders)(E.value.headers);return d&&F||c.delete(R.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,h.getCacheControlHeader)(E.cacheControl)),await (0,p.sendResponse)(B,j,new Response(E.value.body,{headers:c,status:E.value.status||200})),null};H?await u(H):await P.withPropagatedContext(e.headers,()=>P.trace(c.BaseServerSpan.handleRequest,{spanName:`${k} ${n}`,kind:i.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},u))}catch(t){if(t instanceof N.NoFallbackError||await O.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:x})},!1,y),F)throw t;return await (0,p.sendResponse)(B,j,new Response(null,{status:500})),null}}e.s(["handler",()=>I,"patchFetch",()=>m,"routeModule",()=>O,"serverHooks",()=>y,"workAsyncStorage",()=>f,"workUnitAsyncStorage",()=>C]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__a6bb0148._.js.map