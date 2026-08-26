import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full transition duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-[#152E22]',
        outline: 'border border-border bg-surface text-text hover:bg-secondary',
        subtle: 'bg-secondary text-text hover:bg-[#EBE6DC]'
      },
      size: {
        default: 'h-12 px-6 text-sm font-semibold',
        sm: 'h-10 px-4 text-sm'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
