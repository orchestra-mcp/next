'use client'

/**
 * ProfileCover — DEPRECATED
 *
 * The cover image is now rendered inline within the ProfileSidebar card.
 * This component returns null to prevent layout breakage in any remaining
 * references. Do not delete — other routes or dynamic imports may still
 * reference this module.
 */

interface ProfileCoverProps {
  handle: string
}

export default function ProfileCover(_props: ProfileCoverProps) {
  return null
}
