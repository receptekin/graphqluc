import { gql } from 'apollo-server-express';

const directiveTypeDefs = gql`
    directive @auth(requires: [UserRole!]) on FIELD_DEFINITION
`;

export default directiveTypeDefs; 