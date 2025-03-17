import { authController } from '../controllers/auth.controller.js';

export const authResolvers = {
    Mutation: {
        register: authController.register,
        login: authController.login,
        refreshToken: authController.refreshToken,
        logout: authController.logout,
        superAdminRegister: authController.superAdminRegister,
        adminRegister: authController.adminRegister,
        adminLogin: authController.adminLogin
    }
}; 