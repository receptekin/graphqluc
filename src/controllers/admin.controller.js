import { adminService } from '../services/admin.service.js';
import { createError, ErrorTypes } from '../utils/errorHandler.js';
import { validateUser } from '../utils/validators.js';

class AdminController {
    async register(name, surname, email, password) {
        try {
            console.log('Admin Register Request:', { name, surname, email });
            
            // Kullanıcı bilgilerini doğrula
            const validatedData = validateUser({ name, surname, email, password });
            if (!validatedData) {
                throw createError('Geçersiz kullanıcı bilgileri!', ErrorTypes.VALIDATION, 400);
            }

            // Email ile kullanıcı var mı kontrol et
            const existingUser = await adminService.findByEmail(email);
            if (existingUser) {
                throw createError(
                    `Bu email adresi (${email.toLowerCase()}) ile kayıtlı bir admin kullanıcısı bulunmaktadır!`,
                    ErrorTypes.VALIDATION,
                    400
                );
            }

            // Admin oluştur
            const admin = await adminService.create(
                validatedData.name,
                validatedData.surname,
                validatedData.email,
                validatedData.password
            );

            console.log('Admin registered successfully:', {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            });

            return admin;
        } catch (error) {
            console.error('Admin Register Error:', error);
            if (error.type === ErrorTypes.VALIDATION) {
                throw createError(error.message, ErrorTypes.VALIDATION, 400);
            }
            throw createError(
                `Admin kayıt işlemi başarısız: ${error.message}`,
                ErrorTypes.DATABASE,
                500
            );
        }
    }

    async login(email, password) {
        try {
            console.log('Admin Login Request:', { email });
            
            // Email ile kullanıcı var mı kontrol et
            const admin = await adminService.findByEmail(email);
            if (!admin) {
                throw createError(
                    `Bu email adresi (${email.toLowerCase()}) ile kayıtlı bir admin kullanıcısı bulunmamaktadır!`,
                    ErrorTypes.AUTHENTICATION,
                    401
                );
            }

            // Şifreyi doğrula
            await adminService.verifyPassword(admin, password);

            console.log('Admin logged in successfully:', {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            });

            return admin;
        } catch (error) {
            console.error('Admin Login Error:', error);
            if (error.type === ErrorTypes.AUTHENTICATION) {
                throw createError(error.message, ErrorTypes.AUTHENTICATION, 401);
            }
            throw createError(
                `Admin giriş işlemi başarısız: ${error.message}`,
                ErrorTypes.DATABASE,
                500
            );
        }
    }
}

export const adminController = new AdminController(); 