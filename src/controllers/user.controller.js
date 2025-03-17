import { userService } from '../services/user.service.js';
import { createError, ErrorTypes } from '../utils/errorHandler.js';
import { validateUser } from '../utils/validators.js';

export const userController = {
    async getAllUsers(_, __, context) {
        try {
            if (!context.user) {
                throw createError('Bu işlem için giriş yapmanız gerekiyor!', ErrorTypes.AUTHENTICATION, 401);
            }

            if (context.user.role !== 'SUPER_ADMIN' && context.user.role !== 'ADMIN') {
                throw createError('Bu işlem için yetkiniz yok!', ErrorTypes.AUTHORIZATION, 403);
            }

            return await userService.findAll();
        } catch (error) {
            console.error('Get All Users Error:', error);
            throw createError(error.message, error.type || ErrorTypes.INTERNAL, error.code || 500);
        }
    },

    async getUserById(_, { id }, context) {
        try {
            if (!context.user) {
                throw createError('Bu işlem için giriş yapmanız gerekiyor!', ErrorTypes.AUTHENTICATION, 401);
            }

            if (context.user.role !== 'SUPER_ADMIN' && context.user.role !== 'ADMIN') {
                throw createError('Bu işlem için yetkiniz yok!', ErrorTypes.AUTHORIZATION, 403);
            }

            return await userService.findById(id);
        } catch (error) {
            console.error('Get User By ID Error:', error);
            throw createError(error.message, error.type || ErrorTypes.INTERNAL, error.code || 500);
        }
    },

    async updateUser(_, { id, name, surname }, context) {
        try {
            if (!context.user) {
                throw createError('Bu işlem için giriş yapmanız gerekiyor!', ErrorTypes.AUTHENTICATION, 401);
            }

            if (context.user.role !== 'SUPER_ADMIN' && context.user.role !== 'ADMIN') {
                throw createError('Bu işlem için yetkiniz yok!', ErrorTypes.AUTHORIZATION, 403);
            }

            const updateData = {};
            if (name) updateData.name = name;
            if (surname) updateData.surname = surname;

            return await userService.update(id, updateData);
        } catch (error) {
            console.error('Update User Error:', error);
            throw createError(error.message, error.type || ErrorTypes.INTERNAL, error.code || 500);
        }
    },

    async deleteUser(_, { id }, context) {
        try {
            if (!context.user) {
                throw createError('Bu işlem için giriş yapmanız gerekiyor!', ErrorTypes.AUTHENTICATION, 401);
            }

            if (context.user.role !== 'SUPER_ADMIN' && context.user.role !== 'ADMIN') {
                throw createError('Bu işlem için yetkiniz yok!', ErrorTypes.AUTHORIZATION, 403);
            }

            await userService.delete(id);
            return {
                success: true,
                message: 'Kullanıcı başarıyla silindi!'
            };
        } catch (error) {
            console.error('Delete User Error:', error);
            throw createError(error.message, error.type || ErrorTypes.INTERNAL, error.code || 500);
        }
    },

    async updateUserRole(_, { id, role }, context) {
        try {
            if (!context.user) {
                throw createError('Bu işlem için giriş yapmanız gerekiyor!', ErrorTypes.AUTHENTICATION, 401);
            }

            if (context.user.role !== 'SUPER_ADMIN') {
                throw createError('Bu işlem için süper admin yetkisi gerekiyor!', ErrorTypes.AUTHORIZATION, 403);
            }

            return await userService.updateUserRole(id, role);
        } catch (error) {
            console.error('Update User Role Error:', error);
            throw createError(error.message, error.type || ErrorTypes.INTERNAL, error.code || 500);
        }
    },

    async createAdmin(_, { name, surname, password }, context) {
        try {
            if (!context.user) {
                throw createError('Bu işlem için giriş yapmanız gerekiyor!', ErrorTypes.AUTHENTICATION, 401);
            }

            if (context.user.role !== 'SUPER_ADMIN') {
                throw createError('Bu işlem için süper admin yetkisi gerekiyor!', ErrorTypes.AUTHORIZATION, 403);
            }

            // Veri doğrulama
            const validatedData = validateUser({ name, surname, password });

            // Admin oluştur
            return await userService.createAdmin(validatedData.name, validatedData.surname, validatedData.password);
        } catch (error) {
            console.error('Create Admin Error:', error);
            throw createError(error.message, error.type || ErrorTypes.INTERNAL, error.code || 500);
        }
    }
}; 