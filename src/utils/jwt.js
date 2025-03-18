import jwt from 'jsonwebtoken';
import { AUTH_CONFIG } from './constants.js';
import { createError, ErrorTypes } from './errorHandler.js';

export const generateToken = (user, expiresIn) => {
    try {
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        return jwt.sign(payload, AUTH_CONFIG.JWT_SECRET, { expiresIn });
    } catch (error) {
        throw createError('Token oluşturma hatası!', ErrorTypes.AUTHENTICATION, 500);
    }
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, AUTH_CONFIG.JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw createError('Token süresi dolmuş!', ErrorTypes.AUTHENTICATION, 401);
        }
        throw createError('Geçersiz token!', ErrorTypes.AUTHENTICATION, 401);
    }
};

export const generateAccessToken = (user) => {
    return generateToken(user, AUTH_CONFIG.ACCESS_TOKEN_EXPIRES_IN);
};

export const generateRefreshToken = (user) => {
    return generateToken(user, AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN);
}; 