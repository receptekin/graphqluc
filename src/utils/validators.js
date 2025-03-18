import { createError, ErrorTypes } from './errorHandler.js';

export const validateUser = (userData) => {
    const { firstName, lastName, email, password } = userData;

    if (!firstName || firstName.trim().length < 2) {
        throw createError(
            'İsim en az 2 karakter olmalıdır!',
            ErrorTypes.VALIDATION,
            400
        );
    }

    if (!lastName || lastName.trim().length < 2) {
        throw createError(
            'Soyisim en az 2 karakter olmalıdır!',
            ErrorTypes.VALIDATION,
            400
        );
    }

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw createError(
            'Geçerli bir email adresi giriniz!',
            ErrorTypes.VALIDATION,
            400
        );
    }

    // Şifre validasyonunu validatePassword fonksiyonu ile yap
    const validatedPassword = validatePassword(password);

    return {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password: validatedPassword
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