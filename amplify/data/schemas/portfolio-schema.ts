import { a } from '@aws-amplify/backend';

export const portfolioSchema = {
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
};
