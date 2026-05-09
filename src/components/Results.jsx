import './Results.css'

function Results({ score, total, onRestart }) {
  const percentage = Math.round((score / total) * 100)
  
  const getResultMessage = () => {
    if (percentage === 100) return "Perfect Score! 🎉"
    if (percentage >= 80) return "Excellent Work! 🌟"
    if (percentage >= 60) return "Good Job! 👍"
    if (percentage >= 40) return "Not Bad! 💪"
    return "Keep Practicing! 📚"
  }

  const getResultDescription = () => {
    if (percentage === 100) return "You're a true master!"
    if (percentage >= 80) return "You really know your stuff!"
    if (percentage >= 60) return "You're doing great!"
    if (percentage >= 40) return "There's room for improvement."
    return "Practice makes perfect!"
  }

  return (
    <div className="results-container">
      <div className="results-icon">
        {percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '📝'}
      </div>
      <h2 className="results-title">{getResultMessage()}</h2>
      <p className="results-description">{getResultDescription()}</p>
      
      <div className="score-circle">
        <svg className="score-svg" viewBox="0 0 160 160">
          <circle
            className="score-circle-bg"
            cx="80"
            cy="80"
            r="70"
          />
          <circle
            className="score-circle-fill"
            cx="80"
            cy="80"
            r="70"
            style={{
              strokeDasharray: `${2 * Math.PI * 70}`,
              strokeDashoffset: `${2 * Math.PI * 70 * (1 - percentage / 100)}`
            }}
          />
        </svg>
        <div className="score-text">
          <div className="score-percentage">{percentage}%</div>
          <div className="score-fraction">{score} / {total}</div>
        </div>
      </div>

      <button className="restart-button" onClick={onRestart}>
        <span>Try Again</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 4 23 10 17 10"></polyline>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
      </button>
    </div>
  )
}

export default Results
