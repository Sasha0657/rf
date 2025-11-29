addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const userAgent = request.headers.get('User-Agent') || '';
  const isMobile = /Android|iPhone|iPad|Mobile/i.test(userAgent);
  
  // Для мобильных - сразу на GitHub Pages
  if (isMobile) {
    return Response.redirect('https://sasha0657.github.io/rf/index.html', 302);
  }
  
  // Для ПК - обычная загрузка
  return fetch(request);
}