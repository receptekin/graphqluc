import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import { AUTH_CONFIG } from '../utils/constants.js';
import { createError, ErrorTypes } from '../utils/errorHandler.js';

class SuperAdminService {
    async findByNameAndSurname(name, surname = null) {
        try {
            const query = { name, role: 'SUPER_ADMIN' };
            if (surname) {
                query.surname = surname;
            }
            const user = await User.findOne(query);
            console.log('SuperAdminService.findByNameAndSurname result:', user ? {
                id: user._id,
                name: user.name,
                role: user.role,
                hasPassword: !!user.password
            } : 'Not found');
            return user;
        } catch (error) {
            throw createError(
                `Süper admin arama hatası: ${error.message}`,
                ErrorTypes.DATABASE,
                500
            );
        }
    }

    async create(name, surname, password) {
        try {
            console.log('Creating Super Admin with password:', {
                name,
                surname,
                role: 'SUPER_ADMIN'
            });

            const user = new User({
                name,
                surname,
                password,
                role: 'SUPER_ADMIN'
            });
            const savedUser = await user.save();
            console.log('Created Super Admin:', {
                id: savedUser._id,
                name: savedUser.name,
                role: savedUser.role,
                hasPassword: !!savedUser.password
            });
            return savedUser;
        } catch (error) {
            console.error('Create Super Admin Error:', error);
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