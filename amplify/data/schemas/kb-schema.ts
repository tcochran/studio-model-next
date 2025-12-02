import { a } from '@aws-amplify/backend';

export const kbSchema = {
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
};
