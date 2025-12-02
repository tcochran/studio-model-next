import type { Schema } from '../resource';

export function request(ctx: any) {
  const { portfolioCode, productCode, ideaNumber } = ctx.arguments;

  return {
    operation: 'Query',
    index: 'ideasByProductCode',
    query: {
      expression: 'productCode = :productCode',
      expressionValues: {
        ':productCode': { S: productCode }
      }
    },
    filter: {
      expression: 'portfolioCode = :portfolioCode AND ideaNumber = :ideaNumber',
      expressionValues: {
        ':portfolioCode': { S: portfolioCode },
        ':ideaNumber': { N: ideaNumber.toString() }
      }
    }
  };
}

export function response(ctx: any) {
  if (ctx.error) {
    throw new Error(ctx.error.message);
  }

  if (ctx.result.items && ctx.result.items.length > 0) {
    return ctx.result.items[0];
  }

  return null;
}
