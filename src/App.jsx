import { useState } from 'react'
import { quizData } from './quizData'
import Question from './components/Question'
import Progress from './components/Progress'
import Results from './components/Results'
import './App.css'

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const handleAnswerSelect = (answerIndex) => {
    const isCorrect = answerIndex === quizData[currentQuestion].correctAnswer
    const newSelectedAnswers = [...selectedAnswers, answerIndex]
    setSelectedAnswers(newSelectedAnswers)

    if (isCorrect) {
      setScore(score + 1)
    }

    // Move to next question or show results
    setTimeout(() => {
      if (currentQuestion < quizData.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        setShowResults(true)
      }
    }, 600)
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswers([])
    setShowResults(false)
    setScore(0)
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="logo">QuizMaster</h1>
          <p className="tagline">Test your knowledge</p>
        </header>

        {!showResults ? (
          <>
            <Progress 
              current={currentQuestion + 1} 
              total={quizData.length}
              percentage={(currentQuestion / quizData.length) * 100}
            />
            <Question 
              question={quizData[currentQuestion]}
              questionNumber={currentQuestion + 1}
              onAnswerSelect={handleAnswerSelect}
              selectedAnswer={selectedAnswers[currentQuestion]}
            />
          </>
        ) : (
          <Results 
            score={score}
            total={quizData.length}
            onRestart={restartQuiz}
          />
        )}
      </div>
    </div>
  )
}

export default App
