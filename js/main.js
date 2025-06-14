import { apiManager } from './api.js';
import { initCalculator } from './calculator.js';
import { handleLogin, handleRegister, handleLogout, updateUserUI } from './auth.js';
import { showNotification, sendTelegramNotification } from './notifications.js';
import { addUserAlert, loadUserAlerts } from './alerts.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await apiManager.init();
        initCalculator();
        setupEventListeners();
        loadUserAlerts(currentAlertFilter);
        
        // Проверка авторизации
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser?.email) {
            updateUserUI(currentUser.email);
        }

        // Запуск проверки алертов
        setInterval(checkAlerts, 2000);
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showNotification('Critical Error', 'Failed to connect to Binance API');
    }
});

function setupEventListeners() {
    // Настройка всех обработчиков событий
    // ...
}

// Глобальные функции
window.createAlertForSymbol = createAlertForSymbol;
window.deleteAlert = deleteAlert;
// ... другие глобальные функции
