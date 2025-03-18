import { gql } from 'apollo-server-express';

const typeDefs = gql`
    enum UserRole {
        SUPER_ADMIN
        ADMIN
        USER
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

    input UpdateUserInput {
        firstName: String
        lastName: String
        email: String
        password: String
        role: UserRole
        isActive: Boolean
    }

    type DeleteResponse {
        success: Boolean!
        message: String!
    }

    type Query {
        users: [User!]! @auth(requires: [SUPER_ADMIN, ADMIN])
        user(id: ID!): User @auth(requires: [SUPER_ADMIN, ADMIN])
    }

    type Mutation {
        updateUser(id: ID!, input: UpdateUserInput!): User! @auth(requires: [SUPER_ADMIN, ADMIN])
        deleteUser(id: ID!): Boolean! @auth(requires: [SUPER_ADMIN, ADMIN])
        updateUserRole(id: ID!, role: UserRole!): User! @auth(requires: SUPER_ADMIN)
        createAdmin(name: String!, surname: String!, email: String!, password: String!): User! @auth(requires: SUPER_ADMIN)
    }
`;

export default typeDefs; 