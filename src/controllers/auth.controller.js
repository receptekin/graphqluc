import { authService } from '../services/auth.service.js';
import { superAdminService } from '../services/superAdmin.service.js';
import { adminService } from '../services/admin.service.js';
import { userService } from '../services/user.service.js';
import { validateUser, validatePassword } from '../utils/validators.js';
import { createError, ErrorTypes } from '../utils/errorHandler.js';
import { AUTH_CONFIG } from '../utils/constants.js';
import jwt from 'jsonwebtoken';

export const authController = {
    async register(_, { name, surname, password }, context) {
        try {
            const userData = { name, surname, password };
            validateUser(userData);
            const user = await userService.create(name, surname, password);
            const { accessToken, refreshToken } = await authService.generateTokens(user);
            await authService.saveRefreshToken(user._id, refreshToken);
            return { accessToken, refreshToken, user };
        } catch (error) {
            console.error('Register Error:', error);
            throw error;
        }
    },

    async login(_, { name, password }, context) {
        try {
            console.log('Login attempt for user:', name);
            console.log('Password provided:', password);
            
            // Önce normal kullanıcı olarak dene
            let user = await userService.findByNameAndSurname(name);
            let service = userService;
            console.log('Normal user search result:', user ? {
                id: user._id,
                name: user.name,
                role: user.role,
                hashedPassword: user.password
            } : 'Not found');

            // Normal kullanıcı bulunamazsa admin olarak dene
            if (!user) {
                user = await adminService.findByNameAndSurname(name);
                service = adminService;
                console.log('Admin user search result:', user ? {
                    id: user._id,
                    name: user.name,
                    role: user.role,
                    hashedPassword: user.password
                } : 'Not found');
            }

            // Admin de bulunamazsa super admin olarak dene
            if (!user) {
                user = await superAdminService.findByNameAndSurname(name, null);
                service = superAdminService;
                console.log('Super admin search result:', user ? {
                    id: user._id,
                    name: user.name,
                    role: user.role,
                    hashedPassword: user.password
                } : 'Not found');
            }

            if (!user) {
                throw createError('Kullanıcı bulunamadı!', ErrorTypes.AUTHENTICATION, 401);
            }

            console.log('Found user:', {
                id: user._id,
                name: user.name,
                role: user.role,
                hasPassword: !!user.password,
                hashedPassword: user.password
            });

            // Şifre doğrulama işlemi
            try {
                await service.verifyPassword(user, password);
                console.log('Password verification successful');
                
                const { accessToken, refreshToken } = await authService.generateTokens(user);
                await authService.saveRefreshToken(user._id, refreshToken);
                return { accessToken, refreshToken, user };
            } catch (error) {
                console.error('Password verification failed:', error);
                throw createError('Şifre yanlış!', ErrorTypes.AUTHENTICATION, 401);
            }
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    },

    async refreshToken(_, { refreshToken }, context) {
        try {
            const decoded = await authService.verifyRefreshToken(refreshToken);
            const user = await userService.findById(decoded.userId);
            if (!user) {
                throw createError('Kullanıcı bulunamadı!', ErrorTypes.AUTHENTICATION, 401);
            }

            const { accessToken, refreshToken: newRefreshToken } = await authService.generateTokens(user);
            await authService.saveRefreshToken(user._id, newRefreshToken);
            return { accessToken, refreshToken: newRefreshToken };
        } catch (error) {
            console.error('Refresh Token Error:', error);
            throw error;
        }
    },

    async logout(_, { refreshToken }, context) {
        try {
            const decoded = await authService.verifyRefreshToken(refreshToken);
            await authService.deleteRefreshToken(decoded.userId);
            return true;
        } catch (error) {
            console.error('Logout Error:', error);
            throw error;
        }
    },

    async adminRegister(_, { name, surname, password }, context) {
        try {
            // Context'ten kullanıcı bilgisini al
            if (!context.user) {
                throw createError('Bu işlem için giriş yapmanız gerekiyor!', ErrorTypes.AUTHENTICATION, 401);
            }

            // Kullanıcının super admin olup olmadığını kontrol et
            if (context.user.role !== 'SUPER_ADMIN') {
                throw createError('Bu işlem için süper admin yetkisi gerekiyor!', ErrorTypes.AUTHORIZATION, 403);
            }

            // Kullanıcı verilerini doğrula
            const validatedData = validateUser({ name, surname, password });
            
            // Kullanıcı adı ve soyadı ile kullanıcı var mı kontrol et
            const existingUser = await userService.findByNameAndSurname(validatedData.name, validatedData.surname);
            if (existingUser) {
                throw createError('Bu isim ve soyisimle kayıtlı bir kullanıcı var!', ErrorTypes.VALIDATION, 400);
            }

            // Admin kullanıcısı oluştur
            const user = await userService.createAdmin(validatedData.name, validatedData.surname, validatedData.password);

            // Token'ları oluştur
            const accessToken = authService.generateAccessToken(user);
            const refreshToken = authService.generateRefreshToken(user);

            return {
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    surname: user.surname,
                    role: user.role,
                    createdAt: user.createdAt
                }
            };
        } catch (error) {
            console.error('Admin Register Error:', error);
            throw createError(error.message, error.type || ErrorTypes.INTERNAL, error.code || 500);
        }
    },

    async adminLogin(_, { name, password }, context) {
        try {
            // Kullanıcıyı bul
            const user = await userService.findByNameAndSurname(name);
            if (!user) {
                throw createError('Kullanıcı bulunamadı!', ErrorTypes.AUTHENTICATION, 401);
            }

            // Admin kontrolü
            if (user.role !== 'ADMIN') {
                throw createError('Bu işlem için admin yetkisi gerekiyor!', ErrorTypes.AUTHORIZATION, 403);
            }

            // Şifreyi kontrol et
            await userService.verifyPassword(user, password);

            // Token'ları oluştur
            const accessToken = authService.generateAccessToken(user);
            const refreshToken = authService.generateRefreshToken(user);

            // Refresh token'ı kaydet
            const saved = await authService.saveRefreshToken(user._id.toString(), refreshToken);
            if (!saved) {
                console.warn('Refresh token kaydedilemedi!');
            }

            return {
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    surname: user.surname,
                    role: user.role,
                    createdAt: user.createdAt
                }
            };
        } catch (error) {
            console.error('Admin Login Error:', error);
            if (error.type === ErrorTypes.AUTHENTICATION || error.type === ErrorTypes.AUTHORIZATION) throw error;
            throw createError('Giriş yapılamadı!', ErrorTypes.AUTHENTICATION, 401);
        }
    },

    async superAdminRegister(_, { name, surname, password }, context) {
        try {
            // Veri doğrulama
            const validatedData = validateUser({ name, surname, password });

            // Kullanıcı adı ve soyadı ile kullanıcı var mı kontrol et
            const existingUser = await superAdminService.findByNameAndSurname(validatedData.name, validatedData.surname);
            if (existingUser) {
                throw createError('Bu isim ve soyisimle kayıtlı bir süper admin var!', ErrorTypes.VALIDATION, 400);
            }

            // Süper admin kullanıcısı oluştur
            const user = await superAdminService.create(validatedData.name, validatedData.surname, validatedData.password);

            // Token'ları oluştur
            const accessToken = authService.generateAccessToken(user);
            const refreshToken = authService.generateRefreshToken(user);

            // Refresh token'ı kaydet
            const saved = await authService.saveRefreshToken(user._id.toString(), refreshToken);
            if (!saved) {
                console.warn('Refresh token kaydedilemedi!');
            }

            return {
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    surname: user.surname,
                    role: user.role,
                    createdAt: user.createdAt
                }
            };
        } catch (error) {
            console.error('Super Admin Register Error:', error);
            throw createError(error.message, error.type || ErrorTypes.INTERNAL, error.code || 500);
        }
    }
}; 