// GraphQL hata tipleri
export const ErrorTypes = {
    AUTHENTICATION: 'AUTHENTICATION_ERROR',
    AUTHORIZATION: 'AUTHORIZATION_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND_ERROR',
    DATABASE: 'DATABASE_ERROR',
    INTERNAL: 'INTERNAL_SERVER_ERROR'
};

class CustomError extends Error {
    constructor(message, type, code = 500) {
        super(message);
        this.type = type;
        this.code = code;
    }
}

export const createError = (message, type = ErrorTypes.INTERNAL, code = 500) => {
    return new CustomError(message, type, code);
};

export const handleError = (error) => {
    console.error('Error:', {
        message: error.message,
        type: error.type || 'UNKNOWN_ERROR',
        stack: error.stack
    });

    return {
        message: error.message,
        type: error.type || ErrorTypes.INTERNAL,
        code: error.code || 500
    };
}; 