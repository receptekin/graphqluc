import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import { AUTH_CONFIG } from '../utils/constants.js';
import { createError, ErrorTypes } from '../utils/errorHandler.js';

class UserService {
    async findByNameAndSurname(name, surname = null) {
        try {
            const query = { name, role: 'USER' };
            if (surname) {
                query.surname = surname;
            }
            const user = await User.findOne(query);
            console.log('UserService.findByNameAndSurname result:', user ? {
                id: user._id,
                name: user.name,
                surname: user.surname,
                role: user.role,
                hasPassword: !!user.password
            } : 'Not found');
            return user;
        } catch (error) {
            throw createError(
                `Kullanıcı arama hatası: ${error.message}`,
                ErrorTypes.DATABASE,
                500
            );
        }
    }

    async findById(id) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw createError('Kullanıcı bulunamadı!', ErrorTypes.NOT_FOUND, 404);
            }
            return user;
        } catch (error) {
            if (error.type === ErrorTypes.NOT_FOUND) throw error;
            throw createError(
                `Kullanıcı arama hatası: ${error.message}`,
                ErrorTypes.DATABASE,
                500
            );
        }
    }

    async create(name, surname, password) {
        try {
            console.log('Creating User:', {
                name,
                surname,
                role: 'USER'
            });

            const user = new User({
                name,
                surname,
                password,
                role: 'USER'
            });

            const savedUser = await user.save();
            console.log('Created User:', {
                id: savedUser._id,
                name: savedUser.name,
                role: savedUser.role,
                hasPassword: !!savedUser.password
            });
            return savedUser;
        } catch (error) {
            console.error('Create User Error:', error);
            throw createError(
                `Kullanıcı oluşturma hatası: ${error.message}`,
                ErrorTypes.DATABASE,
                500
            );
        }
    }

    async verifyPassword(user, plainPassword) {
        try {
            if (!user.password) {
                throw createError('Kullanıcı şifresi bulunamadı!', ErrorTypes.AUTHENTICATION, 401);
            }

            console.log('Verifying User password:', {
                plainPassword,
                hashedPassword: user.password,
                userId: user._id,
                userRole: user.role
            });

            const isValid = await bcrypt.compare(plainPassword, user.password);
            console.log('Password verification result:', isValid);

            if (!isValid) {
                throw createError('Şifre yanlış!', ErrorTypes.AUTHENTICATION, 401);
            }
            return true;
        } catch (error) {
            console.error('User Password Verification Error:', error);
            if (error.type === ErrorTypes.AUTHENTICATION) throw error;
            throw createError('Şifre doğrulama hatası!', ErrorTypes.AUTHENTICATION, 401);
        }
    }

    async updatePassword(userId, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, AUTH_CONFIG.SALT_ROUNDS);
            return await User.findByIdAndUpdate(
                userId,
                { password: hashedPassword },
                { new: true }
            );
        } catch (error) {
            throw createError(
                `Şifre güncelleme hatası: ${error.message}`,
                ErrorTypes.DATABASE,
                500
            );
        }
    }

    async update(id, updateData) {
        try {
            return await User.findByIdAndUpdate(id, updateData, { new: true });
        } catch (error) {
            throw createError(
                `Kullanıcı güncelleme hatası: ${error.message}`,
                ErrorTypes.DATABASE,
                500
            );
        }
    }

    async delete(id) {
        try {
            const user = await User.findByIdAndDelete(id);
            if (!user) {
                throw createError(
                    'Silinecek kullanıcı bulunamadı!',
                    ErrorTypes.NOT_FOUND,
                    404
                );
            }
            return user;
        } catch (error) {
            if (error.type === ErrorTypes.NOT_FOUND) throw error;
            throw createError(
                `Kullanıcı silme hatası: ${error.message}`,
                ErrorTypes.DATABASE,
                500
            );
        }
    }

    async createAdmin(name, surname, password) {
        try {
            console.log('Creating Admin:', {
                name,
                surname,
                role: 'ADMIN'
            });

            const user = new User({
                name,
                surname,
                password,
                role: 'ADMIN'
            });

            const savedUser = await user.save();
            console.log('Created Admin:', {
                id: savedUser._id,
                name: savedUser.name,
                role: savedUser.role,
                hasPassword: !!savedUser.password
            });
            return savedUser;
        } catch (error) {
            console.error('Create Admin Error:', error);
            throw createError('Admin kullanıcı oluşturulamadı!', ErrorTypes.DATABASE, 500);
        }
    }

    async findAll() {
        try {
            return await User.find().select('-password');
        } catch (error) {
            throw createError('Kullanıcılar alınamadı!', ErrorTypes.DATABASE, 500);
        }
    }

    async updateUserRole(userId, role) {
        try {
            const user = await User.findByIdAndUpdate(
                userId,
                { role },
                { new: true }
            );
            
            if (!user) {
                throw createError('Kullanıcı bulunamadı!', ErrorTypes.NOT_FOUND, 404);
            }
            
            return user;
        } catch (error) {
            console.error('Update User Role Error:', error);
            throw createError(
                `Kullanıcı rolü güncellenemedi: ${error.message}`,
                ErrorTypes.DATABASE,
                500
            );
        }
    }
}

export const userService = new UserService(); 