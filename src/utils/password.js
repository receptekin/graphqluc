import bcrypt from 'bcryptjs';
import { AUTH_CONFIG } from './constants.js';
import { createError, ErrorTypes } from './errorHandler.js';

export const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(AUTH_CONFIG.SALT_ROUNDS);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        throw createError('Şifre hashleme hatası!', ErrorTypes.AUTHENTICATION, 500);
    }
};

export const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        throw createError('Şifre karşılaştırma hatası!', ErrorTypes.AUTHENTICATION, 500);
    }
};

export const validatePassword = (password) => {
    if (!password) {
        throw createError('Şifre alanı zorunludur!', ErrorTypes.VALIDATION, 400);
    }

    if (password.length < 6) {
        throw createError('Şifre en az 6 karakter olmalıdır!', ErrorTypes.VALIDATION, 400);
    }

    if (!/[a-zA-Z]/.test(password)) {
        throw createError('Şifre en az bir harf içermelidir!', ErrorTypes.VALIDATION, 400);
    }

    if (!/[0-9]/.test(password)) {
        throw createError('Şifre en az bir rakam içermelidir!', ErrorTypes.VALIDATION, 400);
    }

    return true;
}; 