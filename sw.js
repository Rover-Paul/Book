// 독서 앱 서비스 워커: 앱 화면과 아이콘을 기기에 저장해 두고 다음부터 즉시 엽니다.
// index.html 등을 고친 뒤에는 아래 버전 숫자를 올리면 모든 기기에 새 화면이 확실히 반영됩니다.
const CACHE = 'reading-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 저장된 화면을 먼저 보여 주고, 뒤에서 최신 파일로 갱신 (구글 스크립트 API 요청은 건드리지 않음)
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const net = fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  });
  e.waitUntil(net.catch(() => {}));
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || net)
  );
});
