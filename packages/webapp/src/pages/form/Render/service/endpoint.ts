import { HiddenFieldAnswer } from '@heyform-inc/shared-types-enums'

import { axios } from '../utils/axios'

const OPEN_FORM_GQL = `query openForm($input: OpenFormInput!) {
  openForm(input: $input)
}`

const VERIFY_FORM_PASSWORD_GQL = `query verifyFormPassword($input: VerifyPasswordInput!) {
  verifyFormPassword(input: $input)
}`

const UPLOAD_FILE_TOKEN_GQL = `mutation uploadFileToken($input: UploadFormFileInput!) {
  uploadFileToken(input: $input) {
    token
    urlPrefix
    key
  }
}`

const COMPLETE_SUBMISSION_GQL = `mutation completeSubmission($input: CompleteSubmissionInput!) {
	completeSubmission(input: $input) {
	  clientSecret
	}
}`

const COLLABORATIVE_SESSION_GQL = `query collaborativeSession($input: CollaborativeSessionInput!) {
  collaborativeSession(input: $input) {
    token
    formId
    values
    revision
    completed
  }
}`

const UPDATE_COLLABORATIVE_SESSION_GQL = `mutation updateCollaborativeSession($input: UpdateCollaborativeSessionInput!) {
  updateCollaborativeSession(input: $input) {
    token
    formId
    values
    revision
    completed
  }
}`

export interface CollaborativeSession {
  token: string
  formId: string
  values: Record<string, Any>
  revision: number
  completed: boolean
}

export class EndpointService {
  static async collaborativeSession(token: string): Promise<CollaborativeSession> {
    const result = await axios({
      query: COLLABORATIVE_SESSION_GQL,
      variables: { input: { token } }
    })
    return result.collaborativeSession
  }

  static async updateCollaborativeSession(
    token: string,
    changes: Record<string, Any>
  ): Promise<CollaborativeSession> {
    const result = await axios({
      query: UPDATE_COLLABORATIVE_SESSION_GQL,
      variables: { input: { token, changes } }
    })
    return result.updateCollaborativeSession
  }

  static async openForm(formId: string): Promise<string> {
    const result = await axios({
      query: OPEN_FORM_GQL,
      variables: {
        input: {
          formId
        }
      }
    })
    return result.openForm
  }

  static async verifyFormPassword(formId: string, password: string): Promise<string> {
    const result = await axios({
      query: VERIFY_FORM_PASSWORD_GQL,
      variables: {
        input: {
          formId,
          password
        }
      }
    })
    return result.verifyFormPassword
  }

  static async uploadFileToken(
    formId: string,
    filename: string,
    mime: string
  ): Promise<{
    token: string
    urlPrefix: string
    key: string
  }> {
    const result = await axios({
      query: UPLOAD_FILE_TOKEN_GQL,
      variables: {
        input: {
          formId,
          filename,
          mime
        }
      }
    })
    return result.uploadFileToken
  }

  static async completeSubmission(input: {
    formId: string
    contactId?: string
    openToken: string
    passwordToken?: string
    answers: Record<string, Any>
    hiddenFields: HiddenFieldAnswer[]
    // Google reCAPTCHA token
    recaptchaToken?: string
    partialSubmission?: boolean
    collaborativeToken?: string
  }): Promise<{ clientSecret?: string }> {
    const result = await axios({
      query: COMPLETE_SUBMISSION_GQL,
      variables: {
        input
      }
    })
    return result.completeSubmission
  }
}
