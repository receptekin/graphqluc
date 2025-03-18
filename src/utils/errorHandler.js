// GraphQL hata tipleri
export const ErrorTypes = {
    AUTHENTICATION: 'AUTHENTICATION_ERROR',
    AUTHORIZATION: 'AUTHORIZATION_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND_ERROR',
    DATABASE: 'DATABASE_ERROR',
    NETWORK: 'NETWORK_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR'
};

export class AppError extends Error {
    constructor(message, type, statusCode) {
        super(message);
        this.name = 'AppError';
        this.type = type;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const createError = (message, type, statusCode) => {
    return new AppError(message, type, statusCode);
};

export const handleError = (error) => {
    if (error instanceof AppError) {
        return {
            message: error.message,
            type: error.type,
            statusCode: error.statusCode
        };
    }

    console.error('Unexpected Error:', error);

    return {
        message: 'Beklenmeyen bir hata oluştu!',
        type: ErrorTypes.UNKNOWN,
        statusCode: 500
    };
}; 