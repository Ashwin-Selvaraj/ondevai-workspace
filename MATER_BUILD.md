# OnDevAI — Complete Production Build Specification
### Full Vibesterz Replication · Pump.fun Bounty Submission
**Version 2.0 — Complete Functionality + Proper UI**

> **Instructions for Claude Code:**
> Read this ENTIRE file before touching a single file.
> This replaces any previous MASTER_BUILD.md.
> Every section is required. Build in phase order. Do not skip.

---

## CRITICAL ARCHITECTURE RULES (never break these)

1. **Zero server inference** — `@mlc-ai/web-llm` only. No OpenAI, Anthropic, or any cloud API calls with user data.
2. **Required HTTP headers** — Without these, WebLLM's SharedArrayBuffer fails and nothing works:
   ```
   Cross-Origin-Opener-Policy: same-origin
   Cross-Origin-Embedder-Policy: require-corp
   ```
   Set in `next.config.js` AND `vercel.json`.
3. **Single engine singleton** — WebLLM engine lives in a React Context, loaded once, shared by workspace + toolbox + assistant.
4. **`"use client"`** on every component that touches WebLLM, CodeMirror, PGlite, or browser APIs.
5. **Dynamic imports** for WebLLM and heavy libs — `next/dynamic` with `ssr: false`.
6. **PGlite** persists to `idb://ondevai` in IndexedDB. Exclude from webpack: `optimizeDeps: { exclude: ['@electric-sql/pglite'] }`.

---

## TECH STACK

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 App Router | SSR shell + CSR AI engine |
| Language | TypeScript strict | Type safety |
| Styling | Tailwind CSS + CSS custom properties | Utility + design tokens |
| LLM Engine | @mlc-ai/web-llm | WebGPU in-browser LLM |
| Code Editor | CodeMirror 6 (vanilla, wrapped in React) | Best browser editor |
| In-browser DB | @electric-sql/pglite | PostgreSQL in WASM |
| Vision/Audio | @huggingface/transformers (v3) | Whisper, RMBG, depth |
| File ops | pdf-lib, jszip, idb-keyval | PDF + ZIP + IndexedDB |
| PWA | next-pwa | Offline shell + model cache |
| Icons | lucide-react | Consistent icon set |
| State | React Context + useReducer | No external state lib needed |

---

## DESIGN SYSTEM

### Palette (define in `globals.css` as CSS custom properties)
```css
:root {
  /* Backgrounds */
  --bg-base:     #08080e;   /* deepest background */
  --bg-surface:  #0f0f17;   /* cards, panels */
  --bg-elevated: #161622;   /* modals, dropdowns */
  --bg-hover:    #1c1c2a;   /* hover states */
  
  /* Borders */
  --border:      #252535;
  --border-subtle: #1a1a28;
  --border-focus: #6d5df0;
  
  /* Accent — purple */
  --accent:      #6d5df0;
  --accent-hover:#7c6af7;
  --accent-muted: rgba(109,93,240,0.15);
  --accent-glow:  0 0 20px rgba(109,93,240,0.35);
  
  /* Semantic */
  --green:       #22d3a5;
  --green-muted: rgba(34,211,165,0.12);
  --yellow:      #f59e0b;
  --red:         #ef4444;
  --blue:        #3b82f6;
  
  /* Text */
  --text-primary:   #e8e8f0;
  --text-secondary: #9494a8;
  --text-muted:     #5c5c70;
  --text-disabled:  #3a3a4a;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Radii */
  --radius-sm:  4px;
  --radius:     8px;
  --radius-lg:  12px;
  --radius-xl:  16px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.4);
  --shadow:    0 4px 16px rgba(0,0,0,0.5);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.6);
}
```

### Typography Scale
```css
.text-xs   { font-size: 11px; line-height: 1.4; }
.text-sm   { font-size: 13px; line-height: 1.5; }
.text-base { font-size: 14px; line-height: 1.6; }
.text-lg   { font-size: 16px; line-height: 1.5; }
.text-xl   { font-size: 20px; line-height: 1.4; }
.text-2xl  { font-size: 28px; line-height: 1.3; }
.text-3xl  { font-size: 36px; line-height: 1.2; }
.text-4xl  { font-size: 48px; line-height: 1.1; }
```

### Component Tokens (used everywhere, never hardcode hex)
```css
/* Buttons */
.btn-primary   { bg: var(--accent); color: white; hover: var(--accent-hover) }
.btn-secondary { bg: var(--bg-elevated); border: var(--border); hover: var(--bg-hover) }
.btn-ghost     { bg: transparent; hover: var(--bg-hover) }
.btn-danger    { bg: rgba(239,68,68,0.15); border: rgba(239,68,68,0.3); color: var(--red) }

/* Inputs */
input, textarea { bg: var(--bg-elevated); border: var(--border); color: var(--text-primary) }
input:focus, textarea:focus { border: var(--border-focus); box-shadow: var(--accent-glow) }
```

### Visual Identity — Key Design Decisions
- **Background:** Very dark, near-black purple-tinted (`#08080e`). NOT flat black.
- **Cards:** Subtle border on dark surface. No drop shadows on most cards — borders do the work.
- **Accent glow:** Purple glow on key interactive elements (status dots, active states, CTA buttons).
- **Typography:** Inter for UI, JetBrains Mono for all code. Load via `next/font`.
- **Animations:** Purposeful only. Fade-in on mount (150ms ease), skeleton loaders during model load, streaming text cursor blink.
- **Grid pattern:** Subtle dot grid on hero sections (`background-image: radial-gradient(var(--border) 1px, transparent 1px)`).
- **No gradients** on backgrounds. Gradients only in: hero headline text, CTA button hover, accent glow effects.
- **Status indicators:** Pulsing dot animation for loading states only.

---

## PROJECT STRUCTURE

```
ondevai/
├── app/
│   ├── layout.tsx                    # Root layout: font, metadata, providers
│   ├── page.tsx                      # Landing page
│   ├── globals.css                   # Design tokens + base styles
│   ├── local/page.tsx                # On-device / how it works
│   ├── workspace/
│   │   ├── page.tsx                  # Workspace shell (model init)
│   │   └── WorkspaceClient.tsx       # Full workspace UI (client component)
│   ├── assistant/page.tsx            # Standalone AI chat
│   ├── toolbox/
│   │   ├── page.tsx                  # Toolbox shell
│   │   └── ToolboxClient.tsx         # Tool grid + runner
│   ├── use-cases/page.tsx
│   ├── roadmap/page.tsx
│   ├── docs/page.tsx
│   └── devtools/page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   │
│   ├── workspace/
│   │   ├── WorkspaceLayout.tsx       # Three-pane layout manager
│   │   ├── WorkspaceToolbar.tsx      # Model picker + strategy + status
│   │   ├── ChatPanel.tsx             # Prompt + pipeline + build log
│   │   ├── PipelineSteps.tsx         # 5-step visual pipeline
│   │   ├── EditorPanel.tsx           # CodeMirror + file tabs + history
│   │   ├── PreviewPanel.tsx          # iframe + error handling + console
│   │   ├── ModelPicker.tsx           # Dropdown: tier + model selection
│   │   ├── StrategySelector.tsx      # Quick / Standard / Deep tabs
│   │   ├── ProjectDrawer.tsx         # Slide-in project manager
│   │   └── ExportButton.tsx          # ZIP export via jszip
│   │
│   ├── toolbox/
│   │   ├── ToolSidebar.tsx           # Category navigation
│   │   ├── ToolGrid.tsx              # Responsive tool card grid
│   │   ├── ToolCard.tsx              # Individual tool card
│   │   ├── ToolRunner.tsx            # I/O panel for running tools
│   │   └── tools/                   # One file per complex tool
│   │       ├── DiffViewer.tsx        # Side-by-side diff
│   │       ├── JsonTools.tsx         # Format/validate/diff JSON
│   │       ├── PdfToolkit.tsx        # PDF operations (pdf-lib)
│   │       ├── ImageTools.tsx        # Background removal (Transformers.js)
│   │       ├── AudioTools.tsx        # Whisper transcription
│   │       ├── DataTools.tsx         # CSV/JSON/YAML convert
│   │       ├── ColorStudio.tsx       # Color picker + WCAG
│   │       └── MarkdownStudio.tsx    # Markdown + live preview
│   │
│   ├── assistant/
│   │   ├── ChatInterface.tsx         # Full chat UI
│   │   ├── MessageBubble.tsx         # Markdown-rendered message
│   │   └── ChatInput.tsx             # Textarea + send button
│   │
│   └── shared/
│       ├── ModelOverlay.tsx          # Full-screen model loading
│       ├── WebGPUCheck.tsx           # Detect + show WebGPU status
│       ├── StatusBadge.tsx           # ● Ready / ◌ Loading
│       ├── ProgressBar.tsx           # Download progress
│       ├── Ticker.tsx                # Horizontal scrolling feature list
│       ├── CodeBlock.tsx             # Syntax-highlighted code display
│       └── Toast.tsx                 # Notification system
│
├── lib/
│   ├── engine/
│   │   ├── webllm.ts                 # Engine singleton + stream helper
│   │   ├── models.ts                 # Model definitions by tier
│   │   └── EngineContext.tsx         # React context for engine
│   │
│   ├── workspace/
│   │   ├── pipeline.ts               # 5-pass build pipeline
│   │   ├── strategies.ts             # Quick/Standard/Deep logic
│   │   ├── componentPack.ts          # window.Vib injection code
│   │   └── pgliteInjection.ts        # PGlite injection for DB apps
│   │
│   ├── toolbox/
│   │   ├── toolDefinitions.ts        # All 66 tools: id, name, prompt, category
│   │   └── transformersModels.ts     # Lazy-loaded vision/audio models
│   │
│   ├── storage/
│   │   ├── projects.ts               # IndexedDB project CRUD (idb-keyval)
│   │   └── pglite.ts                 # PGlite singleton for workspace DB
│   │
│   └── utils/
│       ├── webgpu.ts                 # GPU detection utilities
│       ├── zip.ts                    # jszip export helper
│       └── markdown.ts               # Markdown → HTML renderer
│
├── public/
│   ├── manifest.json                 # PWA manifest
│   └── icons/                        # 192, 512, maskable PNGs
│
├── next.config.js                    # COOP/COEP headers + PWA + webpack
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## PACKAGE.JSON

```json
{
  "name": "ondevai",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@mlc-ai/web-llm": "^0.2.79",
    "@electric-sql/pglite": "^0.2.17",
    "@codemirror/state": "^6.4.0",
    "@codemirror/view": "^6.34.0",
    "@codemirror/commands": "^6.7.0",
    "@codemirror/lang-html": "^6.4.0",
    "@codemirror/lang-css": "^6.3.0",
    "@codemirror/lang-javascript": "^6.2.0",
    "@codemirror/lang-markdown": "^6.3.0",
    "@codemirror/lang-json": "^6.1.0",
    "@codemirror/theme-one-dark": "^6.1.2",
    "@uiw/codemirror-theme-vscode": "^4.23.0",
    "@huggingface/transformers": "^3.5.0",
    "idb-keyval": "^6.2.0",
    "jszip": "^3.10.0",
    "pdf-lib": "^1.17.0",
    "lucide-react": "^0.468.0",
    "next-pwa": "^5.6.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0"
  }
}
```

---

## NEXT.CONFIG.JS (exact, copy verbatim)

```javascript
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  // REQUIRED: WebLLM needs SharedArrayBuffer which requires these headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },

  webpack: (config) => {
    // PGlite must be excluded from webpack optimization
    config.externals = config.externals || [];
    
    // Handle WASM files
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    
    // Fallbacks for browser environment
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
};

module.exports = withPWA(nextConfig);
```

---

## LIB/ENGINE/WEBLLM.TS (exact implementation)

```typescript
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
```

---

## LIB/ENGINE/MODELS.TS

```typescript
export interface ModelDef {
  id: string;
  name: string;
  tier: 'lightweight' | 'balanced' | 'powerful';
  params: string;
  vram: string;
  description: string;
  recommended?: boolean;
}

export const MODELS: ModelDef[] = [
  // Lightweight
  {
    id: 'Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5-Coder 0.5B',
    tier: 'lightweight',
    params: '0.5B',
    vram: '~1.5GB',
    description: 'Fastest. Good for simple scripts and short apps.',
  },
  {
    id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    name: 'Phi-3.5 Mini',
    tier: 'lightweight',
    params: '3.8B',
    vram: '~2.5GB',
    description: 'Compact but capable for basic apps.',
  },
  // Balanced (default)
  {
    id: 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5-Coder 1.5B',
    tier: 'balanced',
    params: '1.5B',
    vram: '~3GB',
    description: 'Best balance of speed and quality. Recommended default.',
    recommended: true,
  },
  {
    id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 3B',
    tier: 'balanced',
    params: '3B',
    vram: '~4GB',
    description: 'Strong general capability for complex apps.',
  },
  // Powerful
  {
    id: 'Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5-Coder 7B',
    tier: 'powerful',
    params: '7B',
    vram: '~8GB',
    description: 'Best quality. Full-stack apps with deep logic.',
  },
];

export const DEFAULT_MODEL = MODELS.find(m => m.recommended)!;

export function getModelsByTier(tier: ModelDef['tier']): ModelDef[] {
  return MODELS.filter(m => m.tier === tier);
}

export function detectRecommendedTier(): ModelDef['tier'] {
  // Simple heuristic based on device memory if available
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (mem && mem >= 8) return 'powerful';
  if (mem && mem >= 4) return 'balanced';
  return 'lightweight';
}
```

---

## LIB/ENGINE/ENGINECONTEXT.TSX

```tsx
'use client';
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { MLCEngine } from '@mlc-ai/web-llm';
import { initWebLLM, type EngineState } from './webllm';
import { DEFAULT_MODEL, type ModelDef } from './models';

interface EngineContextType extends EngineState {
  selectedModel: ModelDef;
  loadModel: (model: ModelDef) => Promise<void>;
  setModel: (model: ModelDef) => void;
}

const EngineContext = createContext<EngineContextType | null>(null);

type Action =
  | { type: 'SET_STATE'; payload: Partial<EngineState> }
  | { type: 'SET_MODEL'; payload: ModelDef };

function reducer(
  state: EngineContextType,
  action: Action
): EngineContextType {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'SET_MODEL':
      return { ...state, selectedModel: action.payload };
    default:
      return state;
  }
}

const initialState: EngineContextType = {
  engine: null,
  isReady: false,
  isLoading: false,
  progress: 0,
  progressText: 'Ready to load model',
  currentModelId: '',
  error: null,
  selectedModel: DEFAULT_MODEL,
  loadModel: async () => {},
  setModel: () => {},
};

export function EngineProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadModel = useCallback(async (model: ModelDef) => {
    dispatch({ type: 'SET_MODEL', payload: model });
    const engine = await initWebLLM(model.id, (partial) => {
      dispatch({ type: 'SET_STATE', payload: { ...partial, engine: null } });
    });
    dispatch({
      type: 'SET_STATE',
      payload: {
        engine,
        isReady: true,
        isLoading: false,
        currentModelId: model.id,
      },
    });
  }, []);

  const setModel = useCallback((model: ModelDef) => {
    dispatch({ type: 'SET_MODEL', payload: model });
  }, []);

  return (
    <EngineContext.Provider value={{ ...state, loadModel, setModel }}>
      {children}
    </EngineContext.Provider>
  );
}

export function useEngine(): EngineContextType {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error('useEngine must be inside EngineProvider');
  return ctx;
}
```

---

## LIB/WORKSPACE/PIPELINE.TS

```typescript
import { streamChat, runChat } from '../engine/webllm';
import type { ChatCompletionMessageParam } from '@mlc-ai/web-llm';

export type Strategy = 'quick' | 'standard' | 'deep';
export type PipelineStep = 'research' | 'blueprint' | 'generate' | 'review' | 'fix';
export type StepStatus = 'pending' | 'active' | 'done' | 'skipped';

export interface PipelineCallbacks {
  onStepChange: (step: PipelineStep, status: StepStatus) => void;
  onLog: (step: PipelineStep, text: string) => void;
  onCodeUpdate: (code: string) => void;
  onComplete: (code: string) => void;
  onError: (error: string) => void;
}

const SYSTEM_PROMPTS = {
  research: `You are a senior web developer and architect. Your job is to analyse what needs to be built and identify requirements.
Be concise. Output 6-8 bullet points covering: key features, tech choices, data structure, UI components, and any APIs needed.`,

  blueprint: `You are a web app architect. Given requirements, produce a structured blueprint.
Output a clear plan with: sections/pages, components, data models, key functions, and state needed.
Be specific and concrete. This blueprint will be used to write code.`,

  generate: `You are an expert web developer. You write complete, working, single-file HTML applications.
Rules:
- Output ONLY the complete HTML. Nothing else. No explanation. No markdown fences.
- Embed all CSS in a <style> tag and all JS in a <script> tag.
- Make it genuinely functional — real logic, not placeholders.
- Use CSS custom properties for theming. Make it look polished and modern.
- Dark theme by default. Clean, minimal design.
- All data persists via localStorage.
- Handle errors gracefully.`,

  review: `You are a senior code reviewer. Audit the provided HTML app for:
- Missing features from the stated requirements
- JavaScript errors or broken logic
- CSS issues (layout breakage, missing styles)
- UX problems (non-functional buttons, broken forms)
List ONLY real issues found, as bullet points. If the code is correct, output only: LGTM`,

  fix: `You are a code fixer. Given a review of issues, fix ALL of them in the provided HTML app.
Output ONLY the complete, corrected HTML. Nothing else. No explanation.`,
};

export async function runPipeline(
  userPrompt: string,
  strategy: Strategy,
  callbacks: PipelineCallbacks
): Promise<void> {
  const { onStepChange, onLog, onCodeUpdate, onComplete, onError } = callbacks;

  try {
    let research = '';
    let blueprint = '';
    let generatedCode = '';

    // ─── PASS 1: RESEARCH ───────────────────────────────────────────
    if (strategy !== 'quick') {
      onStepChange('research', 'active');
      onLog('research', 'Analysing requirements…');

      research = await runChat([
        { role: 'system', content: SYSTEM_PROMPTS.research },
        { role: 'user', content: `Analyse requirements for: "${userPrompt}"` },
      ], { temperature: 0.2, max_tokens: 600 });

      onLog('research', research);
      onStepChange('research', 'done');
    } else {
      onStepChange('research', 'skipped');
    }

    // ─── PASS 2: BLUEPRINT ──────────────────────────────────────────
    if (strategy !== 'quick') {
      onStepChange('blueprint', 'active');
      onLog('blueprint', 'Drafting architecture…');

      blueprint = await runChat([
        { role: 'system', content: SYSTEM_PROMPTS.blueprint },
        {
          role: 'user',
          content: `Create a detailed blueprint for: "${userPrompt}"\n\nRequirements:\n${research}`,
        },
      ], { temperature: 0.2, max_tokens: 800 });

      onLog('blueprint', blueprint);
      onStepChange('blueprint', 'done');
    } else {
      onStepChange('blueprint', 'skipped');
    }

    // ─── PASS 3: GENERATE ──────────────────────────────────────────
    onStepChange('generate', 'active');
    onLog('generate', 'Writing code…');

    const generateMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPTS.generate },
      {
        role: 'user',
        content: strategy === 'quick'
          ? `Build this as a complete single HTML file: "${userPrompt}"\n\nOutput ONLY the HTML.`
          : `Build this as a complete single HTML file.\n\nGoal: "${userPrompt}"\nRequirements:\n${research}\nBlueprint:\n${blueprint}\n\nOutput ONLY the complete HTML.`,
      },
    ];

    for await (const partial of streamChat(generateMessages, {
      temperature: 0.5,
      max_tokens: 4096,
    })) {
      generatedCode = partial;
      onCodeUpdate(partial);
    }

    onStepChange('generate', 'done');

    // ─── PASS 4: REVIEW ────────────────────────────────────────────
    if (strategy !== 'quick') {
      onStepChange('review', 'active');
      onLog('review', 'Reviewing for issues…');

      const reviewResult = await runChat([
        { role: 'system', content: SYSTEM_PROMPTS.review },
        {
          role: 'user',
          content: `Original goal: "${userPrompt}"\n\nCode to review:\n${generatedCode.substring(0, 6000)}`,
        },
      ], { temperature: 0.1, max_tokens: 600 });

      onLog('review', reviewResult);
      onStepChange('review', 'done');

      // ─── PASS 5: FIX ─────────────────────────────────────────────
      if (!reviewResult.trim().toUpperCase().startsWith('LGTM')) {
        onStepChange('fix', 'active');
        onLog('fix', 'Applying fixes…');

        for await (const partial of streamChat([
          { role: 'system', content: SYSTEM_PROMPTS.fix },
          {
            role: 'user',
            content: `Issues found:\n${reviewResult}\n\nOriginal code:\n${generatedCode.substring(0, 5000)}\n\nOutput ONLY the corrected HTML.`,
          },
        ], { temperature: 0.3, max_tokens: 4096 })) {
          generatedCode = partial;
          onCodeUpdate(partial);
        }

        onStepChange('fix', 'done');
      } else {
        onStepChange('fix', 'skipped');
      }
    } else {
      onStepChange('review', 'skipped');
      onStepChange('fix', 'skipped');
    }

    // ─── INJECT LOCAL-FIRST BACKEND ────────────────────────────────
    generatedCode = injectLocalBackend(generatedCode);
    onCodeUpdate(generatedCode);
    onComplete(generatedCode);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Pipeline failed';
    onError(msg);
  }
}

function injectLocalBackend(html: string): string {
  const vibScript = `
<script>
/* OnDevAI — Local-first backend (runs in your browser, no server) */
window.Vib = {
  store: {
    get: (k) => { try { return JSON.parse(localStorage.getItem('vib_' + k) || 'null'); } catch { return null; } },
    set: (k, v) => localStorage.setItem('vib_' + k, JSON.stringify(v)),
    del: (k) => localStorage.removeItem('vib_' + k),
    all: () => Object.fromEntries(
      Object.keys(localStorage)
        .filter(k => k.startsWith('vib_'))
        .map(k => [k.slice(4), JSON.parse(localStorage.getItem(k))])
    ),
  },
  toast: (msg, type = 'info') => {
    const t = document.createElement('div');
    const colors = { info: '#6d5df0', success: '#22d3a5', error: '#ef4444' };
    t.style.cssText = \`position:fixed;bottom:24px;right:24px;padding:12px 18px;border-radius:8px;
      background:\${colors[type]||colors.info};color:white;font-size:13px;z-index:9999;
      box-shadow:0 4px 16px rgba(0,0,0,0.4);animation:fadeIn .2s ease;\`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  },
  auth: {
    _hash: async (p) => { const b = new TextEncoder().encode(p); const h = await crypto.subtle.digest('SHA-256',b); return Array.from(new Uint8Array(h)).map(x=>x.toString(16).padStart(2,'0')).join(''); },
    signup: async (user, pass) => {
      if (localStorage.getItem('vib_user_'+user)) return { ok: false, error: 'User exists' };
      const h = await window.Vib.auth._hash(pass);
      localStorage.setItem('vib_user_'+user, h);
      localStorage.setItem('vib_session', JSON.stringify({ user, ts: Date.now() }));
      return { ok: true };
    },
    login: async (user, pass) => {
      const h = await window.Vib.auth._hash(pass);
      if (localStorage.getItem('vib_user_'+user) !== h) return { ok: false, error: 'Invalid credentials' };
      localStorage.setItem('vib_session', JSON.stringify({ user, ts: Date.now() }));
      return { ok: true };
    },
    logout: () => localStorage.removeItem('vib_session'),
    current: () => { try { return JSON.parse(localStorage.getItem('vib_session')||'null'); } catch { return null; } },
  },
};
</script>`;

  if (html.includes('</body>')) {
    return html.replace('</body>', vibScript + '\n</body>');
  }
  return html + vibScript;
}
```

---

## LIB/TOOLBOX/TOOLDEFINITIONS.TS

```typescript
export type ToolCategory =
  | 'assistant'
  | 'code'
  | 'writing'
  | 'data'
  | 'documents'
  | 'vision'
  | 'audio'
  | 'imagegen'
  | 'knowledge'
  | 'devutils'
  | 'privacy';

export interface ToolDef {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  inputLabel: string;
  inputPlaceholder: string;
  outputLabel: string;
  systemPrompt: string;
  userPromptTemplate: string; // use {input} as placeholder
  inputType: 'text' | 'file' | 'custom';
  customComponent?: string; // component name if inputType === 'custom'
}

export const TOOLS: ToolDef[] = [
  // ── ASSISTANT ────────────────────────────────────────
  {
    id: 'general-chat',
    name: 'AI Assistant',
    description: 'General-purpose AI chat. Ask anything.',
    category: 'assistant',
    icon: '🤖',
    inputLabel: 'Message',
    inputPlaceholder: 'Ask anything…',
    outputLabel: 'Response',
    systemPrompt: 'You are a helpful, knowledgeable assistant. Be concise and accurate.',
    userPromptTemplate: '{input}',
    inputType: 'text',
  },

  // ── CODE INTELLIGENCE ─────────────────────────────────
  {
    id: 'code-playground',
    name: 'Raw Code Zone',
    description: 'Generate, run and refine code snippets.',
    category: 'code',
    icon: '⚡',
    inputLabel: 'Describe or paste code',
    inputPlaceholder: 'e.g. Write a binary search function in TypeScript',
    outputLabel: 'Generated code',
    systemPrompt: 'You are an expert programmer. Write clean, working code with comments.',
    userPromptTemplate: '{input}',
    inputType: 'text',
  },
  {
    id: 'regex-gen',
    name: 'Regex Generator & Tester',
    description: 'Describe a pattern in plain English and get a regex.',
    category: 'code',
    icon: '🔤',
    inputLabel: 'Describe the pattern',
    inputPlaceholder: 'e.g. Match email addresses but not subdomains',
    outputLabel: 'Regex + explanation',
    systemPrompt: 'You are a regex expert. Given a description, output: 1) The regex pattern 2) What it matches 3) Example matches 4) Example non-matches.',
    userPromptTemplate: 'Generate a regex for: {input}',
    inputType: 'text',
  },
  {
    id: 'sql-gen',
    name: 'SQL Generator & Explainer',
    description: 'Natural language → SQL query. Explains and optimises.',
    category: 'code',
    icon: '🗄️',
    inputLabel: 'Describe your query',
    inputPlaceholder: 'e.g. Get all users who signed up last month and have made a purchase',
    outputLabel: 'SQL + explanation',
    systemPrompt: 'You are a SQL expert. Write clean, optimised SQL queries with explanations.',
    userPromptTemplate: 'Write SQL for: {input}',
    inputType: 'text',
  },
  {
    id: 'cron-builder',
    name: 'Cron Builder',
    description: 'Plain English → cron expression with next-run preview.',
    category: 'code',
    icon: '⏰',
    inputLabel: 'Describe the schedule',
    inputPlaceholder: 'e.g. Every weekday at 9am except holidays',
    outputLabel: 'Cron expression + schedule',
    systemPrompt: 'You are a cron expert. Convert schedule descriptions to cron expressions. Show the expression, explain each field, and list the next 5 run times.',
    userPromptTemplate: 'Convert to cron: {input}',
    inputType: 'text',
  },
  {
    id: 'code-explainer',
    name: 'Code Explainer & Commenter',
    description: 'Plain-English explanation + inline comments.',
    category: 'code',
    icon: '🔍',
    inputLabel: 'Paste your code',
    inputPlaceholder: 'Paste any code here…',
    outputLabel: 'Explanation + commented code',
    systemPrompt: 'You are a senior developer explaining code to a junior. First explain what the code does in plain English, then output the same code with helpful inline comments added.',
    userPromptTemplate: 'Explain and comment this code:\n\n{input}',
    inputType: 'text',
  },
  {
    id: 'code-translator',
    name: 'Code Translator',
    description: 'Convert code between programming languages idiomatically.',
    category: 'code',
    icon: '🔄',
    inputLabel: 'Paste code (specify source and target language)',
    inputPlaceholder: 'e.g. Convert this Python to TypeScript:\n\ndef add(a, b):\n  return a + b',
    outputLabel: 'Translated code',
    systemPrompt: 'You are an expert in multiple programming languages. Translate code idiomatically — use the target language\'s conventions, not a direct translation.',
    userPromptTemplate: '{input}',
    inputType: 'text',
  },
  {
    id: 'test-gen',
    name: 'Unit Test Generator',
    description: 'Paste a function → get a full test suite.',
    category: 'code',
    icon: '🧪',
    inputLabel: 'Paste the function to test',
    inputPlaceholder: 'Paste your function here…',
    outputLabel: 'Test suite',
    systemPrompt: 'You are a testing expert. Write comprehensive unit tests covering: happy path, edge cases, error cases, and boundary conditions. Detect the language and use the appropriate test framework.',
    userPromptTemplate: 'Write unit tests for:\n\n{input}',
    inputType: 'text',
  },
  {
    id: 'commit-writer',
    name: 'Commit & PR Writer',
    description: 'Paste a git diff → get a commit message + PR description.',
    category: 'code',
    icon: '📝',
    inputLabel: 'Paste your git diff',
    inputPlaceholder: 'Paste git diff output here…',
    outputLabel: 'Commit message + PR description',
    systemPrompt: 'You are a developer writing commit messages. Output: 1) A Conventional Commits message (type(scope): description) 2) A PR title 3) A PR description with what changed and why.',
    userPromptTemplate: 'Write a commit message and PR description for this diff:\n\n{input}',
    inputType: 'text',
  },

  // ── WRITING ───────────────────────────────────────────
  {
    id: 'writing-tools',
    name: 'Writing Tools',
    description: 'Draft, rewrite, summarise and proofread.',
    category: 'writing',
    icon: '✍️',
    inputLabel: 'Text + instruction',
    inputPlaceholder: 'e.g. Rewrite this to be more concise:\n\n[your text]',
    outputLabel: 'Result',
    systemPrompt: 'You are a professional writer and editor. Help with drafting, rewriting, summarising, and proofreading text.',
    userPromptTemplate: '{input}',
    inputType: 'text',
  },
  {
    id: 'translator',
    name: 'Offline Translator',
    description: 'Translate between 100+ languages, fully on-device.',
    category: 'writing',
    icon: '🌐',
    inputLabel: 'Text to translate (specify target language)',
    inputPlaceholder: 'e.g. Translate to French:\n\nHello, how are you?',
    outputLabel: 'Translation',
    systemPrompt: 'You are a professional translator. Provide accurate, natural-sounding translations.',
    userPromptTemplate: '{input}',
    inputType: 'text',
  },
  {
    id: 'grammar-style',
    name: 'Grammar & Style',
    description: 'Fix grammar and polish writing clarity.',
    category: 'writing',
    icon: '📖',
    inputLabel: 'Paste your text',
    inputPlaceholder: 'Paste the text to fix…',
    outputLabel: 'Corrected text + changes',
    systemPrompt: 'You are a grammar and style expert. Fix all grammar, spelling, and style issues. Output the corrected text followed by a bullet list of what was changed.',
    userPromptTemplate: 'Fix grammar and style:\n\n{input}',
    inputType: 'text',
  },
  {
    id: 'tone-rewriter',
    name: 'Tone & Readability',
    description: 'Rewrite text to a target tone and reading level.',
    category: 'writing',
    icon: '🎯',
    inputLabel: 'Text + desired tone/level',
    inputPlaceholder: 'e.g. Rewrite for a 10-year-old in a friendly tone:\n\n[your text]',
    outputLabel: 'Rewritten text',
    systemPrompt: 'You are an expert at adapting text for different audiences and tones.',
    userPromptTemplate: '{input}',
    inputType: 'text',
  },
  {
    id: 'email-assistant',
    name: 'Email Assistant',
    description: 'Draft, reply to, and tune emails.',
    category: 'writing',
    icon: '📧',
    inputLabel: 'Email context + instruction',
    inputPlaceholder: 'e.g. Write a polite follow-up email for a job application sent 2 weeks ago',
    outputLabel: 'Email draft',
    systemPrompt: 'You are a professional email writer. Write clear, appropriate emails for any context.',
    userPromptTemplate: '{input}',
    inputType: 'text',
  },
  {
    id: 'resume-writer',
    name: 'Resume & Cover Letter',
    description: 'Tailor resume to a job, write cover letter, run ATS check.',
    category: 'writing',
    icon: '📄',
    inputLabel: 'Job description + your experience',
    inputPlaceholder: 'Paste the job description, then your current resume or skills list',
    outputLabel: 'Tailored content',
    systemPrompt: 'You are a career coach and professional resume writer. Help tailor resumes and write compelling cover letters.',
    userPromptTemplate: '{input}',
    inputType: 'text',
  },
  {
    id: 'flashcards',
    name: 'Flashcards & Quiz',
    description: 'Turn notes into flashcards or a quiz.',
    category: 'writing',
    icon: '🃏',
    inputLabel: 'Paste your notes or topic',
    inputPlaceholder: 'Paste notes or describe a topic to quiz yourself on',
    outputLabel: 'Flashcards / Quiz',
    systemPrompt: 'You are an education tool. Create clear, useful flashcards or quiz questions from the provided content. Format as Q&A pairs.',
    userPromptTemplate: 'Create flashcards from:\n\n{input}',
    inputType: 'text',
  },
  {
    id: 'quick-generators',
    name: 'Quick Generators',
    description: 'Names, usernames, URL slugs, lorem ipsum — no waiting.',
    category: 'writing',
    icon: '⚡',
    inputLabel: 'Describe what to generate',
    inputPlaceholder: 'e.g. Generate 10 creative usernames for a photography app',
    outputLabel: 'Generated results',
    systemPrompt: 'You are a creative generator. Produce varied, useful results quickly.',
    userPromptTemplate: '{input}',
    inputType: 'text',
  },
  {
    id: 'markdown-studio',
    name: 'Markdown Studio',
    description: 'Write Markdown with live preview, export to HTML/PDF.',
    category: 'writing',
    icon: '📝',
    inputLabel: 'Markdown content',
    inputPlaceholder: '# My Document\n\nWrite Markdown here…',
    outputLabel: 'Preview (HTML)',
    systemPrompt: 'Convert Markdown to clean HTML. Preserve all formatting.',
    userPromptTemplate: 'Convert this Markdown to clean HTML:\n\n{input}',
    inputType: 'custom',
    customComponent: 'MarkdownStudio',
  },

  // ── DATA & SPREADSHEETS ───────────────────────────────
  {
    id: 'chat-data',
    name: 'Chat With Your Data',
    description: 'Ask plain-English questions about your spreadsheet.',
    category: 'data',
    icon: '📊',
    inputLabel: 'Paste CSV data + question',
    inputPlaceholder: 'Paste your CSV data here, then ask a question below it.\n\ne.g.\nname,age,city\nAlice,30,NYC\nBob,25,LA\n\nQuestion: Who is the oldest?',
    outputLabel: 'Answer',
    systemPrompt: 'You are a data analyst. Answer questions about tabular data accurately. Show your reasoning.',
    userPromptTemplate: '{input}',
    inputType: 'text',
  },
  {
    id: 'data-cleaner',
    name: 'Data Cleaner',
    description: 'Deduplicate, trim, normalise — entirely in your browser.',
    category: 'data',
    icon: '🧹',
    inputLabel: 'Paste messy CSV or TSV data',
    inputPlaceholder: 'Paste CSV data with duplicates, bad formatting, etc.',
    outputLabel: 'Cleaned data + change summary',
    systemPrompt: 'You are a data cleaning expert. Clean the provided data: remove duplicates, trim whitespace, normalise casing, fix common formatting issues. Output the clean CSV and a summary of changes.',
    userPromptTemplate: 'Clean this data:\n\n{input}',
    inputType: 'text',
  },
  {
    id: 'format-converter',
    name: 'Format Converter',
    description: 'Convert between CSV, JSON, YAML, XML.',
    category: 'data',
    icon: '🔄',
    inputLabel: 'Paste data + specify target format',
    inputPlaceholder: 'e.g. Convert to JSON:\n\nname,age\nAlice,30\nBob,25',
    outputLabel: 'Converted data',
    systemPrompt: 'You are a data format expert. Convert data between CSV, JSON, YAML, XML, and TSV formats accurately.',
    userPromptTemplate: '{input}',
    inputType: 'text',
  },
  {
    id: 'formula-gen',
    name: 'Formula Generator',
    description: 'Describe → Excel/Sheets/Airtable formula.',
    category: 'data',
    icon: '🧮',
    inputLabel: 'Describe what you need',
    inputPlaceholder: 'e.g. Sum column B where column A contains "Revenue" (Excel)',
    outputLabel: 'Formula + explanation',
    systemPrompt: 'You are a spreadsheet expert. Generate formulas for Excel, Google Sheets, or Airtable with clear explanations.',
    userPromptTemplate: 'Generate a formula for: {input}',
    inputType: 'text',
  },
  {
    id: 'data-anonymizer',
    name: 'Data Anonymizer',
    description: 'Detect and mask PII in data — fully on-device.',
    category: 'data',
    icon: '🔒',
    inputLabel: 'Paste data to anonymize',
    inputPlaceholder: 'Paste CSV or text containing personal data',
    outputLabel: 'Anonymized data',
    systemPrompt: 'You are a privacy expert. Detect and replace PII (names, emails, phones, SSNs, addresses) with realistic synthetic values. Preserve data structure.',
    userPromptTemplate: 'Anonymize this data by replacing PII with synthetic values:\n\n{input}',
    inputType: 'text',
  },
  {
    id: 'sentiment-analyzer',
    name: 'Sentiment & Theme Analyzer',
    description: 'Score sentiment and surface themes across text rows.',
    category: 'data',
    icon: '💬',
    inputLabel: 'Paste text data (one item per line or CSV)',
    inputPlaceholder: 'Paste customer reviews, feedback, or comments',
    outputLabel: 'Sentiment scores + themes',
    systemPrompt: 'You are a sentiment analysis and text mining expert. For each input, provide: sentiment (positive/negative/neutral + score 0-100), and for the full set, identify recurring themes.',
    userPromptTemplate: 'Analyse sentiment and themes in:\n\n{input}',
    inputType: 'text',
  },
  {
    id: 'chart-builder',
    name: 'Chart Builder',
    description: 'Turn data into Chart.js code, runs in preview.',
    category: 'data',
    icon: '📈',
    inputLabel: 'Paste your data + chart type',
    inputPlaceholder: 'e.g. Bar chart:\nQ1,Q2,Q3,Q4\n120,145,98,200',
    outputLabel: 'Chart HTML (copy to editor)',
    systemPrompt: 'You are a data visualisation expert. Generate complete HTML with Chart.js that creates a beautiful, responsive chart from the provided data.',
    userPromptTemplate: 'Create a Chart.js visualisation for:\n\n{input}',
    inputType: 'text',
  },
  {
    id: 'column-categorizer',
    name: 'Smart Column Categorizer',
    description: 'Tag every row into clean categories.',
    category: 'data',
    icon: '🏷️',
    inputLabel: 'Paste CSV data + category instructions',
    inputPlaceholder: 'Paste your data and describe the categories to assign',
    outputLabel: 'Categorized data',
    systemPrompt: 'You are a data categorisation expert. Tag each row with the appropriate category based on the provided criteria.',
    userPromptTemplate: '{input}',
    inputType: 'text',
  },

  // ── DOCUMENTS & PDF ───────────────────────────────────
  {
    id: 'document-assistant',
    name: 'Document Assistant',
    description: 'Summarise, explain contracts, ask questions.',
    category: 'documents',
    icon: '📋',
    inputLabel: 'Paste document text + question',
    inputPlaceholder: 'Paste document content, then ask your question',
    outputLabel: 'Summary / Answer',
    systemPrompt: 'You are a document analysis expert. Summarise documents, explain complex language in plain English, highlight risks, and answer specific questions.',
    userPromptTemplate: '{input}',
    inputType: 'text',
  },
  {
    id: 'pdf-toolkit',
    name: 'PDF Toolkit',
    description: 'Merge, split, compress PDFs in your browser.',
    category: 'documents',
    icon: '📑',
    inputLabel: 'Upload PDF(s)',
    inputPlaceholder: '',
    outputLabel: 'Result PDF',
    systemPrompt: '',
    userPromptTemplate: '',
    inputType: 'custom',
    customComponent: 'PdfToolkit',
  },
  {
    id: 'structured-extractor',
    name: 'Structured Data Extractor',
    description: 'Pull invoices, contracts, forms into JSON/CSV.',
    category: 'documents',
    icon: '🔗',
    inputLabel: 'Paste document text + extraction schema',
    inputPlaceholder: 'e.g. Extract: vendor name, total, date, line items\n\n[paste invoice text here]',
    outputLabel: 'Extracted JSON',
    systemPrompt: 'You are a data extraction expert. Extract structured data from unstructured documents. Output valid JSON.',
    userPromptTemplate: '{input}',
    inputType: 'text',
  },
  {
    id: 'receipts-csv',
    name: 'Receipts to Spreadsheet',
    description: 'Turn batch receipts/invoices into CSV.',
    category: 'documents',
    icon: '🧾',
    inputLabel: 'Paste receipt/invoice text',
    inputPlaceholder: 'Paste one or more receipts or invoices',
    outputLabel: 'CSV spreadsheet',
    systemPrompt: 'You are an accounting tool. Parse receipts and invoices and output a CSV with columns: date, vendor, description, amount, category.',
    userPromptTemplate: 'Extract receipt data as CSV:\n\n{input}',
    inputType: 'text',
  },

  // ── VISION & IMAGE ────────────────────────────────────
  {
    id: 'background-remover',
    name: 'Background Remover',
    description: 'Remove image background with RMBG-1.4, fully on-device.',
    category: 'vision',
    icon: '✂️',
    inputLabel: 'Upload image',
    inputPlaceholder: '',
    outputLabel: 'Transparent PNG',
    systemPrompt: '',
    userPromptTemplate: '',
    inputType: 'custom',
    customComponent: 'ImageTools',
  },
  {
    id: 'image-compressor',
    name: 'Smart Image Compressor',
    description: 'Shrink images to WebP/AVIF/JPEG with live size preview.',
    category: 'vision',
    icon: '🗜️',
    inputLabel: 'Upload image',
    inputPlaceholder: '',
    outputLabel: 'Compressed image',
    systemPrompt: '',
    userPromptTemplate: '',
    inputType: 'custom',
    customComponent: 'ImageTools',
  },
  {
    id: 'color-extractor',
    name: 'Color Palette Extractor',
    description: 'Pull dominant colors from any image as design tokens.',
    category: 'vision',
    icon: '🎨',
    inputLabel: 'Upload image',
    inputPlaceholder: '',
    outputLabel: 'Color palette + CSS',
    systemPrompt: '',
    userPromptTemplate: '',
    inputType: 'custom',
    customComponent: 'ImageTools',
  },
  {
    id: 'qr-barcode',
    name: 'QR & Barcode Studio',
    description: 'Generate QR codes and barcodes, or scan from image.',
    category: 'vision',
    icon: '📱',
    inputLabel: 'Text or URL to encode',
    inputPlaceholder: 'Enter URL or text to encode as QR code',
    outputLabel: 'QR Code',
    systemPrompt: '',
    userPromptTemplate: '',
    inputType: 'custom',
    customComponent: 'ImageTools',
  },
  {
    id: 'format-converter-img',
    name: 'Image Format Converter',
    description: 'Convert HEIC/JPG/PNG/WebP in batches.',
    category: 'vision',
    icon: '🖼️',
    inputLabel: 'Upload image(s)',
    inputPlaceholder: '',
    outputLabel: 'Converted image',
    systemPrompt: '',
    userPromptTemplate: '',
    inputType: 'custom',
    customComponent: 'ImageTools',
  },
  {
    id: 'favicon-gen',
    name: 'App Icon & Favicon Generator',
    description: 'One image → all favicon and PWA icon sizes.',
    category: 'vision',
    icon: '⭐',
    inputLabel: 'Upload source image',
    inputPlaceholder: '',
    outputLabel: 'ZIP of all icon sizes',
    systemPrompt: '',
    userPromptTemplate: '',
    inputType: 'custom',
    customComponent: 'ImageTools',
  },
  {
    id: 'vision-ocr',
    name: 'Vision & OCR',
    description: 'Extract text from images and photos.',
    category: 'vision',
    icon: '👁️',
    inputLabel: 'Upload image',
    inputPlaceholder: '',
    outputLabel: 'Extracted text',
    systemPrompt: '',
    userPromptTemplate: '',
    inputType: 'custom',
    customComponent: 'ImageTools',
  },

  // ── AUDIO & VOICE ─────────────────────────────────────
  {
    id: 'audio-transcribe',
    name: 'Audio Transcription',
    description: 'Transcribe audio files using Whisper, fully on-device.',
    category: 'audio',
    icon: '🎤',
    inputLabel: 'Upload audio file',
    inputPlaceholder: '',
    outputLabel: 'Transcript',
    systemPrompt: '',
    userPromptTemplate: '',
    inputType: 'custom',
    customComponent: 'AudioTools',
  },
  {
    id: 'meeting-assistant',
    name: 'Meeting Assistant',
    description: 'Recording → transcript + decisions + action items.',
    category: 'audio',
    icon: '📹',
    inputLabel: 'Upload meeting recording',
    inputPlaceholder: '',
    outputLabel: 'Transcript + action items',
    systemPrompt: '',
    userPromptTemplate: '',
    inputType: 'custom',
    customComponent: 'AudioTools',
  },

  // ── IMAGE GENERATION ──────────────────────────────────
  {
    id: 'image-gen',
    name: 'Image Generation',
    description: 'Text → image on-device (WebGPU).',
    category: 'imagegen',
    icon: '🎨',
    inputLabel: 'Describe the image',
    inputPlaceholder: 'e.g. A futuristic city at night with neon lights',
    outputLabel: 'Generated image',
    systemPrompt: '',
    userPromptTemplate: '',
    inputType: 'custom',
    customComponent: 'ImageTools',
  },

  // ── KNOWLEDGE & SEARCH ────────────────────────────────
  {
    id: 'chat-files',
    name: 'Chat With Your Files',
    description: 'Q&A across your uploaded documents, fully offline.',
    category: 'knowledge',
    icon: '📚',
    inputLabel: 'Upload file(s) + ask a question',
    inputPlaceholder: 'Upload a file above, then ask your question here',
    outputLabel: 'Answer',
    systemPrompt: 'You are a document Q&A tool. Answer questions accurately based ONLY on the provided document content.',
    userPromptTemplate: 'Based on this document:\n\n{input}',
    inputType: 'custom',
    customComponent: 'KnowledgeTools',
  },
  {
    id: 'auto-tagger',
    name: 'Auto-Tagger & Clusterer',
    description: 'Group notes, bookmarks, snippets into topics.',
    category: 'knowledge',
    icon: '🗂️',
    inputLabel: 'Paste items to tag (one per line)',
    inputPlaceholder: 'Paste notes, URLs, or snippets — one per line',
    outputLabel: 'Tagged + grouped items',
    systemPrompt: 'You are a knowledge organisation expert. Automatically tag and cluster the provided items into meaningful topic groups.',
    userPromptTemplate: 'Tag and cluster these items:\n\n{input}',
    inputType: 'text',
  },
  {
    id: 'duplicate-finder',
    name: 'Duplicate Finder',
    description: 'Spot near-identical passages across your files.',
    category: 'knowledge',
    icon: '🔍',
    inputLabel: 'Paste multiple text blocks (separate with ---)',
    inputPlaceholder: 'Block 1\n\n---\n\nBlock 2\n\n---\n\nBlock 3',
    outputLabel: 'Duplicate analysis',
    systemPrompt: 'You are a text analysis expert. Identify near-duplicate or very similar passages across the provided text blocks.',
    userPromptTemplate: 'Find duplicates or near-duplicates in:\n\n{input}',
    inputType: 'text',
  },

  // ── DEV UTILITIES ─────────────────────────────────────
  {
    id: 'json-tools',
    name: 'JSON & Schema Tools',
    description: 'Format, validate, diff, convert to TypeScript types.',
    category: 'devutils',
    icon: '{}',
    inputLabel: 'Paste JSON + instruction',
    inputPlaceholder: 'e.g. Convert to TypeScript types:\n\n{"name": "Alice", "age": 30}',
    outputLabel: 'Result',
    systemPrompt: 'You are a JSON expert. Format, validate, diff, convert to TypeScript interfaces, or generate JSON Schema as requested.',
    userPromptTemplate: '{input}',
    inputType: 'custom',
    customComponent: 'JsonTools',
  },
  {
    id: 'diff-viewer',
    name: 'Diff & Merge Viewer',
    description: 'Compare text, code or JSON side by side.',
    category: 'devutils',
    icon: '↔️',
    inputLabel: 'Two texts to compare',
    inputPlaceholder: 'Paste two versions of text/code separated by\n--- SEPARATOR ---',
    outputLabel: 'Diff result',
    systemPrompt: 'Compare the two provided texts and highlight all differences clearly.',
    userPromptTemplate: 'Show the differences between these two texts:\n\n{input}',
    inputType: 'custom',
    customComponent: 'DiffViewer',
  },
  {
    id: 'color-studio',
    name: 'Color & CSS Studio',
    description: 'Convert colors, WCAG contrast, build gradients.',
    category: 'devutils',
    icon: '🎨',
    inputLabel: 'Color or CSS to work with',
    inputPlaceholder: 'e.g. Convert #6d5df0 to all formats and check WCAG contrast on white',
    outputLabel: 'Color analysis + CSS',
    systemPrompt: 'You are a CSS and color expert. Convert between color formats, check WCAG contrast ratios, and generate gradients and CSS box shadows.',
    userPromptTemplate: '{input}',
    inputType: 'custom',
    customComponent: 'ColorStudio',
  },
  {
    id: 'mock-data',
    name: 'Mock Data & API Studio',
    description: 'Generate realistic fake datasets + local mock API.',
    category: 'devutils',
    icon: '🏭',
    inputLabel: 'Describe the data schema',
    inputPlaceholder: 'e.g. Generate 20 users with: name, email, age, city, subscription tier',
    outputLabel: 'Mock data (JSON/CSV)',
    systemPrompt: 'You are a mock data generator. Create realistic, varied fake data matching the described schema. Output as valid JSON array.',
    userPromptTemplate: 'Generate mock data for: {input}',
    inputType: 'text',
  },
  {
    id: 'secret-scanner',
    name: 'Secret Scanner',
    description: 'Detect leaked API keys and credentials in code.',
    category: 'devutils',
    icon: '🔑',
    inputLabel: 'Paste code or config files',
    inputPlaceholder: 'Paste code to scan for secrets…',
    outputLabel: 'Scan results',
    systemPrompt: 'You are a security expert. Scan the provided code for: API keys, tokens, passwords, private keys, connection strings, and other secrets. Report findings with line context.',
    userPromptTemplate: 'Scan for secrets and credentials in:\n\n{input}',
    inputType: 'text',
  },
  {
    id: 'accessibility-checker',
    name: 'Contrast & Accessibility',
    description: 'WCAG contrast check + color blindness preview.',
    category: 'devutils',
    icon: '♿',
    inputLabel: 'Paste HTML or color pairs to check',
    inputPlaceholder: 'e.g. Check: #6d5df0 on #08080e\nor paste HTML to audit',
    outputLabel: 'WCAG audit results',
    systemPrompt: 'You are an accessibility expert. Check WCAG 2.1 AA/AAA compliance for color contrast. Report pass/fail and suggest alternatives where needed.',
    userPromptTemplate: 'Check accessibility for: {input}',
    inputType: 'text',
  },
  {
    id: 'dev-quicktools',
    name: 'Dev Quick-Tools',
    description: 'Base64, URL encode/decode, UUID, hash, and more.',
    category: 'devutils',
    icon: '🔧',
    inputLabel: 'Input + specify operation',
    inputPlaceholder: 'e.g. Base64 encode: Hello World\nor: Generate 5 UUIDs',
    outputLabel: 'Result',
    systemPrompt: 'You are a developer utility tool. Handle: Base64 encode/decode, URL encode/decode, UUID generation, hash calculation, JSON minify/prettify, and other common dev tasks.',
    userPromptTemplate: '{input}',
    inputType: 'text',
  },

  // ── PRIVACY & SECURITY ────────────────────────────────
  {
    id: 'private-redactor',
    name: 'Private Redactor',
    description: 'Strip PII and secrets from text before sharing.',
    category: 'privacy',
    icon: '🔇',
    inputLabel: 'Paste text to redact',
    inputPlaceholder: 'Paste text containing sensitive information',
    outputLabel: 'Redacted text',
    systemPrompt: 'You are a privacy tool. Identify and redact: names, emails, phone numbers, addresses, SSNs, API keys, and other PII. Replace with [REDACTED] or descriptive placeholders.',
    userPromptTemplate: 'Redact all sensitive information from:\n\n{input}',
    inputType: 'text',
  },
  {
    id: 'password-studio',
    name: 'Password Studio',
    description: 'Generate strong passwords and audit existing ones.',
    category: 'privacy',
    icon: '🔐',
    inputLabel: 'Requirements or password to audit',
    inputPlaceholder: 'e.g. Generate a 20-char password with no ambiguous characters\nor: Audit this password: mypassword123',
    outputLabel: 'Password + strength analysis',
    systemPrompt: 'You are a password security expert. Generate strong passwords and analyse password strength with specific feedback.',
    userPromptTemplate: '{input}',
    inputType: 'text',
  },
  {
    id: 'hash-checker',
    name: 'Hash & Integrity Checker',
    description: 'SHA/MD5 fingerprint + verify checksums.',
    category: 'privacy',
    icon: '#️⃣',
    inputLabel: 'Text to hash or hash to verify',
    inputPlaceholder: 'e.g. SHA-256 hash: Hello World\nor: Verify "abc123" matches [known hash]',
    outputLabel: 'Hash result',
    systemPrompt: 'You are a cryptography tool. Calculate SHA-256, SHA-512, MD5 hashes and verify checksums.',
    userPromptTemplate: '{input}',
    inputType: 'text',
  },
  {
    id: 'metadata-stripper',
    name: 'Metadata Stripper',
    description: 'Reveal hidden EXIF/GPS data in photos, then strip it.',
    category: 'privacy',
    icon: '🕵️',
    inputLabel: 'Upload image',
    inputPlaceholder: '',
    outputLabel: 'EXIF data + clean image download',
    systemPrompt: '',
    userPromptTemplate: '',
    inputType: 'custom',
    customComponent: 'ImageTools',
  },
  {
    id: 'encryption-vault',
    name: 'Encryption Vault',
    description: 'AES-256 file encrypt/decrypt in your browser.',
    category: 'privacy',
    icon: '🔏',
    inputLabel: 'File + passphrase',
    inputPlaceholder: '',
    outputLabel: 'Encrypted/decrypted file',
    systemPrompt: '',
    userPromptTemplate: '',
    inputType: 'custom',
    customComponent: 'EncryptionVault',
  },
  {
    id: 'steganography',
    name: 'Hidden Message in Image',
    description: 'Embed a secret message in an image or reveal one.',
    category: 'privacy',
    icon: '🖼️',
    inputLabel: 'Image + message',
    inputPlaceholder: '',
    outputLabel: 'Image with hidden message',
    systemPrompt: '',
    userPromptTemplate: '',
    inputType: 'custom',
    customComponent: 'ImageTools',
  },
  {
    id: 'deck-builder',
    name: 'Deck Builder',
    description: 'Topic → editable slide deck, export as offline HTML.',
    category: 'writing',
    icon: '🎞️',
    inputLabel: 'Topic or document to turn into slides',
    inputPlaceholder: 'e.g. Create a 10-slide presentation on: The benefits of on-device AI',
    outputLabel: 'Slide deck HTML',
    systemPrompt: 'You are a presentation expert. Create clean, structured slide decks as HTML with embedded CSS. Each slide should be visually distinct with a title and key points.',
    userPromptTemplate: 'Create a slide deck for: {input}',
    inputType: 'text',
  },
];

export const CATEGORIES: { id: ToolCategory; label: string; icon: string; count: number }[] = [
  { id: 'assistant', label: 'Assistant', icon: '🤖', count: TOOLS.filter(t => t.category === 'assistant').length },
  { id: 'code', label: 'Code Intelligence', icon: '⚡', count: TOOLS.filter(t => t.category === 'code').length },
  { id: 'writing', label: 'Writing & Language', icon: '✍️', count: TOOLS.filter(t => t.category === 'writing').length },
  { id: 'data', label: 'Data & Spreadsheets', icon: '📊', count: TOOLS.filter(t => t.category === 'data').length },
  { id: 'documents', label: 'Documents & PDF', icon: '📋', count: TOOLS.filter(t => t.category === 'documents').length },
  { id: 'vision', label: 'Vision & Image', icon: '👁️', count: TOOLS.filter(t => t.category === 'vision').length },
  { id: 'audio', label: 'Audio & Voice', icon: '🎤', count: TOOLS.filter(t => t.category === 'audio').length },
  { id: 'imagegen', label: 'Image Generation', icon: '🎨', count: TOOLS.filter(t => t.category === 'imagegen').length },
  { id: 'knowledge', label: 'Knowledge & Search', icon: '📚', count: TOOLS.filter(t => t.category === 'knowledge').length },
  { id: 'devutils', label: 'Dev Utilities', icon: '🔧', count: TOOLS.filter(t => t.category === 'devutils').length },
  { id: 'privacy', label: 'Privacy & Security', icon: '🔐', count: TOOLS.filter(t => t.category === 'privacy').length },
];
```

---

## PHASE-WISE IMPLEMENTATION PLAN

### PHASE 0 — Foundation (do this first, ~30 min)
**Goal:** Working Next.js project with design system. No AI yet.

Tasks:
1. `npx create-next-app@14 ondevai --typescript --tailwind --app --src-dir=no --import-alias="@/*"`
2. Install ALL packages from package.json above
3. Create `app/globals.css` with all CSS custom properties
4. Create `tailwind.config.ts` with custom colors mapped to CSS vars
5. Create `next.config.js` (exact version from spec above — COOP/COEP headers critical)
6. Create `public/manifest.json` PWA manifest
7. Create `app/layout.tsx` with Inter + JetBrains Mono fonts, EngineProvider wrapper, Navbar
8. Create `components/layout/Navbar.tsx` — all 7 nav links + Install PWA button
9. Create `components/layout/Footer.tsx`
10. Verify: `npm run dev`, navigate all routes without errors

**Acceptance:** Site loads, all routes exist (even if blank), correct dark background visible, fonts loaded.

---

### PHASE 1 — WebLLM Engine (critical path, ~1 hour)
**Goal:** Model loads in browser, progress shown, engine ready for all pages.

Tasks:
1. Create `lib/engine/webllm.ts` (exact implementation from spec)
2. Create `lib/engine/models.ts` (exact implementation from spec)
3. Create `lib/engine/EngineContext.tsx` (exact implementation from spec)
4. Create `components/shared/ModelOverlay.tsx`:
   - Full-screen dark overlay
   - WebGPU detection (`navigator.gpu` check + `requestAdapter()`)
   - Progress bar (animated, smooth transitions)
   - Model name + tier badge
   - Progress text from `initProgressCallback`
   - Error state: "WebGPU required. Use Chrome 113+ or Edge 113+"
   - Success: overlay fades out, engine is ready
5. Create `components/shared/WebGPUCheck.tsx` — reusable WebGPU status badge
6. Create `components/shared/StatusBadge.tsx` — `● Ready` / `◌ Loading…` component
7. Create `components/shared/ProgressBar.tsx`
8. Wrap `app/layout.tsx` with `EngineProvider`
9. Add `<ModelOverlay />` to layout — shows on first load of workspace/toolbox/assistant routes only
10. Auto-trigger `loadModel(DEFAULT_MODEL)` on workspace page mount

**Acceptance:** Open `/workspace` in Chrome → overlay appears → model downloads → progress bar fills → overlay fades → status badge shows green "Ready".

---

### PHASE 2 — Core Workspace (largest phase, ~3 hours)
**Goal:** Fully functional AI app builder with 5-pass pipeline.

#### 2a. Layout (30 min)
1. Create `app/workspace/page.tsx` — server component shell with metadata
2. Create `app/workspace/WorkspaceClient.tsx` — `'use client'`, full workspace UI
3. Create `components/workspace/WorkspaceLayout.tsx`:
   - Fixed 48px navbar
   - Fixed 40px workspace toolbar below nav
   - Three-pane below toolbar: Chat (320px fixed) | Editor (flex-1) | Preview (flex-1)
   - `overflow: hidden` on body/workspace — no page scroll
   - Mobile: tab bar at bottom switches between Chat / Code / Preview panels
4. Create `components/workspace/WorkspaceToolbar.tsx`:
   - Left: ModelPicker + StrategySelector
   - Right: StatusBadge + "Projects" button

#### 2b. Chat Panel (45 min)
5. Create `components/workspace/ChatPanel.tsx`:
   - Top section: Textarea "Describe your app…" (resize none, 4 rows)
   - Example prompt chips below textarea (4 chips, clickable → fill textarea)
   - Two buttons: `[⚡ Build App]` (primary) + `[📋 Plan First]` (secondary)
   - Middle: `PipelineSteps` component
   - Bottom: scrollable build log (messages stream here during build)
   - After build completes: follow-up textarea + send button appears
6. Create `components/workspace/PipelineSteps.tsx`:
   - 5 rows: Research / Blueprint / Generate / Review / Fix & Polish
   - Each row: numbered circle + label + status (pending=grey, active=pulsing purple, done=green check, skipped=dash)
   - Shows only during/after active build

#### 2c. Build Log Messages (20 min)
7. Message types (styled differently):
   - `system`: grey left border, muted text — welcome messages, status
   - `step-header`: purple accent, bold — "🔍 Pass 1 — Research"
   - `ai-output`: slightly lighter bg, text-secondary — streamed AI text (truncated to 300 chars + "…")
   - `code-preview`: mono font, green left border — first 3 lines of generated code
   - `success`: green left border — "✅ Build complete!"
   - `error`: red border — error messages

#### 2d. Pipeline (45 min)
8. Create `lib/workspace/pipeline.ts` (exact from spec above)
9. Create `lib/workspace/strategies.ts`:
   ```typescript
   export function getStrategySteps(strategy: Strategy): PipelineStep[] {
     if (strategy === 'quick') return ['generate'];
     if (strategy === 'standard') return ['research','blueprint','generate','review','fix'];
     // deep: run standard twice, compare
     return ['research','blueprint','generate','review','fix'];
   }
   ```
10. Wire `[Build App]` button → `runPipeline(prompt, strategy, callbacks)` in `ChatPanel`
11. Callbacks update: pipeline step statuses, build log messages, code in editor, preview iframe

#### 2e. Code Editor (45 min)
12. Create `components/workspace/EditorPanel.tsx`:
    - File tabs bar (show tabs for each file in current project)
    - CodeMirror 6 editor (dark theme, HTML/CSS/JS auto-detect)
    - Bottom bar: Ctrl+S hint + version history dropdown + Export ZIP button
13. CodeMirror 6 setup (vanilla, wrapped in React useEffect):
    ```typescript
    // Use @codemirror/view EditorView, not any React wrapper
    // Extensions: basicSetup, html(), oneDark theme, EditorView.updateListener
    // Always use dynamic import: const { EditorView, ... } = await import('@codemirror/view')
    ```
14. Create `lib/workspace/componentPack.ts` — `injectLocalBackend()` function
15. Create `lib/workspace/pgliteInjection.ts` — inject PGlite script into HTML for DB apps

#### 2f. Preview Panel (30 min)
16. Create `components/workspace/PreviewPanel.tsx`:
    - Fake URL bar showing `preview://app`
    - iframe with sandbox attrs
    - [▶ Run] [↗ New Tab] [🔄 Reset] buttons
    - Auto-refresh on code change (800ms debounce)
    - Console log capture: inject script that overrides `console.log/error` + postMessage to parent
    - Error banner: red bar with [Auto-fix] button when runtime error detected

#### 2g. Model Picker + Strategy (20 min)
17. Create `components/workspace/ModelPicker.tsx`:
    - Shows: current model name + tier badge (Lightweight/Balanced/Powerful)
    - Dropdown: grouped by tier, each model shows params + VRAM
    - Selecting triggers `loadModel()` from EngineContext
18. Create `components/workspace/StrategySelector.tsx`:
    - Three tab-style buttons: Quick / Standard / Deep
    - Standard selected by default (ring accent)
    - Tooltip on Deep: "Slower — explores multiple plans"

#### 2h. Project Manager (30 min)
19. Create `lib/storage/projects.ts` using `idb-keyval`:
    ```typescript
    import { get, set, del, keys } from 'idb-keyval';
    // Project CRUD: save, load, list, delete, rename
    // Each project: { id, name, prompt, files[{name,content}], createdAt, updatedAt, snapshots }
    // Auto-save after build: saveProject(project)
    // Snapshot: saveSnapshot(projectId, files) → append to project.snapshots
    ```
20. Create `components/workspace/ProjectDrawer.tsx`:
    - Slide-in from right (300px wide, animated)
    - Project list: name, timestamp, [Open] [Rename] [Delete] [Export ZIP]
    - [+ New Project] button at top
21. Create `components/workspace/ExportButton.tsx`:
    - Uses `jszip` to bundle project files
    - Triggers browser download of `project-name.zip`

**Acceptance:** Can type a prompt, click Build, watch all 5 pipeline steps run with streaming output, see code appear in editor, preview renders the app, save/export works.

---

### PHASE 3 — Assistant Page (~45 min)
**Goal:** Full streaming chat page.

Tasks:
1. Create `app/assistant/page.tsx`
2. Create `components/assistant/ChatInterface.tsx`:
   - Full viewport height, no scroll on outer
   - Message list: scrollable, flex-col, gap between bubbles
   - User bubbles: right-aligned, accent bg
   - Assistant bubbles: left-aligned, surface2 bg, streaming cursor during generation
   - Markdown rendering: bold, code blocks (monospace bg), bullet lists
3. Create `components/assistant/MessageBubble.tsx`:
   - Renders markdown in assistant messages
   - Copy button on hover
4. Create `components/assistant/ChatInput.tsx`:
   - Full-width textarea, auto-grow (max 200px)
   - Send button (disabled while generating)
   - Enter to send, Shift+Enter for newline
   - "Generating…" state with stop button
5. Conversation history: `useState` array of `{role, content}` messages
6. Use `streamChat()` from WebLLM lib, show tokens as they stream

**Acceptance:** Can have a multi-turn conversation, responses stream in, markdown renders properly.

---

### PHASE 4 — Toolbox Page (~3 hours)
**Goal:** All 66 tools visible and working (text tools via WebLLM, file tools via browser APIs).

#### 4a. Layout + Navigation (30 min)
1. Create `app/toolbox/page.tsx` + `ToolboxClient.tsx`
2. Create `components/toolbox/ToolSidebar.tsx`:
   - Vertical list of 11 categories with icon + label + count badge
   - Active category highlighted
   - Search input at top (filters tools across all categories)
3. Create `components/toolbox/ToolGrid.tsx`:
   - 3-column responsive grid (2 on tablet, 1 on mobile)
   - Shows tools for selected category, or all matching search
4. Create `components/toolbox/ToolCard.tsx`:
   - Tool icon (large, 24px)
   - Tool name (bold, 14px)
   - Short description (muted, 12px)
   - Hover: border turns accent, subtle scale(1.01)
   - Click: opens ToolRunner

#### 4b. Tool Runner (45 min)
5. Create `components/toolbox/ToolRunner.tsx`:
   - Slide-in panel from right (480px) OR bottom sheet on mobile
   - Header: tool icon + name + close button
   - Input area (varies by `inputType`):
     - `text`: styled textarea with input label + placeholder
     - `file`: drag-drop zone + file type hint
     - `custom`: renders the specific custom component
   - [Run Tool] button (primary, full-width, disabled during run)
   - Output area: scrollable, pre-wrap text, copy button
   - For file-output: download button appears after result
6. Text tool execution:
   - Call `streamChat()` with tool's system prompt + user prompt template
   - Stream into output area token by token
7. Loading state: spinner on [Run Tool] button, output area shows "Running…"

#### 4c. Custom Tool Components (90 min)
8. Create `components/toolbox/tools/DiffViewer.tsx`:
   - Split view: two CodeMirror editors (left + right)
   - Highlighted diff lines (green added, red removed)
   - Parse input by `--- SEPARATOR ---`
9. Create `components/toolbox/tools/JsonTools.tsx`:
   - Textarea input + operation selector (Format / Validate / TypeScript types / JSON Schema)
   - Output: formatted + syntax highlighted
10. Create `components/toolbox/tools/MarkdownStudio.tsx`:
    - Left: CodeMirror markdown editor
    - Right: live preview (rendered HTML in div)
    - Export buttons: HTML, Markdown download
11. Create `components/toolbox/tools/ColorStudio.tsx`:
    - Color input (text + color picker)
    - Show: hex, rgb, hsl, oklch values
    - WCAG contrast checker (input two colors → AA/AAA pass/fail)
    - Gradient builder: two color pickers → CSS gradient output
12. Create `components/toolbox/tools/PdfToolkit.tsx`:
    - File upload zone (accept PDF)
    - Operations: View page count, Split (page range), Compress
    - Uses `pdf-lib` for all operations client-side
    - Download result button
13. Create `components/toolbox/tools/ImageTools.tsx`:
    - File upload + drag-drop
    - Operation selector based on which tool was opened
    - Background Remover: `@huggingface/transformers` pipeline, RMBG-1.4 model
    - Image Compressor: Canvas API → WebP/JPEG blob
    - Color Extractor: Canvas pixel sampling → dominant colors
    - QR Code: `qrcode` npm package → canvas
    - Format Converter: Canvas drawImage → toBlob
    - Favicon Generator: canvas resize → ZIP of sizes
    - All processing: Web Worker for heavy ops, main thread for light canvas ops
14. Create `components/toolbox/tools/AudioTools.tsx`:
    - File upload zone (audio)
    - Uses `@huggingface/transformers` Whisper pipeline
    - Shows real-time progress during transcription
    - For Meeting Assistant: transcription + AI pass for action items extraction
15. Create `lib/toolbox/transformersModels.ts`:
    - Lazy singletons for each Transformers.js model
    - Load only when first tool of that type is used
    - Track loading state per model

**Acceptance:** Every text tool runs via local LLM, background remover works, audio transcription works, PDF toolkit operates client-side.

---

### PHASE 5 — Marketing Pages (~2 hours)
**Goal:** All public pages look polished and match the visual identity.

#### 5a. Landing Page `app/page.tsx` (60 min)
Build all sections in order:

**Hero section:**
- Full-viewport height
- Dot grid background pattern
- Large headline: "Private. Offline. On-device." (gradient text on "On-device")
- Sub: "AI Tools That Never Touch the Cloud"
- Three pill badges: No subscription · No sign-up · No pay-per-use credits
- Two CTAs: [Open Workspace →] [View Toolbox]
- Workspace mockup screenshot (use a static illustration/screenshot)

**Stats bar:**
- Horizontal row: 62 Tools | 11 Categories | 0 Bytes to cloud | 100% Offline | 0 Sign-ups
- Each stat: large number + small label below

**Feature ticker:**
- Horizontal auto-scrolling marquee (CSS animation, pause on hover)
- Items: "Plain-English prompts · Five-pass pipeline · WebGPU on-device · …"

**"Private by architecture" section:**
- 3-col grid of feature cards (dark bg, subtle border)
- Each: icon + heading + body text

**Six commitments (01–06 cards):**
- Grid of 6 cards, numbered with accent numerals
- Each: number + title + 1-line description

**Technology pipeline visualization:**
- Horizontal flow: 01 Research → 02 Blueprint → 03 Generate → 04 Review → 05 Fix
- Connected by arrows, each step has icon + label

**Workspace section:**
- Headline + feature list (multi-file editor, live preview, in-browser PostgreSQL…)
- Large workspace screenshot

**CTA section:**
- Dark card with headline, sub, and [Open Workspace →] button
- "Verify it yourself: Open DevTools → Network tab → Build app → See zero outbound calls"

#### 5b. Other Pages (60 min)
- `app/local/page.tsx` — model tiers, how it works, install PWA
- `app/use-cases/page.tsx` — 9 use case cards, privacy architecture, promises
- `app/roadmap/page.tsx` — 3 next milestones, 6 phases with status badges
- `app/docs/page.tsx` — long-scroll docs, anchor links sidebar, all sections
- `app/devtools/page.tsx` — step-by-step DevTools verification guide

**Acceptance:** All pages render correctly, navigation works, no broken links, mobile-responsive.

---

### PHASE 6 — PWA + Offline (~30 min)
**Goal:** Installable, works offline after first model load.

Tasks:
1. Create `public/manifest.json` (from spec)
2. Generate PWA icons: 192×192 and 512×512 PNGs (simple logo)
3. Configure `next-pwa` in `next.config.js`
4. Service Worker: cache shell (CacheFirst), model weights (CacheFirst, large quota)
5. Install banner: detect `beforeinstallprompt`, show custom "Install App" button in navbar
6. Test: load page → model downloads → disable network → reload → app still works

**Acceptance:** App installable from Chrome → opens standalone → build works with WiFi off.

---

### PHASE 7 — Polish + Bug Fixes (~1 hour)
**Goal:** Production-quality feel.

Tasks:
1. **Mobile responsiveness:** workspace uses tab bar on mobile, toolbox uses bottom sheet
2. **Keyboard shortcuts:** Ctrl+K = command palette (list all tools + actions), Ctrl+S = save snapshot
3. **Error boundaries:** Wrap workspace + toolbox in `<ErrorBoundary>`
4. **Loading skeletons:** Show skeleton cards while tool grid loads
5. **Toast notifications:** Global toast system for success/error/info
6. **Smooth transitions:** Panel open/close animations (150ms ease), page transitions
7. **SEO:** Metadata for each page, Open Graph tags
8. **Performance audit:** Lazy load toolbox tools, dynamic import WorkspaceClient
9. **URL params:** `/workspace?prompt=...` pre-fills prompt from use-case CTAs
10. **Version history UI:** Restore previous snapshots from dropdown in editor

---

## VERCEL DEPLOYMENT

Create `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
      ]
    }
  ]
}
```

Deploy:
```bash
npm run build   # verify no errors
vercel --prod   # deploy to production URL
```

---

## WHAT MAKES THIS DIFFERENT FROM THE PREVIOUS PLAN

| Previous Plan | This Plan |
|---|---|
| Generic dark UI with hardcoded hex | Full design system with CSS custom properties |
| Simple HTML textarea editor | CodeMirror 6 with syntax highlight + file tabs |
| Single-pass generation | True 5-pass pipeline with streaming |
| Placeholder tools | All 66 tools defined with exact prompts |
| No file handling | PDF-lib for PDFs, Transformers.js for images/audio |
| No persistence | IndexedDB projects + version history |
| No offline | Full PWA + service worker |
| Basic pipeline | Strategy selector (Quick/Standard/Deep) |
| One model | Tier system: Lightweight/Balanced/Powerful |
| No local DB | PGlite injection into generated apps |
| Single HTML file | Full Next.js app with proper architecture |

---

*End of MASTER_BUILD.md v2.0*
*This is the complete, production specification.*
*Build in phase order. Every phase must pass acceptance criteria before moving to the next.*