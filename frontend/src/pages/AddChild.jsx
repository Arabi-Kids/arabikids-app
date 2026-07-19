import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import {
  getCurriculum,
  createChildProfile,
  computeMaxStageForAge,
  ageFromDob,
  getPlacementQuestions,
  nextPlacementStep,
  submitPlacementResult,
} from '../lib/db.js';
import HudMascot from '../components/HudMascot.jsx';

export default function AddChild() {
  const { user } = useAuth();
  const { childProfiles, setActiveChildId, refreshChildren } = useActiveChild();
  const navigate = useNavigate();

  const [levels, setLevels] = useState([]);
  const [stages, setStages] = useState([]);
  const [placementQuestions, setPlacementQuestions] = useState([]);
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 'details' -> 'choose' -> 'test' -> 'result'
  const [step, setStep] = useState('details');
  const [answers, setAnswers] = useState([]);
  const [placedOrderIndex, setPlacedOrderIndex] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [manualOverride, setManualOverride] = useState(false);

  useEffect(() => {
    Promise.all([getCurriculum(), getPlacementQuestions()])
      .then(([{ levels: lv, stages: st }, questions]) => {
        setLevels(lv);
        setStages(st);
        setPlacementQuestions(questions);
      })
      .catch((err) => setError(err.message));
  }, []);

  const age = ageFromDob(dateOfBirth);
  const maxStageId = age != null ? computeMaxStageForAge(age, stages) : stages[0]?.id ?? null;
  const maxStage = stages.find((s) => s.id === maxStageId);
  const eligibleStages = maxStage ? stages.filter((s) => s.orderIndex <= maxStage.orderIndex) : stages;
  const maxOrderIndex = maxStage?.orderIndex ?? 1;

  const currentStep = step === 'test' ? nextPlacementStep(placementQuestions, maxOrderIndex, answers) : null;

  function goToChoose(e) {
    e.preventDefault();
    setError('');
    setStep('choose');
  }

  function skipTest() {
    const stage = eligibleStages[0];
    setSelectedStageId(stage.id);
    setPlacedOrderIndex(null);
    setStep('result');
  }

  function startTest() {
    setAnswers([]);
    setStep('test');
  }

  function answerQuestion(option) {
    if (!currentStep || currentStep.done) return;
    const correct = option === currentStep.question.correctAnswer;
    const updated = [...answers, { stageOrderIndex: currentStep.question.stageOrderIndex, correct }];
    setAnswers(updated);
    const next = nextPlacementStep(placementQuestions, maxOrderIndex, updated);
    if (next.done) {
      const placedStage = eligibleStages.find((s) => s.orderIndex === next.placedOrderIndex) || eligibleStages[0];
      setPlacedOrderIndex(next.placedOrderIndex);
      setSelectedStageId(placedStage.id);
      setStep('result');
    }
  }

  async function handleFinalSubmit() {
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
      if (placedOrderIndex != null) {
        await submitPlacementResult({ childId: child.id, rawAnswers: answers, placedStageId: selectedStageId }).catch(() => {});
      }
      await refreshChildren();
      setActiveChildId(child.id);
      navigate('/lessons');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const placedStage = stages.find((s) => s.id === selectedStageId);

  return (
    <div className="container">
      <div className="card auth-card" style={{ maxWidth: 480 }}>
        <HudMascot pose="mark" size={56} style={{ margin: '0 auto 12px', display: 'block' }} />
        <h1 className="page-title" style={{ textAlign: 'center' }}>
          {childProfiles.length === 0 ? 'Add Your First Child' : 'Add a Child'}
        </h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          Each child gets their own progress, streak, and starting stage.
        </p>
        {error && <p className="error-text">{error}</p>}

        {step === 'details' && (
          <form onSubmit={goToChoose}>
            <div className="form-group">
              <label htmlFor="childName">Child's Name</label>
              <input id="childName" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={!name}>
              Continue
            </button>
          </form>
        )}

        {step === 'choose' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#4b5a6a' }}>
              Does {name} already know some Arabic letters or words? A quick 4-5 question quiz can place them
              further along instead of starting from the very first letter.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: 12 }}
              onClick={startTest}
              disabled={eligibleStages.length <= 1}
            >
              Take the Placement Quiz
            </button>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={skipTest}>
              Skip — Start at Stage 1
            </button>
            {eligibleStages.length <= 1 && (
              <p style={{ color: '#8ea0b6', fontSize: '0.85rem', marginTop: 10 }}>
                Based on {name}'s age, Stage 1 is the best starting point — the quiz isn't needed yet.
              </p>
            )}
          </div>
        )}

        {step === 'test' && currentStep && !currentStep.done && (
          <div>
            <p style={{ color: '#8ea0b6', fontSize: '0.85rem', textAlign: 'center', marginTop: -8 }}>
              Question {answers.length + 1} of up to 5
            </p>
            <p style={{ fontWeight: 700, color: 'var(--color-blue-dark)', textAlign: 'center', margin: '12px 0 20px' }}>
              {currentStep.question.instruction}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentStep.question.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%', textAlign: 'center' }}
                  onClick={() => answerQuestion(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'result' && (
          <div style={{ textAlign: 'center' }}>
            <HudMascot pose="celebrate" size={72} style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#4b5a6a' }}>
              {placedOrderIndex != null ? (
                <>We recommend starting {name} at:</>
              ) : (
                <>{name} will start at:</>
              )}
            </p>
            <p style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-blue)', margin: '4px 0 20px' }}>
              Stage {placedStage?.orderIndex}: {placedStage?.name}
            </p>

            {manualOverride && (
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label htmlFor="startStage">Pick a different stage</label>
                <select
                  id="startStage"
                  value={selectedStageId ?? ''}
                  onChange={(e) => setSelectedStageId(Number(e.target.value))}
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
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%', marginBottom: 12 }} onClick={handleFinalSubmit} disabled={submitting}>
              {submitting ? 'Adding...' : `Start Learning at Stage ${placedStage?.orderIndex ?? ''}`}
            </button>
            {!manualOverride && (
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setManualOverride(true)}>
                Choose a Different Stage Instead
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
