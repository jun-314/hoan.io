/* 保安管理 点検記録 — Service Worker（オフライン起動用）
   アプリ本体はインストール時に、資料の写真は裏で1枚ずつキャッシュする（写真が無くても失敗しない）。
   index.html を更新したら CACHE の番号を上げること。 */
const CACHE = 'hoan-v4';
const ASSETS = ['./', './index.html', './manifest.json'];
const PHOTOS = ['ocr-moc-a3t', 'ocr-moc-a1t', 'dgr-togami-ltr', 'dgr-hikari-ldg', 'dgr-mdg-a3v', 'gr-mgr-a3v', 'ovgr-rpr-omron',
  'lfa-omron', 'lfa-kawamura', 'tester-ipr-meter', 'tester-ipr-power', 'tester-dgr3050', 'tester-rdf5a', 'tester-gcr6n',
  'megger-kew3442', 'megger-musashi', 'earth-checker', 'set1000', 'mcm8000', 'oiltest-kit', 'oiltest-color',
  'dcleak-setup', 'mr8880', 'mr8880-ports'].map((f) => './img/' + f + '.jpg');

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS).then(() => {
      PHOTOS.forEach((u) => c.add(u).catch(() => {}));   // 写真は待たない・失敗しても無視
    })).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request).then((res) => {
      if (res && res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
