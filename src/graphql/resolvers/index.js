import { Query } from './queries/index.js';
import { Mutation } from './mutations/index.js';
import { adminQueries } from './queries/admin.query.js';
import { adminMutations } from './mutations/admin.mutation.js';

export const resolvers = {
    Query: {
        ...Query,
        ...adminQueries
    },
    Mutation: {
        ...Mutation,
        ...adminMutations
    }
}; 