// local-folder-indexeddb.js
(function() {
    console.log('📂 Локальная папка + IndexedDB');
    
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
    
    const LOCAL_FOLDER = 'C:/dag/';
    
    // Проверяем доступ к локальному файлу
    async function checkLocalFile(filename) {
        return new Promise((resolve) => {
            const localUrl = `file:///${LOCAL_FOLDER}${filename}`;
            
            // Пробуем через Image (самый надежный способ)
            const img = new Image();
            
            img.onload = function() {
                console.log(`✅ Локальный файл найден: ${filename}`);
                resolve(localUrl);
            };
            
            img.onerror = function() {
                console.log(`❌ Локальный файл не найден: ${filename}`);
                resolve(null);
            };
            
            img.src = localUrl;
            
            // Таймаут для file:// (иногда долго грузит)
            setTimeout(() => {
                if (!img.complete) {
                    resolve(null);
                }
            }, 100);
        });
    }
    
    // IndexedDB для резервного кэширования
    class ImageCache {
        constructor() {
            this.db = null;
            this.dbName = 'ImageBackupCache';
            this.storeName = 'images';
        }
        
        async init() {
            if (!window.indexedDB) return false;
            
            return new Promise((resolve) => {
                const request = indexedDB.open(this.dbName, 1);
                
                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    resolve(true);
                };
                
                request.onerror = () => resolve(false);
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        db.createObjectStore(this.storeName, { keyPath: 'id' });
                    }
                };
            });
        }
        
        async get(filename) {
            if (!this.db) return null;
            
            return new Promise((resolve) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.get(filename);
                
                request.onsuccess = () => resolve(request.result ? request.result.data : null);
                request.onerror = () => resolve(null);
            });
        }
        
        async set(filename, dataUrl) {
            if (!this.db) return false;
            
            return new Promise((resolve) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.put({
                    id: filename,
                    data: dataUrl,
                    timestamp: Date.now()
                });
                
                request.onsuccess = () => resolve(true);
                request.onerror = () => resolve(false);
            });
        }
    }
    
    async function loadImages() {
        console.log('🔄 Загрузка изображений...');
        
        const cache = new ImageCache();
        await cache.init();
        
        let fromLocal = 0;
        let fromCache = 0;
        let fromNetwork = 0;
        
        // Проверяем каждое изображение
        for (const filename of IMAGES) {
            const imgElements = document.querySelectorAll(`img[src*="${filename}"]`);
            
            if (imgElements.length === 0) {
                console.log(`⏭️ ${filename} не найден на странице`);
                continue;
            }
            
            // ШАГ 1: Пробуем локальную папку C:\dag\
            const localUrl = await checkLocalFile(filename);
            
            if (localUrl) {
                // Используем локальный файл
                imgElements.forEach(img => {
                    img.src = localUrl;
                });
                fromLocal++;
                console.log(`📂 ${filename} из C:\\dag\\`);
                continue;
            }
            
            // ШАГ 2: Пробуем IndexedDB кэш
            if (cache.db) {
                const cachedData = await cache.get(filename);
                
                if (cachedData) {
                    imgElements.forEach(img => {
                        img.src = cachedData;
                    });
                    fromCache++;
                    console.log(`🗄️ ${filename} из IndexedDB`);
                    continue;
                }
            }
            
            // ШАГ 3: Загружаем с сети
            try {
                const originalSrc = imgElements[0].src;
                const response = await fetch(originalSrc);
                
                if (!response.ok) {
                    console.log(`❌ ${filename}: HTTP ${response.status}`);
                    continue;
                }
                
                const blob = await response.blob();
                
                // Для быстрого отображения используем Blob URL
                const blobUrl = URL.createObjectURL(blob);
                imgElements.forEach(img => {
                    img.src = blobUrl;
                });
                
                // Сохраняем в IndexedDB для будущего
                if (blob.size < 200 * 1024) { // Только файлы меньше 200KB
                    const reader = new FileReader();
                    reader.onload = async () => {
                        await cache.set(filename, reader.result);
                    };
                    reader.readAsDataURL(blob);
                }
                
                fromNetwork++;
                console.log(`🌐 ${filename} из сети (${Math.round(blob.size/1024)}KB)`);
                
            } catch (error) {
                console.log(`⚠️ ${filename}: ${error.message}`);
            }
        }
        
        console.log(`📊 Итог: ${fromLocal} из C:\\dag\\, ${fromCache} из IndexedDB, ${fromNetwork} из сети`);
        
        // Если хоть что-то загрузили локально - показываем уведомление
        if (fromLocal > 0) {
            showNotification(`✅ ${fromLocal} изображений загружены с локального диска`);
        }
        
        return { fromLocal, fromCache, fromNetwork };
    }
    
    function showNotification(text) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = text;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Добавляем стили анимации
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function hideLoader() {
        const loader = document.getElementById('loading');
        if (loader) {
            loader.style.transition = 'opacity 0.5s';
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                console.log('👋 Индикатор загрузки скрыт');
            }, 500);
        }
    }
    
    // Главная функция
    async function init() {
        console.log('🚀 Инициализация...');
        
        // Ждем загрузки DOM
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        // Даем время на первоначальную загрузку
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Загружаем изображения
        const stats = await loadImages();
        
        // Скрываем индикатор
        hideLoader();
        
        // Логируем результат
        if (stats.fromLocal > 0) {
            console.log(`🎉 Успех! ${stats.fromLocal} изображений загружены с C:\\dag\\`);
        } else {
            console.log('ℹ️ Локальные файлы не найдены, используем стандартную загрузку');
        }
    }
    
    // Запуск
    init().catch(console.error);
    
    // Для отладки
    window.imageLoader = {
        reload: loadImages,
        testLocalFile: async (filename = 'shapka.webp') => {
            const url = await checkLocalFile(filename);
            if (url) {
                console.log(`✅ ${filename} доступен по адресу: ${url}`);
                return url;
            } else {
                console.log(`❌ ${filename} не найден в C:\\dag\\`);
                return null;
            }
        },
        clearCache: async function() {
            if (window.indexedDB) {
                const dbs = await indexedDB.databases();
                for (const db of dbs) {
                    if (db.name.includes('ImageCache')) {
                        indexedDB.deleteDatabase(db.name);
                        console.log(`🗑️ Удалена база: ${db.name}`);
                    }
                }
            }
            console.log('🗑️ Кэш очищен');
        }
    };
    
})();