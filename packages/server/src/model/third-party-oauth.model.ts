import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({
  timestamps: true
})
export class ThirdPartyOauthModel extends Document {
  @Prop({
    type: String,
    required: true
  })
  appId: string

  @Prop({ required: true })
  openId: string

  @Prop({
    default: ''
  })
  scope: string

  @Prop({
    type: Map
  })
  user?: Record<string, any>

  @Prop({
    type: Map
  })
  tokens: Record<string, any>
}

export const ThirdPartyOauthSchema = SchemaFactory.createForClass(ThirdPartyOauthModel)

ThirdPartyOauthSchema.index({ appId: 1, openId: 1, scope: 1 }, { unique: true })
