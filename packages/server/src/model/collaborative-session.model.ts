import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { nanoid } from '@heyform-inc/utils'

const COLLABORATIVE_SESSION_LIFETIME = 30 * 24 * 60 * 60 * 1000

@Schema({ timestamps: true })
export class CollaborativeSessionModel extends Document {
  @Prop({ default: () => nanoid(24) })
  _id: string

  @Prop({ required: true, index: true })
  formId: string

  @Prop({ type: Object, default: {} })
  values: Record<string, any>

  @Prop({ default: 0 })
  revision: number

  @Prop({ default: 0 })
  completedAt: number

  @Prop({ type: Object, default: {} })
  participants: Record<string, number>

  @Prop({
    type: Date,
    default: () => new Date(Date.now() + COLLABORATIVE_SESSION_LIFETIME)
  })
  expiresAt: Date
}

export const CollaborativeSessionSchema = SchemaFactory.createForClass(CollaborativeSessionModel)

CollaborativeSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
