class BinanceAPIManager {
    constructor() {
        // Инициализация
    }

    async init() {
        // Подключение к API
    }

    async getCurrentPrice(symbol, marketType) {
        // Получение текущей цены
    }
}

// Глобальный экземпляр API
let apiManager;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    apiManager = new BinanceAPIManager();
    await apiManager.init();
});
