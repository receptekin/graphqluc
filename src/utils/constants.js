export const AUTH_CONFIG = {
    ACCESS_TOKEN_EXPIRES: '1h',
    REFRESH_TOKEN_EXPIRES: '7d',
    SALT_ROUNDS: 10
};

export const VALIDATION_RULES = {
    NAME_MIN_LENGTH: 2,
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_REGEX: {
        NUMBER: /\d/,
        LETTER: /[a-zA-Z]/
    }
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

export const PUBLIC_OPERATIONS = [
    'login',
    'register',
    'refreshToken'
]; 