import { Link } from 'react-router-dom';
import CharacterAvatar from '../characters/CharacterAvatar.jsx';

/** Final step of every Practical Life flow: finish -> sticker + cheer. */
export default function RewardStep({ demonstratorId, friendId, copy, stickerLabel, completed, submitting, error, onFinish, cheering }) {
  return (
    <div>
      {error && <p className="error-text">{error}</p>}
      {!completed ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <CharacterAvatar id={demonstratorId} state="idle" size={96} style={{ margin: '0 auto 6px' }} />
          <span className="badge badge-free">{copy.readyToFinish}</span>
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-primary btn-chunky" disabled={submitting} onClick={onFinish}>
              {submitting ? copy.saving : copy.finish}
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', background: 'rgba(26,122,74,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            <CharacterAvatar id={demonstratorId} state="cheer" size={110} className={cheering ? 'mascot-cheer' : ''} />
            {friendId && <CharacterAvatar id={friendId} state="cheer" size={90} style={{ alignSelf: 'flex-end' }} />}
          </div>
          <h3 style={{ margin: '8px 0 6px' }}>{copy.rewardTitle}</h3>
          <p style={{ margin: '0 0 6px', fontSize: '1.6rem' }}>⭐</p>
          <p style={{ margin: 0, fontWeight: 700 }}>{stickerLabel}</p>
          <div style={{ marginTop: 16 }}>
            <Link to="/lessons/practical" className="btn btn-primary btn-chunky">{copy.backToHub}</Link>
          </div>
        </div>
      )}
    </div>
  );
}
