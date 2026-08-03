import type { FC } from 'react'

import { HiddenFields } from './HiddenFields'
import { Rules } from './Rules'
import { Variables } from './Variables'

export const Logic: FC = () => {
  return (
    <div className="divide-accent-light space-y-4 divide-y p-4">
      <HiddenFields />
      <Variables />
      <Rules />
    </div>
  )
}
