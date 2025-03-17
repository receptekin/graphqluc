import jwt from 'jsonwebtoken';
import { authService } from '../services/auth.service.js';
import { userService } from '../services/user.service.js';
import { createError, ErrorTypes } from '../utils/errorHandler.js';
import { PUBLIC_OPERATIONS } from '../utils/constants.js';

export const authMiddleware = async (resolve, root, args, context, info) => {
    try {
        // Public mutations/queries için kontrol yok
        if (PUBLIC_OPERATIONS.includes(info.fieldName)) {
            return resolve(root, args, context, info);
        }

        // Authorization header'ı kontrol et
        const authHeader = context.req.headers.authorization;
        if (!authHeader) {
            throw createError('Token bulunamadı!', ErrorTypes.AUTHENTICATION, 401);
        }

        // Bearer token'ı ayıkla
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw createError('Geçersiz token formatı!', ErrorTypes.AUTHENTICATION, 401);
        }

        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Token geçerli mi kontrol et
        if (!authService.isTokenValid(token, decoded.userId)) {
            throw createError(
                'Oturum sonlandırılmış, lütfen tekrar giriş yapın!',
                ErrorTypes.AUTHENTICATION,
                401
            );
        }

        // Kullanıcıyı bul
        const user = await userService.findById(decoded.userId);
        if (!user) {
            throw createError('Kullanıcı bulunamadı!', ErrorTypes.NOT_FOUND, 404);
        }

        // Context'e kullanıcı bilgisini ekle
        context.user = user;

        // Yetki kontrolü
        const authDirective = info.fieldNodes[0].directives?.find(d => d.name.value === 'auth');
        if (authDirective) {
            const requires = authDirective.arguments[0].value.value;
            
            switch (requires) {
                case 'ADMIN':
                    if (user.role !== 'admin') {
                        throw createError('Bu işlem için admin yetkisi gerekiyor!', ErrorTypes.AUTHORIZATION, 403);
                    }
                    break;
                case 'OWNER':
                    if (user.id !== args.id) {
                        throw createError('Bu işlem için yetkiniz yok!', ErrorTypes.AUTHORIZATION, 403);
                    }
                    break;
                case 'AUTHENTICATED':
                    // Sadece giriş yapmış olması yeterli
                    break;
            }
        }
        
        // İşlemi devam ettir
        return resolve(root, args, context, info);
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw createError(
                'Token süresi dolmuş, lütfen tekrar giriş yapın!',
                ErrorTypes.AUTHENTICATION,
                401
            );
        }
        throw error;
    }
};

// GraphQL Shield için permission tanımları
export const permissions = {
    isAuthenticated: (parent, args, context) => {
        return !!context.user;
    },
    
    isOwner: (parent, args, context) => {
        return context.user.id === args.id;
    }
}; 