import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authTypeDefs from './schemas/auth.schema.js';
import userTypeDefs from './schemas/user.schema.js';
import directiveTypeDefs from './schemas/directives.schema.js';
import { authResolvers } from './resolvers/auth.resolvers.js';
import { userResolvers } from './resolvers/user.resolvers.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { authDirectiveTransformer } from './directives/auth.directive.js';
import { makeExecutableSchema } from '@graphql-tools/schema';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Bağlantısı
mongoose.connect(process.env.DB_URI)
    .then(() => console.log('MongoDB bağlantısı başarılı!'))
    .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Schema oluştur
const schema = makeExecutableSchema({
    typeDefs: [directiveTypeDefs, authTypeDefs, userTypeDefs],
    resolvers: [authResolvers, userResolvers],
});

// Auth direktifini uygula
const schemaWithAuth = authDirectiveTransformer(schema);

// Apollo Server
const server = new ApolloServer({
    schema: schemaWithAuth,
    context: authMiddleware,
    formatError: (error) => {
        console.error('GraphQL Error:', error);
        return error;
    }
});

// Server'ı başlat
const startServer = async () => {
    await server.start();
    server.applyMiddleware({ app });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Server http://localhost:${PORT}${server.graphqlPath} adresinde çalışıyor`);
    });
};

startServer(); 