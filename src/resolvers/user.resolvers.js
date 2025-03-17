import { userController } from '../controllers/user.controller.js';

export const userResolvers = {
    Query: {
        users: userController.getAllUsers,
        user: userController.getUserById
    },
    Mutation: {
        updateUser: userController.updateUser,
        deleteUser: userController.deleteUser,
        updateUserRole: userController.updateUserRole,
        createAdmin: userController.createAdmin
    }
}; 