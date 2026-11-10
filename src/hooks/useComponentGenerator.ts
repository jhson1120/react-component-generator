import { useState, useCallback } from 'react';
import type { GeneratedComponent, Provider } from '../types';
import { parseStreamLines } from '../utils/parseStreamLines';

interface UseComponentGeneratorReturn {
  components: GeneratedComponent[];
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = useState<GeneratedComponent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate component');
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newComponent: GeneratedComponent = {
        id,
        prompt,
        code: '',
        createdAt: new Date(),
        streaming: true,
      };
      setComponents((prev) => [newComponent, ...prev]);

      const update = (patch: (c: GeneratedComponent) => GeneratedComponent) =>
        setComponents((prev) => prev.map((c) => (c.id === id ? patch(c) : c)));

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finished = false;

      while (!finished) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parsed = parseStreamLines(buffer);
        buffer = parsed.rest;

        for (const event of parsed.events) {
          if (event.type === 'delta') {
            update((c) => ({ ...c, code: c.code + event.text }));
          } else if (event.type === 'done') {
            update((c) => ({ ...c, code: event.code, streaming: false }));
            finished = true;
          } else {
            setComponents((prev) => prev.filter((c) => c.id !== id));
            throw new Error(event.error);
          }
        }
      }

      if (!finished) {
        setComponents((prev) => prev.filter((c) => c.id !== id));
        throw new Error('응답이 중간에 끊겼습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setComponents([]);
  }, []);

  return { components, isLoading, error, generate, removeComponent, clearAll };
}
