import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Idea: a
    .model({
      name: a.string().required(),
      hypothesis: a.string().required(),
      validationStatus: a.enum(['first-level', 'second-level', 'scaling']),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
