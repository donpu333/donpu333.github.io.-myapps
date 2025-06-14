const TG_BOT_TOKEN = '8044055704:AAGk8cQFayPqYCscLlEB3qGRj0Uw_NTpe30';

export async function sendTelegramNotification(message, chatId) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const data = await response.json();
        return data.ok;
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
        return false;
    }
}

export function showNotification(title, message) {
    // Показ уведомления в интерфейсе
    // ...
}
