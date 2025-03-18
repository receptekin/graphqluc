import { userService } from '../../../services/user.service.js';
import { createError, ErrorTypes } from '../../../utils/errorHandler.js';
import { validateUser } from '../../../utils/validators.js';
import { authController } from '../../../controllers/auth.controller.js';

export const adminMutations = {
    adminRegister: async (_, args, context) => {
        return authController.adminRegister(_, args, context);
    },

    adminLogin: async (_, args, context) => {
        return authController.adminLogin(_, args, context);
    },

    createAdmin: async (_, { name, surname, email, password }, context) => {
        try {
            // Kullanıcı verilerini doğrula
            const validatedData = validateUser({ name, surname, email, password });
            
            // Email ile kullanıcı var mı kontrol et
            const existingUser = await userService.findByEmail(validatedData.email);
            if (existingUser) {
                throw createError('Bu email adresi ile kayıtlı bir kullanıcı var!', ErrorTypes.VALIDATION, 400);
            }

            // Admin kullanıcısı oluştur
            return await userService.createAdmin(validatedData.name, validatedData.surname, validatedData.email, validatedData.password);
        } catch (error) {
            throw createError('Admin kullanıcısı oluşturulamadı!', ErrorTypes.DATABASE, 500);
        }
    },

    updateUserRole: async (_, { id, role }, context) => {
        try {
            // Role değerini kontrol et
            if (!['user', 'admin'].includes(role)) {
                throw createError('Geçersiz rol!', ErrorTypes.VALIDATION, 400);
            }

            // Kullanıcıyı bul
            const user = await userService.findById(id);
            if (!user) {
                throw createError('Kullanıcı bulunamadı!', ErrorTypes.NOT_FOUND, 404);
            }

            // Kullanıcının rolünü güncelle
            user.role = role;
            return await user.save();
        } catch (error) {
            throw createError('Kullanıcı rolü güncellenemedi!', ErrorTypes.DATABASE, 500);
        }
    },

    deleteUser: async (_, { id }, context) => {
        try {
            // Kullanıcıyı bul
            const user = await userService.findById(id);
            if (!user) {
                throw createError('Kullanıcı bulunamadı!', ErrorTypes.NOT_FOUND, 404);
            }

            // Kullanıcıyı sil
            return await userService.delete(id);
        } catch (error) {
            throw createError('Kullanıcı silinemedi!', ErrorTypes.DATABASE, 500);
        }
    }
}; 