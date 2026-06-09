'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useEngine } from '@/lib/engine/EngineContext';
import { runPipeline, type Strategy, type PipelineStep, type StepStatus } from '@/lib/workspace/pipeline';
import { needsPGlite, injectPGlite } from '@/lib/workspace/pgliteInjection';
import { createProject, saveProject, saveSnapshot, type Project, type ProjectFile } from '@/lib/storage/projects';
import WorkspaceToolbar from '@/components/workspace/WorkspaceToolbar';
import ChatPanel, { type LogMessage } from '@/components/workspace/ChatPanel';
import EditorPanel from '@/components/workspace/EditorPanel';
import PreviewPanel from '@/components/workspace/PreviewPanel';
import ProjectDrawer from '@/components/workspace/ProjectDrawer';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { useToast } from '@/components/shared/Toast';
import { DEFAULT_MODEL } from '@/lib/engine/models';

const EMPTY_STEPS: Record<PipelineStep, StepStatus> = {
  research: 'pending', blueprint: 'pending', generate: 'pending', review: 'pending', fix: 'pending',
};

const HELLO_WORLD: import('@/lib/storage/projects').ProjectFile = {
  name: 'index.html',
  content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hello World</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #08080e;
      font-family: system-ui, sans-serif;
      color: #e2e2f0;
    }
    .card {
      text-align: center;
      padding: 48px 64px;
      background: #13131f;
      border: 1px solid #2a2a3d;
      border-radius: 16px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.5);
    }
    .emoji { font-size: 56px; margin-bottom: 24px; }
    h1 { font-size: 36px; font-weight: 700; margin-bottom: 12px; }
    p { font-size: 15px; color: #8888aa; margin-bottom: 28px; }
    button {
      padding: 12px 32px;
      background: #6d5df0;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #5a4dd0; }
    #msg { margin-top: 20px; font-size: 14px; color: #6d5df0; min-height: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">👋</div>
    <h1>Hello, World!</h1>
    <p>Your on-device AI workspace is ready. Describe an app in the chat to build something new.</p>
    <button onclick="greet()">Say Hello</button>
    <div id="msg"></div>
  </div>
  <script>
    const messages = [
      'Hello from your browser! 🚀',
      'No server, no cloud — pure WebGPU magic ✨',
      'Ready to build something amazing? 🛠️',
      'Your data never leaves this device 🔒',
    ];
    let idx = 0;
    function greet() {
      document.getElementById('msg').textContent = messages[idx++ % messages.length];
    }
  </script>
</body>
</html>`,
};

let logIdCounter = 0;
function makeLog(type: LogMessage['type'], text: string): LogMessage {
  return { id: String(logIdCounter++), type, text };
}

export default function WorkspaceClient() {
  const { isReady, isLoading, loadModel, selectedModel } = useEngine();
  const { toast } = useToast();

  const [strategy, setStrategy] = useState<Strategy>('standard');
  const [isBuilding, setIsBuilding] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<Record<PipelineStep, StepStatus>>({ ...EMPTY_STEPS });
  const [pipelineVisible, setPipelineVisible] = useState(false);
  const [buildLog, setBuildLog] = useState<LogMessage[]>([]);

  const [files, setFiles] = useState<ProjectFile[]>([HELLO_WORLD]);
  const [activeFile, setActiveFile] = useState('index.html');
  const [project, setProject] = useState<Project | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Mobile: which panel is active
  const [mobileTab, setMobileTab] = useState<'chat' | 'code' | 'preview'>('chat');

  // Hide global footer on workspace page
  useEffect(() => {
    document.body.classList.add('workspace-page');
    return () => document.body.classList.remove('workspace-page');
  }, []);

  // Auto-load model on mount
  useEffect(() => {
    if (!isReady && !isLoading) loadModel(selectedModel ?? DEFAULT_MODEL);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ctrl+S → save snapshot
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, files]);

  // Read ?prompt= from URL
  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get('prompt');
    if (q) {
      setTimeout(() => handleBuild(q.trim(), strategy), 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addLog(type: LogMessage['type'], text: string) {
    setBuildLog(prev => [...prev, makeLog(type, text)]);
  }

  const handleBuild = useCallback(async (prompt: string, strat: Strategy) => {
    if (!isReady) { addLog('error', 'Model not ready yet. Please wait…'); return; }
    setIsBuilding(true);
    setPipelineVisible(true);
    setPipelineSteps({ ...EMPTY_STEPS });
    setBuildLog([makeLog('system', `Building: "${prompt.slice(0, 60)}…"`)]);
    setMobileTab('chat');

    let finalCode = '';

    await runPipeline(prompt, strat, {
      onStepChange: (step, status) => {
        setPipelineSteps(prev => ({ ...prev, [step]: status }));
        if (status === 'active') {
          const STEP_LABELS: Record<PipelineStep, string> = {
            research: '🔍 Pass 1 — Research', blueprint: '📐 Pass 2 — Blueprint',
            generate: '⚡ Pass 3 — Generate', review: '🔎 Pass 4 — Review', fix: '🔧 Pass 5 — Fix',
          };
          addLog('step-header', STEP_LABELS[step]);
        }
      },
      onLog: (_step, text) => {
        if (text.length > 10) addLog('ai-output', text);
      },
      onCodeUpdate: (code) => {
        finalCode = code;
        const previewLines = code.split('\n').slice(0, 3).join('\n');
        setFiles([{ name: 'index.html', content: code }]);
        setActiveFile('index.html');
        // Show first 3 lines as code preview in log
        if (code.length > 200) {
          setBuildLog(prev => {
            const last = prev[prev.length - 1];
            if (last?.type === 'code-preview') {
              return [...prev.slice(0, -1), makeLog('code-preview', previewLines)];
            }
            return [...prev, makeLog('code-preview', previewLines)];
          });
        }
        setMobileTab('code');
      },
      onComplete: async (code) => {
        let finalHTML = code;
        if (needsPGlite(prompt)) finalHTML = injectPGlite(finalHTML);
        setFiles([{ name: 'index.html', content: finalHTML }]);
        finalCode = finalHTML;
        addLog('success', '✅ Build complete! App is running in the preview.');
        setMobileTab('preview');

        // Save project
        const p = createProject(prompt, [{ name: 'index.html', content: finalHTML }]);
        setProject(p);
        await saveProject(p);
        await saveSnapshot(p.id, p.files);
        setIsBuilding(false);
      },
      onError: (err) => {
        addLog('error', `❌ Error: ${err}`);
        setIsBuilding(false);
      },
    });
  }, [isReady, strategy]);

  const handleFollowUp = useCallback(async (msg: string) => {
    if (!isReady || !files.length) return;
    addLog('step-header', `🔄 Updating: "${msg}"`);
    setIsBuilding(true);
    const currentCode = files.find(f => f.name === activeFile)?.content ?? '';
    const { streamChat } = await import('@/lib/engine/webllm');
    let updated = '';
    for await (const partial of streamChat([
      { role: 'system', content: 'You are a code editor. Given an HTML app and a modification request, output ONLY the complete updated HTML. No explanation.' },
      { role: 'user', content: `Modification: ${msg}\n\nCurrent code:\n${currentCode.slice(0, 5000)}\n\nOutput ONLY the updated HTML.` },
    ], { temperature: 0.3, max_tokens: 4096 })) {
      updated = partial;
      setFiles([{ name: 'index.html', content: partial }]);
    }
    addLog('success', '✅ Updated!');
    if (project) {
      await saveProject({ ...project, files: [{ name: 'index.html', content: updated }] });
      await saveSnapshot(project.id, [{ name: 'index.html', content: updated }]);
    }
    setIsBuilding(false);
  }, [isReady, files, activeFile, project]);

  const handleSave = useCallback(async () => {
    if (!project) return;
    await saveProject({ ...project, files });
    await saveSnapshot(project.id, files);
    addLog('system', '💾 Saved.');
    toast('Snapshot saved', 'success', 2000);
  }, [project, files, toast]);

  const handleAutoFix = useCallback(async (error: string) => {
    if (!isReady || !files.length) return;
    addLog('step-header', '🔧 Auto-fixing runtime error…');
    await handleFollowUp(`Fix this runtime error: ${error}`);
  }, [isReady, files, handleFollowUp]);

  function handleOpenProject(p: Project) {
    setProject(p);
    setFiles(p.files);
    setActiveFile(p.files[0]?.name ?? 'index.html');
    setBuildLog([makeLog('system', `📂 Opened: ${p.name}`)]);
    setPipelineVisible(false);
  }

  return (
    <ErrorBoundary label="workspace">
    <div style={{
      position: 'fixed',
      top: '88px', // 48px navbar + 40px toolbar
      left: 0, right: 0, bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Toolbar */}
      <WorkspaceToolbar
        strategy={strategy}
        onStrategyChange={setStrategy}
        onProjectsClick={() => setDrawerOpen(true)}
        isBuilding={isBuilding}
      />

      {/* Three-pane layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Chat panel — 320px fixed */}
        <div
          style={{
            width: '320px',
            flexShrink: 0,
            borderRight: '1px solid var(--border)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
          className="workspace-chat"
          data-active={mobileTab === 'chat' ? 'true' : undefined}
        >
          <ChatPanel
            onBuild={handleBuild}
            strategy={strategy}
            isBuilding={isBuilding}
            pipelineSteps={pipelineSteps}
            pipelineVisible={pipelineVisible}
            buildLog={buildLog}
            onFollowUp={handleFollowUp}
          />
        </div>

        {/* Editor panel — flex-1 */}
        <div
          style={{
            flex: 1,
            borderRight: '1px solid var(--border)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
          className="workspace-editor"
          data-active={mobileTab === 'code' ? 'true' : undefined}
        >
          <EditorPanel
            files={files}
            activeFile={activeFile}
            onFileChange={setActiveFile}
            onCodeChange={(name, content) => setFiles(prev => prev.map(f => f.name === name ? { ...f, content } : f))}
            project={project}
            onSave={handleSave}
            onRestoreSnapshot={(snapFiles) => setFiles(snapFiles)}
          />
        </div>

        {/* Preview panel — flex-1 */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
          className="workspace-preview"
          data-active={mobileTab === 'preview' ? 'true' : undefined}
        >
          <PreviewPanel
            code={files.find(f => f.name === activeFile)?.content ?? ''}
            onAutoFix={handleAutoFix}
          />
        </div>
      </div>

      {/* Mobile tab bar */}
      <div className="mobile-tabs" style={{
        display: 'none',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-surface)',
      }}>
        {(['chat', 'code', 'preview'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              background: mobileTab === tab ? 'var(--accent-muted)' : 'transparent',
              color: mobileTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: mobileTab === tab ? 600 : 400,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <ProjectDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenProject={handleOpenProject}
        onNewProject={() => {
          setProject(null);
          setFiles([]);
          setBuildLog([makeLog('system', 'New project started.')]);
          setPipelineVisible(false);
          setDrawerOpen(false);
        }}
        currentProjectId={project?.id}
      />

      <style>{`
        body.workspace-page footer { display: none !important; }
        @media (max-width: 768px) {
          .workspace-chat, .workspace-editor, .workspace-preview {
            display: none !important;
            width: 100% !important;
            flex: 1 !important;
          }
          .workspace-chat[data-active="true"],
          .workspace-editor[data-active="true"],
          .workspace-preview[data-active="true"] {
            display: flex !important;
          }
          .mobile-tabs { display: flex !important; }
        }
        /* Smooth panel transitions */
        .workspace-chat, .workspace-editor, .workspace-preview {
          transition: opacity 0.15s ease;
        }
      `}</style>
    </div>
    </ErrorBoundary>
  );
}
