export default function ExerciseCard({ exercise, index, selected, onSelect, result }) {
  const isAnswered = result !== undefined;

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <span className="badge badge-locked" style={{ marginBottom: 8 }}>{exercise.title}</span>
      <p style={{ fontWeight: 800, fontSize: '1.1rem', margin: '8px 0 16px' }}>
        {index + 1}. {exercise.instruction}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {exercise.options.map((option) => {
          const isSelected = selected === option;
          let borderColor = '#e0dccd';
          if (isAnswered && isSelected) borderColor = result.correct ? 'var(--color-green)' : '#c0392b';
          else if (isSelected) borderColor = 'var(--color-blue)';

          return (
            <button
              key={option}
              onClick={() => onSelect(exercise.id, option)}
              disabled={isAnswered}
              dir={/[؀-ۿ]/.test(option) ? 'rtl' : undefined}
              className={/[؀-ۿ]/.test(option) ? 'arabic-text' : ''}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${borderColor}`,
                background: isSelected ? 'rgba(27,79,138,0.06)' : '#fff',
                fontWeight: 700,
                fontSize: '1.05rem',
                cursor: isAnswered ? 'default' : 'pointer',
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
      {isAnswered && result.explanation && (
        <p style={{ margin: '14px 0 0', color: result.correct ? 'var(--color-green)' : '#c0392b', fontWeight: 700 }}>
          {result.correct ? '✓ ' : '✗ '}{result.explanation}
        </p>
      )}
    </div>
  );
}
