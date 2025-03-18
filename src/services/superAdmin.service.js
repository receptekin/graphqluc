import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import { AUTH_CONFIG } from '../utils/constants.js';
import { createError, ErrorTypes } from '../utils/errorHandler.js';

class SuperAdminService {
    async findByEmail(email) {
        try {
            return await User.findOne({ email: email.toLowerCase(), role: 'SUPER_ADMIN' });
        } catch (error) {
            throw createError(
                `Süper admin arama hatası: ${error.message}`,
                ErrorTypes.DATABASE,
                500
            );
        }
    }

    async create(firstName, lastName, email, password) {
        try {
            console.log('Creating Super Admin:', {
                firstName,
                lastName,
                email,
                role: 'SUPER_ADMIN'
            });

            // Önce mevcut süper admin var mı kontrol et
            const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
            if (existingSuperAdmin) {
                throw createError(
                    `Sistemde zaten bir süper admin bulunmaktadır! (${existingSuperAdmin.email})`,
                    ErrorTypes.VALIDATION,
                    400
                );
            }

            // Email ile kullanıcı var mı kontrol et
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
                firstName,
                lastName,
                email: email.toLowerCase(),
                password,
                role: 'SUPER_ADMIN'
            });

            const savedUser = await user.save();
            console.log('Created Super Admin:', {
                id: savedUser._id,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email,
                role: savedUser.role,
                hasPassword: !!savedUser.password
            });
            return savedUser;
        } catch (error) {
            console.error('Create Super Admin Error:', error);
            if (error.code === 11000) {
                if (error.keyPattern.role) {
                    throw createError(
                        `Sistemde zaten bir süper admin bulunmaktadır! (${email.toLowerCase()})`,
                        ErrorTypes.VALIDATION,
                        400
                    );
                }
                throw createError(
                    `Bu email adresi (${email.toLowerCase()}) ile kayıtlı bir kullanıcı bulunmaktadır!`,
                    ErrorTypes.VALIDATION,
                    400
                );
            }
            throw createError(
                `Süper admin oluşturma hatası: ${error.message}`,
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
                throw createError('Süper admin şifresi bulunamadı!', ErrorTypes.AUTHENTICATION, 401);
            }

            console.log('Verifying Super Admin password:', {
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
            console.error('Super Admin Password Verification Error:', error);
            if (error.type === ErrorTypes.AUTHENTICATION) throw error;
            throw createError('Şifre doğrulama hatası!', ErrorTypes.AUTHENTICATION, 401);
        }
    }
}

export const superAdminService = new SuperAdminService(); 