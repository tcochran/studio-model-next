import { a } from '@aws-amplify/backend';

export const ideaSchema = {
  getIdeaByNumber: a
    .query()
    .arguments({
      portfolioCode: a.string().required(),
      productCode: a.string().required(),
      ideaNumber: a.integer().required(),
    })
    .returns(a.ref('Idea'))
    .authorization((allow) => [allow.publicApiKey()])
    .handler(
      a.handler.custom({
        entry: '../resolvers/getIdeaByNumber.ts',
        dataSource: a.ref('Idea')
      })
    ),
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
