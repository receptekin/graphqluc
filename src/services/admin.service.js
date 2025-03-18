import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import { AUTH_CONFIG } from '../utils/constants.js';
import { createError, ErrorTypes } from '../utils/errorHandler.js';

class AdminService {
    async findByEmail(email) {
        try {
            return await User.findOne({ email: email.toLowerCase(), role: 'ADMIN' });
        } catch (error) {
            throw createError(
                `Admin arama hatası: ${error.message}`,
                ErrorTypes.DATABASE,
                500
            );
        }
    }

    async create(name, surname, email, password) {
        try {
            console.log('Creating Admin:', {
                name,
                surname,
                email,
                role: 'ADMIN'
            });

            const existingUser = await User.findOne({ 
                $or: [
                    { email: email.toLowerCase() }
                ]
            });

            if (existingUser) {
                throw createError(
                    `Bu email adresi (${email.toLowerCase()}) ile kayıtlı bir ${existingUser.role.toLowerCase()} kullanıcısı bulunmaktadır!`,
                    ErrorTypes.VALIDATION,
                    400
                );
            }

            const user = new User({
                name,
                surname,
                email: email.toLowerCase(),
                password,
                role: 'ADMIN'
            });

            const savedUser = await user.save();
            console.log('Created Admin:', {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role,
                hasPassword: !!savedUser.password
            });
            return savedUser;
        } catch (error) {
            console.error('Create Admin Error:', error);
            if (error.code === 11000) {
                throw createError(
                    `Bu email adresi (${email.toLowerCase()}) ile kayıtlı bir kullanıcı bulunmaktadır!`,
                    ErrorTypes.VALIDATION,
                    400
                );
            }
            throw createError(
                `Admin oluşturma hatası: ${error.message}`,
                ErrorTypes.DATABASE,
                500
            );
        }
    }

    async verifyPassword(user, plainPassword) {
        try {
            if (!user.password) {
                console.error('User has no password:', {
                    id: user._id,
                    name: user.name,
                    role: user.role
                });
                throw createError('Admin şifresi bulunamadı!', ErrorTypes.AUTHENTICATION, 401);
            }

            console.log('Verifying Admin password:', {
                userId: user._id,
                userName: user.name,
                userRole: user.role
            });

            const isValid = await user.comparePassword(plainPassword);
            console.log('Password verification result:', isValid);

            if (!isValid) {
                throw createError('Şifre yanlış!', ErrorTypes.AUTHENTICATION, 401);
            }
            return true;
        } catch (error) {
            console.error('Admin Password Verification Error:', error);
            if (error.type === ErrorTypes.AUTHENTICATION) throw error;
            throw createError('Şifre doğrulama hatası!', ErrorTypes.AUTHENTICATION, 401);
        }
    }
}

export const adminService = new AdminService(); 