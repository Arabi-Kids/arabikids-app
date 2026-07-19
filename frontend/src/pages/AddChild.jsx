import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { getCurriculum, createChildProfile, computeMaxStageForAge, ageFromDob } from '../lib/db.js';

export default function AddChild() {
  const { user } = useAuth();
  const { childProfiles, setActiveChildId, refreshChildren } = useActiveChild();
  const navigate = useNavigate();

  const [levels, setLevels] = useState([]);
  const [stages, setStages] = useState([]);
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [stageManuallySet, setStageManuallySet] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCurriculum()
      .then(({ levels: lv, stages: st }) => {
        setLevels(lv);
        setStages(st);
      })
      .catch((err) => setError(err.message));
  }, []);

  const age = ageFromDob(dateOfBirth);
  const maxStageId = age != null ? computeMaxStageForAge(age, stages) : stages[0]?.id ?? null;
  const maxStage = stages.find((s) => s.id === maxStageId);
  const eligibleStages = maxStage ? stages.filter((s) => s.orderIndex <= maxStage.orderIndex) : stages;

  useEffect(() => {
    if (stageManuallySet || !eligibleStages.length) return;
    setSelectedStageId(eligibleStages[eligibleStages.length - 1].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxStageId, eligibleStages.length, stageManuallySet]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const child = await createChildProfile({
        parentId: user.id,
        name,
        dateOfBirth: dateOfBirth || null,
        startingStageId: selectedStageId,
        maxStageId,
      });
      await refreshChildren();
      setActiveChildId(child.id);
      navigate('/lessons');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="card auth-card" style={{ maxWidth: 480 }}>
        <h1 className="page-title" style={{ textAlign: 'center' }}>
          {childProfiles.length === 0 ? 'Add Your First Child' : 'Add a Child'}
        </h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          Each child gets their own progress, streak, and starting stage.
        </p>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="childName">Child's Name</label>
            <input id="childName" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="dob">Date of Birth</label>
            <input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="startStage">Starting Stage</label>
            <select
              id="startStage"
              value={selectedStageId ?? ''}
              onChange={(e) => {
                setSelectedStageId(Number(e.target.value));
                setStageManuallySet(true);
              }}
            >
              {levels.map((level) => (
                <optgroup key={level.id} label={level.name}>
                  {level.stages
                    .filter((s) => eligibleStages.some((e) => e.id === s.id))
                    .map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        Stage {stage.orderIndex}: {stage.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
            <p style={{ color: '#8ea0b6', fontSize: '0.85rem', margin: '6px 0 0' }}>
              We picked the stage that best fits their age — you can start earlier if you'd like. (A full placement test is
              coming soon; for now this is a manual pick.)
            </p>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting || !selectedStageId}>
            {submitting ? 'Adding...' : 'Add Child & Start Learning'}
          </button>
        </form>
      </div>
    </div>
  );
}
