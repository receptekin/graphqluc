import { userService } from '../../../services/user.service.js';
import { createError, ErrorTypes } from '../../../utils/errorHandler.js';

export const adminQueries = {
    adminStats: async (_, __, context) => {
        try {
            const users = await userService.findAll();
            const admins = users.filter(user => user.role === 'admin');
            const recentUsers = users
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 5);

            return {
                totalUsers: users.length,
                totalAdmins: admins.length,
                recentUsers
            };
        } catch (error) {
            throw createError('İstatistikler alınamadı!', ErrorTypes.DATABASE, 500);
        }
    },

    getAllUsers: async (_, __, context) => {
        try {
            return await userService.findAll();
        } catch (error) {
            throw createError('Kullanıcılar alınamadı!', ErrorTypes.DATABASE, 500);
        }
    },

    getUserById: async (_, { id }, context) => {
        try {
            const user = await userService.findById(id);
            if (!user) {
                throw createError('Kullanıcı bulunamadı!', ErrorTypes.NOT_FOUND, 404);
            }
            return user;
        } catch (error) {
            throw createError('Kullanıcı bilgileri alınamadı!', ErrorTypes.DATABASE, 500);
        }
    }
}; 