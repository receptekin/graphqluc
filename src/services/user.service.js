import { User } from '../models/user.js';
import bcrypt from 'bcryptjs';
import { AUTH_CONFIG } from '../utils/constants.js';
import { createError, ErrorTypes } from '../utils/errorHandler.js';
import { validateUser } from '../utils/validators.js';
import { hashPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

export const userService = {
    // Tüm kullanıcıları getir
    async getAllUsers(currentUser) {
        try {
            // SUPER_ADMIN tüm kullanıcıları görebilir
            if (currentUser.role === 'SUPER_ADMIN') {
                return await User.find();
            }
            // ADMIN sadece USER rolündeki kullanıcıları görebilir
            return await User.find({ role: 'USER' });
        } catch (error) {
            throw createError('Kullanıcılar getirilirken bir hata oluştu!', ErrorTypes.DATABASE, 500);
        }
    },

    // ID'ye göre kullanıcı getir
    async findById(id) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw createError('Kullanıcı bulunamadı!', ErrorTypes.NOT_FOUND, 404);
            }
            return user;
        } catch (error) {
            if (error.name === 'CastError') {
                throw createError('Geçersiz kullanıcı ID!', ErrorTypes.VALIDATION, 400);
            }
            throw error;
        }
    },

    // Kullanıcı kaydı
    async register(input) {
        try {
            const user = await User.create(input);
            return user;
        } catch (error) {
            if (error.code === 11000) {
                throw createError('Bu email adresi ile kayıtlı bir kullanıcı var!', ErrorTypes.VALIDATION, 400);
            }
            throw error;
        }
    },

    // Kullanıcı güncelleme
    async update(id, input) {
        try {
            // Şifre güncelleniyorsa hashle
            if (input.password) {
                input.password = await hashPassword(input.password);
            }

            const user = await User.findByIdAndUpdate(
                id,
                { $set: input },
                { new: true, runValidators: true }
            );

            if (!user) {
                throw createError('Kullanıcı bulunamadı!', ErrorTypes.NOT_FOUND, 404);
            }

            return user;
        } catch (error) {
            if (error.code === 11000) {
                throw createError('Bu email adresi ile kayıtlı bir kullanıcı var!', ErrorTypes.VALIDATION, 400);
            }
            throw error;
        }
    },

    // Kullanıcı silme
    async delete(id) {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw createError('Kullanıcı bulunamadı!', ErrorTypes.NOT_FOUND, 404);
        }
        return true;
    },

    // Kullanıcı rolü güncelleme
    async updateUserRole(userId, role) {
        try {
            const user = await this.findById(userId);
            user.role = role;
            await user.save();
            return user;
        } catch (error) {
            throw error;
        }
    },

    // Super Admin oluşturma
    async createSuperAdmin(userData) {
        try {
            userData.role = 'SUPER_ADMIN';
            return await this.register(userData);
        } catch (error) {
            throw error;
        }
    },

    // Admin oluşturma
    async createAdmin(userData) {
        try {
            userData.role = 'ADMIN';
            return await this.register(userData);
        } catch (error) {
            throw error;
        }
    },

    async findByFirstNameAndLastName(firstName, lastName = null) {
        try {
            const query = { firstName };
            if (lastName) {
                query.lastName = lastName;
            }
            const user = await User.findOne(query);
            return user;
        } catch (error) {
            throw createError(
                `Kullanıcı arama hatası: ${error.message}`,
                ErrorTypes.DATABASE,
                500
            );
        }
    },

    async findByEmail(email) {
        return await User.findOne({ email }).select('+password');
    },

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
    },

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
    },

    async getCurrentUser() {
        try {
            // Context'ten kullanıcı bilgisini al
            const context = global.context;
            if (!context || !context.user) {
                return null;
            }
            return context.user;
        } catch (error) {
            console.error('Get Current User Error:', error);
            return null;
        }
    },

    async findByRole(role) {
        return await User.find({ role });
    },

    async findAll() {
        return await User.find().sort({ createdAt: -1 });
    }
}; 