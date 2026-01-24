// local-cache-min.js
(function() {
    console.log('🔧 Минимальный локальный кэш');
    
    // Просто пробуем загрузить из C:/dag/
    function tryLocalCache() {
        document.querySelectorAll('img').forEach(img => {
            const src = img.src || '';
            const filename = src.split('/').pop();
            
            if (filename && filename.match(/\.(webp|png|jpg|jpeg)$/i)) {
                const localSrc = `file:///C:/dag/${filename}`;
                
                // Пробуем загрузить
                const test = new Image();
                test.onload = function() {
                    img.src = localSrc;
                    console.log(`✅ ${filename}`);
                };
                test.src = localSrc;
            }
        });
    }
    
    // Запускаем после загрузки
    window.addEventListener('load', function() {
        setTimeout(tryLocalCache, 800);
        setTimeout(() => {
            const loader = document.getElementById('loading');
            if (loader) loader.style.display = 'none';
        }, 1000);
    });
})();