import { userService } from '../services/user.service.js';
import { authService } from '../services/auth.service.js';
import { createError, ErrorTypes } from '../utils/errorHandler.js';
import { validateUser } from '../utils/validators.js';

export const resolvers = {
    Query: {
        users: async (_, args, context) => {
            return await userService.getAllUsers(context.user);
        },

        user: async (_, { id }, context) => {
            const user = await userService.findById(id);
            
            if (context.user.role === 'ADMIN' && user.role === 'SUPER_ADMIN') {
                throw createError('Bu işlem için yetkiniz yok!', ErrorTypes.AUTHORIZATION, 403);
            }

            return user;
        },

        me: async (_, args, context) => {
            return context.user;
        }
    },

    Mutation: {
        // Auth Mutations
        login: async (_, { email, password }) => {
            return await authService.login(email, password);
        },

        refreshToken: async (_, { refreshToken }) => {
            return await authService.refreshToken(refreshToken);
        },

        logout: async (_, args, context) => {
            return await authService.logout(context.user.id);
        },

        // User Mutations
        register: async (_, { input }, context) => {
            if (context.user && context.user.role !== 'SUPER_ADMIN') {
                throw createError('Bu işlem için yetkiniz yok!', ErrorTypes.AUTHORIZATION, 403);
            }

            if (context.user && context.user.role === 'SUPER_ADMIN' && input.role === 'SUPER_ADMIN') {
                throw createError('Sistemde sadece bir tane SUPER_ADMIN olabilir!', ErrorTypes.AUTHORIZATION, 403);
            }

            if (context.user && context.user.role === 'ADMIN' && input.role === 'ADMIN') {
                throw createError('ADMIN rolüne sahip kullanıcılar başka ADMIN oluşturamaz!', ErrorTypes.AUTHORIZATION, 403);
            }

            const validatedData = validateUser(input);
            const user = await userService.register(validatedData);
            
            // Token'ları oluştur
            const { accessToken, refreshToken } = await authService.generateTokens(user);

            return {
                user,
                accessToken,
                refreshToken
            };
        },

        updateUser: async (_, { id, input }, context) => {
            if (context.user.role === 'ADMIN') {
                const targetUser = await userService.findById(id);
                if (targetUser.role === 'SUPER_ADMIN') {
                    throw createError('Bu işlem için yetkiniz yok!', ErrorTypes.AUTHORIZATION, 403);
                }
            }

            return await userService.update(id, input, context.user);
        },

        deleteUser: async (_, { id }, context) => {
            const targetUser = await userService.findById(id);
            
            if (context.user.role === 'ADMIN' && targetUser.role === 'SUPER_ADMIN') {
                throw createError('Bu işlem için yetkiniz yok!', ErrorTypes.AUTHORIZATION, 403);
            }

            return await userService.delete(id, context.user);
        },

        updateUserRole: async (_, { userId, role }, context) => {
            return await userService.updateUserRole(userId, role);
        },

        superAdminRegister: async (_, { input }) => {
            const existingSuperAdmin = await userService.findByRole('SUPER_ADMIN');
            if (existingSuperAdmin && existingSuperAdmin.length > 0) {
                throw createError('Sistemde zaten bir SUPER_ADMIN var!', ErrorTypes.VALIDATION, 400);
            }

            const validatedData = validateUser(input);
            const user = await userService.createSuperAdmin(validatedData);
            
            // Token'ları oluştur
            const { accessToken, refreshToken } = await authService.generateTokens(user);

            return {
                user,
                accessToken,
                refreshToken
            };
        },

        adminRegister: async (_, { input }, context) => {
            if (!context.user || context.user.role !== 'SUPER_ADMIN') {
                throw createError('Bu işlem için SUPER_ADMIN yetkisi gerekiyor!', ErrorTypes.AUTHORIZATION, 403);
            }

            const validatedData = validateUser(input);
            const user = await userService.createAdmin(validatedData);
            
            // Token'ları oluştur
            const { accessToken, refreshToken } = await authService.generateTokens(user);

            return {
                user,
                accessToken,
                refreshToken
            };
        }
    }
}; 