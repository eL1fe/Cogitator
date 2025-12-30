'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import {
  Send,
  Bot,
  User,
  Settings,
  Wrench,
  Zap,
  RotateCcw,
  AlertCircle,
  Server,
  Cloud,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string;
  tokens?: number;
  timestamp: Date;
}

interface ModelOption {
  id: string;
  name: string;
  provider: 'ollama' | 'openai' | 'anthropic' | 'google';
  available: boolean;
}

interface ModelsData {
  ollama: {
    available: boolean;
    models: Array<{ name: string; displayName: string }>;
  };
  cloud: Array<{
    id: string;
    name: string;
    models: string[];
    configured: boolean;
  }>;
}

const BUILTIN_TOOLS = [
  { id: 'calculator', name: 'Calculator', description: 'Math calculations' },
  { id: 'datetime', name: 'Date/Time', description: 'Current time' },
  { id: 'http', name: 'HTTP Request', description: 'Fetch URLs' },
  { id: 'exec', name: 'Shell Command', description: 'Run commands' },
];

export function PlaygroundChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelOption | null>(null);
  const [tools, setTools] = useState(
    BUILTIN_TOOLS.map((t) => ({ ...t, enabled: false }))
  );
  const [temperature, setTemperature] = useState(0.7);
  const [loadingModels, setLoadingModels] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch available models
  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch('/api/models');
        if (!response.ok) throw new Error('Failed to fetch models');
        
        const data: ModelsData = await response.json();
        const modelOptions: ModelOption[] = [];

        // Add Ollama models
        if (data.ollama.available) {
          for (const model of data.ollama.models) {
            modelOptions.push({
              id: model.name,
              name: model.displayName,
              provider: 'ollama',
              available: true,
            });
          }
        }

        // Add cloud models
        for (const provider of data.cloud) {
          const providerType = provider.id as 'openai' | 'anthropic' | 'google';
          for (const modelId of provider.models) {
            modelOptions.push({
              id: modelId,
              name: modelId,
              provider: providerType,
              available: provider.configured,
            });
          }
        }

        setModels(modelOptions);
        
        // Select first available model
        const firstAvailable = modelOptions.find((m) => m.available);
        if (firstAvailable) {
          setSelectedModel(firstAvailable);
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
        setError('Failed to load models. Is Ollama running?');
      } finally {
        setLoadingModels(false);
      }
    }

    fetchModels();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !selectedModel) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Create assistant message placeholder
    const assistantMessageId = `msg_${Date.now() + 1}`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ]);

    try {
      abortControllerRef.current = new AbortController();

      // Build messages for API
      const apiMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      apiMessages.push({ role: 'user', content: input });

      const response = await fetch('/api/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: apiMessages,
          temperature,
          tools: tools.filter((t) => t.enabled).map((t) => t.id),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let tokenCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n').filter(Boolean);
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new Error(data.error);
              }
              
              if (data.content) {
                fullContent += data.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              }
              
              if (data.eval_count) {
                tokenCount = data.eval_count + (data.prompt_eval_count || 0);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }

      // Update final message with token count
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, tokens: tokenCount || undefined }
            : m
        )
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : 'Failed to get response');
      
      // Remove empty assistant message on error
      setMessages((prev) =>
        prev.filter((m) => m.id !== assistantMessageId || m.content)
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const toggleTool = (toolId: string) => {
    setTools((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const ollamaModels = models.filter((m) => m.provider === 'ollama' && m.available);
  const cloudModels = models.filter((m) => m.provider !== 'ollama');

  return (
    <div className="h-full flex">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-error/10 border border-error/20 rounded-lg text-error">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="text-center py-20">
                <Bot className="w-12 h-12 text-accent mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-text-primary mb-2">
                  Agent Playground
                </h2>
                <p className="text-text-secondary max-w-md mx-auto">
                  {selectedModel
                    ? `Ready to chat with ${selectedModel.name}`
                    : 'Select a model from the sidebar to get started'}
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-4 animate-fade-in',
                    message.role === 'user' && 'flex-row-reverse'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      message.role === 'user'
                        ? 'bg-chart-2/10'
                        : message.role === 'tool'
                          ? 'bg-chart-4/10'
                          : 'bg-accent/10'
                    )}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-chart-2" />
                    ) : message.role === 'tool' ? (
                      <Wrench className="w-4 h-4 text-chart-4" />
                    ) : (
                      <Bot className="w-4 h-4 text-accent" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'flex-1 max-w-[80%]',
                      message.role === 'user' && 'text-right'
                    )}
                  >
                    {message.toolName && (
                      <Badge variant="outline" size="sm" className="mb-2">
                        {message.toolName}
                      </Badge>
                    )}
                    <div
                      className={cn(
                        'rounded-xl p-4',
                        message.role === 'user'
                          ? 'bg-chart-2/10 text-text-primary inline-block'
                          : 'bg-bg-secondary border border-border-subtle'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content || (
                          <span className="text-text-muted italic">
                            Generating...
                          </span>
                        )}
                      </p>
                    </div>
                    {message.tokens && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                        <Zap className="w-3 h-3" />
                        {message.tokens} tokens
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border-subtle p-4 bg-bg-secondary">
          <div className="max-w-3xl mx-auto flex gap-3">
            <Input
              placeholder={
                selectedModel
                  ? 'Type a message...'
                  : 'Select a model first...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="flex-1"
              disabled={!selectedModel}
            />
            {isLoading ? (
              <Button variant="danger" onClick={stopGeneration}>
                Stop
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSend}
                disabled={!input.trim() || !selectedModel}
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l border-border-subtle bg-bg-secondary p-4 space-y-6 overflow-auto">
        {/* Model Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Model
            </CardTitle>
          </CardHeader>

          {loadingModels ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Ollama Models */}
              {ollamaModels.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
                    <Server className="w-3 h-3" />
                    <span>Local (Ollama)</span>
                  </div>
                  <div className="space-y-1">
                    {ollamaModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model)}
                        className={cn(
                          'w-full p-2 rounded-lg text-left transition-colors text-sm',
                          selectedModel?.id === model.id
                            ? 'bg-accent/10 border border-accent'
                            : 'bg-bg-elevated hover:bg-bg-hover border border-transparent'
                        )}
                      >
                        {model.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cloud Models */}
              {cloudModels.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
                    <Cloud className="w-3 h-3" />
                    <span>Cloud</span>
                  </div>
                  <div className="space-y-1">
                    {cloudModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => model.available && setSelectedModel(model)}
                        disabled={!model.available}
                        className={cn(
                          'w-full p-2 rounded-lg text-left transition-colors text-sm',
                          selectedModel?.id === model.id
                            ? 'bg-accent/10 border border-accent'
                            : model.available
                              ? 'bg-bg-elevated hover:bg-bg-hover border border-transparent'
                              : 'bg-bg-elevated border border-transparent opacity-50 cursor-not-allowed'
                        )}
                      >
                        <span>{model.id}</span>
                        {!model.available && (
                          <span className="text-xs text-error ml-2">
                            (no API key)
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {models.length === 0 && (
                <div className="text-center py-4 text-text-muted text-sm">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No models available</p>
                  <p className="text-xs mt-1">
                    Start Ollama or configure API keys
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Temperature */}
        <Card>
          <CardHeader>
            <CardTitle>Temperature</CardTitle>
            <span className="text-sm text-accent">{temperature}</span>
          </CardHeader>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </Card>

        {/* Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Tools
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {tools.map((tool) => (
              <label
                key={tool.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-hover cursor-pointer"
              >
                <div>
                  <span className="text-sm text-text-primary">{tool.name}</span>
                  <p className="text-xs text-text-muted">{tool.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={tool.enabled}
                  onChange={() => toggleTool(tool.id)}
                  className="w-4 h-4 accent-accent"
                />
              </label>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <Button variant="outline" className="w-full gap-2" onClick={clearChat}>
          <RotateCcw className="w-4 h-4" />
          Clear Chat
        </Button>
      </div>
    </div>
  );
}
