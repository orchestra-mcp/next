'use client'
import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuPortal = DropdownMenuPrimitive.Portal
const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, style, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      style={{
        background: 'var(--color-bg, #1e1b2e)', border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
        borderRadius: 10, padding: '4px', minWidth: 200,
        boxShadow: 'var(--color-shadow-lg, 0 10px 40px rgba(0,0,0,0.4))', zIndex: 9999,
        animation: 'fadeIn 0.15s ease-out',
        ...style,
      }}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = 'DropdownMenuContent'

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & { inset?: boolean }
>(({ className, inset, style, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
      borderRadius: 7, fontSize: 13, color: 'var(--color-fg-muted, rgba(255,255,255,0.7))',
      cursor: 'pointer', outline: 'none', transition: 'background 0.1s',
      ...style,
    }}
    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-active, rgba(128,128,128,0.12))')}
    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    {...props}
  />
))
DropdownMenuItem.displayName = 'DropdownMenuItem'

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    style={{ height: 1, background: 'var(--color-border, rgba(255,255,255,0.08))', margin: '4px 0' }}
    {...props}
  />
))
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    style={{ padding: '6px 10px', fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}
    {...props}
  />
))
DropdownMenuLabel.displayName = 'DropdownMenuLabel'

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>
>(({ className, style, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
      borderRadius: 7, fontSize: 13, color: 'var(--color-fg-muted, rgba(255,255,255,0.7))',
      cursor: 'pointer', outline: 'none', transition: 'background 0.1s',
      ...style,
    }}
    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-active, rgba(128,128,128,0.12))')}
    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    {...props}
  >
    {children}
    <i className="bx bx-chevron-right" style={{ marginLeft: 'auto', fontSize: 14, opacity: 0.5 }} />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger'

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, style, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      style={{
        background: 'var(--color-bg, #1e1b2e)', border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
        borderRadius: 10, padding: '4px', minWidth: 180,
        boxShadow: 'var(--color-shadow-lg, 0 10px 40px rgba(0,0,0,0.4))', zIndex: 9999,
        animation: 'fadeIn 0.15s ease-out',
        ...style,
      }}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent'

export {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
  DropdownMenuPortal, DropdownMenuGroup,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
}
