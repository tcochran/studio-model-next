import type { Schema } from '../resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler: Schema['getIdeaByNumber']['functionHandler'] = async (event) => {
  const { portfolioCode, productCode, ideaNumber } = event.arguments;
  const tableName = process.env.IDEA_TABLE_NAME;

  if (!tableName) {
    console.error('IDEA_TABLE_NAME environment variable not set');
    throw new Error('Configuration error: IDEA_TABLE_NAME not set');
  }

  // Query using the productCode GSI
  const command = new QueryCommand({
    TableName: tableName,
    IndexName: 'ideasByProductCode',
    KeyConditionExpression: 'productCode = :productCode',
    FilterExpression: 'portfolioCode = :portfolioCode AND ideaNumber = :ideaNumber',
    ExpressionAttributeValues: {
      ':productCode': productCode,
      ':portfolioCode': portfolioCode,
      ':ideaNumber': ideaNumber,
    },
  });

  const result = await docClient.send(command);

  if (result.Items && result.Items.length > 0) {
    return result.Items[0] as Schema['Idea']['type'];
  }

  return null;
};
