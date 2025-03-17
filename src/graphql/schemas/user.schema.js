export const userTypeDefs = `#graphql
    enum Role {
        ADMIN
        USER
    }

    enum AuthRequires {
        ADMIN
        OWNER
        AUTHENTICATED
    }

    directive @auth(requires: AuthRequires!) on FIELD_DEFINITION

    type User {
        id: ID!
        name: String!
        surname: String!
        role: Role!
        createdAt: String!
    }

    type AuthPayload {
        accessToken: String!
        refreshToken: String!
        user: User!
    }

    type LogoutResponse {
        message: String!
        success: Boolean!
    }

    type Query {
        users: [User!]! @auth(requires: ADMIN)
        user(id: ID!): User @auth(requires: OWNER)
        me: User @auth(requires: AUTHENTICATED)
    }
    
    type Mutation {
        register(name: String!, surname: String!, password: String!): AuthPayload!
        login(name: String!, password: String!): AuthPayload!
        refreshToken(token: String!): AuthPayload!
        logout: Boolean! @auth(requires: AUTHENTICATED)
        updatePassword(id: ID!, currentPassword: String!, newPassword: String!): User! @auth(requires: OWNER)
        updateUser(id: ID!, name: String, surname: String): User! @auth(requires: OWNER)
        deleteUser(id: ID!): User! @auth(requires: OWNER)
    }
`; 