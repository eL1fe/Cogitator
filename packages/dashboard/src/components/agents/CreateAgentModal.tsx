'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Bot, Server, Cloud } from 'lucide-react';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface ModelOption {
  id: string;
  name: string;
  provider: string;
}

export function CreateAgentModal({ isOpen, onClose, onCreated }: CreateAgentModalProps) {
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch available models
      fetch('/api/models')
        .then((res) => res.json())
        .then((data) => {
          const options: ModelOption[] = [];
          
          // Add Ollama models
          if (data.ollama?.available) {
            for (const m of data.ollama.models || []) {
              options.push({
                id: m.name,
                name: m.displayName || m.name,
                provider: 'ollama',
              });
            }
          }
          
          // Add cloud models
          for (const provider of data.cloud || []) {
            if (provider.configured) {
              for (const m of provider.models) {
                options.push({
                  id: m,
                  name: m,
                  provider: provider.name,
                });
              }
            }
          }
          
          setModels(options);
          if (options.length > 0 && !model) {
            setModel(options[0].id);
          }
        })
        .catch(console.error);
    }
  }, [isOpen, model]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !model) {
      setError('Name and model are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          model,
          description: description.trim() || undefined,
          instructions: instructions.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create agent');
      }

      // Reset form
      setName('');
      setModel(models[0]?.id || '');
      setDescription('');
      setInstructions('');
      
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-lg mx-4 z-10 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Bot className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              Create Agent
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-bg-hover transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Agent"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Model *
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-bg-elevated border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
              required
            >
              {models.length === 0 ? (
                <option value="">No models available</option>
              ) : (
                <>
                  {models.filter((m) => m.provider === 'ollama').length > 0 && (
                    <optgroup label="Local (Ollama)">
                      {models
                        .filter((m) => m.provider === 'ollama')
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                    </optgroup>
                  )}
                  {models.filter((m) => m.provider !== 'ollama').length > 0 && (
                    <optgroup label="Cloud">
                      {models
                        .filter((m) => m.provider !== 'ollama')
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.provider})
                          </option>
                        ))}
                    </optgroup>
                  )}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Description
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this agent do?"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              System Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="You are a helpful assistant..."
              rows={4}
              className="w-full px-3 py-2 bg-bg-elevated border border-border-primary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !name.trim() || !model}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Agent'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

