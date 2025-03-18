export const AUTH_CONFIG = {
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    ACCESS_TOKEN_EXPIRES_IN: '1h',
    REFRESH_TOKEN_EXPIRES_IN: '7d',
    SALT_ROUNDS: 10
};

export const CORS_CONFIG = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
};

export const DB_CONFIG = {
    url: process.env.MONGODB_URI,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
};

export const SERVER_CONFIG = {
    port: process.env.PORT || 4000,
    env: process.env.NODE_ENV || 'development'
};

export const VALIDATION_RULES = {
    NAME_MIN_LENGTH: 2,
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_REGEX: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
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