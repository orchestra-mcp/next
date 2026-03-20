import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { SlideRenderer } from './slide-renderer'

const mockSlides = [
  {
    id: '1',
    slide_number: 1,
    layout: 'title',
    title: 'Welcome to Orchestra',
    content: 'An AI-powered IDE',
    notes: 'Intro slide',
    properties: null,
  },
  {
    id: '2',
    slide_number: 2,
    layout: 'title-content',
    title: 'Architecture',
    content: '- Go backend\n- Rust engine\n- React frontend',
    notes: '',
    properties: null,
  },
  {
    id: '3',
    slide_number: 3,
    layout: 'quote',
    title: '',
    content: 'The future is **agentic**',
    notes: '',
    properties: null,
  },
]

describe('SlideRenderer', () => {
  it('renders empty state when no slides', () => {
    render(<SlideRenderer slides={[]} />)
    expect(screen.getByText('No slides')).toBeInTheDocument()
  })

  it('shows first slide by default', () => {
    render(<SlideRenderer slides={mockSlides} />)
    expect(screen.getByText('Welcome to Orchestra')).toBeInTheDocument()
  })

  it('shows slide counter', () => {
    render(<SlideRenderer slides={mockSlides} />)
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('navigates to next slide on button click', () => {
    render(<SlideRenderer slides={mockSlides} />)
    const nextBtn = screen.getByLabelText('Next slide')
    fireEvent.click(nextBtn)
    expect(screen.getByText('Architecture')).toBeInTheDocument()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('navigates to previous slide on button click', () => {
    render(<SlideRenderer slides={mockSlides} />)
    // Go to slide 2
    fireEvent.click(screen.getByLabelText('Next slide'))
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
    // Go back
    fireEvent.click(screen.getByLabelText('Previous slide'))
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('navigates with arrow keys', () => {
    render(<SlideRenderer slides={mockSlides} />)
    // Right arrow → next
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
    // Left arrow → prev
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('does not go before first slide', () => {
    render(<SlideRenderer slides={mockSlides} />)
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('does not go past last slide', () => {
    render(<SlideRenderer slides={mockSlides} />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
  })

  it('shows presentation title in controls', () => {
    render(<SlideRenderer slides={mockSlides} title="My Deck" />)
    expect(screen.getByText('My Deck')).toBeInTheDocument()
  })

  it('has fullscreen toggle button', () => {
    render(<SlideRenderer slides={mockSlides} />)
    expect(screen.getByLabelText('Fullscreen')).toBeInTheDocument()
  })

  it('renders quote layout with blockquote', () => {
    render(<SlideRenderer slides={mockSlides} />)
    // Navigate to slide 3 (quote)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
    // Quote content should be rendered
    const container = screen.getByTestId('slide-renderer')
    expect(container.querySelector('blockquote')).toBeTruthy()
  })
})
