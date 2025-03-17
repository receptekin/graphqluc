import { defaultFieldResolver } from 'graphql';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';

export function authDirectiveTransformer(schema) {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            const authDirective = getDirective(schema, fieldConfig, 'auth')?.[0];

            if (authDirective) {
                const { resolve = defaultFieldResolver } = fieldConfig;
                const { requires } = authDirective;

                fieldConfig.resolve = async function (source, args, context, info) {
                    if (!context.user) {
                        throw new Error('Yetkilendirme gerekli');
                    }

                    if (requires && !requires.includes(context.user.role)) {
                        throw new Error('Bu işlem için yetkiniz yok');
                    }

                    return resolve(source, args, context, info);
                };
            }

            return fieldConfig;
        },
    });
} 