# OnDevAI — Master Build Specification
## A Full Replication of Vibesterz for Pump.fun Bounty Submission

> **For Claude Code:** Read this entire document before writing a single line of code.
> This is the single source of truth. Every feature, route, component, and behaviour is specified here.
> Build everything in order. Do not skip sections.

---

## 0. PROJECT OVERVIEW

**What we are building:** A browser-native, WebGPU-powered AI coding workspace and private toolbox — a functional replication of Vibesterz (vibesterz.replit.app / vibesterz.com).

**Core principle that governs every decision:**
> The LLM runs inside the browser tab via WebGPU. Zero bytes of user data (prompts, code, files) ever leave the device. No server inference. No API key. No sign-up. Verifiable in DevTools Network tab.

**Tech stack:**
- Framework: **Next.js 14 (App Router)**
- Styling: **Tailwind CSS** + custom CSS variables
- LLM in browser: **@mlc-ai/web-llm** (WebLLM via CDN/npm)
- Code editor: **CodeMirror 6**
- In-browser DB: **PGlite** (@electric-sql/pglite) — PostgreSQL in WebAssembly
- File handling: browser File API + JSZip (export)
- PWA: next-pwa for installable offline shell
- Language: **TypeScript**

**Deployment target:** Vercel (static export friendly) or any static host

---

## 1. FILE STRUCTURE

```
/
├── app/
│   ├── layout.tsx              # Root layout with nav + providers
│   ├── page.tsx                # Landing page (home)
│   ├── local/page.tsx          # "Local" / How it works page
│   ├── assistant/page.tsx      # Standalone AI chat page
│   ├── workspace/page.tsx      # THE MAIN WORKSPACE (app builder)
│   ├── toolbox/page.tsx        # Toolbox grid + tool runner
│   ├── use-cases/page.tsx      # Use cases page
│   ├── roadmap/page.tsx        # Roadmap page
│   ├── docs/page.tsx           # Documentation page
│   ├── devtools/page.tsx       # DevTools / network verification page
│   └── globals.css             # Global styles + CSS variables
│
├── components/
│   ├── nav/
│   │   └── Navbar.tsx          # Top navigation
│   ├── workspace/
│   │   ├── WorkspaceLayout.tsx # Three-pane layout
│   │   ├── ChatPanel.tsx       # Left: prompt input + pipeline log
│   │   ├── EditorPanel.tsx     # Center: CodeMirror editor
│   │   ├── PreviewPanel.tsx    # Right: iframe live preview
│   │   ├── PipelineSteps.tsx   # Visual 5-step pipeline status
│   │   ├── ModelPicker.tsx     # Model tier selector
│   │   ├── StrategySelector.tsx # Quick / Standard / Deep
│   │   └── ProjectManager.tsx  # Save/load/export projects
│   ├── toolbox/
│   │   ├── ToolGrid.tsx        # 11-category tool grid
│   │   ├── ToolCard.tsx        # Individual tool card
│   │   └── ToolRunner.tsx      # Tool I/O panel
│   ├── assistant/
│   │   └── ChatInterface.tsx   # Full-page streaming chat
│   ├── shared/
│   │   ├── ModelOverlay.tsx    # Loading overlay during model init
│   │   ├── StatusBadge.tsx     # WebGPU / offline status
│   │   └── Footer.tsx          # Site footer
│
├── lib/
│   ├── webllm.ts               # WebLLM engine singleton + helpers
│   ├── pipeline.ts             # 5-pass build pipeline logic
│   ├── pglite.ts               # In-browser PostgreSQL wrapper
│   ├── storage.ts              # IndexedDB project storage
│   ├── tools.ts                # Tool definitions + prompt templates
│   └── models.ts               # Model tier definitions
│
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # PWA icons
│
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 2. DESIGN SYSTEM

### 2.1 CSS Variables (globals.css)
```css
:root {
  --bg:        #0a0a0f;
  --surface:   #111118;
  --surface2:  #18181f;
  --surface3:  #1e1e28;
  --border:    #2a2a38;
  --accent:    #7c6af7;
  --accent2:   #a78bfa;
  --accent3:   #c4b5fd;
  --green:     #34d399;
  --yellow:    #fbbf24;
  --red:       #f87171;
  --blue:      #60a5fa;
  --text:      #e2e2ef;
  --text2:     #9ca3af;
  --muted:     #6b7280;
  --radius:    8px;
  --radius-lg: 14px;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
}
```

### 2.2 Typography
- Display headings: `font-bold tracking-tight` — system-ui or Inter
- Body: system-ui sans-serif, 14px base
- Code/mono: `--font-mono`, 13px
- Muted labels: uppercase, 11px, letter-spacing 0.08em

### 2.3 Aesthetic Direction
- Dark, near-black backgrounds. No light mode needed.
- Accent color = purple (`#7c6af7`). Used sparingly on interactive elements.
- Green (`#34d399`) for success, "ready", "verified" states.
- Subtle glows on status dots: `box-shadow: 0 0 8px currentColor`
- Borders are `1px solid var(--border)` — never thicker.
- Border-radius: 8px standard, 14px for cards, 4px for inline chips.
- Animations: only purposeful — loading spinner, pipeline pulse, progress bar.
- No gradients on backgrounds. Gradients only as subtle accents on hero sections.

---

## 3. NAVIGATION

### 3.1 Navbar (all pages)
```
[Logo: ● OnDevAI]  [Local] [Assistant] [DevTools] [Use Cases] [Roadmap] [Docs]  [Install PWA btn]
```
- Logo: filled circle dot (purple glow) + "OnDevAI" bold text
- Nav links: 13px, muted color, hover → text-white
- Active link: accent color + bottom border indicator
- "Install" button: outlined, small, right-aligned. Triggers PWA install prompt if `beforeinstallprompt` fired.
- On mobile: hamburger menu, slide-in drawer

### 3.2 Routes
| URL | Page |
|-----|------|
| `/` | Landing / home |
| `/local` | Local / how it works |
| `/workspace` | **Main app builder workspace** |
| `/assistant` | Standalone chat |
| `/toolbox` | Toolbox grid |
| `/use-cases` | Use cases |
| `/roadmap` | Roadmap |
| `/docs` | Documentation |
| `/devtools` | DevTools verification page |

---

## 4. LANDING PAGE (`/`)

### Sections in order:

#### 4.1 Hero
- Headline: `Private. Offline. On-device.`
- Sub: `AI Tools That Never Touch the Cloud`
- Pills: `No subscription · No sign-up · No pay-per-use credits`
- Two CTAs: **[Open Workspace →]** (primary, links to `/workspace`) and **[View Toolbox]** (secondary, links to `/toolbox`)
- Background: dark, subtle grid pattern or noise texture
- Hero visual: animated mockup / screenshot of the workspace UI (static image or SVG)

#### 4.2 "Private by architecture" section
- Three columns:
  - **Everything stays on your device** — model runs on GPU in this tab
  - **No account, no sign-up, no credit card** — nothing uploaded
  - **No uploads to the cloud** — 100% private, 100% yours

#### 4.3 Stats bar
```
62    |  11       |  0            |  100%          |  0
Tools | Areas     | Bytes to cloud| Works offline  | Sign-ups
```

#### 4.4 Feature carousel / ticker
Scrolling horizontal ticker:
`Plain-English prompts · Watch it think · Five-pass pipeline · Export the full project · Runs offline after install · PostgreSQL backend in browser · No sign-up required · No usage meter · Web code search · Multi-file editor · Version history · WebGPU on-device ·` (loops)

#### 4.5 "The disciplined offline engine" section
- Left: three bullet points (on-device, zero bytes, 100% offline once installed, air-gapped supported)
- Right: Terminal/DevTools mockup showing empty network tab

#### 4.6 "Six commitments" section (numbered cards 01–06)
01. On-device by design
02. Plan, then build
03. You can see it think
04. Real, exportable code
05. Offline-ready
06. A private toolbox, not just a builder

#### 4.7 "The technology" section
Multi-pass pipeline visualization:
`01 Research → 02 Blueprint → 03 Generate → 04 Review → 05 Fix → 06 Expand`
Horizontal step flow with icons and short descriptions.

#### 4.8 "The workspace" section
- Headline: `A real editor, a real preview, a real export.`
- Features: Multi-file editor, live iframe preview, in-browser PostgreSQL, runtime console, version history
- Large workspace screenshot

#### 4.9 "Start here" CTA section
- Headline: `Open a tab and build.`
- Sub: No account, no card, no usage meter.
- Verify box: "Press F12 → Network tab → generate app → request list stays empty"
- CTA: **[Open Workspace →]**

#### 4.10 Footer
See §11

---

## 5. LOCAL PAGE (`/local`)

### Sections:

#### 5.1 Hero
- Badge: `WebGPU. On-device.`
- Headline: `On-device AI. Zero bytes sent.`
- Sub: A WebGPU model runs entirely in your browser tab. Your prompts and code never reach a server.
- Two stats: `offline-ready` · `0 bytes leaving the tab`
- Badge: `Verifiable in the network tab`

#### 5.2 "The promise" — 4-card grid
1. Nothing leaves your tab
2. Works offline after install
3. Verifiable, not just promised
4. Compliance-friendly

#### 5.3 Stats row
```
0 Bytes sent  |  0 Third parties  |  ∞ Builds
```

#### 5.4 Model Tiers — 3-column card layout

**Lightweight**
- Parameters: 0.5 to 1.7B
- VRAM: 2 to 4 GB
- Use: Quick prototypes and small scripts
- Tag: phones, integrated GPUs, older laptops

**Balanced** (default/recommended badge)
- Parameters: 3 to 4B
- VRAM: 4 to 8 GB
- Use: Full-stack apps and richer logic
- Tag: mainstream laptops, dedicated GPUs

**Powerful**
- Parameters: 7B+
- VRAM: 8 to 16 GB
- Use: Larger surfaces, deeper architectures
- Tag: workstations, gaming-class GPUs

#### 5.5 "Built for" — 4-card grid
1. Sensitive codebases (air-gapped, healthcare, gov)
2. Limited connectivity (one download, year of building)
3. Travel and field work (planes, ships, remote sites)
4. Privacy by default (indie devs, unreleased work)

#### 5.6 "Install Vibesterz as an app" section
PWA install prompt. Describes: shell loads instantly offline, builds run with no network.
CTA: **[Install App]** (triggers `beforeinstallprompt`)

---

## 6. MAIN WORKSPACE (`/workspace`) ← MOST IMPORTANT

This is the core product. Build this with the most care.

### 6.1 Layout
Three-pane layout, full viewport height, no page scroll:
```
┌─────────────────────────────────────────────────────────────────┐
│  NAVBAR (48px)                                                  │
├─────────────────────────────────────────────────────────────────┤
│  WORKSPACE TOOLBAR (40px): ModelPicker | Strategy | Status      │
├───────────────┬──────────────────────────┬──────────────────────┤
│               │                          │                      │
│  CHAT PANEL   │    EDITOR PANEL          │   PREVIEW PANEL      │
│  (320px)      │    (flex: 1)             │   (flex: 1)          │
│               │                          │                      │
│  - Prompt     │  - Tab: Code / Preview   │  - Live iframe       │
│  - Pipeline   │  - CodeMirror 6 editor   │  - Run button        │
│    steps      │  - Syntax highlight      │  - Auto-refresh      │
│  - Build log  │  - File tabs (multi)     │  - Error banner      │
│  - Follow-up  │  - Version history       │  - Console output    │
│    input      │                          │                      │
└───────────────┴──────────────────────────┴──────────────────────┘
```

On mobile: tabs switch between panels (Chat / Code / Preview).

### 6.2 Workspace Toolbar
Left side:
- **Model Picker dropdown**: shows current model name + tier badge (Lightweight/Balanced/Powerful). Opens dropdown to switch models.
- **Strategy selector**: [Quick] [Standard ✓] [Deep] — toggles, Standard is default

Right side:
- **Status badge**: `● Ready · On-device` (green dot) or `◌ Loading…` (yellow pulsing)
- **WebGPU badge**: `⚡ WebGPU`
- **Projects button**: opens project manager drawer

### 6.3 Chat Panel (left, 320px)

**Top: Prompt area**
- Textarea: "Describe your app in plain English…"
- Example prompts (chips, clickable):
  - "A todo app with categories and dark mode"
  - "Weather dashboard using Open-Meteo"
  - "Pomodoro timer with session tracking"
  - "Markdown notes app with tags"
- **[⚡ Build App]** button — primary, full-width, disabled until model ready
- **[📋 Plan First]** button — secondary, runs Plan mode before building

**Middle: Pipeline steps** (shown during/after build)
```
● 01 Research      [done/active/pending]
● 02 Blueprint     [done/active/pending]
● 03 Generate      [done/active/pending]
● 04 Review        [done/active/pending]
● 05 Fix & Polish  [done/active/pending]
```
Each step has: icon, label, status indicator (pulsing if active, checkmark if done).

**Bottom: Build log / chat stream**
- Scrollable log of all AI output during the build
- Each step's output streams in with the step label as a header
- After build: follow-up input box — "Ask a follow-up or request changes…"

### 6.4 Editor Panel (center)

**File tabs bar** (top):
- Tabs for each generated file (index.html, style.css, app.js, etc.)
- [+] Add file, [⬇] Download file
- Active tab highlighted with accent underline

**CodeMirror 6 editor**:
- Dark theme matching app palette
- HTML/CSS/JS syntax highlighting (autodetect from file extension)
- Line numbers, fold gutters
- Changes instantly reflected in preview iframe on save/debounce

**Bottom toolbar**:
- `Ctrl+S` saves snapshot to version history
- Version history dropdown: "v1 · 2m ago", "v2 · 5m ago" — click to restore
- [⬇ Export ZIP] button — downloads all files as a ZIP via JSZip

### 6.5 Preview Panel (right)

**Toolbar**:
- URL bar (fake, shows `preview://app`) — for visual
- [▶ Run] button — re-renders iframe
- [↗ Open in new tab] button
- [🔄 Reset] button

**iframe**:
- `sandbox="allow-scripts allow-same-origin allow-forms"`
- Auto-refreshes on code change (debounced 800ms)
- Captures console errors and displays them in a bottom panel

**Error banner** (shows on runtime error):
- Red bar: "Runtime error detected · [Auto-fix] [Restore last working version]"
- Auto-fix sends the error back to the AI for repair

**Console panel** (collapsible, bottom 120px):
- Shows console.log / console.error output from iframe
- Syntax-highlighted, scrollable

### 6.6 Build Pipeline Logic (`lib/pipeline.ts`)

The pipeline runs these passes **in order** using the WebLLM engine. Each pass streams its output to the chat log.

```typescript
// PASS 1: RESEARCH
// Prompt: "List 6-8 key requirements, features, and best library/API choices for: [USER_PROMPT]"
// Model: system = senior web dev planner, temperature = 0.3
// Output: stored as `research` string

// PASS 2: BLUEPRINT
// Prompt: "Based on these requirements: [RESEARCH], create a detailed blueprint for a single-file HTML app.
//          List every section, component, function, and data model. Be specific."
// Model: system = web architect, temperature = 0.3
// Output: stored as `blueprint` string

// PASS 3: GENERATE
// Prompt: "Build this as a COMPLETE single HTML file (embedded CSS + JS).
//          Requirements: [RESEARCH]
//          Blueprint: [BLUEPRINT]
//          User goal: [USER_PROMPT]
//          Output ONLY the complete HTML. No markdown. No explanation."
// Model: system = expert web developer, temperature = 0.5, max_tokens = 4096
// Output: stream directly to editor + stored as `code` string

// PASS 4: REVIEW
// Prompt: "Review this app code for: missing features from the blueprint, JS errors, broken CSS,
//          accessibility issues, or incomplete logic. List specific issues found."
// Model: system = senior code reviewer, temperature = 0.2
// Output: stored as `review` string

// PASS 5: FIX & POLISH
// If review found issues:
//   Prompt: "Fix all these issues: [REVIEW]. Output the complete corrected HTML only."
//   Stream fixed code to editor
// Always inject:
//   - Local-first storage helpers (localStorage + IndexedDB wrapper) if app stores data
//   - Offline component pack primitives (window.Vib object) 
//   - PGlite backend if app needs a database
// Output: final code in editor + auto-render in preview
```

**Strategy modifiers:**
- **Quick**: Run only Pass 3 (generate only). Fast, lower quality.
- **Standard**: Run all 5 passes. Default.
- **Deep**: Run passes 1-5 twice, compare outputs, keep better one. Slowest.

**Hardware override:**
- Detect GPU tier on load via WebLLM's device detection
- If lightweight GPU or mobile: force Quick strategy, show "Forced: Quick" badge

### 6.7 Model Picker (`lib/models.ts`)

```typescript
const MODELS = {
  lightweight: [
    { id: "Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC", name: "Qwen2.5-Coder 0.5B", vram: "2GB" },
    { id: "Phi-3.5-mini-instruct-q4f16_1-MLC", name: "Phi-3.5 Mini", vram: "2.5GB" },
  ],
  balanced: [
    { id: "Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC", name: "Qwen2.5-Coder 1.5B", vram: "3GB" }, // default
    { id: "Phi-3-mini-4k-instruct-q4f16_1-MLC", name: "Phi-3 Mini 4K", vram: "4GB" },
  ],
  powerful: [
    { id: "Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC", name: "Qwen2.5-Coder 7B", vram: "8GB" },
    { id: "Llama-3.2-3B-Instruct-q4f16_1-MLC", name: "Llama 3.2 3B", vram: "6GB" },
  ]
}
// Default: Qwen2.5-Coder-1.5B (balanced tier)
```

### 6.8 Model Loading Overlay

Full-screen overlay shown until model is ready. Contains:
- App logo + name
- Headline: "Loading On-Device AI"
- Description: "The AI model runs entirely in this browser tab using WebGPU. Nothing leaves your device."
- WebGPU check status (✅ WebGPU available / ❌ Not supported)
- Progress bar (0–100%) with percentage label
- Current operation text (from WebLLM `initProgressCallback`)
- Model info: name, size estimate
- Footer: "⚡ Powered by WebLLM · GPU acceleration via WebGPU · 100% private"

If WebGPU not supported:
- Show error: "WebGPU is required. Please open in Chrome 113+ or Edge 113+."
- Show link to browser download

### 6.9 Project Manager (`lib/storage.ts`)

Projects stored in **IndexedDB** (via `idb-keyval` or native):
```typescript
interface Project {
  id: string;          // uuid
  name: string;        // "My Todo App"
  prompt: string;      // original user prompt
  files: FileEntry[];  // { name, content }[]
  createdAt: number;
  updatedAt: number;
  snapshots: Snapshot[]; // version history
}
```

UI: Slide-in drawer from right with:
- List of saved projects (name, last updated, preview thumbnail)
- [New] [Open] [Rename] [Delete] [Export ZIP] actions
- Auto-save on every build completion

### 6.10 In-browser PostgreSQL (`lib/pglite.ts`)

Using `@electric-sql/pglite`:
```typescript
import { PGlite } from '@electric-sql/pglite';

let db: PGlite | null = null;

export async function getDB() {
  if (!db) db = new PGlite('idb://vibesterz-pglite');
  return db;
}
```

Generated apps that request a database backend get this injected:
```javascript
// Injected into generated HTML before </body>
<script type="module">
  import { PGlite } from 'https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/index.js';
  const db = new PGlite();
  window.db = db;
  await db.exec(`CREATE TABLE IF NOT EXISTS app_data (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE,
    value JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  )`);
  window.dbReady = true;
  console.log('[OnDevAI] In-browser PostgreSQL ready');
</script>
```

### 6.11 Offline Component Pack

A `window.Vib` object injected into all generated apps:
```javascript
window.Vib = {
  // State management
  store: (key, val) => val !== undefined 
    ? localStorage.setItem(key, JSON.stringify(val)) 
    : JSON.parse(localStorage.getItem(key) || 'null'),
  
  // Simple router
  route: (hash) => { window.location.hash = hash; },
  
  // Toast notifications
  toast: (msg, type='info') => { /* create + auto-remove toast element */ },
  
  // Modal
  modal: (content, opts) => { /* create modal overlay */ },
  
  // Local auth (no server)
  auth: {
    signup: (user, pass) => { /* hash + store in localStorage */ },
    login: (user, pass) => { /* verify hash */ },
    logout: () => { localStorage.removeItem('vib_session'); },
    current: () => JSON.parse(localStorage.getItem('vib_session') || 'null'),
  }
};
```

---

## 7. TOOLBOX PAGE (`/toolbox`)

### 7.1 Layout
- Left: category sidebar (11 categories) + search input
- Right: tool grid (3-column) + tool I/O panel (when tool selected)

### 7.2 Categories and Tools

Implement ALL 66 tools across 11 categories. Each tool has:
- Icon (emoji)
- Name
- Short description
- System prompt template
- Input placeholder
- Output format

#### CATEGORY 1: Assistant (flagship)
| Tool | Description | Prompt |
|------|-------------|--------|
| AI Assistant | General-purpose chat | General helpful assistant |

#### CATEGORY 2: Code Intelligence (8 tools)
| Tool | Description | System Prompt Template |
|------|-------------|------------------------|
| Raw Code Zone | AI code playground | Generate/run/refine code snippets |
| Regex Generator & Tester | Describe → regex | Generate a regex pattern for: {input}. Explain it. |
| SQL Generator & Explainer | Natural language → SQL | Write SQL for: {input}. Show the query + explanation. |
| Cron Builder | Schedule → cron expression | Convert this schedule to cron: {input}. Show next 5 run times. |
| Code Explainer & Commenter | Explain + add comments | Explain this code in plain English, then add inline comments: {input} |
| Code Translator | Language conversion | Convert this code to [target language], idiomatically: {input} |
| Unit Test Generator | Generate test suite | Write comprehensive unit tests for: {input} |
| Commit & PR Writer | Diff → commit message | Write a Conventional Commits message and PR description for this diff: {input} |

#### CATEGORY 3: Writing & Language (9 tools)
| Tool | Description |
|------|-------------|
| Writing Tools | Draft, rewrite, summarize, proofread |
| Offline Translator | Translate between 100+ languages |
| Grammar & Style | Fix grammar, polish clarity |
| Tone & Readability | Rewrite to target tone + reading level |
| Email Assistant | Draft, reply, adjust tone |
| Resume & Cover Letter | Tailor resume to job, write cover letter |
| Flashcards & Quiz | Notes → flashcards or quiz |
| Quick Generators | Names, usernames, slugs, lorem ipsum |
| Markdown Studio | Write Markdown with live preview |

#### CATEGORY 4: Data & Spreadsheets (8 tools)
| Tool | Description |
|------|-------------|
| Chat With Your Data | Plain-English questions about spreadsheet |
| Data Cleaner | Deduplicate, trim, normalize |
| Smart Column Categorizer | Tag rows into categories |
| Format Converter | CSV ↔ JSON ↔ YAML ↔ XML |
| Formula Generator | Describe → Excel/Sheets/Airtable formula |
| Chart and Dashboard Builder | Spreadsheet → charts (Chart.js) |
| Data Anonymizer | Detect + mask PII |
| Sentiment and Theme Analyzer | Score sentiment across text rows |

#### CATEGORY 5: Documents & PDF (7 tools)
| Tool | Description |
|------|-------------|
| PDF Toolkit | Merge, split, reorder, rotate, compress (PDF-lib) |
| PDF Converter | PDF ↔ text/Markdown/Word |
| Form Filler & Sign | Fill PDF fields + draw signature |
| Document Scanner | Camera → searchable PDF |
| Document Assistant | Summarize, explain contracts |
| Receipts to Spreadsheet | Batch receipts → CSV |
| Structured Data Extractor | Documents → JSON/CSV via schema |

#### CATEGORY 6: Vision & Image (11 tools)
| Tool | Description |
|------|-------------|
| Vision & Document Intelligence | OCR, photo→spreadsheet, describe images |
| Background Remover | Subject cutout → transparent PNG |
| Image Upscaler | Super-resolution upscale |
| Object Detection & Auto-Tagging | Find + label objects |
| Image Classification & Smart Sort | Label + group images |
| Depth & Portrait | Depth map + background blur |
| Smart Image Compressor | Shrink to WebP/AVIF/JPEG |
| Color Palette Extractor | Dominant colors → design tokens |
| QR & Barcode Studio | Generate + scan QR/barcodes |
| Image Format Converter | HEIC/JPG/PNG/WebP batch convert |
| App Icon & Favicon Generator | One image → all favicon sizes |

#### CATEGORY 7: Audio & Voice (2 tools)
| Tool | Description |
|------|-------------|
| Audio & Voice | Transcribe, caption, summarize, narrate (Whisper via Transformers.js) |
| Meeting Assistant | Recording → transcript + decisions + action items |

#### CATEGORY 8: Image Generation (1 tool)
| Tool | Description |
|------|-------------|
| Image Generation | Text → image via WebGPU (use Stable Diffusion WebGPU or DALL-E mini ONNX) |

#### CATEGORY 9: Knowledge & Search (5 tools)
| Tool | Description |
|------|-------------|
| Chat With Your Files | Q&A on uploaded documents (local RAG) |
| Semantic Folder Search | Search docs by meaning |
| Duplicate Finder | Near-identical passages via embeddings |
| Auto-Tagger and Clusterer | Group notes into topics |
| Personal Knowledge Base | Multi-doc Q&A with citations |

#### CATEGORY 10: Dev Utilities (8 tools)
| Tool | Description |
|------|-------------|
| Dev Quick-Tools | Formatters, converters, generators |
| Mock Data & API Studio | Fake datasets + local mock API server |
| JSON & Schema Tools | Format, validate, diff, TypeScript types |
| API Request Playground | Local REST client (CORS proxy) |
| Diff & Merge Viewer | Side-by-side text/code/JSON diff |
| Color & CSS Studio | Color convert, WCAG contrast, gradients |
| Secret Scanner | Detect leaked API keys in code |
| Contrast & Accessibility Checker | WCAG contrast + color blindness preview |

#### CATEGORY 11: Privacy & Security (6 tools)
| Tool | Description |
|------|-------------|
| Private Redactor | Strip PII from text/docx/pdf |
| Metadata Stripper | Reveal + remove EXIF/GPS from photos |
| Password Studio | Generate strong passwords + audit |
| Hash & Integrity Checker | SHA/MD5 fingerprint + verify |
| Encryption Vault | AES-256 file encrypt/decrypt in browser |
| Hidden Message in Image | Steganography: embed/reveal messages |

**Presentations (1 tool):**
| Deck Builder | Topic → editable slide deck → export HTML |

### 7.3 Tool Runner UI

When a tool is selected from the grid:
- Right panel slides in (or modal on mobile)
- Header: tool name + description
- Input area:
  - Textarea for text-based tools
  - File upload area for file-based tools
  - Special UI for specific tools (e.g., side-by-side diff, color picker)
- [Run Tool] button — streams output from local model
- Output area: scrollable, formatted, copy button
- For file-output tools: download button appears after generation

### 7.4 Implementation Priority
Build tools in this order (most impactful first):
1. AI Assistant (text chat)
2. All Code Intelligence tools (core audience)
3. Writing Tools (broad appeal)
4. JSON & Schema Tools, Diff Viewer, Dev Quick-Tools
5. Format Converter, Data Cleaner
6. PDF Toolkit (PDF-lib, client-side)
7. Image tools (Transformers.js for vision)
8. Audio tools (Whisper via Transformers.js)
9. Remaining tools

---

## 8. ASSISTANT PAGE (`/assistant`)

Full-page standalone chat interface. Same model as workspace.

### Layout:
- Full-height chat message list
- Bottom: textarea + send button
- Top-right: model status badge

### Features:
- Streaming responses (token by token)
- Conversation history maintained in state
- Markdown rendering in responses (code blocks, bold, lists)
- Copy button on each assistant message
- "New conversation" button (clears history)
- Keyboard: Enter to send, Shift+Enter for newline

---

## 9. DEVTOOLS PAGE (`/devtools`)

Educational page explaining how to verify the on-device claim.

### Sections:

#### 9.1 Hero
"Verify it yourself. Press F12."

#### 9.2 Step-by-step guide
Numbered steps with screenshots/illustrations:
1. Open this workspace: `https://ondevai.app/workspace`
2. Press F12 to open DevTools
3. Go to Network tab
4. Generate an app
5. Observe: the Network tab shows **zero requests** during generation
6. The only outbound traffic is the one-time model download (from HuggingFace CDN)

#### 9.3 What you WILL see
- Initial page load (HTML, CSS, JS shell) — expected
- One-time model download (~600MB–2GB) — expected, cached after
- No inference requests — this is the proof

#### 9.4 What you will NOT see
- No `POST /v1/chat/completions` calls
- No OpenAI, Anthropic, or any AI API calls
- No user prompt data leaving the tab

#### 9.5 Technical explanation
Short explanation of WebLLM + WebGPU:
> The model weights are downloaded once to your browser cache. WebGPU compiles the model onto your GPU. All inference happens inside a Web Worker in your tab. The JavaScript API (`engine.chat.completions.create`) never makes a network call — it runs the model computation locally.

---

## 10. USE CASES PAGE (`/use-cases`)

### 10.1 Hero
- Headline: `Build the things you cannot safely build on anyone else's AI.`
- Four trust badges:
  - Zero telemetry — prompts and code never leave your browser
  - No training on your data
  - No account, no credit card
  - Your project, your file

#### 10.2 Feature tiles (horizontal scroll or grid)
- Documents stay on device
- Vision and audio run locally
- Redact before you share

### 10.3 Use Case Cards (9 cards in grid)
Each card has: title, use-case description, example app description, [Open with starter prompt] CTA

1. **Clinical & Healthcare intake** — PHI, HIPAA. Starter: "A patient intake form with symptom checklist, offline storage and CSV export"
2. **Legal drafting & contracts** — Privileged matter, NDA. Starter: "A contract clause comparator that diffs two pasted agreements"
3. **Financial models & client books** — Trading sheets, deal models. Starter: "A discounted cash flow model with editable assumptions and sensitivity table"
4. **Classified, defense & air-gapped** — Networks that ban outbound traffic. Starter: "A red-team checklist tracker with severity scoring and exportable report"
5. **Internal HR & payroll** — Compensation, employee records. Starter: "A salary band calculator with role levels, regions and side-by-side comparison"
6. **Journalism & source protection** — Notes, tip lines, unpublished drafts. Starter: "A reporter notebook with tagged entries, full-text search and encrypted lock screen"
7. **Regulated startups (HIPAA/GDPR/SOC2)** — Compliance. Starter: "A consent management dashboard with audit log and revocation flow"
8. **Students & schools on locked-down networks** — No signup, no billing. Starter: "A flashcard app with spaced repetition, tags and progress chart"
9. **Indie devs who want code private** — No training data. Starter: "A markdown notes app with live preview, tags and full-text search"

Each "Open with starter prompt" button links to `/workspace?prompt=[encoded starter prompt]` — the workspace reads the URL param and pre-fills the prompt textarea.

### 10.4 Privacy architecture section
4 facts (verifiable with DevTools):
1. WebGPU in your browser
2. Files stay in IndexedDB
3. No network in the build loop
4. Installable PWA

### 10.5 "What we will never do" section
Bulleted list of explicit promises.

---

## 11. ROADMAP PAGE (`/roadmap`)

**Important:** Do not copy Vibesterz's roadmap exactly. Use our own realistic roadmap based on what we CAN build.

### 11.1 Hero
"What's shipped, and what's next."

### 11.2 "Next milestones" (3 cards — what we're building next)

**Card 1: Extended Toolbox**
- ~2 weeks
- Adding remaining vision + audio tools (Whisper, background removal)
- All running on-device via Transformers.js

**Card 2: Hybrid Research Mode**
- ~1 month
- Allow the AI to optionally search for public API docs and current library versions
- Prompts still never leave device; only the research query is optional
- Off by default, user-controlled

**Card 3: Image Generation**
- Coming soon
- On-device text-to-image via WebGPU
- Callable from generated apps via `window.Vib.generateImage(prompt)`

### 11.3 Phase Plan (our phases)

**Phase 1 — Foundation** ✅ Shipped
- 5-pass build pipeline
- WebGPU workspace, installable PWA
- Multi-file editor, live preview, ZIP export

**Phase 2 — On-device depth** ✅ Shipped
- Strategy selector (Quick/Standard/Deep)
- Grammar-constrained blueprints
- Per-tier context budgets
- Quality gate + auto-fix

**Phase 3 — Private Toolbox** ✅ Shipped
- 66 on-device tools across 11 categories
- Code Intelligence, Writing, Data tools
- Vision + Document Intelligence

**Phase 4 — Smarter generation** 🔄 In Progress
- Section-based smart edits (regenerate one panel)
- GitHub reference seeding by app type
- Runtime preview self-heal
- Success-pattern memory

**Phase 5 — Workspace Polish** ⏭ Up next
- Inline blueprint editing before generation
- Side-by-side version diffs
- One-click publish to static host
- Keyboard-first command palette (Ctrl+K)

**Phase 6 — Open Platform** 🔜 Coming soon
- Bring-your-own-model support
- Plugin API for custom tools
- Shareable client-side app links

---

## 12. DOCS PAGE (`/docs`)

Single long-scroll documentation page with anchor links.

### Sections (mirror Vibesterz docs structure):

#### Getting Started
- Step 1: Open workspace from home page, model loads into browser tab via WebGPU
- Step 2: Type prompt, press Enter
- Step 3: Watch pipeline run
- Step 4: Iterate with follow-ups, save snapshots, export as ZIP

#### How it runs on your device
- WebGPU model in browser tab
- Requirements: Chrome 113+ / Edge 113+, 4GB+ VRAM
- Three model tiers (same as §6.7)

#### Plan & Build modes
- Plan mode: draft blueprint before code
- Build mode: generate + iterate (default)

#### Build Strategy
- Quick: single fast pass
- Standard: full 5-pass pipeline (default)
- Deep: multi-candidate, keeps best result

#### The build pipeline
- Five passes: Plan → Draft → Review → Fix → Expand
- What each pass does

#### Offline Component Pack
- `window.Vib` primitives
- Design token presets (5 themes)

#### Your apps & data
- Local database (in-browser PostgreSQL via PGlite)
- Local auth (browser-only, no server)
- Projects autosaved to /projects (IndexedDB)

#### Offline, PWA & Storage
- How to install as PWA
- Background model download
- Storage page at /storage

#### Prompting Guide
- Three principles: specific, name data sources, describe visual style
- Working example prompts

#### API Sources
List of free public APIs the builder can wire up automatically:
- Weather: Open-Meteo (no key), WeatherAPI
- Recipes: TheMealDB, Edamam
- Movies: OMDb, TMDb
- News: NewsData.io, GNews
- Data: REST Countries, JSONPlaceholder
- Fun: PokeAPI, JokeAPI, Quotable

#### FAQ
(Mirror Vibesterz FAQ with our own product name)

---

## 13. FOOTER

All pages:
```
OnDevAI — A browser-based AI coding workspace and private toolbox.
Build real apps on your device, privately, with no sign-up required.

Product                Resources              Connect
How it works           Documentation          Contact
Capabilities           Prompting Guide        Follow on X
Technology             API References         
Toolbox                Roadmap               
AI Chat                                      
Use Cases                                    

© 2026 OnDevAI. All rights reserved. · Privacy Policy
Built for creators. Private, on-device AI.
```

---

## 14. PWA CONFIGURATION

### manifest.json
```json
{
  "name": "OnDevAI — On-Device AI Workspace",
  "short_name": "OnDevAI",
  "description": "Browser-native AI coding workspace. No sign-up. No cloud.",
  "start_url": "/workspace",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#7c6af7",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Service Worker (via next-pwa)
Cache strategy:
- Shell (HTML/CSS/JS): CacheFirst
- Model weights: CacheFirst with large quota
- API responses: NetworkFirst (for any external API calls from generated apps)

---

## 15. LIB/WEBLLM.TS — ENGINE SINGLETON

```typescript
import * as webllm from "@mlc-ai/web-llm";

let engine: webllm.MLCEngine | null = null;
let currentModelId: string = "";

export async function initEngine(
  modelId: string,
  onProgress: (report: webllm.InitProgressReport) => void
): Promise<webllm.MLCEngine> {
  if (engine && currentModelId === modelId) return engine;
  engine = await webllm.CreateMLCEngine(modelId, {
    initProgressCallback: onProgress,
  });
  currentModelId = modelId;
  return engine;
}

export async function streamChat(
  messages: webllm.ChatCompletionMessageParam[],
  onToken: (text: string) => void,
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  if (!engine) throw new Error("Engine not initialized");
  const stream = await engine.chat.completions.create({
    messages,
    stream: true,
    temperature: options?.temperature ?? 0.4,
    max_tokens: options?.max_tokens ?? 2048,
  });
  let full = "";
  for await (const chunk of stream) {
    const tok = chunk.choices[0]?.delta?.content || "";
    full += tok;
    onToken(full);
  }
  return full;
}

export function isEngineReady(): boolean {
  return engine !== null;
}
```

---

## 16. PERFORMANCE & CORRECTNESS RULES

1. **Never send user data anywhere.** No `fetch()` calls with user prompts, code, or file contents.
2. **Model is a singleton.** Load once, reuse across workspace + toolbox + assistant.
3. **Debounce preview refresh.** 800ms after last keystroke in editor.
4. **iframe sandboxing.** Always `sandbox="allow-scripts allow-same-origin allow-forms"`. Never `allow-top-navigation`.
5. **Export ZIP.** Use `jszip` to bundle all project files client-side.
6. **IndexedDB for persistence.** Never use `localStorage` for large data (code, files).
7. **Web Workers.** Keep LLM inference off the main thread — WebLLM does this automatically.
8. **Lazy load toolbox models.** Vision/audio tools load Transformers.js lazily, only when first used.
9. **Mobile fallback.** If `navigator.gpu` is absent, show clear WebGPU requirement message.
10. **Keyboard shortcuts.** Ctrl+K = command palette, Ctrl+S = save snapshot, Ctrl+Shift+D = download file.

---

## 17. PACKAGE.JSON DEPENDENCIES

```json
{
  "dependencies": {
    "next": "14.2.x",
    "react": "18.x",
    "react-dom": "18.x",
    "typescript": "5.x",
    "@mlc-ai/web-llm": "latest",
    "@electric-sql/pglite": "latest",
    "@codemirror/view": "latest",
    "@codemirror/state": "latest",
    "@codemirror/lang-html": "latest",
    "@codemirror/lang-css": "latest",
    "@codemirror/lang-javascript": "latest",
    "@codemirror/theme-one-dark": "latest",
    "jszip": "latest",
    "@xenova/transformers": "latest",
    "idb-keyval": "latest",
    "pdf-lib": "latest",
    "next-pwa": "latest",
    "tailwindcss": "3.x",
    "lucide-react": "latest"
  }
}
```

---

## 18. WHAT TO BUILD FIRST (Build Order for Claude Code)

Execute in this exact order:

1. **Project scaffold** — Next.js 14 + TypeScript + Tailwind + globals.css with design tokens
2. **`lib/webllm.ts`** — Engine singleton
3. **`components/shared/ModelOverlay.tsx`** — Loading overlay
4. **`app/workspace/page.tsx`** — Main workspace (skeleton layout)
5. **`lib/pipeline.ts`** — 5-pass pipeline
6. **`components/workspace/ChatPanel.tsx`** — Prompt + log
7. **`components/workspace/EditorPanel.tsx`** — CodeMirror 6
8. **`components/workspace/PreviewPanel.tsx`** — iframe + error handling
9. **`components/workspace/PipelineSteps.tsx`** — Visual steps
10. **`components/workspace/ModelPicker.tsx`** + **`StrategySelector.tsx`**
11. **`lib/storage.ts`** + **`ProjectManager.tsx`**
12. **`lib/pglite.ts`** — In-browser PostgreSQL
13. **`app/assistant/page.tsx`** — Chat interface
14. **`lib/tools.ts`** — Tool definitions
15. **`app/toolbox/page.tsx`** + **`ToolGrid.tsx`** + **`ToolRunner.tsx`**
16. **`app/page.tsx`** — Landing page (full sections)
17. **`app/local/page.tsx`** — Local page
18. **`app/use-cases/page.tsx`** — Use cases
19. **`app/roadmap/page.tsx`** — Roadmap
20. **`app/docs/page.tsx`** — Documentation
21. **`app/devtools/page.tsx`** — DevTools verification
22. **PWA config** — manifest.json + next-pwa setup
23. **Mobile responsiveness pass** — all pages
24. **Polish pass** — animations, transitions, loading states

---

## 19. BOUNTY CONTEXT

This application is being built as a submission for a Pump.fun bounty to replicate Vibesterz (vibesterz.replit.app). The submission requires:

1. A working live demo proving the claimed functionality
2. Evidence that the LLM runs in-browser (DevTools Network tab shows no inference calls)
3. Proof the app builder generates running web apps
4. Demonstration of the toolbox working
5. Offline functionality after first model load

The application must be hosted at a public URL for submission. Deploy to Vercel.

---

## 20. ENVIRONMENT & DEPLOYMENT

```bash
# Development
npm run dev   # http://localhost:3000

# Build
npm run build

# Deploy
vercel --prod   # or push to GitHub + Vercel auto-deploy
```

**Important next.config.js settings:**
```javascript
const withPWA = require('next-pwa')({ dest: 'public' });
module.exports = withPWA({
  // Required for WebLLM WASM files
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
  // Required CORS headers for SharedArrayBuffer (WebLLM needs this)
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
      ],
    }];
  },
});
```

> **Note:** The `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers are REQUIRED for WebLLM to work. Without them, SharedArrayBuffer is unavailable and the engine will not initialize.

---

*End of MASTER_BUILD.md*
*This document is the complete specification. Build everything described here.*
*Version: 1.0 · For Pump.fun Vibesterz Bounty Submission*