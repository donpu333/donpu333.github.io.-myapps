export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function handleRegister() {
    // Логика регистрации
    // ...
}

export function handleLogin() {
    // Логика входа
    // ...
}

export function handleLogout() {
    // Логика выхода
    // ...
}

export function updateUserUI(email) {
    // Обновление интерфейса для пользователя
    // ...
}
