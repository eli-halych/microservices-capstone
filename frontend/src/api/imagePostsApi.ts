import { apiEndpoint } from '../config'
import { ImagePost } from '../types/ImagePost';
import { CreatePostImageRequest } from '../types/CreatePostImageRequest';
import Axios from 'axios'
import { UpdatePostImageRequest } from '../types/UpdatePostImageRequest';

export async function getPosts(idToken: string): Promise<ImagePost[]> {
  console.log('Fetching image posts')

  const response = await Axios.get(`${apiEndpoint}/posts`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Image posts:', response.data)
  return response.data.items
}

export async function createPost(
  idToken: string,
  newImagePost: CreatePostImageRequest
): Promise<ImagePost> {
  const response = await Axios.post(`${apiEndpoint}/posts`,  JSON.stringify(newImagePost), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchPost(
  idToken: string,
  postId: string,
  updatedImagePost: UpdatePostImageRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/posts/${postId}`, JSON.stringify(updatedImagePost), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deletePost(
  idToken: string,
  postId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/posts/${postId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  postId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/posts/${postId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
