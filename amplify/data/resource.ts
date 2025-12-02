import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { portfolioSchema } from './schemas/portfolio-schema';
import { ideaSchema } from './schemas/idea-schema';
import { kbSchema } from './schemas/kb-schema';

const schema = a.schema({
  ...portfolioSchema,
  ...ideaSchema,
  ...kbSchema,
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
