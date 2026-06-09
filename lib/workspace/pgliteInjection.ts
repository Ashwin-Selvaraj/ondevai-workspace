export function injectPGlite(html: string): string {
  const pgliteScript = `
<script type="module">
/* OnDevAI — In-browser PostgreSQL via PGlite */
import { PGlite } from 'https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/index.js';
window.db = new PGlite('idb://ondevai-app');
window.db.ready = window.db.waitReady;
console.log('[OnDevAI] PGlite database ready at idb://ondevai-app');
</script>`;

  if (html.includes('</head>')) return html.replace('</head>', pgliteScript + '\n</head>');
  return pgliteScript + html;
}

export function needsPGlite(prompt: string): boolean {
  const keywords = ['database', 'sql', 'postgres', 'sqlite', 'db', 'table', 'query', 'schema', 'crud', 'store data'];
  const lower = prompt.toLowerCase();
  return keywords.some(k => lower.includes(k));
}
