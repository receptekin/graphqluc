export const adminTypeDefs = `#graphql
    directive @auth(requires: AuthRequires!) on FIELD_DEFINITION

    type AdminStats {
        totalUsers: Int!
        totalAdmins: Int!
        recentUsers: [User!]!
    }

    extend type Query {
        adminStats: AdminStats! @auth(requires: ADMIN)
        getAllUsers: [User!]! @auth(requires: ADMIN)
        getUserById(id: ID!): User! @auth(requires: ADMIN)
    }

    extend type Mutation {
        adminRegister(name: String!, surname: String!, password: String!): AuthPayload!
        adminLogin(name: String!, password: String!): AuthPayload!
        createAdmin(name: String!, surname: String!, password: String!): User! @auth(requires: ADMIN)
        updateUserRole(id: ID!, role: Role!): User! @auth(requires: ADMIN)
        deleteUser(id: ID!): User! @auth(requires: ADMIN)
    }
`; 