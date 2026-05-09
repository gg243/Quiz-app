import { describe, it, expect } from 'vitest'
import { quizData } from './quizData'

describe('Quiz Data', () => {
  it('should have 10 questions', () => {
    expect(quizData).toHaveLength(10)
  })

  it('each question should have required fields', () => {
    quizData.forEach(question => {
      expect(question).toHaveProperty('id')
      expect(question).toHaveProperty('question')
      expect(question).toHaveProperty('options')
      expect(question).toHaveProperty('correctAnswer')
    })
  })

  it('each question should have 4 options', () => {
    quizData.forEach(question => {
      expect(question.options).toHaveLength(4)
    })
  })

  it('correctAnswer should be valid index', () => {
    quizData.forEach(question => {
      expect(question.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(question.correctAnswer).toBeLessThan(4)
    })
  })
})
