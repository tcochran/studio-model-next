import { a } from '@aws-amplify/backend';

export const ideaSchema = {
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
};
