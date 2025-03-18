import { userService } from './user.service.js';
import { createError, ErrorTypes } from '../utils/errorHandler.js';
import { generateToken, verifyToken } from '../utils/jwt.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { RefreshToken } from '../models/refreshToken.js';

export const authService = {
    async register(input) {
        // Email adresini küçük harfe çevir
        input.email = input.email.toLowerCase();

        // Eğer rol belirtilmemişse USER olarak ayarla
        if (!input.role) {
            input.role = 'USER';
        }

        // Şifreyi hashle
        input.password = await hashPassword(input.password);

        // Kullanıcıyı oluştur
        const user = await userService.register(input);
        return user;
    },

    async login(email, password) {
        try {
            const user = await userService.findByEmail(email);
            if (!user) {
                throw createError('Geçersiz email veya şifre!', ErrorTypes.AUTHENTICATION, 401);
            }

            const isPasswordValid = await comparePassword(password, user.password);
            if (!isPasswordValid) {
                throw createError('Geçersiz email veya şifre!', ErrorTypes.AUTHENTICATION, 401);
            }

            if (!user.isActive) {
                throw createError('Hesabınız aktif değil!', ErrorTypes.AUTHENTICATION, 401);
            }

            const { accessToken, refreshToken } = await this.generateTokens(user);

            return {
                user,
                accessToken,
                refreshToken
            };
        } catch (error) {
            throw error;
        }
    },

    async generateTokens(user) {
        const accessToken = generateToken(user, '1h');
        const refreshToken = generateToken(user, '7d');

        // Refresh token'ı veritabanına kaydet
        await RefreshToken.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 gün
        });

        return {
            accessToken,
            refreshToken
        };
    },

    async refreshToken(refreshToken) {
        try {
            const decoded = await verifyToken(refreshToken);
            const user = await userService.findById(decoded.id);

            if (!user.isActive) {
                throw createError('Hesabınız aktif değil!', ErrorTypes.AUTHENTICATION, 401);
            }

            const tokens = await this.generateTokens(user);
            return tokens;
        } catch (error) {
            throw createError('Geçersiz veya süresi dolmuş token!', ErrorTypes.AUTHENTICATION, 401);
        }
    },

    async logout(userId) {
        try {
            // Kullanıcının tüm refresh token'larını sil
            await RefreshToken.deleteMany({ userId });

            return true;
        } catch (error) {
            throw error;
        }
    },

    async findByRole(role) {
        return await userService.findByRole(role);
    },

    async adminRegister(input, currentUser) {
        // Email adresini küçük harfe çevir
        input.email = input.email.toLowerCase();

        // Rolü ADMIN olarak ayarla
        input.role = 'ADMIN';

        // Şifreyi hashle
        input.password = await hashPassword(input.password);

        // Kullanıcıyı oluştur
        const user = await userService.register(input);

        // Token'ları oluştur
        const { accessToken, refreshToken } = await this.generateTokens(user);

        return {
            user,
            accessToken,
            refreshToken
        };
    },

    async adminLogin(email, password) {
        try {
            const user = await userService.findByEmail(email);
            if (!user) {
                throw createError('Geçersiz email veya şifre!', ErrorTypes.AUTHENTICATION, 401);
            }

            // Sadece ADMIN rolüne sahip kullanıcılar giriş yapabilir
            if (user.role !== 'ADMIN') {
                throw createError('Bu giriş sadece adminler içindir!', ErrorTypes.AUTHENTICATION, 401);
            }

            const isPasswordValid = await comparePassword(password, user.password);
            if (!isPasswordValid) {
                throw createError('Geçersiz email veya şifre!', ErrorTypes.AUTHENTICATION, 401);
            }

            if (!user.isActive) {
                throw createError('Hesabınız aktif değil!', ErrorTypes.AUTHENTICATION, 401);
            }

            const { accessToken, refreshToken } = await this.generateTokens(user);

            return {
                user,
                accessToken,
                refreshToken
            };
        } catch (error) {
            throw error;
        }
    }
}; 