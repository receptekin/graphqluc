import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLSchema } from 'graphql';

export function authDirectiveTransformer(schema) {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            const authDirective = getDirective(schema, fieldConfig, 'auth')?.[0];
            
            if (authDirective) {
                const { requires } = authDirective;
                const { resolve } = fieldConfig;
                
                fieldConfig.resolve = async (source, args, context, info) => {
                    if (!context.user) {
                        throw new Error('Yetkilendirme gerekli!');
                    }

                    switch (requires) {
                        case 'ADMIN':
                            if (context.user.role !== 'ADMIN') {
                                throw new Error('Bu işlem için admin yetkisi gerekiyor!');
                            }
                            break;
                        case 'OWNER':
                            if (context.user.id !== args.id) {
                                throw new Error('Bu işlem için yetkiniz yok!');
                            }
                            break;
                        case 'AUTHENTICATED':
                            // Sadece giriş yapmış olması yeterli
                            break;
                    }

                    return resolve(source, args, context, info);
                };
            }
            
            return fieldConfig;
        }
    });
} 