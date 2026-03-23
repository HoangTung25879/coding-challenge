import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('adds left padding when leftIcon is provided', () => {
    render(<Input leftIcon={<span data-testid="icon">🔍</span>} placeholder="search" />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('search').className).toContain('pl-8')
  })

  it('adds right padding when rightIcon is provided', () => {
    render(<Input rightIcon={<span data-testid="icon">✕</span>} placeholder="search" />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('search').className).toContain('pr-8')
  })

  it('shows error message and applies error styling', () => {
    render(<Input error="Required field" placeholder="name" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('name').className).toContain('border-red-300')
  })

  it('applies normal styling when no error', () => {
    render(<Input placeholder="name" />)
    expect(screen.getByPlaceholderText('name').className).toContain('border-gray-300')
  })
})
