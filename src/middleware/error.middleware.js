import { createError, ErrorTypes } from '../utils/errorHandler.js';

export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // GraphQL hataları için özel işleme
    if (err.extensions?.code) {
        return res.status(err.extensions.statusCode || 500).json({
            message: err.message,
            code: err.extensions.code,
            statusCode: err.extensions.statusCode || 500
        });
    }

    // Mongoose hataları için özel işleme
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({
            message: 'Validasyon hatası',
            errors: messages,
            code: ErrorTypes.VALIDATION,
            statusCode: 400
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            message: 'Geçersiz ID formatı',
            code: ErrorTypes.VALIDATION,
            statusCode: 400
        });
    }

    // JWT hataları için özel işleme
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Geçersiz token',
            code: ErrorTypes.AUTHENTICATION,
            statusCode: 401
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: 'Token süresi dolmuş',
            code: ErrorTypes.AUTHENTICATION,
            statusCode: 401
        });
    }

    // Varsayılan hata yanıtı
    return res.status(500).json({
        message: 'Sunucu hatası',
        code: ErrorTypes.INTERNAL,
        statusCode: 500
    });
}; 