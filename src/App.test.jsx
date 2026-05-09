import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Component', () => {
  it('renders the app with logo', () => {
    render(<App />)
    expect(screen.getByText(/QuizMaster/i)).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<App />)
    expect(screen.getByText(/Test your knowledge/i)).toBeInTheDocument()
  })

  it('renders progress component', () => {
    render(<App />)
    expect(screen.getByText(/Progress/i)).toBeInTheDocument()
  })

  it('renders first question', () => {
    render(<App />)
    expect(screen.getByText(/Question 1/i)).toBeInTheDocument()
  })
})
