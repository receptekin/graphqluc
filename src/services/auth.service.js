import jwt from 'jsonwebtoken';
import { AUTH_CONFIG } from '../utils/constants.js';
import { createError, ErrorTypes } from '../utils/errorHandler.js';

class AuthService {
    constructor() {
        this.invalidatedTokens = new Set();
        this.loggedOutUsers = new Set();
        this.refreshTokens = new Map();
    }

    generateAccessToken(user) {
        return jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRES }
        );
    }

    generateRefreshToken(user) {
        return jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: AUTH_CONFIG.REFRESH_TOKEN_EXPIRES }
        );
    }

    generateTokens(user) {
        return {
            accessToken: this.generateAccessToken(user),
            refreshToken: this.generateRefreshToken(user)
        };
    }

    isTokenValid(token, userId) {
        return !(this.invalidatedTokens.has(token) || this.loggedOutUsers.has(userId));
    }

    async verifyRefreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw createError(
                    'Refresh token süresi dolmuş, lütfen tekrar giriş yapın!',
                    ErrorTypes.AUTHENTICATION,
                    401
                );
            }
            throw createError(
                'Geçersiz refresh token!',
                ErrorTypes.AUTHENTICATION,
                401
            );
        }
    }

    async saveRefreshToken(userId, refreshToken) {
        try {
            // Burada refresh token'ı veritabanına kaydedebilirsiniz
            // Şimdilik sadece true dönüyoruz
            return true;
        } catch (error) {
            console.error('Save Refresh Token Error:', error);
            throw createError(
                'Refresh token kaydedilemedi!',
                ErrorTypes.DATABASE,
                500
            );
        }
    }

    async deleteRefreshToken(userId) {
        try {
            // Burada refresh token'ı veritabanından silebilirsiniz
            // Şimdilik sadece true dönüyoruz
            return true;
        } catch (error) {
            console.error('Delete Refresh Token Error:', error);
            throw createError(
                'Refresh token silinemedi!',
                ErrorTypes.DATABASE,
                500
            );
        }
    }

    logoutUser(userId) {
        this.loggedOutUsers.add(userId);
    }

    loginUser(userId) {
        this.loggedOutUsers.delete(userId);
    }
}

export const authService = new AuthService(); 