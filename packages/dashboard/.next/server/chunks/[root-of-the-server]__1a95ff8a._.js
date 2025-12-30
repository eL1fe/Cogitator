module.exports=[70406,(t,e,a)=>{e.exports=t.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(t,e,a)=>{e.exports=t.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(t,e,a)=>{e.exports=t.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(t,e,a)=>{e.exports=t.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(t,e,a)=>{e.exports=t.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(t,e,a)=>{e.exports=t.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},24361,(t,e,a)=>{e.exports=t.x("util",()=>require("util"))},14747,(t,e,a)=>{e.exports=t.x("path",()=>require("path"))},86673,t=>t.a(async(e,a)=>{try{var n=t.i(16995),s=t.i(71004),r=e([n]);function o(t){return{id:t.id,agentId:t.agent_id,agentName:t.agent_name,model:t.agent_model,status:t.status,input:t.input,output:t.output||void 0,startedAt:t.started_at.toISOString(),completedAt:t.completed_at?.toISOString(),duration:t.duration||void 0,inputTokens:t.input_tokens,outputTokens:t.output_tokens,totalTokens:t.total_tokens,cost:parseFloat(t.cost)||0,error:t.error||void 0}}function i(t){return{id:t.id,name:t.name,arguments:t.arguments||{},result:t.result,status:t.status,duration:t.duration||void 0,error:t.error||void 0}}function d(t){return{id:t.id,role:t.role,content:t.content,toolCallId:t.tool_call_id||void 0,createdAt:t.created_at.toISOString()}}async function u(t){let e=`
    SELECT r.*, a.name as agent_name, a.model as agent_model
    FROM dashboard_runs r
    LEFT JOIN dashboard_agents a ON r.agent_id = a.id
    WHERE 1=1
  `,a=[],s=1;return t?.status&&(e+=` AND r.status = $${s++}`,a.push(t.status)),t?.agentId&&(e+=` AND r.agent_id = $${s++}`,a.push(t.agentId)),e+=" ORDER BY r.started_at DESC",t?.limit&&(e+=` LIMIT $${s++}`,a.push(t.limit)),t?.offset&&(e+=` OFFSET $${s++}`,a.push(t.offset)),(await (0,n.query)(e,a)).map(o)}async function l(t){let e=await (0,n.queryOne)(`SELECT r.*, a.name as agent_name, a.model as agent_model
     FROM dashboard_runs r
     LEFT JOIN dashboard_agents a ON r.agent_id = a.id
     WHERE r.id = $1`,[t]);return e?o(e):null}async function E(t){return(await (0,n.query)("SELECT * FROM dashboard_tool_calls WHERE run_id = $1 ORDER BY started_at",[t])).map(i)}async function c(t){return(await (0,n.query)("SELECT * FROM dashboard_messages WHERE run_id = $1 ORDER BY created_at",[t])).map(d)}async function T(t){let e=`run_${(0,s.nanoid)(12)}`;return await (0,n.execute)(`INSERT INTO dashboard_runs (id, agent_id, thread_id, input, status)
     VALUES ($1, $2, $3, $4, 'running')`,[e,t.agentId,t.threadId||null,t.input]),await l(e)}async function p(t,e){let a=[],s=[],r=1;return void 0!==e.status&&(a.push(`status = $${r++}`),s.push(e.status),("completed"===e.status||"failed"===e.status||"cancelled"===e.status)&&a.push("completed_at = NOW()")),void 0!==e.output&&(a.push(`output = $${r++}`),s.push(e.output)),void 0!==e.duration&&(a.push(`duration = $${r++}`),s.push(e.duration)),void 0!==e.inputTokens&&(a.push(`input_tokens = $${r++}`),s.push(e.inputTokens)),void 0!==e.outputTokens&&(a.push(`output_tokens = $${r++}`),s.push(e.outputTokens)),void 0!==e.totalTokens&&(a.push(`total_tokens = $${r++}`),s.push(e.totalTokens)),void 0!==e.cost&&(a.push(`cost = $${r++}`),s.push(e.cost)),void 0!==e.error&&(a.push(`error = $${r++}`),s.push(e.error)),0===a.length||(s.push(t),await (0,n.execute)(`UPDATE dashboard_runs SET ${a.join(", ")} WHERE id = $${r}`,s)),l(t)}async function _(t="day"){let e=await (0,n.queryOne)(`
    SELECT 
      COUNT(*) as total_runs,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_runs,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_runs,
      COALESCE(SUM(total_tokens), 0) as total_tokens,
      COALESCE(SUM(cost), 0) as total_cost
    FROM dashboard_runs
    WHERE started_at >= ${{day:"NOW() - INTERVAL '1 day'",week:"NOW() - INTERVAL '7 days'",month:"NOW() - INTERVAL '30 days'"}[t]}
  `);return{totalRuns:parseInt(e?.total_runs||"0"),completedRuns:parseInt(e?.completed_runs||"0"),failedRuns:parseInt(e?.failed_runs||"0"),totalTokens:parseInt(e?.total_tokens||"0"),totalCost:parseFloat(e?.total_cost||"0")}}[n]=r.then?(await r)():r,t.s(["createRun",()=>T,"getAllRuns",()=>u,"getRunById",()=>l,"getRunMessages",()=>c,"getRunStats",()=>_,"getRunToolCalls",()=>E,"updateRun",()=>p]),a()}catch(t){a(t)}},!1),65969,t=>t.a(async(e,a)=>{try{let e=await t.y("pg-7e2a21e93ebd274c");t.n(e),a()}catch(t){a(t)}},!0),16995,t=>t.a(async(e,a)=>{try{var n=t.i(65969),s=e([n]);[n]=s.then?(await s)():s;let l=null;function r(){return l||(l=new n.Pool({host:process.env.POSTGRES_HOST||"localhost",port:parseInt(process.env.POSTGRES_PORT||"5432"),user:process.env.POSTGRES_USER||"cogitator",password:process.env.POSTGRES_PASSWORD||"cogitator",database:process.env.POSTGRES_DB||"cogitator",max:20,idleTimeoutMillis:3e4,connectionTimeoutMillis:2e3})),l}async function o(t,e){let a=r();return(await a.query(t,e)).rows}async function i(t,e){return(await o(t,e))[0]||null}async function d(t,e){let a=r();return(await a.query(t,e)).rowCount||0}async function u(){let t=r();await t.query(`
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
  `)}t.s(["execute",()=>d,"getPool",()=>r,"initializeSchema",()=>u,"query",()=>o,"queryOne",()=>i]),a()}catch(t){a(t)}},!1),66680,(t,e,a)=>{e.exports=t.x("node:crypto",()=>require("node:crypto"))},71004,t=>{"use strict";let e,a;var n=t.i(66680);function s(t=21){var r;r=t|=0,!e||e.length<r?(e=Buffer.allocUnsafe(128*r),n.webcrypto.getRandomValues(e),a=0):a+r>e.length&&(n.webcrypto.getRandomValues(e),a=0),a+=r;let o="";for(let n=a-t;n<a;n++)o+="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict"[63&e[n]];return o}t.s(["nanoid",()=>s],71004)},33812,t=>t.a(async(e,a)=>{try{var n=t.i(16995),s=t.i(71004),r=e([n]);function o(t){return{id:t.id,name:t.name,model:t.model,status:t.status,totalRuns:t.total_runs,totalTokens:parseInt(t.total_tokens)||0,totalCost:parseFloat(t.total_cost)||0,lastRunAt:t.last_run_at?.toISOString()||null,createdAt:t.created_at.toISOString()}}async function i(){return(await (0,n.query)("SELECT * FROM dashboard_agents ORDER BY created_at DESC")).map(o)}async function d(t){let e=await (0,n.queryOne)("SELECT * FROM dashboard_agents WHERE id = $1",[t]);return e?o(e):null}async function u(t){let e=`agent_${(0,s.nanoid)(12)}`;return await (0,n.execute)(`INSERT INTO dashboard_agents (id, name, model, description, instructions)
     VALUES ($1, $2, $3, $4, $5)`,[e,t.name,t.model,t.description||null,t.instructions||null]),await d(e)}async function l(t,e){let a=[],s=[],r=1;return void 0!==e.name&&(a.push(`name = $${r++}`),s.push(e.name)),void 0!==e.model&&(a.push(`model = $${r++}`),s.push(e.model)),void 0!==e.description&&(a.push(`description = $${r++}`),s.push(e.description)),void 0!==e.instructions&&(a.push(`instructions = $${r++}`),s.push(e.instructions)),void 0!==e.status&&(a.push(`status = $${r++}`),s.push(e.status)),0===a.length||(a.push("updated_at = NOW()"),s.push(t),await (0,n.execute)(`UPDATE dashboard_agents SET ${a.join(", ")} WHERE id = $${r}`,s)),d(t)}async function E(t){return await (0,n.execute)("DELETE FROM dashboard_agents WHERE id = $1",[t])>0}async function c(t,e,a){await (0,n.execute)(`UPDATE dashboard_agents 
     SET total_runs = total_runs + 1, 
         total_tokens = total_tokens + $1,
         total_cost = total_cost + $2,
         last_run_at = NOW(),
         updated_at = NOW()
     WHERE id = $3`,[e,a,t])}async function T(){let t=await (0,n.queryOne)("SELECT COUNT(*) as count FROM dashboard_agents");return parseInt(t?.count||"0")}async function p(){let t=await T();if(0===t)for(let t of[{name:"Research Agent",model:"gpt-4o",description:"Analyzes data and provides comprehensive research reports"},{name:"Code Assistant",model:"claude-3-5-sonnet",description:"Helps with code reviews, refactoring, and documentation"},{name:"Data Analyst",model:"gpt-4o-mini",description:"Processes data and generates analytical insights"}])await u(t)}[n]=r.then?(await r)():r,t.s(["createAgent",()=>u,"deleteAgent",()=>E,"getAgentById",()=>d,"getAllAgents",()=>i,"incrementAgentStats",()=>c,"seedDefaultAgents",()=>p,"updateAgent",()=>l]),a()}catch(t){a(t)}},!1),45237,t=>t.a(async(e,a)=>{try{var n=t.i(16995),s=e([n]);function r(t){return{id:t.id,traceId:t.trace_id,parentId:t.parent_id||void 0,name:t.name,kind:t.kind,status:t.status,startTime:parseInt(t.start_time),endTime:t.end_time?parseInt(t.end_time):void 0,duration:t.duration||void 0,attributes:t.attributes||{},events:t.events||[],children:[]}}async function o(t){var e=(await (0,n.query)("SELECT * FROM dashboard_spans WHERE run_id = $1 ORDER BY start_time",[t])).map(r);let a=new Map,s=[];for(let t of e)a.set(t.id,{...t,children:[]});for(let t of e){let e=a.get(t.id);if(t.parentId){let n=a.get(t.parentId);n?(n.children=n.children||[],n.children.push(e)):s.push(e)}else s.push(e)}return s}[n]=s.then?(await s)():s,t.s(["getSpansByRunId",()=>o]),a()}catch(t){a(t)}},!1),43318,t=>t.a(async(e,a)=>{try{var n=t.i(95897),s=t.i(86673),r=t.i(45237),o=t.i(33812),i=t.i(60750),d=e([s,r,o]);async function u(t,{params:e}){try{let{id:t}=await e,a=await (0,s.getRunById)(t);if(!a)return n.NextResponse.json({error:"Run not found"},{status:404});let[o,i,d]=await Promise.all([(0,s.getRunToolCalls)(t),(0,s.getRunMessages)(t),(0,r.getSpansByRunId)(t)]);return n.NextResponse.json({...a,toolCalls:o,messages:i,spans:d})}catch(t){return console.error("Failed to fetch run:",t),n.NextResponse.json({error:"Failed to fetch run"},{status:500})}}async function l(t,{params:e}){try{let{id:a}=await e,r=await t.json(),d=await (0,s.getRunById)(a);if(!d)return n.NextResponse.json({error:"Run not found"},{status:404});let u=await (0,s.updateRun)(a,{status:r.status,output:r.output,duration:r.duration,inputTokens:r.inputTokens,outputTokens:r.outputTokens,totalTokens:r.totalTokens,cost:r.cost,error:r.error});if("completed"===r.status||"failed"===r.status){try{await (0,o.incrementAgentStats)(d.agentId,r.totalTokens||0,r.cost||0)}catch{}try{let t="completed"===r.status?i.CHANNELS.RUN_COMPLETED:i.CHANNELS.RUN_FAILED;await (0,i.publish)(t,u)}catch{}}return n.NextResponse.json(u)}catch(t){return console.error("Failed to update run:",t),n.NextResponse.json({error:"Failed to update run"},{status:500})}}[s,r,o]=d.then?(await d)():d,t.s(["GET",()=>u,"PATCH",()=>l]),a()}catch(t){a(t)}},!1),72072,t=>t.a(async(e,a)=>{try{var n=t.i(51710),s=t.i(74963),r=t.i(81706),o=t.i(98867),i=t.i(5893),d=t.i(46463),u=t.i(23368),l=t.i(34613),E=t.i(40066),c=t.i(11516),T=t.i(40564),p=t.i(73827),_=t.i(73483),h=t.i(12582),R=t.i(74641),N=t.i(93695);t.i(48763);var g=t.i(4458),I=t.i(43318),S=e([I]);[I]=S.then?(await S)():S;let O=new n.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/runs/[id]/route",pathname:"/api/runs/[id]",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/packages/dashboard/src/app/api/runs/[id]/route.ts",nextConfigOutput:"",userland:I}),{workAsyncStorage:f,workUnitAsyncStorage:y,serverHooks:C}=O;function m(){return(0,r.patchFetch)({workAsyncStorage:f,workUnitAsyncStorage:y})}async function A(t,e,a){O.isDev&&(0,o.addRequestMeta)(t,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/runs/[id]/route";n=n.replace(/\/index$/,"")||"/";let r=await O.prepare(t,e,{srcPage:n,multiZoneDraftMode:!1});if(!r)return e.statusCode=400,e.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:I,params:S,nextConfig:m,parsedUrl:A,isDraftMode:f,prerenderManifest:y,routerServerContext:C,isOnDemandRevalidate:v,revalidateOnlyGenerated:x,resolvedPathname:L,clientReferenceManifest:b,serverActionsManifest:w}=r,D=(0,u.normalizeAppPath)(n),F=!!(y.dynamicRoutes[D]||y.routes[L]),$=async()=>((null==C?void 0:C.render404)?await C.render404(t,e,A,!1):e.end("This page could not be found"),null);if(F&&!f){let t=!!y.routes[L],e=y.dynamicRoutes[D];if(e&&!1===e.fallback&&!t){if(m.experimental.adapterPath)return await $();throw new N.NoFallbackError}}let X=null;!F||O.isDev||f||(X=L,X="/index"===X?"/":X);let U=!0===O.isDev||!F,k=F&&!U;w&&b&&(0,d.setManifestsSingleton)({page:n,clientReferenceManifest:b,serverActionsManifest:w});let M=t.method||"GET",P=(0,i.getTracer)(),H=P.getActiveScopeSpan(),q={params:S,prerenderManifest:y,renderOpts:{experimental:{authInterrupts:!!m.experimental.authInterrupts},cacheComponents:!!m.cacheComponents,supportsDynamicResponse:U,incrementalCache:(0,o.getRequestMeta)(t,"incrementalCache"),cacheLifeProfiles:m.cacheLife,waitUntil:a.waitUntil,onClose:t=>{e.on("close",t)},onAfterTaskError:void 0,onInstrumentationRequestError:(e,a,n,s)=>O.onRequestError(t,e,n,s,C)},sharedContext:{buildId:I}},B=new l.NodeNextRequest(t),W=new l.NodeNextResponse(e),j=E.NextRequestAdapter.fromNodeNextRequest(B,(0,E.signalFromNodeResponse)(e));try{let r=async t=>O.handle(j,q).finally(()=>{if(!t)return;t.setAttributes({"http.status_code":e.statusCode,"next.rsc":!1});let a=P.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=a.get("next.route");if(s){let e=`${M} ${s}`;t.setAttributes({"next.route":s,"http.route":s,"next.span_name":e}),t.updateName(e)}else t.updateName(`${M} ${n}`)}),d=!!(0,o.getRequestMeta)(t,"minimalMode"),u=async o=>{var i,u;let l=async({previousCacheEntry:s})=>{try{if(!d&&v&&x&&!s)return e.statusCode=404,e.setHeader("x-nextjs-cache","REVALIDATED"),e.end("This page could not be found"),null;let n=await r(o);t.fetchMetrics=q.renderOpts.fetchMetrics;let i=q.renderOpts.pendingWaitUntil;i&&a.waitUntil&&(a.waitUntil(i),i=void 0);let u=q.renderOpts.collectedTags;if(!F)return await (0,p.sendResponse)(B,W,n,q.renderOpts.pendingWaitUntil),null;{let t=await n.blob(),e=(0,_.toNodeOutgoingHttpHeaders)(n.headers);u&&(e[R.NEXT_CACHE_TAGS_HEADER]=u),!e["content-type"]&&t.type&&(e["content-type"]=t.type);let a=void 0!==q.renderOpts.collectedRevalidate&&!(q.renderOpts.collectedRevalidate>=R.INFINITE_CACHE)&&q.renderOpts.collectedRevalidate,s=void 0===q.renderOpts.collectedExpire||q.renderOpts.collectedExpire>=R.INFINITE_CACHE?void 0:q.renderOpts.collectedExpire;return{value:{kind:g.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await t.arrayBuffer()),headers:e},cacheControl:{revalidate:a,expire:s}}}}catch(e){throw(null==s?void 0:s.isStale)&&await O.onRequestError(t,e,{routerKind:"App Router",routePath:n,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:v})},!1,C),e}},E=await O.handleResponse({req:t,nextConfig:m,cacheKey:X,routeKind:s.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:v,revalidateOnlyGenerated:x,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:d});if(!F)return null;if((null==E||null==(i=E.value)?void 0:i.kind)!==g.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(u=E.value)?void 0:u.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});d||e.setHeader("x-nextjs-cache",v?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),f&&e.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,_.fromNodeOutgoingHttpHeaders)(E.value.headers);return d&&F||c.delete(R.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||e.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,h.getCacheControlHeader)(E.cacheControl)),await (0,p.sendResponse)(B,W,new Response(E.value.body,{headers:c,status:E.value.status||200})),null};H?await u(H):await P.withPropagatedContext(t.headers,()=>P.trace(c.BaseServerSpan.handleRequest,{spanName:`${M} ${n}`,kind:i.SpanKind.SERVER,attributes:{"http.method":M,"http.target":t.url}},u))}catch(e){if(e instanceof N.NoFallbackError||await O.onRequestError(t,e,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:v})},!1,C),F)throw e;return await (0,p.sendResponse)(B,W,new Response(null,{status:500})),null}}t.s(["handler",()=>A,"patchFetch",()=>m,"routeModule",()=>O,"serverHooks",()=>C,"workAsyncStorage",()=>f,"workUnitAsyncStorage",()=>y]),a()}catch(t){a(t)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__1a95ff8a._.js.map