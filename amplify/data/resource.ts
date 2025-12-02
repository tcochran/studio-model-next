import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Portfolio: a
    .model({
      code: a.string().required(),
      organizationName: a.string().required(),
      name: a.string().required(),
      owners: a.string().array(),
      products: a.json(),
    })
    .identifier(['code'])
    .authorization((allow) => [allow.publicApiKey()]),
  Idea: a
    .model({
      ideaNumber: a.integer().required(),
      name: a.string().required(),
      hypothesis: a.string().required(),
      validationStatus: a.enum(['backlog', 'firstLevel', 'secondLevel', 'scaling', 'failed']),
      statusHistory: a.json().array(),
      upvotes: a.integer().default(0),
      source: a.enum(['customerFeedback', 'teamBrainstorm', 'competitorAnalysis', 'userResearch', 'marketTrend', 'internalRequest', 'other']),
      portfolioCode: a.string().required(),
      productCode: a.string().required(),
    })
    .authorization((allow) => [allow.publicApiKey()])
    .secondaryIndexes((index) => [
      index('name'),
      index('validationStatus'),
      index('source'),
      index('portfolioCode'),
      index('productCode'),
    ]),
  KBDocument: a
    .model({
      title: a.string().required(),
      content: a.string().required(),
      portfolioCode: a.string(),
      productCode: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()])
    .secondaryIndexes((index) => [
      index('portfolioCode'),
      index('productCode'),
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
