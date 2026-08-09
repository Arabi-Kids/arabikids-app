import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useActiveChild } from '../context/ActiveChildContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
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
  const { language, t } = useLanguage();
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
    Promise.all([getCurriculum(language), getPlacementQuestions(language)])
      .then(([{ levels: lv, stages: st }, questions]) => {
        setLevels(lv);
        setStages(st);
        setPlacementQuestions(questions);
      })
      .catch((err) => setError(err.message));
  }, [language]);

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
          {childProfiles.length === 0 ? t('addChild.titleFirst') : t('addChild.titleAdditional')}
        </h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          {t('addChild.subtitle')}
        </p>
        {error && <p className="error-text">{error}</p>}

        {step === 'details' && (
          <form onSubmit={goToChoose}>
            <div className="form-group">
              <label htmlFor="childName">{t('addChild.childName')}</label>
              <input id="childName" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="dob">{t('addChild.dateOfBirth')}</label>
              <input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={!name}>
              {t('addChild.continue')}
            </button>
          </form>
        )}

        {step === 'choose' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#4b5a6a' }}>
              {t('addChild.quizIntro', { name })}
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: 12 }}
              onClick={startTest}
              disabled={eligibleStages.length <= 1}
            >
              {t('addChild.takeQuiz')}
            </button>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={skipTest}>
              {t('addChild.skipQuiz')}
            </button>
            {eligibleStages.length <= 1 && (
              <p style={{ color: '#8ea0b6', fontSize: '0.85rem', marginTop: 10 }}>
                {t('addChild.quizNotNeeded', { name })}
              </p>
            )}
          </div>
        )}

        {step === 'test' && currentStep && !currentStep.done && (
          <div>
            <p style={{ color: '#8ea0b6', fontSize: '0.85rem', textAlign: 'center', marginTop: -8 }}>
              {t('addChild.questionProgress', { current: answers.length + 1 })}
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
              {placedOrderIndex != null
                ? t('addChild.recommendStart', { name })
                : t('addChild.willStart', { name })}
            </p>
            <p style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-blue)', margin: '4px 0 20px' }}>
              {t('addChild.stageLabel', { n: placedStage?.orderIndex, name: placedStage?.name })}
            </p>

            {manualOverride && (
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label htmlFor="startStage">{t('addChild.pickDifferentStage')}</label>
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
                            {t('addChild.stageLabel', { n: stage.orderIndex, name: stage.name })}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%', marginBottom: 12 }} onClick={handleFinalSubmit} disabled={submitting}>
              {submitting ? t('addChild.adding') : t('addChild.startLearning', { n: placedStage?.orderIndex ?? '' })}
            </button>
            {!manualOverride && (
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setManualOverride(true)}>
                {t('addChild.chooseDifferent')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
