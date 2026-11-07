const CACHE_NAME = "quiz-v7";
const FILES = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png"];

self.addEventListener("install", function (event) {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(FILES);
        })
    );
});

self.addEventListener("activate" , function (event) {
    event.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(
                names
                .filter(function (name) { return name !== CACHE_NAME; })
                .map(function (name) { return caches.delete(name); })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener("fetch",function(event) {
    if (event.request.method !== "GET") return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request.url, { cache: "no-cache" })
        .then(function (response) {
            if (response.ok) {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                cache.put(event.request, copy);
                });
            }
            return response;
        })
        .catch(function () {
            return caches.match(event.request, {ignoreSearch: true }).then(function (cached) {
                if (cached) {
                    return cached;
                }
                if (event.request.mode === "navigate") {
                    return caches.match("index.html");
                }
                return Response.error();
            });
        })
    );
});