import { authController } from '../../../controllers/auth.controller.js';
import { userService } from '../../../services/user.service.js';
import mongoose from 'mongoose';

export const userMutations = {
    // Auth mutations
    register: authController.register,
    login: authController.login,
    refreshToken: authController.refreshToken,
    logout: authController.logout,

    // User mutations
    async deleteUser(_, { id }) {
        try {
            return await userService.delete(id);
        } catch (error) {
            console.error('Delete User Error:', error);
            throw new Error(`Error deleting user: ${error.message}`);
        }
    },

    async updateUser(_, { id, name, surname }) {
        try {
            if (name || surname) {
                const existingUser = await userService.findByNameAndSurname(name, surname);
                if (existingUser && existingUser.id !== id) {
                    throw new Error(`${name || existingUser.name} ${surname || existingUser.surname} isimli başka bir kullanıcı zaten mevcut!`);
                }
            }

            return await userService.update(id, { name, surname });
        } catch (error) {
            console.error('Update User Error:', error);
            throw new Error(error.message);
        }
    },

    async updatePassword(_, { id, currentPassword, newPassword }) {
        try {
            const objectId = new mongoose.Types.ObjectId(id);
            const user = await userService.findById(objectId);
            
            if (!user) {
                throw new Error('Kullanıcı bulunamadı!');
            }

            const isPasswordValid = await userService.verifyPassword(currentPassword, user.password);
            if (!isPasswordValid) {
                throw new Error('Mevcut şifre yanlış!');
            }

            return await userService.updatePassword(objectId, newPassword);
        } catch (error) {
            console.error('Update Password Error:', error);
            throw new Error(error.message);
        }
    }
}; 