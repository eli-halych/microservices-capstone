import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import {getUserId} from "../utils";
import {CreatePostImageRequest} from "../../requests/CreatePostImageRequest";
import {createImagePost} from "../../business-logic/imagePosts";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const parsedBody: CreatePostImageRequest = JSON.parse(event.body);

    const userId = getUserId(event);
    const newImagePost = await createImagePost(parsedBody, userId);

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            item: newImagePost
        })
    }
};
