import { FC, ReactNode } from 'react'

import { cn } from '@/utils'

import { Button } from './Button'

interface EmptyStateProps extends ComponentProps {
  icon?: ReactNode
  headline: string
  subHeadline?: string
  buttonTitle?: string
}

export const EmptyState: FC<EmptyStateProps> = ({
  className,
  icon,
  headline,
  subHeadline,
  buttonTitle,
  onClick
}) => {
  return (
    <div className={cn('hf-empty-state flex flex-col items-center text-center', className)}>
      {icon && <div className="text-secondary mb-4">{icon}</div>}

      <h3 className="text-lg font-medium" data-slot="headline">
        {headline}
      </h3>

      {subHeadline && (
        <p className="text-secondary mt-2 max-w-md text-sm" data-slot="subheadline">
          {subHeadline}
        </p>
      )}

      {buttonTitle && (
        <Button className="mt-6" size="md" data-slot="button" onClick={onClick}>
          {buttonTitle}
        </Button>
      )}
    </div>
  )
}
