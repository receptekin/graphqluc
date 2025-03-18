import { authService } from '../services/auth.service.js';
import { createError, ErrorTypes } from '../utils/errorHandler.js';
import { checkAuth } from '../middleware/auth.middleware.js';

export const authResolvers = {
    Mutation: {
        register: async (_, { input }, context) => {
            // Sadece SUPER_ADMIN ve ADMIN rolüne sahip kullanıcılar kayıt yapabilir
            if (!context.user || !['SUPER_ADMIN', 'ADMIN'].includes(context.user.role)) {
                throw createError('Bu işlem için yetkiniz yok!', ErrorTypes.AUTHORIZATION, 403);
            }

            return authService.register(input);
        },

        login: async (_, { email, password }) => {
            return authService.login(email, password);
        },

        logout: async (_, __, context) => {
            // Kullanıcının giriş yapmış olması gerekiyor
            if (!context.user) {
                throw createError('Bu işlem için giriş yapmanız gerekiyor!', ErrorTypes.AUTHENTICATION, 401);
            }

            return authService.logout(context.user.id);
        },

        refreshToken: async (_, { refreshToken }) => {
            return authService.refreshToken(refreshToken);
        },

        adminRegister: async (_, { input }, context) => {
            // Sadece SUPER_ADMIN rolüne sahip kullanıcılar admin oluşturabilir
            if (!context.user || context.user.role !== 'SUPER_ADMIN') {
                throw createError('Bu işlem için SUPER_ADMIN yetkisi gerekiyor!', ErrorTypes.AUTHORIZATION, 403);
            }

            return authService.adminRegister(input, context.user);
        },

        adminLogin: async (_, { email, password }) => {
            return authService.adminLogin(email, password);
        }
    }
}; 