import { FormTheme } from '@heyform-inc/shared-types-enums'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { nanoid } from '@heyform-inc/utils'

@Schema()
export class BrandKitModel extends Document {
  @Prop({ default: () => nanoid(8) })
  _id: string

  @Prop({ required: true, index: true })
  teamId: string

  @Prop()
  logo: string

  @Prop({ type: Object })
  theme: FormTheme
}

export const BrandKitSchema = SchemaFactory.createForClass(BrandKitModel)
