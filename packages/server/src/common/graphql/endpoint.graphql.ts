import { HiddenFieldAnswer } from '@heyform-inc/shared-types-enums'
import { IsOptional, IsString } from 'class-validator'

import { CdnTokenInput } from './user.graphql'
import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { GraphQLJSONObject } from 'graphql-type-json'

@InputType()
export class UploadFormFileInput extends CdnTokenInput {
  @Field()
  formId: string
}

@InputType()
export class UploadFormSignatureInput {
  @Field()
  formId: string

  @Field()
  signature: string
}

@InputType()
export class OpenFormInput {
  @Field()
  formId: string
}

@InputType()
export class VerifyPasswordInput {
  @Field()
  formId: string

  @Field()
  password: string
}

@InputType()
class HiddenFieldAnswerInput {
  @Field()
  id: string

  @Field()
  name: string

  @Field({ nullable: true })
  value?: string
}

@InputType()
export class CompleteSubmissionInput {
  @Field()
  formId: string

  @Field(type => GraphQLJSONObject)
  answers: Record<string, any>

  @Field(type => [HiddenFieldAnswerInput])
  hiddenFields: HiddenFieldAnswer[]

  @Field({ nullable: true })
  partialSubmission?: boolean

  @Field()
  openToken: string

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  passwordToken?: string

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  recaptchaToken?: string

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  collaborativeToken?: string
}

@InputType()
export class CollaborativeSessionInput {
  @Field()
  @IsString()
  token: string
}

@InputType()
export class CreateCollaborativeSessionInput {
  @Field()
  @IsString()
  formId: string
}

@InputType()
export class UpdateCollaborativeSessionInput extends CollaborativeSessionInput {
  @Field(type => GraphQLJSONObject)
  changes: Record<string, any>
}

@ObjectType()
export class CollaborativeSessionType {
  @Field()
  token: string

  @Field()
  formId: string

  @Field(type => GraphQLJSONObject)
  values: Record<string, any>

  @Field()
  revision: number

  @Field()
  completed: boolean

  @Field()
  participantCount: number
}

@ObjectType()
export class CompleteSubmissionType {
  @Field({ nullable: true })
  clientSecret?: string
}

@ObjectType()
export class UploadFormFileType {
  @Field()
  filename: string

  @Field()
  url: string

  @Field()
  size: number
}
