import { gql } from 'apollo-server-express';

// User ile ilgili tipler
const userTypes = gql`
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

    input RegisterInput {
        firstName: String!
        lastName: String!
        email: String!
        password: String!
        role: UserRole
    }

    input UpdateUserInput {
        firstName: String
        lastName: String
        email: String
        password: String
        role: UserRole
        isActive: Boolean
    }
`;

// Auth ile ilgili tipler
const authTypes = gql`
    type AuthPayload {
        accessToken: String!
        refreshToken: String!
        user: User!
    }

    type RefreshTokenPayload {
        accessToken: String!
        refreshToken: String!
    }
`;

// Query'ler
const queries = gql`
    type Query {
        # User Query'leri
        users: [User!]! @auth(requires: [SUPER_ADMIN, ADMIN])
        user(id: ID!): User! @auth(requires: [SUPER_ADMIN, ADMIN])
        
        # Auth Query'leri
        me: User! @auth
    }
`;

// Mutation'lar
const mutations = gql`
    type Mutation {
        # User Mutation'ları
        register(input: RegisterInput!): AuthPayload!
        updateUser(id: ID!, input: UpdateUserInput!): User! @auth(requires: [SUPER_ADMIN, ADMIN])
        deleteUser(id: ID!): Boolean! @auth(requires: [SUPER_ADMIN, ADMIN])
        updateUserRole(userId: ID!, role: UserRole!): User! @auth(requires: SUPER_ADMIN)
        
        # Admin Mutation'ları
        superAdminRegister(input: RegisterInput!): AuthPayload!
        adminRegister(input: RegisterInput!): AuthPayload! @auth(requires: SUPER_ADMIN)
        
        # Auth Mutation'ları
        login(email: String!, password: String!): AuthPayload!
        refreshToken(refreshToken: String!): RefreshTokenPayload!
        logout: Boolean! @auth
    }
`;

// Directive tanımı
const directiveTypes = gql`
    directive @auth(requires: [UserRole!]) on FIELD_DEFINITION
`;

export const typeDefs = gql`
    ${userTypes}
    ${authTypes}
    ${queries}
    ${mutations}
    ${directiveTypes}
`; 