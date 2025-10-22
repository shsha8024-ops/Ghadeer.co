const CACHE='ghadeer-open-cache-v1';
const ASSETS=['./','./index.html','./assets/css/theme.css','./assets/js/app.js','./assets/icons/truck.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))})
