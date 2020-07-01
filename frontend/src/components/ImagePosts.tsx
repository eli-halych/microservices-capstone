import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createPost, deletePost, getPosts, patchPost } from '../api/imagePostsApi'
import Auth from '../auth/Auth'
import { ImagePost } from '../types/ImagePost'

interface ImagePostsProps {
  auth: Auth
  history: History
}

interface ImagePostState {
  imagePosts: ImagePost[]
  newImagePostName: string
  newImagePostLocation: string
  newImagePostDescription: string
  loadingImagePosts: boolean
}

export class ImagePosts extends React.PureComponent<ImagePostsProps, ImagePostState> {
  state: ImagePostState = {
    imagePosts: [],
    newImagePostName: '',
    newImagePostLocation: '',
    newImagePostDescription: '',
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

      const newImagePost = await createPost(this.props.auth.getIdToken(), {
        name: this.state.newImagePostName,
        description: this.state.newImagePostDescription,
        location_: this.state.newImagePostLocation
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
      await deletePost(this.props.auth.getIdToken(), postId);
      this.setState({
        imagePosts: this.state.imagePosts.filter(post => post.postId != postId)
      })
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
              </Grid.Column>
              <Grid.Column width={9} verticalAlign="middle">
                {post.name}
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                {post.location_}
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
}
