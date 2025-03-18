import { userService } from '../../../services/user.service.js';

export const userQueries = {
    users: async (_, __, context) => {
        try {
            return await userService.getAllUsers(context);
        } catch (error) {
            throw new Error('Error fetching users');
        }
    },
    user: async (_, { id }) => {
        try {
            return await userService.findById(id);
        } catch (error) {
            throw new Error('Error fetching user');
        }
    }
}; 