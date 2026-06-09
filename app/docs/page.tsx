import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Documentation — OnDevAI',
  description: 'Complete documentation for OnDevAI: Workspace, Toolbox, Assistant, and architecture.',
};

const SECTIONS = [
  { id: 'getting-started', title: 'Getting Started' },
  { id: 'workspace', title: 'Workspace' },
  { id: 'toolbox', title: 'Toolbox' },
  { id: 'assistant', title: 'Assistant' },
  { id: 'models', title: 'Models' },
  { id: 'architecture', title: 'Architecture' },
  { id: 'faq', title: 'FAQ' },
];

export default function DocsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <section className="dot-grid" style={{ padding: '60px 24px 40px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '12px' }}>Documentation</p>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, marginBottom: '14px', letterSpacing: '-0.02em' }}>OnDevAI Docs</h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Everything you need to use OnDevAI: Workspace, Toolbox, Assistant, and how the architecture works.
          </p>
        </div>
      </section>

      {/* Two-column layout: sidebar + content */}
      <div style={{ display: 'flex', flex: 1, maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 24px' }}>

        {/* Sticky sidebar */}
        <aside style={{ width: '200px', flexShrink: 0, padding: '40px 24px 40px 0', borderRight: '1px solid var(--border)' }}>
          <nav style={{ position: 'sticky', top: '72px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '8px' }}>Contents</p>
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} className="docs-nav-link">
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Doc content */}
        <main style={{ flex: 1, padding: '40px 0 80px 48px', maxWidth: '720px' }}>

          <DocSection id="getting-started" title="Getting Started">
            <p>OnDevAI runs entirely in your browser — no install, no account, no backend. The only requirement is a browser with WebGPU support.</p>
            <h4>Requirements</h4>
            <ul>
              <li>Chrome 113+ or Edge 113+ (WebGPU enabled by default)</li>
              <li>A GPU with at least 2 GB VRAM for the lightweight models, 4+ GB for balanced</li>
              <li>~3 GB free browser cache space for model weights</li>
            </ul>
            <h4>First run</h4>
            <ol>
              <li>Open <Link href="/workspace">/workspace</Link> in Chrome.</li>
              <li>The model loading overlay appears. The default model (Qwen2.5-Coder 1.5B) downloads from HuggingFace CDN — ~3 GB, takes 2–5 minutes on a fast connection.</li>
              <li>Once loaded (status badge turns green), type a prompt and click <strong>Build App</strong>.</li>
              <li>Subsequent visits load from the browser cache instantly.</li>
            </ol>
          </DocSection>

          <DocSection id="workspace" title="Workspace">
            <p>The Workspace is a full AI-powered app builder. Describe what you want, and the 5-pass pipeline builds a complete, single-file HTML app.</p>

            <h4>Build pipeline</h4>
            <p>Every build runs through up to five passes depending on the selected strategy:</p>
            <ol>
              <li><strong>Research</strong> — Analyses your prompt, identifies requirements, key features, and data structures.</li>
              <li><strong>Blueprint</strong> — Architects the solution: pages, components, state, functions.</li>
              <li><strong>Generate</strong> — Writes the complete HTML/CSS/JS as a single file. Streamed live into the editor.</li>
              <li><strong>Review</strong> — Audits the generated code for bugs, missing features, and UX problems.</li>
              <li><strong>Fix</strong> — Applies all review findings. Outputs the corrected version.</li>
            </ol>

            <h4>Strategy selector</h4>
            <ul>
              <li><strong>Quick</strong> — Skip Research and Blueprint. Single generation pass only. Fastest, best for simple scripts.</li>
              <li><strong>Standard</strong> — Full 5-pass pipeline. Best for most apps.</li>
              <li><strong>Deep</strong> — Same as Standard, with extra depth in the Research and Blueprint passes.</li>
            </ul>

            <h4>Editor</h4>
            <p>CodeMirror 6 powers the editor with full HTML/CSS/JS syntax highlighting, the VS Code dark theme, and live updating as the model generates code.</p>

            <h4>Preview</h4>
            <p>The preview pane runs your app in a sandboxed iframe. Console logs are captured and shown. Runtime errors trigger a banner with an <strong>Auto-fix</strong> button that passes the error back through the pipeline.</p>

            <h4>local-first backend injection</h4>
            <p>Every generated app is injected with <code>window.Vib</code> — a local-first backend providing: <code>Vib.store</code> (localStorage key-value), <code>Vib.toast</code> (notification UI), and <code>Vib.auth</code> (SHA-256 password hashing, session management).</p>
          </DocSection>

          <DocSection id="toolbox" title="Toolbox">
            <p>The Toolbox contains 57 tools across 11 categories. Text tools stream output from the local LLM. File tools run client-side browser APIs.</p>

            <h4>Categories</h4>
            <ul>
              <li><strong>Assistant</strong> — General AI chat</li>
              <li><strong>Code Intelligence</strong> — Generate, explain, translate, test, commit code</li>
              <li><strong>Writing & Language</strong> — Draft, rewrite, translate, summarise</li>
              <li><strong>Data & Spreadsheets</strong> — Query CSV, clean, convert formats, build charts</li>
              <li><strong>Documents & PDF</strong> — Summarise, extract, merge/split PDFs</li>
              <li><strong>Vision & Image</strong> — Compress, convert, remove background, extract colors</li>
              <li><strong>Audio & Voice</strong> — Whisper transcription, meeting action items</li>
              <li><strong>Image Generation</strong> — On-device diffusion (coming soon)</li>
              <li><strong>Knowledge & Search</strong> — Chat with files, auto-tag, find duplicates</li>
              <li><strong>Dev Utilities</strong> — JSON tools, diff viewer, color studio, mock data</li>
              <li><strong>Privacy & Security</strong> — Redact PII, AES-256 encryption, hash check</li>
            </ul>

            <h4>Running a tool</h4>
            <ol>
              <li>Click any tool card — the ToolRunner panel slides in from the right.</li>
              <li>Fill in the input (textarea, file upload, or custom UI).</li>
              <li>Click <strong>Run Tool</strong>. Text tools stream the LLM response token by token. File tools process locally and offer a download.</li>
            </ol>

            <h4>Model requirement</h4>
            <p>Text tools require the WebLLM engine to be loaded. If you open the Toolbox directly, the model loads automatically. Once loaded, it stays in memory for the entire session — switching between Workspace, Toolbox, and Assistant uses the same engine instance.</p>
          </DocSection>

          <DocSection id="assistant" title="Assistant">
            <p>The Assistant page at <Link href="/assistant">/assistant</Link> is a standalone chat interface powered by the same WebLLM engine.</p>
            <ul>
              <li>Multi-turn conversation with full message history</li>
              <li>Streaming responses with a blinking cursor</li>
              <li>Markdown rendering: bold, code blocks, bullet lists</li>
              <li>Copy button on each message</li>
              <li>Stop button to interrupt generation mid-stream</li>
            </ul>
          </DocSection>

          <DocSection id="models" title="Models">
            <p>All models are quantized 4-bit MLC-compiled versions hosted on HuggingFace. They load from CDN into browser cache on first use.</p>

            <h4>Available models</h4>
            <table>
              <thead>
                <tr><th>Model</th><th>Tier</th><th>Params</th><th>VRAM</th></tr>
              </thead>
              <tbody>
                <tr><td>Qwen2.5-Coder 0.5B</td><td>Lightweight</td><td>0.5B</td><td>~1.5 GB</td></tr>
                <tr><td>Phi-3.5 Mini</td><td>Lightweight</td><td>3.8B</td><td>~2.5 GB</td></tr>
                <tr><td>Qwen2.5-Coder 1.5B ★</td><td>Balanced</td><td>1.5B</td><td>~3 GB</td></tr>
                <tr><td>Llama 3.2 3B</td><td>Balanced</td><td>3B</td><td>~4 GB</td></tr>
                <tr><td>Qwen2.5-Coder 7B</td><td>Powerful</td><td>7B</td><td>~8 GB</td></tr>
              </tbody>
            </table>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>★ Default model</p>

            <h4>Switching models</h4>
            <p>Open the Model Picker in the Workspace toolbar. Selecting a new model triggers a new download (if not cached) and replaces the engine instance. All pages share the same engine singleton.</p>
          </DocSection>

          <DocSection id="architecture" title="Architecture">
            <h4>Critical HTTP headers</h4>
            <p>WebLLM requires SharedArrayBuffer, which requires these headers on every response:</p>
            <pre><code>{`Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp`}</code></pre>
            <p>These are set in <code>next.config.js</code> and <code>vercel.json</code>.</p>

            <h4>Engine singleton</h4>
            <p>The WebLLM engine is a module-level singleton in <code>lib/engine/webllm.ts</code>. It's shared via <code>EngineContext</code> (React Context) across all pages. Loading a model once makes it available everywhere — switching from Workspace to Toolbox doesn't reload the model.</p>

            <h4>Dynamic imports</h4>
            <p>WebLLM and all heavy libraries are dynamically imported with <code>next/dynamic &#123; ssr: false &#125;</code>. This keeps the server-rendered shell fast and prevents SSR errors from browser-only APIs.</p>

            <h4>Storage</h4>
            <ul>
              <li><strong>Model weights</strong> — Browser Cache API (via WebLLM's internal caching)</li>
              <li><strong>Projects</strong> — IndexedDB via idb-keyval</li>
              <li><strong>Generated app data</strong> — localStorage (via the injected Vib.store)</li>
            </ul>
          </DocSection>

          <DocSection id="faq" title="FAQ">
            <Faq q="Does OnDevAI ever send my data to a server?">
              No. The LLM runs entirely in your browser via WebGPU. Your prompts, files, and generated code never leave your device. You can verify this by opening DevTools → Network and watching that zero requests are made during inference.
            </Faq>
            <Faq q="Why does it need so much VRAM?">
              Language models are large matrices of floating-point numbers. Even a quantized 1.5B model needs ~3 GB of GPU memory to run. Larger models (7B) need ~8 GB. If you have less VRAM, use the Lightweight tier.
            </Faq>
            <Faq q="Can I use it on Firefox or Safari?">
              Not yet. WebGPU is only enabled by default in Chrome 113+ and Edge 113+. Firefox has WebGPU behind a flag. Safari has partial WebGPU support but WebLLM hasn't been validated on it.
            </Faq>
            <Faq q="How do I use it offline?">
              After the first model load, disable your network connection and reload the page. The app shell loads from the service worker cache, and the model loads from the browser cache. Everything works offline.
            </Faq>
            <Faq q="Can I run my own model?">
              Not yet via the UI, but any MLC-compiled model supported by web-llm can be added by editing <code>lib/engine/models.ts</code>. PRs welcome.
            </Faq>
          </DocSection>
        </main>
      </div>
      <style>{`
        .docs-nav-link {
          font-size: 13px;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          transition: color 0.15s ease;
        }
        .docs-nav-link:hover { color: var(--text-primary); }
      `}</style>
    </div>
  );
}

function DocSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: '64px', paddingTop: '8px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
        {title}
      </h2>
      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8 }} className="doc-content">
        {children}
      </div>
    </section>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
      <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{q}</h4>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{children}</p>
    </div>
  );
}
