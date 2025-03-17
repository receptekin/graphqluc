import { gql } from 'apollo-server-express';

const typeDefs = gql`
    enum UserRole {
        SUPER_ADMIN
        ADMIN
        USER
    }

    type User {
        id: ID!
        name: String!
        surname: String!
        role: UserRole!
        createdAt: String!
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
        updateUser(id: ID!, name: String, surname: String): User! @auth(requires: [SUPER_ADMIN, ADMIN])
        deleteUser(id: ID!): DeleteResponse! @auth(requires: [SUPER_ADMIN, ADMIN])
        updateUserRole(id: ID!, role: UserRole!): User! @auth(requires: SUPER_ADMIN)
        createAdmin(name: String!, surname: String!, password: String!): User! @auth(requires: SUPER_ADMIN)
    }
`;

export default typeDefs; 