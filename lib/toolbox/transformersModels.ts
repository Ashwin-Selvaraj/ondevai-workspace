'use client';

type PipelineType = 'image-segmentation' | 'automatic-speech-recognition';

interface ModelState {
  pipeline: unknown | null;
  loading: boolean;
  error: string | null;
}

const modelCache = new Map<string, ModelState>();

export async function getTransformersPipeline(
  task: PipelineType,
  modelId: string,
  onProgress?: (progress: number, text: string) => void
): Promise<unknown> {
  const key = `${task}:${modelId}`;

  const existing = modelCache.get(key);
  if (existing?.pipeline) return existing.pipeline;
  if (existing?.loading) {
    // wait for it
    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        const state = modelCache.get(key);
        if (!state?.loading) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
    const state = modelCache.get(key);
    if (state?.pipeline) return state.pipeline;
    throw new Error(state?.error ?? 'Model failed to load');
  }

  modelCache.set(key, { pipeline: null, loading: true, error: null });

  try {
    const { pipeline, env } = await import('@huggingface/transformers');
    env.allowLocalModels = false;

    const pipe = await pipeline(task as Parameters<typeof pipeline>[0], modelId, {
      progress_callback: (info: { progress?: number; status?: string }) => {
        if (info.progress !== undefined && onProgress) {
          onProgress(Math.round(info.progress), info.status ?? '');
        }
      },
    });

    modelCache.set(key, { pipeline: pipe, loading: false, error: null });
    return pipe;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to load model';
    modelCache.set(key, { pipeline: null, loading: false, error: msg });
    throw new Error(msg);
  }
}

export function isModelLoaded(task: PipelineType, modelId: string): boolean {
  return !!modelCache.get(`${task}:${modelId}`)?.pipeline;
}
