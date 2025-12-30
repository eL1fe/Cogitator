import { NextRequest } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { model, messages, temperature = 0.7, tools = [] } = await request.json();

    if (!model || !messages) {
      return new Response(JSON.stringify({ error: 'Model and messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Determine if this is an Ollama model
    const isOllamaModel = !model.includes('gpt') && 
                          !model.includes('claude') && 
                          !model.includes('gemini');

    if (isOllamaModel) {
      return handleOllamaChat(model, messages, temperature);
    } else {
      return handleCloudChat(model, messages, temperature);
    }
  } catch (error) {
    console.error('Playground error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleOllamaChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number
) {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options: { temperature },
    }),
  });

  if (!response.ok || !response.body) {
    return new Response(JSON.stringify({ error: 'Ollama request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const reader = response.body.getReader();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode('data: {"done":true}\n\n'));
            controller.close();
            break;
          }

          const text = new TextDecoder().decode(value);
          const lines = text.split('\n').filter(Boolean);

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.message?.content) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({
                    content: data.message.content,
                    done: data.done || false,
                    total_duration: data.total_duration,
                    eval_count: data.eval_count,
                    prompt_eval_count: data.prompt_eval_count,
                  })}\n\n`)
                );
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      } catch (error) {
        controller.enqueue(encoder.encode(`data: {"error":"${error}"}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

async function handleCloudChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number
) {
  // Check for API keys
  const isOpenAI = model.includes('gpt') || model.includes('o1');
  const isAnthropic = model.includes('claude');
  const isGoogle = model.includes('gemini');

  let apiKey: string | undefined;
  let endpoint: string;
  let headers: Record<string, string>;
  let body: unknown;

  if (isOpenAI) {
    apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    endpoint = 'https://api.openai.com/v1/chat/completions';
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    body = {
      model,
      messages,
      temperature,
      stream: true,
    };
  } else if (isAnthropic) {
    apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Anthropic API key not configured' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    endpoint = 'https://api.anthropic.com/v1/messages';
    headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    };
    
    // Convert messages to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system');
    const otherMessages = messages.filter(m => m.role !== 'system');
    
    body = {
      model,
      messages: otherMessages,
      system: systemMessage?.content,
      max_tokens: 4096,
      stream: true,
    };
  } else if (isGoogle) {
    apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Google API key not configured' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use Google's REST API
    const modelId = model.replace('gemini-', '');
    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-${modelId}:streamGenerateContent?key=${apiKey}`;
    headers = {
      'Content-Type': 'application/json',
    };
    
    // Convert messages to Google format
    body = {
      contents: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: { temperature },
    };
  } else {
    return new Response(JSON.stringify({ error: 'Unknown model provider' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    return new Response(JSON.stringify({ error: `API error: ${error}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!response.body) {
    return new Response(JSON.stringify({ error: 'No response body' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const reader = response.body.getReader();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode('data: {"done":true}\n\n'));
            controller.close();
            break;
          }

          const text = new TextDecoder().decode(value);
          
          if (isOpenAI) {
            // Parse OpenAI SSE format
            const lines = text.split('\n').filter(line => line.startsWith('data: '));
            for (const line of lines) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch {}
            }
          } else if (isAnthropic) {
            // Parse Anthropic SSE format
            const lines = text.split('\n').filter(line => line.startsWith('data: '));
            for (const line of lines) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.type === 'content_block_delta') {
                  const content = parsed.delta?.text;
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                }
              } catch {}
            }
          } else if (isGoogle) {
            // Google sends JSON array chunks
            try {
              const parsed = JSON.parse(text);
              if (Array.isArray(parsed)) {
                for (const item of parsed) {
                  const content = item.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                }
              }
            } catch {}
          }
        }
      } catch (error) {
        controller.enqueue(encoder.encode(`data: {"error":"${error}"}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

