// local-cache-reader.js
(function() {
    'use strict';
    
    console.log('📁 Локальный кэш через FileReader');
    
    // Конфигурация
    const CONFIG = {
        folderPath: 'C:/dag/',  // Только для информации
        images: [
            'shapka.webp', '01.webp', 
            'd1.webp', 'd2.webp', 'd3.webp', 'd4.webp', 'd5.webp',
            'd6.webp', 'd7.webp', 'd8.webp', 'd9.webp', 'd10.webp',
            'd11.webp', 'd12.webp', 'd13.webp', 'd14.webp', 'd15.webp',
            'd16.webp', 'd17.webp', 'd18.webp', 'd19.webp', 'd20.webp',
            'd21.webp', 'd22.webp', 'd23.webp', 'd24.webp', 'd25.webp',
            'd26.webp', 'd27.webp', 'd28.webp', 'd29.webp', 'd30.webp',
            'd31.webp', 'd32.webp', 'd33.webp', 'd34.webp', 'd35.webp',
            'd36.webp'
        ]
    };
    
    // Кэш в памяти
    const imageCache = new Map();
    
    // Диалог выбора папки
    async function selectFolder() {
        try {
            const handle = await window.showDirectoryPicker({
                startIn: 'desktop',
                id: 'dag-images-folder'
            });
            
            if (handle.name.toLowerCase() === 'dag') {
                localStorage.setItem('dagFolderSelected', 'true');
                return handle;
            }
            return null;
        } catch (error) {
            console.log('📂 Папка не выбрана:', error.message);
            return null;
        }
    }
    
    // Загружаем изображение из выбранной папки
    async function loadImageFromFolder(folderHandle, filename) {
        try {
            const fileHandle = await folderHandle.getFileHandle(filename);
            const file = await fileHandle.getFile();
            
            // Читаем файл как Data URL
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        } catch (error) {
            console.log(`❌ Не удалось загрузить ${filename}:`, error.message);
            return null;
        }
    }
    
    // Заменяем изображения на странице
    function replaceImages(dataUrls) {
        let replaced = 0;
        
        CONFIG.images.forEach(filename => {
            if (dataUrls[filename]) {
                const images = document.querySelectorAll(`img[src*="${filename}"]`);
                
                images.forEach(img => {
                    img.src = dataUrls[filename];
                    replaced++;
                    console.log(`✅ ${filename}`);
                });
            }
        });
        
        return replaced;
    }
    
    // Основная функция
    async function init() {
        console.log('🔄 Инициализация...');
        
        // Проверяем, была ли уже выбрана папка
        const wasSelected = localStorage.getItem('dagFolderSelected') === 'true';
        
        if (!wasSelected) {
            // Показываем кнопку для выбора папки
            createFolderSelector();
            return;
        }
        
        // Пробуем загрузить изображения
        await loadAndReplaceImages();
    }
    
    // Создаем интерфейс для выбора папки
    function createFolderSelector() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            max-width: 500px;
        `;
        
        modal.innerHTML = `
            <h2>📁 Локальный кэш изображений</h2>
            <p>Для быстрой загрузки выберите папку с изображениями</p>
            <p><small>Обычно это: <code>C:/dag/</code></small></p>
            <button id="selectFolderBtn" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
                margin: 10px;
            ">Выбрать папку</button>
            <button id="skipBtn" style="
                background: #f0f0f0;
                border: none;
                padding: 12px 24px;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
                margin: 10px;
            ">Пропустить</button>
            <p><small>Выбор запоминается для этого сайта</small></p>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        document.getElementById('selectFolderBtn').addEventListener('click', async () => {
            modal.innerHTML = '<p>Выбираю папку...</p>';
            await loadAndReplaceImages();
            overlay.remove();
        });
        
        document.getElementById('skipBtn').addEventListener('click', () => {
            overlay.remove();
            hideLoader();
        });
    }
    
    // Загружаем и заменяем изображения
    async function loadAndReplaceImages() {
        const folderHandle = await selectFolder();
        
        if (!folderHandle) {
            console.log('🚫 Папка не выбрана');
            hideLoader();
            return;
        }
        
        console.log('📂 Загружаю изображения...');
        
        const dataUrls = {};
        let loaded = 0;
        
        // Загружаем все изображения
        for (const filename of CONFIG.images) {
            try {
                const dataUrl = await loadImageFromFolder(folderHandle, filename);
                if (dataUrl) {
                    dataUrls[filename] = dataUrl;
                    loaded++;
                    console.log(`📦 Загружено ${loaded}/${CONFIG.images.length}: ${filename}`);
                }
            } catch (error) {
                console.log(`⚠️ Ошибка загрузки ${filename}:`, error.message);
            }
        }
        
        console.log(`✅ Загружено ${loaded} изображений`);
        
        // Заменяем на странице
        const replaced = replaceImages(dataUrls);
        console.log(`🖼️ Заменено ${replaced} изображений на странице`);
        
        hideLoader();
        
        // Сохраняем в localStorage для будущего использования
        if (loaded > 0) {
            try {
                // Сохраняем только первые несколько Data URLs (они могут быть большими)
                const sampleData = {};
                const keys = Object.keys(dataUrls).slice(0, 5);
                keys.forEach(key => sampleData[key] = dataUrls[key].substring(0, 100) + '...');
                localStorage.setItem('dagCacheInfo', JSON.stringify({
                    count: loaded,
                    timestamp: new Date().toISOString(),
                    sample: sampleData
                }));
            } catch (e) {
                // Игнорируем ошибки localStorage
            }
        }
    }
    
    // Скрываем индикатор загрузки
    function hideLoader() {
        setTimeout(() => {
            const loader = document.getElementById('loading');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                    console.log('👋 Индикатор скрыт');
                }, 300);
            }
        }, 500);
    }
    
    // Запускаем
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // API для отладки
    window.localCache = {
        reload: loadAndReplaceImages,
        clear: () => {
            localStorage.removeItem('dagFolderSelected');
            localStorage.removeItem('dagCacheInfo');
            console.log('🗑️ Кэш очищен');
        }
    };
    
    console.log('🚀 Локальный кэш готов к работе');
})();