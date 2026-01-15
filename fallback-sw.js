self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      // Если запрос НЕ УДАЛСЯ — редиректим на GitHub Pages
      return Response.redirect('https://sasha0657.github.io/rf/index.html', 302);
    })
  );

});
