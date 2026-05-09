import './Progress.css'

function Progress({ current, total, percentage }) {
  return (
    <div className="progress-container">
      <div className="progress-info">
        <span className="progress-text">Progress</span>
        <span className="progress-count">{current} / {total}</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

export default Progress
