import { verifyToken } from '../utils/jwt.js';
import { userService } from '../services/user.service.js';
import { createError, ErrorTypes } from '../utils/errorHandler.js';

export const authMiddleware = async ({ req }) => {
    try {
        // req.headers kontrolü
        if (!req || !req.headers) {
            return { user: null };
        }

        // Authorization header'ı kontrol et
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { user: null };
        }

        // Token'ı al ve doğrula
        const token = authHeader.split(' ')[1];
        const decoded = await verifyToken(token);

        // Kullanıcıyı bul
        const user = await userService.findById(decoded.id);
        if (!user) {
            throw createError('Kullanıcı bulunamadı!', ErrorTypes.AUTHENTICATION, 401);
        }

        // Kullanıcı aktif değilse hata fırlat
        if (!user.isActive) {
            throw createError('Kullanıcı hesabı aktif değil!', ErrorTypes.AUTHENTICATION, 401);
        }

        return { user };
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return { user: null };
    }
}; 