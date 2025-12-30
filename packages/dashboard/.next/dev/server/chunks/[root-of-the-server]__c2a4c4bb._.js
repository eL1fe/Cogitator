module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/packages/dashboard/src/app/api/models/pull/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const runtime = 'nodejs';
const dynamic = 'force-dynamic';
async function POST(request) {
    const { name } = await request.json();
    if (!name) {
        return new Response(JSON.stringify({
            error: 'Model name required'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    try {
        const response = await fetch(`${OLLAMA_URL}/api/pull`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                stream: true
            })
        });
        if (!response.ok || !response.body) {
            return new Response(JSON.stringify({
                error: 'Failed to pull model'
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        // Stream the response
        const encoder = new TextEncoder();
        const reader = response.body.getReader();
        const stream = new ReadableStream({
            async start (controller) {
                while(true){
                    const { done, value } = await reader.read();
                    if (done) {
                        controller.enqueue(encoder.encode('data: {"status":"done"}\n\n'));
                        controller.close();
                        break;
                    }
                    // Parse and forward progress
                    const text = new TextDecoder().decode(value);
                    const lines = text.split('\n').filter(Boolean);
                    for (const line of lines){
                        try {
                            const progress = JSON.parse(line);
                            // Calculate percentage if possible
                            if (progress.total && progress.completed) {
                                progress.percent = Math.round(progress.completed / progress.total * 100);
                            }
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify(progress)}\n\n`));
                        } catch  {
                        // Ignore parse errors
                        }
                    }
                }
            }
        });
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });
    } catch (error) {
        console.error('Failed to pull model:', error);
        return new Response(JSON.stringify({
            error: 'Failed to connect to Ollama'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c2a4c4bb._.js.map