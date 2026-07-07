import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full transition duration-300 duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-[#1d4562]',
        outline: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
        subtle: 'bg-secondary text-slate-950 hover:bg-slate-200'
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
