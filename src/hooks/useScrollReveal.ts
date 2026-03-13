'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

interface ScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

/**
 * Hook that returns a ref and visibility state for scroll-based reveal animations.
 * Matches the site's anime.js style (easeOutCubic, fade + translateY).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const { threshold = 0.1, rootMargin = '0px 0px -60px 0px', once = true } = options
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return { ref, isVisible }
}

/**
 * CSS style helper for scroll reveal animations.
 * Use with useScrollReveal: style={revealStyle(isVisible, delay)}
 */
export function revealStyle(
  isVisible: boolean,
  delayMs = 0,
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance = 24
): React.CSSProperties {
  const transforms: Record<string, string> = {
    up: `translateY(${distance}px)`,
    down: `translateY(-${distance}px)`,
    left: `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
  }
  return {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translate(0)' : transforms[direction],
    transition: `opacity 0.6s ${delayMs}ms cubic-bezier(0.33, 0, 0.2, 1), transform 0.6s ${delayMs}ms cubic-bezier(0.33, 0, 0.2, 1)`,
  }
}

/**
 * Hook for staggered children reveal (like a grid of cards).
 * Returns a ref for the parent and styles per child index.
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  childCount: number,
  options: ScrollRevealOptions & { staggerMs?: number } = {}
) {
  const { staggerMs = 60, ...revealOpts } = options
  const { ref, isVisible } = useScrollReveal<T>(revealOpts)

  const getChildStyle = useCallback(
    (index: number): React.CSSProperties => revealStyle(isVisible, index * staggerMs),
    [isVisible, staggerMs]
  )

  return { ref, isVisible, getChildStyle }
}
