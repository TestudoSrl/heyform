import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export enum TeamRoleEnum {
  OWNER = 0,
  ADMIN = 1,
  COLLABORATOR = 2,
  MEMBER = 3
}

@Schema()
export class TeamMemberModel extends Document {
  @Prop({ required: true, index: true })
  teamId: string

  @Prop({ required: true, index: true })
  memberId: string

  @Prop({ type: Number, required: true })
  role: TeamRoleEnum

  @Prop({ default: 0 })
  lastSeenAt?: number
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMemberModel)

TeamMemberSchema.index({ teamId: 1, memberId: 1 }, { unique: true })
