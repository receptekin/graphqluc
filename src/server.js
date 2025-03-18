import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { typeDefs } from './schemas/index.js';
import { resolvers } from './resolvers/index.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { authDirectiveTransformer } from './directives/auth.directive.js';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();

// CORS ayarları
const corsOptions = {
    origin: '*', // Tüm originlere izin ver
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600 // 10 dakika
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB bağlantısı
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB bağlantısı başarılı! Host: ${conn.connection.host}`);
    } catch (err) {
        console.error('MongoDB bağlantı hatası:', err);
        process.exit(1);
    }
};

// Schema oluştur
const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

// Auth direktifini uygula
const schemaWithAuth = authDirectiveTransformer(schema);

// GraphQL Server oluştur
const server = new ApolloServer({
    schema: schemaWithAuth,
    context: async ({ req }) => {
        try {
            const context = await authMiddleware({ req });
            return context;
        } catch (error) {
            console.error('Context oluşturma hatası:', error);
            throw error;
        }
    },
    formatError: (error) => {
        console.error('GraphQL Error:', error);
        
        // Özel hata mesajları
        if (error.extensions?.code === 'UNAUTHENTICATED') {
            return {
                message: 'Oturum açmanız gerekiyor',
                code: 'UNAUTHENTICATED',
                statusCode: 401
            };
        }

        if (error.extensions?.code === 'FORBIDDEN') {
            return {
                message: 'Bu işlem için yetkiniz yok',
                code: 'FORBIDDEN',
                statusCode: 403
            };
        }

        return {
            message: error.message,
            code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
            statusCode: error.extensions?.statusCode || 500
        };
    },
    introspection: true,
    playground: {
        settings: {
            'editor.theme': 'dark',
            'editor.reuseHeaders': true,
            'tracing.hideTracingResponse': true,
            'editor.fontSize': 14,
            'editor.fontFamily': "'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace",
            'request.credentials': 'include'
        }
    },
    cors: true,
    debug: true
});

// Server'ı başlat
const startServer = async () => {
    try {
        // MongoDB'ye bağlan
        await connectDB();

        // Apollo Server'ı başlat
        await server.start();

        // Express middleware'lerini uygula
        server.applyMiddleware({ 
            app,
            path: '/graphql',
            cors: true
        });

        // Error handling middleware
        app.use(errorHandler);

        // Server'ı dinlemeye başla
        const PORT = process.env.PORT || 4001;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server http://localhost:${PORT}${server.graphqlPath} adresinde çalışıyor`);
            console.log(`GraphQL Playground: http://localhost:${PORT}${server.graphqlPath}`);
        });
    } catch (error) {
        console.error('Server başlatma hatası:', error);
        process.exit(1);
    }
};

startServer(); 