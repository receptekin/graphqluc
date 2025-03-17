import { createError, ErrorTypes } from './errorHandler.js';

export const validateUser = (userData) => {
    const { name, surname, password } = userData;

    if (!name || name.trim().length < 2) {
        throw createError(
            'İsim en az 2 karakter olmalıdır!',
            ErrorTypes.VALIDATION,
            400
        );
    }

    if (!surname || surname.trim().length < 2) {
        throw createError(
            'Soyisim en az 2 karakter olmalıdır!',
            ErrorTypes.VALIDATION,
            400
        );
    }

    if (!password || password.length < 6) {
        throw createError(
            'Şifre en az 6 karakter olmalıdır!',
            ErrorTypes.VALIDATION,
            400
        );
    }

    return {
        name: name.trim(),
        surname: surname.trim(),
        password
    };
};

export const validatePassword = (password) => {
    if (!password || password.length < 6) {
        throw createError(
            'Şifre en az 6 karakter olmalıdır!',
            ErrorTypes.VALIDATION,
            400
        );
    }

    // Şifre güvenlik kuralları
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);

    if (!hasNumber || !hasLetter) {
        throw createError(
            'Şifre en az bir harf ve bir rakam içermelidir!',
            ErrorTypes.VALIDATION,
            400
        );
    }

    return password;
}; 