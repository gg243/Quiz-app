import './Question.css'

function Question({ question, questionNumber, onAnswerSelect, selectedAnswer }) {
  return (
    <div className="question-container">
      <div className="question-header">
        <span className="question-number">Question {questionNumber}</span>
      </div>
      <h2 className="question-text">{question.question}</h2>
      <div className="options-grid">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`option-button ${selectedAnswer === index ? 'selected' : ''} ${
              selectedAnswer !== undefined
                ? index === question.correctAnswer
                  ? 'correct'
                  : selectedAnswer === index
                  ? 'incorrect'
                  : ''
                : ''
            }`}
            onClick={() => selectedAnswer === undefined && onAnswerSelect(index)}
            disabled={selectedAnswer !== undefined}
          >
            <span className="option-letter">{String.fromCharCode(65 + index)}</span>
            <span className="option-text">{option}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Question
