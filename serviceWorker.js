const staticDevCoffee = "dev-coffee-site-v1";
const assets = [
    "/Mathapp/",
    "/Mathapp/index.html",
    "/Mathapp/style.css",
    "/Mathapp/app.js",
    "/Mathapp/images/backicon.svg",
    "/Mathapp/images/redheart.jpg",
];

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(staticDevCoffee).then(cache => {
            cache.addAll(assets);
        })
    );
});

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res => {
            return res || fetch(fetchEvent.request);
        })
    );
});