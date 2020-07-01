import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3({
    signatureVersion: 'v4'
});

const docClient = new AWS.DynamoDB.DocumentClient();

const postImageTable = process.env.POST_IMAGES_TABLE;
const bucketName = process.env.POST_IMAGES_S3_BUCKET;
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION);
const postImageIdIndex = process.env.POST_IMAGE_ID_INDEX;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const postId = event.pathParameters.postId;

    const url = s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: postId,
        Expires: urlExpiration
    });

    const result = await docClient.query({
        TableName : postImageTable,
        IndexName : postImageIdIndex,
        KeyConditionExpression: 'postId = :postId',
        ExpressionAttributeValues: {
            ':postId': postId
        }
    }).promise();

    if (result.Count !=  0){
        const post = {
            ...result.Items[0],
            attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${postId}`
        };

        await docClient.put({
            TableName: postImageTable,
            Item: post
        }).promise();

    } else {

        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: ''
        }
    }

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            uploadUrl: url
        })
    }
};
