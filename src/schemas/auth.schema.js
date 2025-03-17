import { gql } from 'apollo-server-express';

const typeDefs = gql`
    type AuthResponse {
        accessToken: String!
        refreshToken: String!
        user: User!
    }

    type User {
        id: ID!
        name: String!
        surname: String!
        role: UserRole!
        createdAt: String!
    }

    enum UserRole {
        SUPER_ADMIN
        ADMIN
        USER
    }

    type Query {
        me: User @auth
    }

    type Mutation {
        register(name: String!, surname: String!, password: String!): AuthResponse!
        login(name: String!, password: String!): AuthResponse!
        refreshToken(refreshToken: String!): AuthResponse!
        logout(refreshToken: String!): Boolean!
        superAdminRegister(name: String!, surname: String!, password: String!): AuthResponse!
        adminRegister(name: String!, surname: String!, password: String!): AuthResponse! @auth(requires: SUPER_ADMIN)
        adminLogin(name: String!, password: String!): AuthResponse!
    }
`;

export default typeDefs; 