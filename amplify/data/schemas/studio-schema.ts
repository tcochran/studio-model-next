import { a } from '@aws-amplify/backend';

export const studioSchema = {
  Studio: a
    .model({
      name: a.string().required(),
      portfolioId: a.string().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  StudioUser: a
    .model({
      studioId: a.string().required(),
      email: a.string().required(),
      role: a.enum(['engineer', 'product_manager', 'designer', 'project_manager', 'researcher']),
      specialization: a.string(),
    })
    .secondaryIndexes((index) => [
      index('email').sortKeys(['studioId']),
    ])
    .authorization((allow) => [allow.publicApiKey()]),
};
