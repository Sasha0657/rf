// indexeddb-cache.js
(function() {
    console.log('🗄️ IndexedDB кэш');
    
    const IMAGES = [
        'shapka.webp', '01.webp', 'd1.webp', 'd2.webp', 'd3.webp',
        'd4.webp', 'd5.webp', 'd6.webp', 'd7.webp', 'd8.webp',
        'd9.webp', 'd10.webp', 'd11.webp', 'd12.webp', 'd13.webp',
        'd14.webp', 'd15.webp', 'd16.webp', 'd17.webp', 'd18.webp',
        'd19.webp', 'd20.webp', 'd21.webp', 'd22.webp', 'd23.webp',
        'd24.webp', 'd25.webp', 'd26.webp', 'd27.webp', 'd28.webp',
        'd29.webp', 'd30.webp', 'd31.webp', 'd32.webp', 'd33.webp',
        'd34.webp', 'd35.webp', 'd36.webp'
    ];
    
    const DB_NAME = 'imageCacheDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'images';
    
    let db;
    
    // Открытие базы данных
    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                db = request.result;
                resolve(db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'filename' });
                }
            };
        });
    }
    
    // Сохранить изображение
    async function saveImage(filename, blob) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            // Конвертируем blob в base64
            const reader = new FileReader();
            reader.onload = function() {
                const request = store.put({
                    filename: filename,
                    data: reader.result,
                    timestamp: Date.now()
                });
                
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            };
            reader.readAsDataURL(blob);
        });
    }
    
    // Получить изображение
    async function getImage(filename) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(filename);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // Основная функция кэширования
    async function cacheImages() {
        try {
            await openDB();
            console.log('✅ База данных открыта');
            
            let cached = 0;
            let loadedFromCache = 0;
            
            for (const filename of IMAGES) {
                const imgElements = document.querySelectorAll(`img[src*="${filename}"]`);
                
                if (imgElements.length === 0) continue;
                
                // Пробуем получить из кэша
                const cachedImage = await getImage(filename);
                
                if (cachedImage && cachedImage.data) {
                    // Используем кэш
                    imgElements.forEach(img => {
                        img.src = cachedImage.data;
                    });
                    loadedFromCache++;
                    console.log(`✅ ${filename} из IndexedDB`);
                } else {
                    // Загружаем и кэшируем
                    const originalSrc = imgElements[0].src;
                    
                    try {
                        const response = await fetch(originalSrc);
                        const blob = await response.blob();
                        
                        // Сохраняем в IndexedDB
                        await saveImage(filename, blob);
                        
                        // Применяем
                        const objectUrl = URL.createObjectURL(blob);
                        imgElements.forEach(img => {
                            img.src = objectUrl;
                        });
                        
                        cached++;
                        console.log(`💾 ${filename} сохранен в IndexedDB`);
                    } catch (error) {
                        console.log(`❌ Ошибка загрузки ${filename}:`, error);
                    }
                }
            }
            
            console.log(`📊 Итого: ${loadedFromCache} из кэша, ${cached} закэшировано`);
            
        } catch (error) {
            console.error('❌ Ошибка IndexedDB:', error);
        }
    }
    
    // Скрыть индикатор
    function hideLoader() {
        const loader = document.getElementById('loading');
        if (loader) {
            setTimeout(() => {
                loader.style.display = 'none';
                console.log('👋 Индикатор скрыт');
            }, 1000);
        }
    }
    
    // Очистка кэша
    async function clearCache() {
        try {
            await openDB();
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            store.clear();
            console.log('🗑️ IndexedDB кэш очищен');
        } catch (error) {
            console.error('❌ Ошибка очистки:', error);
        }
    }
    
    // Запуск
    window.addEventListener('load', async function() {
        setTimeout(async () => {
            await cacheImages();
            hideLoader();
        }, 500);
    });
    
    // Экспорт для отладки
    window.imageCache = {
        clear: clearCache,
        reload: cacheImages,
        stats: async function() {
            await openDB();
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.count();
            
            return new Promise(resolve => {
                request.onsuccess = () => {
                    resolve(`В кэше: ${request.result} изображений`);
                };
            });
        }
    };
    
})();