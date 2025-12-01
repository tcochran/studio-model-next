import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Idea: a
    .model({
      name: a.string().required(),
      hypothesis: a.string().required(),
      validationStatus: a.string(),
      upvotes: a.integer().default(0),
      source: a.enum(['customerFeedback', 'teamBrainstorm', 'competitorAnalysis', 'userResearch', 'marketTrend', 'internalRequest', 'other']),
    })
    .authorization((allow) => [allow.publicApiKey()])
    .secondaryIndexes((index) => [
      index('name'),
      index('validationStatus'),
      index('source'),
    ]),
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
