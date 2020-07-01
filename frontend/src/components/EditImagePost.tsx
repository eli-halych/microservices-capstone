import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import {getUploadUrl, patchPost, uploadFile} from '../api/imagePostsApi'
import {strict} from "assert";

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditImagePostProps {
  match: {
    params: {
      postId: string
    }
  }
  auth: Auth
}

interface EditImagePostState {
  file: any
  location_: string
  description: string
  uploadState: UploadState
}

export class EditImagePost extends React.PureComponent<
  EditImagePostProps,
  EditImagePostState
> {
  state: EditImagePostState = {
    file: undefined,
    location_: "",
    description: "",
    uploadState: UploadState.NoUpload
  }

  handleTextChangeLocation = (event: React.ChangeEvent<HTMLInputElement>) => {
    const location_ = event.target.value
    if (!location_) return

    this.setState({
      location_: location_
    })
  }

  handleTextChangeDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
    const description = event.target.value
    if (!description) return

    this.setState({
      description: description
    })
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      const tokenId: string = this.props.auth.getIdToken()
      const postId: string = this.props.match.params.postId

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(tokenId, postId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      await patchPost(tokenId, postId, {
        name: postId, // TODO change to actual name which is available
        location_: this.state.location_,
        description: this.state.description
      })

      alert('File was uploaded! Description was saved!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Upload new image</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>
          {this.renderDescriptionInput()}
          {this.renderLocationInput()}
          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }

  renderLocationInput() {
    return (
      <div>

        <label>Location</label>
        <input
          type="text"
          value={this.state.location_}
          ref="locationStringInput"
          onChange={this.handleTextChangeLocation}
        />
      </div>
    )
  }

  renderDescriptionInput() {
    return (
      <div>

        <label>Description</label>
        <input
          type="text"
          value={this.state.description}
          ref="descriptionStringInput"
          onChange={this.handleTextChangeDescription}
        />
      </div>
    )
  }
}
