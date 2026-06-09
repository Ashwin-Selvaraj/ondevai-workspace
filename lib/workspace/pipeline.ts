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
        { role: 'user', content: `Create a detailed blueprint for: "${userPrompt}"\n\nRequirements:\n${research}` },
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

    for await (const partial of streamChat(generateMessages, { temperature: 0.5, max_tokens: 4096 })) {
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
        { role: 'user', content: `Original goal: "${userPrompt}"\n\nCode to review:\n${generatedCode.substring(0, 6000)}` },
      ], { temperature: 0.1, max_tokens: 600 });
      onLog('review', reviewResult);
      onStepChange('review', 'done');

      // ─── PASS 5: FIX ─────────────────────────────────────────────
      if (!reviewResult.trim().toUpperCase().startsWith('LGTM')) {
        onStepChange('fix', 'active');
        onLog('fix', 'Applying fixes…');
        for await (const partial of streamChat([
          { role: 'system', content: SYSTEM_PROMPTS.fix },
          { role: 'user', content: `Issues found:\n${reviewResult}\n\nOriginal code:\n${generatedCode.substring(0, 5000)}\n\nOutput ONLY the corrected HTML.` },
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
/* OnDevAI — Local-first backend */
window.Vib = {
  store: {
    get: (k) => { try { return JSON.parse(localStorage.getItem('vib_' + k) || 'null'); } catch { return null; } },
    set: (k, v) => localStorage.setItem('vib_' + k, JSON.stringify(v)),
    del: (k) => localStorage.removeItem('vib_' + k),
    all: () => Object.fromEntries(
      Object.keys(localStorage).filter(k => k.startsWith('vib_'))
        .map(k => [k.slice(4), JSON.parse(localStorage.getItem(k) || 'null')])
    ),
  },
  toast: (msg, type = 'info') => {
    const t = document.createElement('div');
    const colors = { info: '#6d5df0', success: '#22d3a5', error: '#ef4444' };
    t.style.cssText = \`position:fixed;bottom:24px;right:24px;padding:12px 18px;border-radius:8px;background:\${colors[type]||colors.info};color:white;font-size:13px;z-index:9999;\`;
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
  if (html.includes('</body>')) return html.replace('</body>', vibScript + '\n</body>');
  return html + vibScript;
}
