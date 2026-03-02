'use client'
import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & { size?: number }
>(({ size = 32, style, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    style={{ width: size, height: size, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, ...style }}
    {...props}
  />
))
Avatar.displayName = 'Avatar'

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ style, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }} {...props} />
))
AvatarImage.displayName = 'AvatarImage'

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ style, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 700, ...style }}
    {...props}
  />
))
AvatarFallback.displayName = 'AvatarFallback'

export { Avatar, AvatarImage, AvatarFallback }
