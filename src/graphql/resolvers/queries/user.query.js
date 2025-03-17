import { User } from '../../../models/User.js';

export const userQueries = {
    users: async () => {
        try {
            return await User.find();
        } catch (error) {
            throw new Error('Error fetching users');
        }
    },
    user: async (_, { id }) => {
        try {
            return await User.findById(id);
        } catch (error) {
            throw new Error('Error fetching user');
        }
    }
}; 