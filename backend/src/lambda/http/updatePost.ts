import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import {UpdatePostImageRequest} from "../../requests/UpdatePostImageRequest";
import {getUserId} from "../utils";
import {updateImagePost} from "../../business-logic/imagePosts";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const postId = event.pathParameters.postId;
    const updatePost: UpdatePostImageRequest = JSON.parse(event.body);
    const userId = getUserId(event);

    await updateImagePost(postId, userId, updatePost);

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({})
    }
};
