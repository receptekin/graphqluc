import jwt from 'jsonwebtoken';

export const authMiddleware = async ({ req }) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return { user: null };
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { user: decoded };
    } catch (error) {
        console.error('Auth middleware error:', error);
        return { user: null };
    }
}; 