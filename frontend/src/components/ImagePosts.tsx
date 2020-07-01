import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createPost, deletePost, getPosts, patchPost } from '../api/posts-api'
import Auth from '../auth/Auth'
import { ImagePost } from '../types/ImagePost'
import {deleteImagePost} from "../../../backend/src/business-logic/imagePosts";

interface ImagePostsProps {
  auth: Auth
  history: History
}

interface ImagePostState {
  imagePosts: ImagePost[]
  newImagePostName: string
  loadingImagePosts: boolean
}

export class ImagePosts extends React.PureComponent<ImagePostsProps, ImagePostState> {
  state: ImagePostState = {
    imagePosts: [],
    newImagePostName: '',
    loadingImagePosts: true
  };

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newImagePostName: event.target.value })
  };

  onEditButtonClick = (postId: string) => {
    this.props.history.push(`/posts/${postId}/edit`)
  };

  onImagePostCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      // const dueDate = this.calculateDueDate();
      const newImagePost = await createPost(this.props.auth.getIdToken(), {
        name: this.state.newImagePostName,
        // dueDate
      });
      this.setState({
        imagePosts: [...this.state.imagePosts, newImagePost],
        newImagePostName: ''
      })
    } catch {
      alert('Image post creation failed')
    }
  };

  onImagePostDelete = async (postId: string) => {
    try {
      await deleteImagePost(this.props.auth.getIdToken(), postId);
      this.setState({
        imagePosts: this.state.imagePosts.filter(post => post.postId != postId)
      })
    } catch {
      alert('Image post deletion failed')
    }
  };

  onImagePostCheck = async (pos: number) => {
    try {
      const post = this.state.imagePosts[pos];
      await patchPost(this.props.auth.getIdToken(), post.postId, {
        name: post.name,
        location: post.location,
        description: post.description
      });
      // this.setState({
      //   imagePosts: update(this.state.imagePosts, {
      //     [pos]: { done: { $set: !post.done } }
      //   })
      // })
    } catch {
      alert('Image post deletion failed')
    }
  };

  async componentDidMount() {
    try {
      const imagePosts = await getPosts(this.props.auth.getIdToken());
      this.setState({
        imagePosts: imagePosts,
        loadingImagePosts: false
      })
    } catch (e) {
      alert(`Failed to fetch image posts: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Image posts</Header>

        {this.renderCreatePostInput()}

        {this.imagePosts()}
      </div>
    )
  }

  renderCreatePostInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onImagePostCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  imagePosts() {
    if (this.state.loadingImagePosts) {
      return this.renderLoading()
    }

    return this.renderImagePostsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading image posts
        </Loader>
      </Grid.Row>
    )
  }

  renderImagePostsList() {
    return (
      <Grid padded>
        {this.state.imagePosts.map((post, pos) => {
          return (
            <Grid.Row key={post.postId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onImagePostCheck(pos)}
                  // checked={post.done}
                />
              </Grid.Column>
              <Grid.Column width={9} verticalAlign="middle">
                {post.name}
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                {post.location}
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                {post.description}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(post.postId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onImagePostDelete(post.postId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {post.attachmentUrl && (
                <Image src={post.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  // calculateDueDate(): string {
  //   const date = new Date();
  //   date.setDate(date.getDate() + 7);
  //
  //   return dateFormat(date, 'yyyy-mm-dd') as string
  // }
}