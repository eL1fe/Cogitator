module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},65969,e=>e.a(async(t,a)=>{try{let t=await e.y("pg-7e2a21e93ebd274c");e.n(t),a()}catch(e){a(e)}},!0),16995,e=>e.a(async(t,a)=>{try{var r=e.i(65969),n=t([r]);[r]=n.then?(await n)():n;let u=null;function s(){return u||(u=new r.Pool({host:process.env.POSTGRES_HOST||"localhost",port:parseInt(process.env.POSTGRES_PORT||"5432"),user:process.env.POSTGRES_USER||"cogitator",password:process.env.POSTGRES_PASSWORD||"cogitator",database:process.env.POSTGRES_DB||"cogitator",max:20,idleTimeoutMillis:3e4,connectionTimeoutMillis:2e3})),u}async function o(e,t){let a=s();return(await a.query(e,t)).rows}async function i(e,t){return(await o(e,t))[0]||null}async function l(e,t){let a=s();return(await a.query(e,t)).rowCount||0}async function d(){let e=s();await e.query(`
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
  `)}e.s(["execute",()=>l,"getPool",()=>s,"initializeSchema",()=>d,"query",()=>o,"queryOne",()=>i]),a()}catch(e){a(e)}},!1),54056,e=>e.a(async(t,a)=>{try{var r=e.i(16995),n=t([r]);async function s(e){let t=await (0,r.queryOne)("SELECT value FROM dashboard_config WHERE key = $1",[e]);return t?.value||null}async function o(e,t){await (0,r.execute)(`INSERT INTO dashboard_config (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,[e,JSON.stringify(t)])}async function i(){let e=await (0,r.query)("SELECT key, value FROM dashboard_config"),t={};for(let a of e)t[a.key]=a.value;return t}async function l(){return s("cogitator")}async function d(e){await o("cogitator",e)}[r]=n.then?(await n)():n,e.s(["getAllConfig",()=>i,"getCogitatorConfig",()=>l,"getConfig",()=>s,"setCogitatorConfig",()=>d,"setConfig",()=>o]),a()}catch(e){a(e)}},!1),18454,e=>{"use strict";let t=process.env.OLLAMA_URL||"http://localhost:11434";async function a(){try{let e=await fetch(`${t}/api/tags`);if(!e.ok)throw Error(`Ollama error: ${e.status}`);return((await e.json()).models||[]).map(e=>{var t;let a,r,n;return{name:e.name,displayName:(r=(a=e.name.split(":"))[0].replace(/-/g," ").replace(/\b\w/g,e=>e.toUpperCase()),n=a[1]||"latest",`${r} (${n})`),size:e.size,sizeFormatted:(t=e.size)<1024?`${t} B`:t<1048576?`${(t/1024).toFixed(1)} KB`:t<0x40000000?`${(t/1048576).toFixed(1)} MB`:`${(t/0x40000000).toFixed(1)} GB`,parameterSize:e.details?.parameter_size||"Unknown",family:e.details?.family||"Unknown",quantization:e.details?.quantization_level||"Unknown",modifiedAt:e.modified_at,isDownloaded:!0}})}catch(e){return console.error("Failed to fetch Ollama models:",e),[]}}async function r(){try{let e=await fetch(`${t}/api/version`);if(e.ok){let t=await e.json();return{available:!0,version:t.version}}return{available:!1}}catch{return{available:!1}}}e.s(["POPULAR_MODELS",0,[{name:"llama3.2:3b",description:"Llama 3.2 3B - Fast and efficient",size:"2.0 GB"},{name:"llama3.2:1b",description:"Llama 3.2 1B - Ultra-lightweight",size:"1.3 GB"},{name:"llama3.1:8b",description:"Llama 3.1 8B - Balanced performance",size:"4.7 GB"},{name:"llama3.1:70b",description:"Llama 3.1 70B - High capability",size:"40 GB"},{name:"mistral:7b",description:"Mistral 7B - Strong reasoning",size:"4.1 GB"},{name:"mixtral:8x7b",description:"Mixtral 8x7B MoE - Expert mixture",size:"26 GB"},{name:"codellama:7b",description:"Code Llama 7B - Code generation",size:"3.8 GB"},{name:"codellama:13b",description:"Code Llama 13B - Better code",size:"7.4 GB"},{name:"gemma2:9b",description:"Gemma 2 9B - Google model",size:"5.4 GB"},{name:"gemma2:2b",description:"Gemma 2 2B - Compact Google",size:"1.6 GB"},{name:"qwen2.5:7b",description:"Qwen 2.5 7B - Multilingual",size:"4.4 GB"},{name:"qwen2.5:14b",description:"Qwen 2.5 14B - Larger Qwen",size:"8.9 GB"},{name:"phi3:mini",description:"Phi-3 Mini - Microsoft compact",size:"2.2 GB"},{name:"deepseek-coder:6.7b",description:"DeepSeek Coder - Code specialist",size:"3.8 GB"},{name:"nomic-embed-text",description:"Nomic Embed - Text embeddings",size:"274 MB"}],"checkOllamaHealth",()=>r,"getOllamaModels",()=>a])},33655,e=>e.a(async(t,a)=>{try{var r=e.i(95897),n=e.i(18454),s=e.i(54056),o=t([s]);async function i(){try{let e=await (0,n.checkOllamaHealth)(),t=e.available?await (0,n.getOllamaModels)():[],a=await (0,s.getConfig)("api_keys"),o=new Set(t.map(e=>e.name)),i=n.POPULAR_MODELS.map(e=>({...e,isDownloaded:o.has(e.name)})),l=[{id:"openai",name:"OpenAI",models:["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo","o1-preview","o1-mini"],configured:!!a?.openai||!!process.env.OPENAI_API_KEY},{id:"anthropic",name:"Anthropic",models:["claude-3-5-sonnet-20241022","claude-3-5-haiku-20241022","claude-3-opus-20240229"],configured:!!a?.anthropic||!!process.env.ANTHROPIC_API_KEY},{id:"google",name:"Google",models:["gemini-1.5-pro","gemini-1.5-flash","gemini-2.0-flash-exp"],configured:!!a?.google||!!process.env.GOOGLE_API_KEY}];return r.NextResponse.json({ollama:{available:e.available,version:e.version,models:t},available:i,cloud:l})}catch(e){return console.error("Failed to fetch models:",e),r.NextResponse.json({error:"Failed to fetch models"},{status:500})}}async function l(e){try{let t=await e.json(),{action:a}=t;if("save_api_keys"===a){let{openai:e,anthropic:a,google:n}=t,o={};return e&&(o.openai=e),a&&(o.anthropic=a),n&&(o.google=n),await (0,s.setConfig)("api_keys",o),r.NextResponse.json({success:!0})}return r.NextResponse.json({error:"Unknown action"},{status:400})}catch(e){return console.error("Failed to process request:",e),r.NextResponse.json({error:"Failed to process request"},{status:500})}}[s]=o.then?(await o)():o,e.s(["GET",()=>i,"POST",()=>l]),a()}catch(e){a(e)}},!1),7636,e=>e.a(async(t,a)=>{try{var r=e.i(51710),n=e.i(74963),s=e.i(81706),o=e.i(98867),i=e.i(5893),l=e.i(46463),d=e.i(23368),u=e.i(34613),c=e.i(40066),E=e.i(11516),T=e.i(40564),p=e.i(73827),m=e.i(73483),N=e.i(12582),h=e.i(74641),_=e.i(93695);e.i(48763);var g=e.i(4458),R=e.i(33655),O=t([R]);[R]=O.then?(await O)():O;let S=new r.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/models/route",pathname:"/api/models",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/packages/dashboard/src/app/api/models/route.ts",nextConfigOutput:"",userland:R}),{workAsyncStorage:C,workUnitAsyncStorage:b,serverHooks:f}=S;function A(){return(0,s.patchFetch)({workAsyncStorage:C,workUnitAsyncStorage:b})}async function I(e,t,a){S.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/models/route";r=r.replace(/\/index$/,"")||"/";let s=await S.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!s)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:R,params:O,nextConfig:A,parsedUrl:I,isDraftMode:C,prerenderManifest:b,routerServerContext:f,isOnDemandRevalidate:x,revalidateOnlyGenerated:v,resolvedPathname:L,clientReferenceManifest:y,serverActionsManifest:w}=s,X=(0,d.normalizeAppPath)(r),D=!!(b.dynamicRoutes[X]||b.routes[L]),U=async()=>((null==f?void 0:f.render404)?await f.render404(e,t,I,!1):t.end("This page could not be found"),null);if(D&&!C){let e=!!b.routes[L],t=b.dynamicRoutes[X];if(t&&!1===t.fallback&&!e){if(A.experimental.adapterPath)return await U();throw new _.NoFallbackError}}let F=null;!D||S.isDev||C||(F=L,F="/index"===F?"/":F);let P=!0===S.isDev||!D,M=D&&!P;w&&y&&(0,l.setManifestsSingleton)({page:r,clientReferenceManifest:y,serverActionsManifest:w});let B=e.method||"GET",k=(0,i.getTracer)(),G=k.getActiveScopeSpan(),q={params:O,prerenderManifest:b,renderOpts:{experimental:{authInterrupts:!!A.experimental.authInterrupts},cacheComponents:!!A.cacheComponents,supportsDynamicResponse:P,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:A.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>S.onRequestError(e,t,r,n,f)},sharedContext:{buildId:R}},H=new u.NodeNextRequest(e),j=new u.NodeNextResponse(t),z=c.NextRequestAdapter.fromNodeNextRequest(H,(0,c.signalFromNodeResponse)(t));try{let s=async e=>S.handle(z,q).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=k.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==E.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let t=`${B} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${B} ${r}`)}),l=!!(0,o.getRequestMeta)(e,"minimalMode"),d=async o=>{var i,d;let u=async({previousCacheEntry:n})=>{try{if(!l&&x&&v&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await s(o);e.fetchMetrics=q.renderOpts.fetchMetrics;let i=q.renderOpts.pendingWaitUntil;i&&a.waitUntil&&(a.waitUntil(i),i=void 0);let d=q.renderOpts.collectedTags;if(!D)return await (0,p.sendResponse)(H,j,r,q.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,m.toNodeOutgoingHttpHeaders)(r.headers);d&&(t[h.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==q.renderOpts.collectedRevalidate&&!(q.renderOpts.collectedRevalidate>=h.INFINITE_CACHE)&&q.renderOpts.collectedRevalidate,n=void 0===q.renderOpts.collectedExpire||q.renderOpts.collectedExpire>=h.INFINITE_CACHE?void 0:q.renderOpts.collectedExpire;return{value:{kind:g.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await S.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:x})},!1,f),t}},c=await S.handleResponse({req:e,nextConfig:A,cacheKey:F,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:b,isRoutePPREnabled:!1,isOnDemandRevalidate:x,revalidateOnlyGenerated:v,responseGenerator:u,waitUntil:a.waitUntil,isMinimalMode:l});if(!D)return null;if((null==c||null==(i=c.value)?void 0:i.kind)!==g.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(d=c.value)?void 0:d.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});l||t.setHeader("x-nextjs-cache",x?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),C&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let E=(0,m.fromNodeOutgoingHttpHeaders)(c.value.headers);return l&&D||E.delete(h.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||E.get("Cache-Control")||E.set("Cache-Control",(0,N.getCacheControlHeader)(c.cacheControl)),await (0,p.sendResponse)(H,j,new Response(c.value.body,{headers:E,status:c.value.status||200})),null};G?await d(G):await k.withPropagatedContext(e.headers,()=>k.trace(E.BaseServerSpan.handleRequest,{spanName:`${B} ${r}`,kind:i.SpanKind.SERVER,attributes:{"http.method":B,"http.target":e.url}},d))}catch(t){if(t instanceof _.NoFallbackError||await S.onRequestError(e,t,{routerKind:"App Router",routePath:X,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:x})},!1,f),D)throw t;return await (0,p.sendResponse)(H,j,new Response(null,{status:500})),null}}e.s(["handler",()=>I,"patchFetch",()=>A,"routeModule",()=>S,"serverHooks",()=>f,"workAsyncStorage",()=>C,"workUnitAsyncStorage",()=>b]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__85095735._.js.map