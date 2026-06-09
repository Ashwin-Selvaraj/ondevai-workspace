// Minimal WebGPU type declarations for TypeScript
interface Navigator {
  readonly gpu: GPU | undefined;
}

interface GPU {
  requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
}

interface GPUAdapter {
  readonly name: string;
}

interface GPURequestAdapterOptions {
  powerPreference?: 'low-power' | 'high-performance';
}
