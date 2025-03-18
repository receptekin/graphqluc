import { gql } from 'apollo-server-express';

const typeDefs = gql`
    type AuthResponse {
        accessToken: String!
        refreshToken: String!
        user: User!
    }

    type User {
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
        role: UserRole!
        isActive: Boolean!
        createdAt: String!
        updatedAt: String!
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
        register(input: RegisterInput!): AuthResponse! @auth(requires: [SUPER_ADMIN, ADMIN])
        login(email: String!, password: String!): AuthResponse!
        refreshToken(refreshToken: String!): AuthResponse!
        logout: Boolean! @auth
        superAdminRegister(input: RegisterInput!): AuthResponse!
        adminRegister(input: RegisterInput!): AuthResponse! @auth(requires: SUPER_ADMIN)
        userRegister(input: RegisterInput!): AuthResponse!
    }

    input RegisterInput {
        firstName: String!
        lastName: String!
        email: String!
        password: String!
        role: UserRole
    }
`;

export default typeDefs; 