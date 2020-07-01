
import * as uuid from 'uuid'
import {CreatePostImageRequest} from "../requests/CreatePostImageRequest";
import {ImagePostItem} from "../models/ImagePostItem";
import {UpdatePostImageRequest} from "../requests/UpdatePostImageRequest";

const imagePostsAccess = new ImagePostsAccess();

export async function getAllImagePosts(userId: String): Promise<ImagePostItem[]> {
    return imagePostsAccess.getAllImagePosts(userId);
}

export async function createImagePost(CreatePostImageRequest: CreatePostImageRequest, userId: string
): Promise<ImagePostItem> {

    const postId =  uuid.v4();
    const createdAt = new Date().toISOString();
    const newImagePost = {
        userId,
        postId,
        createdAt,
        ...CreatePostImageRequest
    };

    return imagePostsAccess.createImagePostItem(newImagePost)
}

export async function updateImagePost(postId: String, userId: string, updateImagePostRequest: UpdatePostImageRequest){
    return imagePostsAccess.updateImagePostItem(postId, userId, updateImagePostRequest);
}

export async function deleteImagePost(postId: String, userId: string){
    return imagePostsAccess.deleteImagePostItem(postId, userId);
}
