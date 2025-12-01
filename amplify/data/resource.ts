import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const ValidationStatus = a.enum(['firstLevel', 'secondLevel', 'scaling']);

const schema = a.schema({
  ValidationStatus,
  Idea: a
    .model({
      name: a.string().required(),
      hypothesis: a.string().required(),
      validationStatus: a.ref('ValidationStatus'),
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
