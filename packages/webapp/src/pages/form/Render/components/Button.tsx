import clsx from 'clsx'
import { ButtonHTMLAttributes, FC } from 'react'

import { Loader } from './Loader'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
  iconOnly?: boolean
  loading?: boolean
}

const ButtonComponent: FC<ButtonProps> = ({
  className,
  type = 'button',
  size = 'lg',
  iconOnly,
  loading,
  disabled,
  children,
  ...restProps
}) => {
  return (
    <button
      className={clsx(
        'bg-primary text-primary-light relative h-11 cursor-pointer rounded-lg border border-transparent px-3.5 text-base/6 font-medium transition-colors duration-100 focus:outline-none focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[size=md]:h-9 data-[size=sm]:h-9 data-[size=lg]:hover:bg-opacity-80 data-[size=md]:hover:bg-opacity-80 sm:h-10 sm:px-3 sm:text-sm/6 data-[size=md]:sm:h-9 data-[size=sm]:sm:h-8',
        {
          '[&_[data-slot=button]]:opacity-0': loading,
          'w-11 px-0 data-[size=md]:w-9 data-[size=sm]:w-9 sm:w-10 sm:px-0 data-[size=md]:sm:w-9 data-[size=sm]:sm:w-8':
            iconOnly
        },
        className
      )}
      type={type}
      disabled={loading || disabled}
      data-size={size}
      {...restProps}
    >
      <div className="flex w-full items-center justify-center gap-x-2" data-slot="button">
        {children}
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center" data-slot="loader">
          <Loader />
        </div>
      )}
    </button>
  )
}

const GhostButton: FC<ButtonProps> = ({ className, ...restProps }) => (
  <ButtonComponent
    className={clsx(
      'border-input bg-foreground text-primary hover:bg-accent-light border',
      className
    )}
    {...restProps}
  />
)

const LinkButton: FC<ButtonProps> = ({ className, ...restProps }) => (
  <ButtonComponent
    className={clsx(
      'text-primary hover:bg-accent-light aria-expanded:bg-accent-light border-0 bg-transparent outline-0 hover:outline-0',
      className
    )}
    {...restProps}
  />
)

export const Button = Object.assign(ButtonComponent, {
  Ghost: GhostButton,
  Link: LinkButton
})
