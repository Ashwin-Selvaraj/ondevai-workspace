// Custom service worker additions for next-pwa
// This file is merged with the auto-generated workbox SW

// Cache WebLLM model weights from CDN with CacheFirst strategy
// Models can be 1-8GB — once cached they should never re-download
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

const MODEL_CACHE = 'webllm-models-v1';
const MODEL_ORIGINS = [
  'huggingface.co',
  'cdn-lfs.huggingface.co',
  'cdn-lfs-us-1.huggingface.co',
  'raw.githubusercontent.com',
];

function isModelRequest(url) {
  try {
    const u = new URL(url);
    // Match model weight files (.bin, .safetensors, .wasm, .so, .data)
    const isModelFile = /\.(bin|safetensors|wasm|so|data|gguf)(\?.*)?$/.test(u.pathname);
    const isModelOrigin = MODEL_ORIGINS.some(o => u.hostname.includes(o));
    // Also match MLC model URLs from various CDN paths
    const isMlcPath = u.pathname.includes('mlc-ai') || u.pathname.includes('mlc-llm');
    return (isModelOrigin && isModelFile) || (isModelOrigin && isMlcPath);
  } catch {
    return false;
  }
}

self.addEventListener('fetch', (event) => {
  if (!isModelRequest(event.request.url)) return;

  event.respondWith(
    caches.open(MODEL_CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) {
        return cached;
      }

      // Not cached — fetch and cache it (CacheFirst after first download)
      try {
        const response = await fetch(event.request.clone());
        if (response.ok && response.status === 200) {
          // Only cache complete responses (not range requests for partial content)
          cache.put(event.request, response.clone()).catch(() => {
            // Storage quota exceeded — continue without caching
          });
        }
        return response;
      } catch {
        return new Response('Model file unavailable offline', { status: 503 });
      }
    })
  );
});
