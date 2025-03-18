import { defaultFieldResolver } from 'graphql';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { createError, ErrorTypes } from '../utils/errorHandler.js';

export function authDirectiveTransformer(schema) {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            const authDirective = getDirective(schema, fieldConfig, 'auth')?.[0];

            if (authDirective) {
                const { resolve = defaultFieldResolver } = fieldConfig;
                const { requires } = authDirective;

                fieldConfig.resolve = async function (source, args, context, info) {
                    if (!context.user) {
                        throw createError('Bu işlem için giriş yapmanız gerekiyor!', ErrorTypes.AUTHENTICATION, 401);
                    }

                    if (requires) {
                        const requiredRoles = Array.isArray(requires) ? requires : [requires];
                        if (!requiredRoles.includes(context.user.role)) {
                            throw createError('Bu işlem için yetkiniz yok!', ErrorTypes.AUTHORIZATION, 403);
                        }
                    }

                    return resolve(source, args, context, info);
                };
            }

            return fieldConfig;
        },
    });
} 