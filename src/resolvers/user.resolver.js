import { userService } from '../services/user.service.js';
import { createError, ErrorTypes } from '../utils/errorHandler.js';

export const userResolvers = {
    Query: {
        users: async () => {
            return userService.findAll();
        }
    },

    Mutation: {
        updateUser: async (_, { id, input }, context) => {
            // Sadece SUPER_ADMIN ve ADMIN rolüne sahip kullanıcılar güncelleme yapabilir
            if (!context.user || !['SUPER_ADMIN', 'ADMIN'].includes(context.user.role)) {
                throw createError('Bu işlem için yetkiniz yok!', ErrorTypes.AUTHORIZATION, 403);
            }

            // SUPER_ADMIN herkesi güncelleyebilir, ADMIN sadece USER rolündeki kullanıcıları güncelleyebilir
            const userToUpdate = await userService.findById(id);
            if (!userToUpdate) {
                throw createError('Kullanıcı bulunamadı!', ErrorTypes.NOT_FOUND, 404);
            }

            if (context.user.role === 'ADMIN' && userToUpdate.role !== 'USER') {
                throw createError('Bu kullanıcıyı güncelleyemezsiniz!', ErrorTypes.AUTHORIZATION, 403);
            }

            return userService.update(id, input);
        },

        deleteUser: async (_, { id }, context) => {
            // Sadece SUPER_ADMIN ve ADMIN rolüne sahip kullanıcılar silme yapabilir
            if (!context.user || !['SUPER_ADMIN', 'ADMIN'].includes(context.user.role)) {
                throw createError('Bu işlem için yetkiniz yok!', ErrorTypes.AUTHORIZATION, 403);
            }

            // Silinecek kullanıcıyı bul
            const userToDelete = await userService.findById(id);
            if (!userToDelete) {
                throw createError('Kullanıcı bulunamadı!', ErrorTypes.NOT_FOUND, 404);
            }

            // ADMIN kullanıcıları sadece USER rolündeki kullanıcıları silebilir
            if (context.user.role === 'ADMIN' && userToDelete.role !== 'USER') {
                throw createError('Bu kullanıcıyı silemezsiniz!', ErrorTypes.AUTHORIZATION, 403);
            }

            return userService.delete(id);
        }
    }
}; 