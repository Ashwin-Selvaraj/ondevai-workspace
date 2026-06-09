import * as webllm from '@mlc-ai/web-llm';

export type ModelTier = 'lightweight' | 'balanced' | 'powerful';

export interface EngineState {
  engine: webllm.MLCEngine | null;
  isReady: boolean;
  isLoading: boolean;
  progress: number;
  progressText: string;
  currentModelId: string;
  error: string | null;
}

let engineInstance: webllm.MLCEngine | null = null;
let currentModelId = '';

export async function initWebLLM(
  modelId: string,
  onProgress: (state: Partial<EngineState>) => void
): Promise<webllm.MLCEngine> {
  if (engineInstance && currentModelId === modelId) {
    return engineInstance;
  }

  onProgress({ isLoading: true, isReady: false, error: null });

  try {
    engineInstance = await webllm.CreateMLCEngine(modelId, {
      initProgressCallback: (report: webllm.InitProgressReport) => {
        const pct = Math.round((report.progress ?? 0) * 100);
        onProgress({
          progress: pct,
          progressText: report.text ?? `Loading… ${pct}%`,
        });
      },
    });
    currentModelId = modelId;
    onProgress({ isReady: true, isLoading: false, progress: 100 });
    return engineInstance;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    onProgress({ error: msg, isLoading: false });
    throw err;
  }
}

export async function* streamChat(
  messages: webllm.ChatCompletionMessageParam[],
  options: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
  } = {}
): AsyncGenerator<string> {
  if (!engineInstance) throw new Error('Engine not initialised');

  const stream = await engineInstance.chat.completions.create({
    messages,
    stream: true,
    temperature: options.temperature ?? 0.4,
    max_tokens: options.max_tokens ?? 3000,
    top_p: options.top_p ?? 0.95,
  });

  let accumulated = '';
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? '';
    accumulated += delta;
    yield accumulated;
  }
}

export async function runChat(
  messages: webllm.ChatCompletionMessageParam[],
  options: { temperature?: number; max_tokens?: number } = {}
): Promise<string> {
  let result = '';
  for await (const text of streamChat(messages, options)) {
    result = text;
  }
  return result;
}

export function getEngine(): webllm.MLCEngine | null {
  return engineInstance;
}

export function isEngineReady(): boolean {
  return engineInstance !== null;
}
