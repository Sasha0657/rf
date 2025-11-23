document.addEventListener('DOMContentLoaded', function() {
  const images = document.querySelectorAll('.gallery img');
  const lightbox = document.createElement('div');
  lightbox.classList.add('lightbox');
  document.body.appendChild(lightbox);

  const img = document.createElement('img');
  lightbox.appendChild(img);

  images.forEach(image => {
    image.addEventListener('click', () => {
      img.src = image.src;
      lightbox.style.display = 'flex';
    });
  });

  lightbox.addEventListener('click', () => {
    lightbox.style.display = 'none';
  });
});