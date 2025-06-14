import { apiManager } from './api.js';

const TG_BOT_TOKEN = '8044055704:AAGk8cQFayPqYCscLlEB3qGRj0Uw_NTpe30';
let userAlerts = [];
let currentAlertFilter = 'active';
let alertCooldowns = {};
let activeTriggeredAlerts = {};

export async function addUserAlert(symbol, type, condition, value, notificationMethods, notificationCount, chatId) {
    try {
        const marketType = apiManager.getMarketTypeBySymbol(symbol);

        const newAlert = {
            id: Date.now(),
            symbol,
            type,
            condition,
            value: parseFloat(value),
            notificationMethods,
            notificationCount: parseInt(notificationCount),
            chatId: notificationMethods.includes('telegram') ? (localStorage.getItem('tg_chat_id') || chatId) : null,
            triggeredCount: 0,
            createdAt: new Date().toISOString(),
            triggered: false,
            lastNotificationTime: 0,
            marketType
        };

        userAlerts.push(newAlert);
        saveAppState();
        loadUserAlerts(currentAlertFilter);
        return true;
    } catch (error) {
        console.error("Error adding alert:", error);
        showNotification('Ошибка', 'Не удалось создать алерт');
        return false;
    }
}

// Остальные функции работы с алертами...
