import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import {createLogger} from "../utils/logger";
import {ImagePostItem} from "../models/ImagePostItem";
import {UpdatePostImageRequest} from "../requests/UpdatePostImageRequest";

const logger = createLogger('access-layer')

export class ImagePostsAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly imagePostItems = process.env.POST_IMAGES_TABLE) {
        logger.info('Constructor invoked');
    }

    async getAllImagePostItems(userId: String): Promise<ImagePostItem[]> {
        logger.info('Getting all image post items');
        const result = await this.docClient.query({
            TableName: this.imagePostItems,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        }).promise();

        const items = result.Items;
        return items as ImagePostItem[]
    }

    async createImagePostItem(imagePost: ImagePostItem): Promise<ImagePostItem> {
        logger.info("Creating a image post item...");
        await this.docClient.put({
            TableName: this.imagePostItems,
            Item: imagePost
        }).promise();

        return imagePost
    }

    async updateImagePostItem(postId: String, userId: String, updateImagePost: UpdatePostImageRequest) {
        logger.info("Updating an image post item...");
        await this.docClient.update({
            TableName: this.imagePostItems,
            Key: {
                userId: userId,
                postId: postId
            },
            UpdateExpression: 'SET #n = :name, location = :location, description = :description',
            ExpressionAttributeValues : {
                ':name': updateImagePost.name,
                ':location': updateImagePost.location,
                ':description': updateImagePost.description
            },
            ExpressionAttributeNames: {
                '#n': 'name'
            }
        }).promise();
    }

    async deleteImagePostItem(postId: String, userId: String) {
        logger.info("Deleting an image post item...");
        await this.docClient.delete({
            TableName: this.imagePostItems,
            Key: {
                userId: userId,
                postId: postId
            }
        }).promise();
    }

}

// for a local DynamoDB instance
function createDynamoDBClient() {
    logger.info("Creating an AWS DynamoDB Client...");
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance');
        return new AWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000',
        })
    }
    return new AWS.DynamoDB.DocumentClient()
}
