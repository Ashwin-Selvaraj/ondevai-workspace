'use client';
import { Download } from 'lucide-react';
import type { ProjectFile } from '@/lib/storage/projects';

interface Props {
  files: ProjectFile[];
  projectName: string;
  disabled?: boolean;
}

export default function ExportButton({ files, projectName, disabled }: Props) {
  async function handleExport() {
    if (!files.length) return;
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    for (const file of files) {
      zip.file(file.name, file.content);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'project'}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      disabled={disabled || !files.length}
      className="btn btn-secondary"
      style={{ fontSize: '12px', padding: '5px 10px' }}
      title="Export as ZIP"
    >
      <Download size={13} />
      Export
    </button>
  );
}
