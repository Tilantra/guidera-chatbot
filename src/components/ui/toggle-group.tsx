import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"
import { toggleVariants } from "./toggle"

// Define prop types for single and multiple
import type { ToggleGroupSingleProps, ToggleGroupMultipleProps } from "@radix-ui/react-toggle-group"

type ToggleGroupSinglePropsExtended = ToggleGroupSingleProps & VariantProps<typeof toggleVariants>
type ToggleGroupMultiplePropsExtended = ToggleGroupMultipleProps & VariantProps<typeof toggleVariants>

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

const ToggleGroupSingle = React.forwardRef<
  HTMLDivElement,
  ToggleGroupSinglePropsExtended
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))

const ToggleGroupMultiple = React.forwardRef<
  HTMLDivElement,
  ToggleGroupMultiplePropsExtended
>(({ className, variant, size, children, ...props }, ref) => {
  // Omit 'type' from props to avoid duplicate
  const { type, ...rest } = props;
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      type="multiple"
      className={cn("flex items-center justify-center gap-1", className)}
      {...rest}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
})

ToggleGroupSingle.displayName = "ToggleGroupSingle"
ToggleGroupMultiple.displayName = "ToggleGroupMultiple"

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  Omit<React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>, 'value'> &
    VariantProps<typeof toggleVariants> & { value: string }
>(({ className, children, variant, size, value, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      value={value}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroupSingle, ToggleGroupMultiple, ToggleGroupItem }