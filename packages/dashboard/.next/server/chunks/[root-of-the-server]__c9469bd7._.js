module.exports=[70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},24361,(e,t,a)=>{t.exports=e.x("util",()=>require("util"))},14747,(e,t,a)=>{t.exports=e.x("path",()=>require("path"))},65969,e=>e.a(async(t,a)=>{try{let t=await e.y("pg-7e2a21e93ebd274c");e.n(t),a()}catch(e){a(e)}},!0),16995,e=>e.a(async(t,a)=>{try{var r=e.i(65969),n=t([r]);[r]=n.then?(await n)():n;let l=null;function s(){return l||(l=new r.Pool({host:process.env.POSTGRES_HOST||"localhost",port:parseInt(process.env.POSTGRES_PORT||"5432"),user:process.env.POSTGRES_USER||"cogitator",password:process.env.POSTGRES_PASSWORD||"cogitator",database:process.env.POSTGRES_DB||"cogitator",max:20,idleTimeoutMillis:3e4,connectionTimeoutMillis:2e3})),l}async function o(e,t){let a=s();return(await a.query(e,t)).rows}async function i(e,t){return(await o(e,t))[0]||null}async function d(e,t){let a=s();return(await a.query(e,t)).rowCount||0}async function u(){let e=s();await e.query(`
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
  `)}e.s(["execute",()=>d,"getPool",()=>s,"initializeSchema",()=>u,"query",()=>o,"queryOne",()=>i]),a()}catch(e){a(e)}},!1),66680,(e,t,a)=>{t.exports=e.x("node:crypto",()=>require("node:crypto"))},71004,e=>{"use strict";let t,a;var r=e.i(66680);function n(e=21){var s;s=e|=0,!t||t.length<s?(t=Buffer.allocUnsafe(128*s),r.webcrypto.getRandomValues(t),a=0):a+s>t.length&&(r.webcrypto.getRandomValues(t),a=0),a+=s;let o="";for(let r=a-e;r<a;r++)o+="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict"[63&t[r]];return o}e.s(["nanoid",()=>n],71004)},86673,e=>e.a(async(t,a)=>{try{var r=e.i(16995),n=e.i(71004),s=t([r]);function o(e){return{id:e.id,agentId:e.agent_id,agentName:e.agent_name,model:e.agent_model,status:e.status,input:e.input,output:e.output||void 0,startedAt:e.started_at.toISOString(),completedAt:e.completed_at?.toISOString(),duration:e.duration||void 0,inputTokens:e.input_tokens,outputTokens:e.output_tokens,totalTokens:e.total_tokens,cost:parseFloat(e.cost)||0,error:e.error||void 0}}function i(e){return{id:e.id,name:e.name,arguments:e.arguments||{},result:e.result,status:e.status,duration:e.duration||void 0,error:e.error||void 0}}function d(e){return{id:e.id,role:e.role,content:e.content,toolCallId:e.tool_call_id||void 0,createdAt:e.created_at.toISOString()}}async function u(e){let t=`
    SELECT r.*, a.name as agent_name, a.model as agent_model
    FROM dashboard_runs r
    LEFT JOIN dashboard_agents a ON r.agent_id = a.id
    WHERE 1=1
  `,a=[],n=1;return e?.status&&(t+=` AND r.status = $${n++}`,a.push(e.status)),e?.agentId&&(t+=` AND r.agent_id = $${n++}`,a.push(e.agentId)),t+=" ORDER BY r.started_at DESC",e?.limit&&(t+=` LIMIT $${n++}`,a.push(e.limit)),e?.offset&&(t+=` OFFSET $${n++}`,a.push(e.offset)),(await (0,r.query)(t,a)).map(o)}async function l(e){let t=await (0,r.queryOne)(`SELECT r.*, a.name as agent_name, a.model as agent_model
     FROM dashboard_runs r
     LEFT JOIN dashboard_agents a ON r.agent_id = a.id
     WHERE r.id = $1`,[e]);return t?o(t):null}async function E(e){return(await (0,r.query)("SELECT * FROM dashboard_tool_calls WHERE run_id = $1 ORDER BY started_at",[e])).map(i)}async function T(e){return(await (0,r.query)("SELECT * FROM dashboard_messages WHERE run_id = $1 ORDER BY created_at",[e])).map(d)}async function c(e){let t=`run_${(0,n.nanoid)(12)}`;return await (0,r.execute)(`INSERT INTO dashboard_runs (id, agent_id, thread_id, input, status)
     VALUES ($1, $2, $3, $4, 'running')`,[t,e.agentId,e.threadId||null,e.input]),await l(t)}async function p(e,t){let a=[],n=[],s=1;return void 0!==t.status&&(a.push(`status = $${s++}`),n.push(t.status),("completed"===t.status||"failed"===t.status||"cancelled"===t.status)&&a.push("completed_at = NOW()")),void 0!==t.output&&(a.push(`output = $${s++}`),n.push(t.output)),void 0!==t.duration&&(a.push(`duration = $${s++}`),n.push(t.duration)),void 0!==t.inputTokens&&(a.push(`input_tokens = $${s++}`),n.push(t.inputTokens)),void 0!==t.outputTokens&&(a.push(`output_tokens = $${s++}`),n.push(t.outputTokens)),void 0!==t.totalTokens&&(a.push(`total_tokens = $${s++}`),n.push(t.totalTokens)),void 0!==t.cost&&(a.push(`cost = $${s++}`),n.push(t.cost)),void 0!==t.error&&(a.push(`error = $${s++}`),n.push(t.error)),0===a.length||(n.push(e),await (0,r.execute)(`UPDATE dashboard_runs SET ${a.join(", ")} WHERE id = $${s}`,n)),l(e)}async function _(e="day"){let t=await (0,r.queryOne)(`
    SELECT 
      COUNT(*) as total_runs,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_runs,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_runs,
      COALESCE(SUM(total_tokens), 0) as total_tokens,
      COALESCE(SUM(cost), 0) as total_cost
    FROM dashboard_runs
    WHERE started_at >= ${{day:"NOW() - INTERVAL '1 day'",week:"NOW() - INTERVAL '7 days'",month:"NOW() - INTERVAL '30 days'"}[e]}
  `);return{totalRuns:parseInt(t?.total_runs||"0"),completedRuns:parseInt(t?.completed_runs||"0"),failedRuns:parseInt(t?.failed_runs||"0"),totalTokens:parseInt(t?.total_tokens||"0"),totalCost:parseFloat(t?.total_cost||"0")}}[r]=s.then?(await s)():s,e.s(["createRun",()=>c,"getAllRuns",()=>u,"getRunById",()=>l,"getRunMessages",()=>T,"getRunStats",()=>_,"getRunToolCalls",()=>E,"updateRun",()=>p]),a()}catch(e){a(e)}},!1),90183,e=>e.a(async(t,a)=>{try{var r=e.i(95897),n=e.i(86673),s=e.i(16995),o=e.i(60750),i=t([n,s]);[n,s]=i.then?(await i)():i;let E=!1;async function d(){if(!E)try{await (0,s.initializeSchema)(),E=!0}catch(e){console.error("Failed to initialize database:",e)}}async function u(e){try{await d();let t=e.nextUrl.searchParams,a=t.get("status")||void 0,s=t.get("agentId")||void 0,o=parseInt(t.get("limit")||"50"),i=parseInt(t.get("offset")||"0"),u=await (0,n.getAllRuns)({status:a,agentId:s,limit:o,offset:i}),l=await (0,n.getRunStats)("day");return r.NextResponse.json({runs:u,stats:l,pagination:{limit:o,offset:i}})}catch(e){return console.error("Failed to fetch runs:",e),r.NextResponse.json({error:"Failed to fetch runs"},{status:500})}}async function l(e){try{await d();let t=await e.json();if(!t.agentId||!t.input)return r.NextResponse.json({error:"agentId and input are required"},{status:400});let a=await (0,n.createRun)({agentId:t.agentId,threadId:t.threadId,input:t.input});try{await (0,o.publish)(o.CHANNELS.RUN_STARTED,a)}catch{}return r.NextResponse.json(a,{status:201})}catch(e){return console.error("Failed to create run:",e),r.NextResponse.json({error:"Failed to create run"},{status:500})}}e.s(["GET",()=>u,"POST",()=>l]),a()}catch(e){a(e)}},!1),13509,e=>e.a(async(t,a)=>{try{var r=e.i(51710),n=e.i(74963),s=e.i(81706),o=e.i(98867),i=e.i(5893),d=e.i(46463),u=e.i(23368),l=e.i(34613),E=e.i(40066),T=e.i(11516),c=e.i(40564),p=e.i(73827),_=e.i(73483),h=e.i(12582),N=e.i(74641),R=e.i(93695);e.i(48763);var I=e.i(4458),g=e.i(90183),S=t([g]);[g]=S.then?(await S)():S;let m=new r.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/runs/route",pathname:"/api/runs",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/packages/dashboard/src/app/api/runs/route.ts",nextConfigOutput:"",userland:g}),{workAsyncStorage:C,workUnitAsyncStorage:x,serverHooks:f}=m;function A(){return(0,s.patchFetch)({workAsyncStorage:C,workUnitAsyncStorage:x})}async function O(e,t,a){m.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/runs/route";r=r.replace(/\/index$/,"")||"/";let s=await m.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!s)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:g,params:S,nextConfig:A,parsedUrl:O,isDraftMode:C,prerenderManifest:x,routerServerContext:f,isOnDemandRevalidate:y,revalidateOnlyGenerated:L,resolvedPathname:v,clientReferenceManifest:b,serverActionsManifest:w}=s,X=(0,u.normalizeAppPath)(r),D=!!(x.dynamicRoutes[X]||x.routes[v]),F=async()=>((null==f?void 0:f.render404)?await f.render404(e,t,O,!1):t.end("This page could not be found"),null);if(D&&!C){let e=!!x.routes[v],t=x.dynamicRoutes[X];if(t&&!1===t.fallback&&!e){if(A.experimental.adapterPath)return await F();throw new R.NoFallbackError}}let U=null;!D||m.isDev||C||(U=v,U="/index"===U?"/":U);let M=!0===m.isDev||!D,P=D&&!M;w&&b&&(0,d.setManifestsSingleton)({page:r,clientReferenceManifest:b,serverActionsManifest:w});let k=e.method||"GET",$=(0,i.getTracer)(),H=$.getActiveScopeSpan(),q={params:S,prerenderManifest:x,renderOpts:{experimental:{authInterrupts:!!A.experimental.authInterrupts},cacheComponents:!!A.cacheComponents,supportsDynamicResponse:M,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:A.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>m.onRequestError(e,t,r,n,f)},sharedContext:{buildId:g}},B=new l.NodeNextRequest(e),j=new l.NodeNextResponse(t),W=E.NextRequestAdapter.fromNodeNextRequest(B,(0,E.signalFromNodeResponse)(t));try{let s=async e=>m.handle(W,q).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=$.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==T.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let t=`${k} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${k} ${r}`)}),d=!!(0,o.getRequestMeta)(e,"minimalMode"),u=async o=>{var i,u;let l=async({previousCacheEntry:n})=>{try{if(!d&&y&&L&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await s(o);e.fetchMetrics=q.renderOpts.fetchMetrics;let i=q.renderOpts.pendingWaitUntil;i&&a.waitUntil&&(a.waitUntil(i),i=void 0);let u=q.renderOpts.collectedTags;if(!D)return await (0,p.sendResponse)(B,j,r,q.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,_.toNodeOutgoingHttpHeaders)(r.headers);u&&(t[N.NEXT_CACHE_TAGS_HEADER]=u),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==q.renderOpts.collectedRevalidate&&!(q.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&q.renderOpts.collectedRevalidate,n=void 0===q.renderOpts.collectedExpire||q.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:q.renderOpts.collectedExpire;return{value:{kind:I.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await m.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:y})},!1,f),t}},E=await m.handleResponse({req:e,nextConfig:A,cacheKey:U,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:x,isRoutePPREnabled:!1,isOnDemandRevalidate:y,revalidateOnlyGenerated:L,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:d});if(!D)return null;if((null==E||null==(i=E.value)?void 0:i.kind)!==I.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(u=E.value)?void 0:u.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});d||t.setHeader("x-nextjs-cache",y?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),C&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let T=(0,_.fromNodeOutgoingHttpHeaders)(E.value.headers);return d&&D||T.delete(N.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||T.get("Cache-Control")||T.set("Cache-Control",(0,h.getCacheControlHeader)(E.cacheControl)),await (0,p.sendResponse)(B,j,new Response(E.value.body,{headers:T,status:E.value.status||200})),null};H?await u(H):await $.withPropagatedContext(e.headers,()=>$.trace(T.BaseServerSpan.handleRequest,{spanName:`${k} ${r}`,kind:i.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},u))}catch(t){if(t instanceof R.NoFallbackError||await m.onRequestError(e,t,{routerKind:"App Router",routePath:X,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:y})},!1,f),D)throw t;return await (0,p.sendResponse)(B,j,new Response(null,{status:500})),null}}e.s(["handler",()=>O,"patchFetch",()=>A,"routeModule",()=>m,"serverHooks",()=>f,"workAsyncStorage",()=>C,"workUnitAsyncStorage",()=>x]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__c9469bd7._.js.map