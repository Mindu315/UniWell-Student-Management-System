import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import itNewSyllabus from '../it_data/it_new_syllabus.json';
import itOldSyllabus from '../it_data/it_old_syllabus.json';
import seNewSyllabus from '../it_data/se_new_syllabus.json';
import seOldSyllabus from '../it_data/se_old_syllabus.json';
import dsNewSyllabus from '../it_data/ds_new_syllabus.json';
import dsOldSyllabus from '../it_data/ds_old_syllabus.json';
import cyberNewSyllabus from '../it_data/cyber_new_syllabus.json';
import cyberOldSyllabus from '../it_data/cyber_old_syllabus.json';
import imNewSyllabus from '../it_data/im_new_syllabus.json';
import imOldSyllabus from '../it_data/im_old_syllabus.json';
import csSyllabus from '../it_data/cs_syllabus.json';
import csneNewSyllabus from '../it_data/csne_new_syllabus.json';
import csneOldSyllabus from '../it_data/csne_old_syllabus.json';
import iseNewSyllabus from '../it_data/ise_new_syllabus.json';
import iseOldSyllabus from '../it_data/ise_old_syllabus.json';
import gradingStyle from '../it_data/grading_style.json';

const syllabusMap = {
  it: { new: itNewSyllabus, old: itOldSyllabus },
  se: { new: seNewSyllabus, old: seOldSyllabus },
  ds: { new: dsNewSyllabus, old: dsOldSyllabus },
  cyber: { new: cyberNewSyllabus, old: cyberOldSyllabus },
  im: { new: imNewSyllabus, old: imOldSyllabus },
  cs: { new: csSyllabus, old: csSyllabus },
  csne: { new: csneNewSyllabus, old: csneOldSyllabus },
  ise: { new: iseNewSyllabus, old: iseOldSyllabus },
};

// ── Grade utilities ──
const gradePointMap = Object.fromEntries(gradingStyle.map((g) => [g.grade, g.gradePoint]));
const getGradePoint = (grade) => gradePointMap[grade] ?? null;
const passGrades = gradingStyle.filter((g) => g.isPass).sort((a, b) => b.gradePoint - a.gradePoint);
const allGradesSorted = [...gradingStyle].sort((a, b) => b.gradePoint - a.gradePoint);

const getGradeForGP = (gp) => {
  const sorted = [...gradingStyle].sort((a, b) => a.gradePoint - b.gradePoint);
  for (const g of sorted) if (g.gradePoint >= gp) return g;
  return sorted[sorted.length - 1];
};

const getGradePalette = (grade) => {
  if (!grade) return 'bg-[#F7F9FB] text-[#6B7280] border border-gray-200';
  if (['A+', 'A', 'A-'].includes(grade)) return 'bg-[#2BB673]/10 text-[#2BB673] border border-[#2BB673]/20';
  if (['B+', 'B', 'B-'].includes(grade)) return 'bg-[#1F5F73]/10 text-[#1F5F73] border border-[#1F5F73]/20';
  if (['C+', 'C', 'C-'].includes(grade)) return 'bg-[#F2994A]/10 text-[#F2994A] border border-[#F2994A]/20';
  return 'bg-red-50 text-red-500 border border-red-200';
};

const getConfidenceConfig = (confidence) => {
  if (confidence >= 80) return { label: 'Very Likely', color: 'text-[#2BB673]', bar: '#2BB673' };
  if (confidence >= 60) return { label: 'Likely', color: 'text-[#1F5F73]', bar: '#1F5F73' };
  if (confidence >= 40) return { label: 'Challenging', color: 'text-[#F2994A]', bar: '#F2994A' };
  if (confidence >= 20) return { label: 'Hard', color: 'text-orange-500', bar: '#F2994A' };
  return { label: 'Very Hard', color: 'text-red-500', bar: '#ef4444' };
};

const getClassification = (gpa) => {
  if (gpa >= 3.7) return 'First Class';
  if (gpa >= 3.3) return '2nd Upper';
  if (gpa >= 3.0) return '2nd Lower';
  if (gpa >= 2.0) return 'General Pass';
  if (gpa > 0) return 'Below Std.';
  return '';
};

// ── Core algorithm ──
const computeCurrentStats = (syllabusData, selectedGrades) => {
  let totalPoints = 0, totalCredits = 0;
  const completedModules = [];
  const futureModules = [];

  syllabusData.forEach((mod) => {
    if (!mod.isGPA) return;
    const grade = selectedGrades[mod.moduleCode];
    if (grade) {
      const gp = getGradePoint(grade);
      if (gp !== null) {
        totalPoints += gp * mod.credits;
        totalCredits += mod.credits;
        completedModules.push({ ...mod, grade, gp });
      }
    } else {
      futureModules.push(mod);
    }
  });

  const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  return { cgpa, totalPoints, totalCredits, completedModules, futureModules };
};

// ── Smart grade distribution algorithm ──
// Assigns different minimum grades per module so their weighted GP sum exactly hits
// the required total. Most modules get the floor grade; a few smallest-credit modules
// are upgraded one step to ceiling grade to cover the deficit.
const assignSmartGrades = (futureModules, requiredAvgGP) => {
  if (futureModules.length === 0) return [];

  const clampedGP = Math.max(0, Math.min(4.0, requiredAvgGP));

  // Sort pass grades ascending by grade point
  const passOnly = [...gradingStyle].filter(g => g.isPass).sort((a, b) => a.gradePoint - b.gradePoint);

  // Ceiling = minimum passing grade with GP >= required
  const ceilGrade = passOnly.find(g => g.gradePoint >= clampedGP) || passOnly[passOnly.length - 1];
  const ceilIdx = passOnly.indexOf(ceilGrade);
  // Floor = one grade below ceiling
  const floorGrade = ceilIdx > 0 ? passOnly[ceilIdx - 1] : ceilGrade;

  // If floor === ceiling (exact match or lowest passing grade), assign uniformly
  if (floorGrade.gradePoint === ceilGrade.gradePoint) {
    return futureModules.map(mod => ({
      ...mod, suggestedGrade: ceilGrade.grade, suggestedGP: ceilGrade.gradePoint, isUpgraded: false,
    }));
  }

  const totalFutureCredits = futureModules.reduce((s, m) => s + m.credits, 0);
  const requiredTotalPoints = clampedGP * totalFutureCredits;
  const basePoints = floorGrade.gradePoint * totalFutureCredits;
  let deficit = requiredTotalPoints - basePoints;
  const gainPerCredit = ceilGrade.gradePoint - floorGrade.gradePoint;

  // Start: all modules at floor
  const result = futureModules.map(mod => ({
    ...mod, suggestedGrade: floorGrade.grade, suggestedGP: floorGrade.gradePoint, isUpgraded: false,
  }));

  if (deficit <= 0.0001) return result;

  // Upgrade smallest-credit modules first → maximises variety (more modules stay at floor)
  const upgradeOrder = [...result].sort((a, b) => a.credits - b.credits);
  for (const mod of upgradeOrder) {
    if (deficit <= 0.0001) break;
    const target = result.find(
      m => m.moduleCode === mod.moduleCode && m.year === mod.year && m.semester === mod.semester && !m.isUpgraded
    );
    if (target) {
      target.suggestedGrade = ceilGrade.grade;
      target.suggestedGP = ceilGrade.gradePoint;
      target.isUpgraded = true;
      deficit -= gainPerCredit * mod.credits;
    }
  }

  return result;
};

const computePrediction = (stats, targetGPA) => {

  const { totalPoints, totalCredits, completedModules, futureModules } = stats;
  const futureCredits = futureModules.reduce((s, m) => s + m.credits, 0);
  const grandTotalCredits = totalCredits + futureCredits;

  if (grandTotalCredits === 0 || futureCredits === 0) {
    return { isAchievable: false, requiredAvgGP: 99, maxPossible: stats.cgpa, futureCredits: 0, futureModules: [], futureGrades: [], repeatPlan: null, confidence: 0 };
  }

  const requiredAvgGP = (targetGPA * grandTotalCredits - totalPoints) / futureCredits;
  const maxPossible = (totalPoints + 4.0 * futureCredits) / grandTotalCredits;
  const isAchievable = requiredAvgGP <= 4.0 && requiredAvgGP >= 0;

  // Smart grade distribution — different grades per module
  const futureGrades = assignSmartGrades(futureModules, requiredAvgGP, totalPoints, totalCredits, targetGPA, grandTotalCredits);

  // Confidence scoring
  let confidence = 0;
  if (requiredAvgGP <= 0) confidence = 99;
  else if (requiredAvgGP <= 2.0) confidence = 95;
  else if (requiredAvgGP <= 2.7) confidence = 80;
  else if (requiredAvgGP <= 3.0) confidence = 65;
  else if (requiredAvgGP <= 3.3) confidence = 50;
  else if (requiredAvgGP <= 3.7) confidence = 35;
  else if (requiredAvgGP <= 4.0) confidence = 15;

  // Repeat plan (always compute when not achievable)
  let repeatPlan = null;
  if (!isAchievable) {
    repeatPlan = computeRepeatPlan(completedModules, targetGPA, futureCredits, totalPoints, totalCredits);
  }

  return { isAchievable, requiredAvgGP: Math.max(0, requiredAvgGP), maxPossible, futureCredits, grandTotalCredits, futureModules, futureGrades, repeatPlan, confidence };
};

const computeRepeatPlan = (completedModules, targetGPA, futureCredits, currentPoints, currentCredits) => {
  const TARGET_REPEAT_GP = 3.7; // A-
  const candidates = completedModules
    .filter((m) => (TARGET_REPEAT_GP - m.gp) * m.credits > 0.001)
    .sort((a, b) => ((TARGET_REPEAT_GP - b.gp) * b.credits) - ((TARGET_REPEAT_GP - a.gp) * a.credits));

  let simPoints = currentPoints;
  const repeatList = [];

  for (const mod of candidates) {
    const gain = (TARGET_REPEAT_GP - mod.gp) * mod.credits;
    simPoints += gain;
    const grandTotal = currentCredits + futureCredits;
    const newMaxPossible = (simPoints + 4.0 * futureCredits) / grandTotal;
    const cgpaAfterRepeat = simPoints / currentCredits;

    // Required avg GP for future modules after this repeat
    const reqAvgAfter = (targetGPA * grandTotal - simPoints) / futureCredits;
    const futureGradeNeeded = getGradeForGP(Math.max(0, Math.min(4, reqAvgAfter)));

    repeatList.push({
      ...mod,
      currentGrade: mod.grade,
      currentGP: mod.gp,
      newGrade: 'A-',
      newGP: TARGET_REPEAT_GP,
      gainPoints: gain,
      cgpaAfter: cgpaAfterRepeat,
      maxPossibleAfter: newMaxPossible,
      isEnough: newMaxPossible >= targetGPA,
      requiredFutureGP: reqAvgAfter,
      futureGradeNeeded: futureGradeNeeded.grade,
    });
    if (newMaxPossible >= targetGPA) break;
  }

  const finalMax = repeatList.length > 0 ? repeatList[repeatList.length - 1].maxPossibleAfter : (currentPoints + 4.0 * futureCredits) / (currentCredits + futureCredits);

  // Also compute what grades are needed in future modules IF all repeats are done
  let futureGradesAfterRepeat = [];
  if (repeatList.length > 0) {
    const lastRepeat = repeatList[repeatList.length - 1];
    if (lastRepeat.isEnough) {
      const reqGP = lastRepeat.requiredFutureGP;
      const neededGrade = getGradeForGP(Math.max(0, Math.min(4, reqGP)));
      futureGradesAfterRepeat = [{ requiredAvgGP: reqGP, grade: neededGrade.grade, gp: neededGrade.gradePoint }];
    }
  }

  return { repeatList, finalMaxPossible: finalMax, futureGradesAfterRepeat };
};

// ── Sub-components ──
const StepBadge = ({ number }) => (
  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#1F5F73] flex items-center justify-center shrink-0 shadow-sm">
    <span className="text-[11px] font-black text-white">{number}</span>
  </div>
);

const SectionCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden ${className}`}>
    {children}
  </div>
);

// ── Main Component ──
const TargetPredictor = ({ selectedGrades = {} }) => {
  const { specialization, syllabusType } = useParams();
  const syllabusData = syllabusMap[specialization]?.[syllabusType] || [];

  const [targetGPA, setTargetGPA] = useState(3.0);
  const [targetGPAInput, setTargetGPAInput] = useState('3.00');
  const [preferredGrade, setPreferredGrade] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const currentStats = useMemo(() => computeCurrentStats(syllabusData, selectedGrades), [syllabusData, selectedGrades]);
  const prediction = useMemo(() => computePrediction(currentStats, targetGPA), [currentStats, targetGPA]);

  const preferredOutcome = useMemo(() => {
    if (!preferredGrade) return null;
    const gp = getGradePoint(preferredGrade);
    if (gp === null || prediction.futureCredits === 0) return null;
    return (currentStats.totalPoints + gp * prediction.futureCredits) / (currentStats.totalCredits + prediction.futureCredits);
  }, [preferredGrade, currentStats, prediction]);

  // ── Validation: 0-4 range, no negatives ──
  const handleTargetGPAInput = (val) => {
    if (val.includes('-')) return;
    setTargetGPAInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      if (num < 0) return;
      if (num > 4.0) { setTargetGPAInput('4.00'); setTargetGPA(4.0); return; }
      setTargetGPA(num);
    }
  };

  const handleSliderChange = (val) => {
    const num = parseFloat(val);
    setTargetGPA(num);
    setTargetGPAInput(num.toFixed(2));
  };

  const getMotivation = () => {
    if (!prediction.isAchievable)
      return { emoji: '⚠️', text: 'Target not reachable with future modules alone — see the Repeat Advisor below for a path forward.', type: 'error' };
    if (prediction.requiredAvgGP > 3.7)
      return { emoji: '🔥', text: 'Extremely ambitious — near-perfect scores needed in every upcoming module!', type: 'warning' };
    if (prediction.requiredAvgGP > 3.3)
      return { emoji: '💪', text: 'Push hard! Consistent top effort this semester will get you there.', type: 'warning' };
    if (prediction.requiredAvgGP > 2.7)
      return { emoji: '🎯', text: 'Very achievable with steady effort. Stay on track!', type: 'info' };
    return { emoji: '✅', text: 'Comfortably within reach. Keep up the great work!', type: 'success' };
  };

  const motivationStyleMap = {
    error: { bg: 'bg-red-50 border border-red-100', text: 'text-red-600' },
    warning: { bg: 'bg-[#F2994A]/8 border border-[#F2994A]/15', text: 'text-[#F2994A]' },
    info: { bg: 'bg-[#1F5F73]/8 border border-[#1F5F73]/15', text: 'text-[#1F5F73]' },
    success: { bg: 'bg-[#2BB673]/8 border border-[#2BB673]/15', text: 'text-[#2BB673]' },
  };

  const motivation = getMotivation();
  const motivStyle = motivationStyleMap[motivation.type];
  const confidenceConfig = getConfidenceConfig(prediction.confidence);
  const hasGrades = currentStats.totalCredits > 0;
  const hasFutureModules = prediction.futureCredits > 0;

  // Group future modules by semester
  const futureGrouped = useMemo(() => {
    const groups = {};
    prediction.futureGrades.forEach((mod) => {
      const key = `Y${mod.year} S${mod.semester}`;
      if (!groups[key]) groups[key] = { label: key, year: mod.year, semester: mod.semester, modules: [] };
      groups[key].modules.push(mod);
    });
    return Object.values(groups).sort((a, b) => a.year !== b.year ? a.year - b.year : a.semester - b.semester);
  }, [prediction.futureGrades]);

  const fadeIn = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(18px)',
    transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
  });

  // ── No grades state ──
  if (!hasGrades) {
    return (
      <div className="flex flex-col items-center justify-center py-24 sm:py-36" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease' }}>
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1E3A5F]/10 to-[#1F5F73]/10 flex items-center justify-center mb-5 shadow-sm">
          <svg className="w-9 h-9 text-[#1E3A5F]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#1C2A39] mb-2">No Grades Found</h2>
        <p className="text-sm text-[#6B7280] text-center max-w-xs leading-relaxed">
          Head to the GPA Calculator and enter your module grades first to unlock the Target Predictor.
        </p>
        <div className="mt-6 flex items-center gap-1.5 text-xs text-[#1E3A5F] font-semibold bg-[#1E3A5F]/8 px-4 py-2 rounded-full">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm2.25-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm2.25-6.75V4.5A2.25 2.25 0 0012.75 2h-1.5A2.25 2.25 0 009 4.5v.75m6.75 0h-6.75m6.75 0v13.5A2.25 2.25 0 0113.5 21h-3a2.25 2.25 0 01-2.25-2.25V5.25" /></svg>
          Go to Calculator tab
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">

      {/* ── Header ── */}
      <div style={fadeIn(0)} className="px-6 py-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2A39] tracking-tight">Target Predictor</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Set your CGPA goal and see exactly what grades you need — or which modules to repeat.
        </p>
      </div>

      {/* ══ STEP 1: Current Standing ══ */}
      <div style={fadeIn(60)}>
        <SectionCard>
          <div className="h-1 bg-gradient-to-r from-[#1E3A5F] to-[#1F5F73]" />
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <StepBadge number="1" />
              <div>
                <h2 className="text-sm font-bold text-[#1C2A39]">Your Current Standing</h2>
                <p className="text-[10px] text-[#6B7280] mt-0.5">{currentStats.completedModules.length} modules · {currentStats.totalCredits} credits completed</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl p-3.5 text-center bg-gradient-to-br from-[#1E3A5F]/6 to-[#1F5F73]/6 border border-[#1E3A5F]/10">
                <p className="text-[9px] font-black text-[#6B7280] uppercase tracking-[0.15em] mb-1">Current CGPA</p>
                <p className="text-2xl font-black text-[#1E3A5F]">{currentStats.cgpa.toFixed(2)}</p>
                {getClassification(currentStats.cgpa) && (
                  <p className="text-[9px] font-bold text-[#1E3A5F]/60 mt-0.5">{getClassification(currentStats.cgpa)}</p>
                )}
              </div>
              <div className="rounded-xl p-3.5 text-center bg-[#F7F9FB] border border-gray-100">
                <p className="text-[9px] font-black text-[#6B7280] uppercase tracking-[0.15em] mb-1">Future Modules</p>
                <p className="text-2xl font-black text-[#1C2A39]">{currentStats.futureModules.length}</p>
                <p className="text-[9px] text-[#6B7280] mt-0.5">{prediction.futureCredits} credits left</p>
              </div>
              <div className="rounded-xl p-3.5 text-center bg-gradient-to-br from-[#2BB673]/6 to-[#1F5F73]/6 border border-[#2BB673]/15">
                <p className="text-[9px] font-black text-[#6B7280] uppercase tracking-[0.15em] mb-1">Max Possible</p>
                <p className="text-2xl font-black text-[#2BB673]">{prediction.maxPossible.toFixed(2)}</p>
                <p className="text-[9px] text-[#6B7280] mt-0.5">with A+ in all</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-semibold text-[#6B7280]">
                <span>Current GPA progress</span>
                <span>{((currentStats.cgpa / 4) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${(currentStats.cgpa / 4) * 100}%`, background: 'linear-gradient(90deg, #1E3A5F, #2BB673)' }} />
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ══ STEP 2: Target GPA Setter ══ */}
      <div style={fadeIn(120)}>
        <SectionCard>
          <div className="h-1 bg-gradient-to-r from-[#1F5F73] to-[#2BB673]" />
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <StepBadge number="2" />
              <div>
                <h2 className="text-sm font-bold text-[#1C2A39]">Set Your Target CGPA</h2>
                <p className="text-[10px] text-[#6B7280] mt-0.5">Drag the slider or type your target (0.00 – 4.00)</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="flex-1 w-full space-y-3">
                <div className="flex justify-between text-[9px] font-bold text-[#6B7280] uppercase tracking-wider px-0.5">
                  <span>1.00</span>
                  <span className="text-[#F2994A]">Pass 2.0</span>
                  <span className="text-[#1F5F73]">2nd Lower 3.0</span>
                  <span className="text-[#1E3A5F]">1st 3.7</span>
                  <span>4.00</span>
                </div>
                <input type="range" min="1.0" max="4.0" step="0.05" value={targetGPA}
                  onChange={(e) => handleSliderChange(e.target.value)}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #1E3A5F 0%, #2BB673 ${((targetGPA - 1) / 3) * 100}%, #e5e7eb ${((targetGPA - 1) / 3) * 100}%, #e5e7eb 100%)`, accentColor: '#1E3A5F' }}
                />
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: 'Pass', value: 2.0, color: 'border-[#F2994A]/30 text-[#F2994A] bg-[#F2994A]/5 hover:bg-[#F2994A]/10' },
                    { label: '2nd Low', value: 3.0, color: 'border-[#1F5F73]/30 text-[#1F5F73] bg-[#1F5F73]/5 hover:bg-[#1F5F73]/10' },
                    { label: '2nd Upp', value: 3.3, color: 'border-[#1E3A5F]/30 text-[#1E3A5F] bg-[#1E3A5F]/5 hover:bg-[#1E3A5F]/10' },
                    { label: '1st Cls', value: 3.7, color: 'border-[#2BB673]/30 text-[#2BB673] bg-[#2BB673]/5 hover:bg-[#2BB673]/10' },
                  ].map((q) => (
                    <button key={q.label} onClick={() => handleSliderChange(q.value.toFixed(2))}
                      className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all duration-200 ${q.color} ${Math.abs(targetGPA - q.value) < 0.04 ? 'scale-105 shadow-sm' : ''}`}
                    >
                      {q.label} {q.value.toFixed(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input type="number" min="0" max="4.0" step="0.01" value={targetGPAInput}
                  onChange={(e) => handleTargetGPAInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === '-' || e.key === '+') e.preventDefault(); }}
                  onPaste={(e) => { if (e.clipboardData.getData('text').includes('-')) e.preventDefault(); }}
                  className="w-20 h-12 text-center text-2xl font-black text-[#1E3A5F] border-2 border-[#1E3A5F]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/25 focus:border-[#1E3A5F]/50 transition-all bg-[#1E3A5F]/4"
                />
                <span className="text-sm text-[#6B7280] font-medium">/ 4.00</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ══ STEP 3: Grade Simulator (optional) ══ */}
      {hasFutureModules && (
        <div style={fadeIn(180)}>
          <SectionCard>
            <div className="h-1 bg-gradient-to-r from-[#2BB673] to-[#F2994A]" />
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <StepBadge number="3" />
                <div>
                  <h2 className="text-sm font-bold text-[#1C2A39]">Grade Simulator <span className="font-normal text-[#6B7280]">(optional)</span></h2>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">See what CGPA you'd reach if you scored this grade in all upcoming modules</p>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {passGrades.map((g) => (
                  <button key={g.grade} onClick={() => setPreferredGrade(preferredGrade === g.grade ? '' : g.grade)}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border-2 transition-all duration-200 font-bold text-sm hover:scale-105 active:scale-95 ${preferredGrade === g.grade
                      ? 'border-[#1E3A5F] bg-gradient-to-br from-[#1E3A5F] to-[#1F5F73] text-white scale-105 shadow-md'
                      : getGradePalette(g.grade)}`}
                  >
                    <span className="text-sm font-black">{g.grade}</span>
                    <span className={`text-[9px] font-semibold mt-0.5 ${preferredGrade === g.grade ? 'text-white/70' : 'opacity-50'}`}>{g.gradePoint.toFixed(1)}</span>
                  </button>
                ))}
              </div>

              {preferredGrade && preferredOutcome !== null && (
                <div className={`mt-4 p-4 rounded-xl flex items-center gap-4 border transition-all duration-300 ${getGradePalette(preferredGrade)}`}>
                  <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-xl shrink-0">🎓</div>
                  <div>
                    <p className="text-xs text-[#6B7280]">If you score <strong className="text-[#1C2A39]">{preferredGrade}</strong> in all upcoming modules, your CGPA would be:</p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <p className="text-2xl font-black text-[#1C2A39]">{preferredOutcome.toFixed(2)}</p>
                      <span className="text-sm text-[#6B7280]">/ 4.00</span>
                      {getClassification(preferredOutcome) && (
                        <span className="text-[10px] font-bold text-[#1E3A5F] bg-[#1E3A5F]/8 px-2 py-0.5 rounded-full ml-1">{getClassification(preferredOutcome)}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ══ Prediction Result ══ */}
      {hasGrades && hasFutureModules ? (
        <div style={fadeIn(240)}>
          <div className={`rounded-2xl border-2 shadow-md overflow-hidden transition-all duration-500 ${prediction.isAchievable ? 'border-[#2BB673]/25' : 'border-red-200'}`}>
            <div className={`px-5 sm:px-6 py-4 flex items-center justify-between ${prediction.isAchievable ? 'bg-gradient-to-r from-[#1E3A5F] to-[#1F5F73]' : 'bg-gradient-to-r from-red-600 to-red-500'}`}>
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{motivation.emoji}</span>
                <div>
                  <h2 className="text-sm font-bold text-white">Prediction Result</h2>
                  <p className="text-[10px] text-white/60 mt-0.5">Target: {targetGPA.toFixed(2)} CGPA · Current: {currentStats.cgpa.toFixed(2)}</p>
                </div>
              </div>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${prediction.isAchievable ? 'bg-[#2BB673]/20 text-[#2BB673] border-[#2BB673]/30' : 'bg-white/10 text-white border-white/20'}`}>
                {prediction.isAchievable ? '✓ Achievable' : '✗ Not Achievable Alone'}
              </span>
            </div>

            <div className="bg-white p-5 sm:p-6">
              {prediction.isAchievable ? (
                <div className="space-y-5">
                  {/* Required grade + Feasibility */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-gray-100 bg-[#F7F9FB] p-4">
                      <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.14em] mb-2">Required Avg Grade</p>
                      <span className={`text-5xl font-black ${prediction.requiredAvgGP > 3.3 ? 'text-[#F2994A]' : 'text-[#2BB673]'}`}>
                        {getGradeForGP(prediction.requiredAvgGP).grade}
                      </span>
                      <p className="text-xs text-[#6B7280] mt-1.5 font-medium">{getGradeForGP(prediction.requiredAvgGP).gradePoint.toFixed(1)} GP avg needed</p>
                      <p className="text-[10px] text-[#6B7280] mt-0.5">Min avg GP: <span className="font-bold text-[#1C2A39]">{prediction.requiredAvgGP.toFixed(2)}</span></p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-[#F7F9FB] p-4 flex flex-col items-center justify-center">
                      <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.14em] mb-2">Feasibility</p>
                      <div className="relative w-20 h-20">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                          <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={confidenceConfig.bar} strokeWidth="3" strokeDasharray={`${prediction.confidence}, 100`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.7s ease' }} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg font-black text-[#1C2A39]">{prediction.confidence}%</span>
                        </div>
                      </div>
                      <p className={`text-xs font-bold mt-1.5 ${confidenceConfig.color}`}>{confidenceConfig.label}</p>
                    </div>
                  </div>

                  <div className={`flex items-start gap-3 p-4 rounded-xl ${motivStyle.bg}`}>
                    <span className="text-lg shrink-0 mt-0.5">{motivation.emoji}</span>
                    <p className={`text-sm font-semibold leading-relaxed ${motivStyle.text}`}>{motivation.text}</p>
                  </div>

                  {/* Future modules grouped by semester */}
                  <div>
                    <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.14em] mb-3">Grades needed per upcoming module</p>
                    <div className="space-y-4">
                      {futureGrouped.map((group) => (
                        <div key={group.label}>
                          <p className="text-xs font-bold text-[#1E3A5F] mb-2 flex items-center gap-2">
                            <span className="bg-[#1E3A5F]/8 px-2 py-0.5 rounded-lg text-[10px] font-black">{group.label}</span>
                            <span className="text-[10px] text-[#6B7280] font-medium">{group.modules.reduce((s, m) => s + m.credits, 0)} credits</span>
                          </p>
                          <div className="space-y-2">
                            {group.modules.map((mod) => (
                              <div key={mod.moduleCode + mod.year + mod.semester} className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F9FB] border border-gray-100 hover:border-[#1E3A5F]/15 hover:bg-white transition-all duration-200">
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black text-[#1E3A5F] bg-[#1E3A5F]/8 px-2 py-0.5 rounded-lg shrink-0">{mod.moduleCode}</span>
                                  <div>
                                    <p className="text-xs font-semibold text-[#1C2A39]">{mod.moduleName}</p>
                                    <p className="text-[10px] text-[#6B7280]">{mod.credits} credits</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all duration-200 ${
                                    mod.isUpgraded
                                      ? 'text-[#F2994A] bg-[#F2994A]/10 border-[#F2994A]/25'
                                      : 'text-[#2BB673] bg-[#2BB673]/10 border-[#2BB673]/25'
                                  }`}>
                                    {mod.suggestedGrade}
                                  </span>
                                  {mod.isUpgraded && (
                                    <span className="text-[9px] font-bold text-[#F2994A]/70">↑</span>
                                  )}
                                </div>
                              </div>
                            ))}

                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Color legend */}
                    <div className="mt-3 flex flex-wrap items-center gap-4 px-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2BB673] shrink-0" />
                        <span className="text-[10px] text-[#6B7280]">Minimum grade sufficient</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F2994A] shrink-0" />
                        <span className="text-[10px] text-[#6B7280]">One grade higher needed <span className="font-bold text-[#F2994A]">↑</span></span>
                      </div>
                      <span className="text-[10px] text-[#6B7280]/60 italic ml-auto">Minimum-effort plan</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                    <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-600">Target not reachable with future modules alone</p>
                      <p className="text-xs text-red-400 mt-0.5">Even with A+ in all upcoming modules, max CGPA = <strong>{prediction.maxPossible.toFixed(2)}</strong></p>
                    </div>
                  </div>

                  {/* Still show what grades needed in future modules */}
                  <div>
                    <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.14em] mb-3">
                      Grades needed in future modules (assuming repeats below)
                    </p>
                    {prediction.repeatPlan && prediction.repeatPlan.repeatList.some(r => r.isEnough) && (
                      <div className="space-y-2 mb-4">
                        {futureGrouped.map((group) => (
                          <div key={group.label}>
                            <p className="text-xs font-bold text-[#1E3A5F] mb-2 flex items-center gap-2">
                              <span className="bg-[#1E3A5F]/8 px-2 py-0.5 rounded-lg text-[10px] font-black">{group.label}</span>
                            </p>
                            <div className="space-y-2">
                              {group.modules.map((mod) => {
                                const lastEnough = prediction.repeatPlan.repeatList.find(r => r.isEnough);
                                const neededGrade = lastEnough ? getGradeForGP(Math.max(0, Math.min(4, lastEnough.requiredFutureGP))) : getGradeForGP(4.0);
                                return (
                                  <div key={mod.moduleCode + mod.year + mod.semester} className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F9FB] border border-gray-100 hover:border-[#1E3A5F]/15 hover:bg-white transition-all duration-200">
                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-black text-[#1E3A5F] bg-[#1E3A5F]/8 px-2 py-0.5 rounded-lg shrink-0">{mod.moduleCode}</span>
                                      <div>
                                        <p className="text-xs font-semibold text-[#1C2A39]">{mod.moduleName}</p>
                                        <p className="text-[10px] text-[#6B7280]">{mod.credits} credits</p>
                                      </div>
                                    </div>
                                    <span className="px-3 py-1.5 rounded-xl text-xs font-black border text-[#F2994A] bg-[#F2994A]/8 border-[#F2994A]/20">
                                      {neededGrade.grade}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={() => handleSliderChange(prediction.maxPossible.toFixed(2))}
                    className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[#1E3A5F] border border-[#1E3A5F]/20 bg-[#1E3A5F]/5 hover:bg-[#1E3A5F]/10 rounded-xl py-3 transition-all duration-200 hover:shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Adjust target to achievable max: {prediction.maxPossible.toFixed(2)}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : hasGrades && !hasFutureModules ? (
        <div style={fadeIn(240)} className="rounded-2xl border-2 border-dashed border-[#2BB673]/30 bg-[#2BB673]/5 p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#2BB673]/15 flex items-center justify-center text-2xl mb-3">🎓</div>
          <p className="text-sm font-semibold text-[#1C2A39]">All modules graded!</p>
          <p className="text-xs text-[#6B7280] mt-1">Your final CGPA is <strong className="text-[#1E3A5F]">{currentStats.cgpa.toFixed(2)}</strong></p>
        </div>
      ) : null}

      {/* ══ Module Repeat Advisor ══ */}
      {hasGrades && hasFutureModules && !prediction.isAchievable && prediction.repeatPlan && (
        <div style={fadeIn(300)}>
          <div className="rounded-2xl border-2 border-[#F2994A]/30 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-[#F2994A]/10 to-[#F2994A]/5 px-5 sm:px-6 py-4 border-b border-[#F2994A]/15">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F2994A]/15 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#F2994A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-[#1C2A39]">Module Repeat Advisor</h2>
                    <span className="text-[10px] font-black bg-[#F2994A]/15 text-[#F2994A] px-2 py-0.5 rounded-full">Smart Plan</span>
                  </div>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">Modules ranked by CGPA boost — retake these to make your target reachable</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 space-y-4">
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#F2994A]/6 border border-[#F2994A]/12">
                <svg className="w-4 h-4 text-[#F2994A] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[11px] text-[#1C2A39] leading-relaxed">
                  Identifies modules where repeating and scoring <strong>A- (3.7)</strong> gives the highest CGPA gain.
                  Modules are added until your target becomes achievable with the combination of repeats + future grades.
                </p>
              </div>

              {prediction.repeatPlan.repeatList.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#F7F9FB] border border-gray-100 text-center">
                  <span className="text-3xl">😔</span>
                  <p className="text-sm font-bold text-[#1C2A39] mt-2">No combination found that reaches this target.</p>
                  <p className="text-xs text-[#6B7280] mt-1">Try lowering your target CGPA.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {prediction.repeatPlan.repeatList.map((mod, idx) => (
                    <div key={mod.moduleCode + idx}
                      className={`rounded-xl border p-4 transition-all duration-300 ${mod.isEnough ? 'bg-[#2BB673]/4 border-[#2BB673]/25 shadow-sm ring-1 ring-[#2BB673]/15' : 'bg-[#F7F9FB] border-gray-100'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-black text-xs mt-0.5 ${mod.isEnough ? 'bg-[#2BB673] text-white shadow-sm' : 'bg-[#F2994A]/15 text-[#F2994A]'}`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="text-[10px] font-black text-[#1E3A5F] bg-[#1E3A5F]/8 px-2 py-0.5 rounded-lg">{mod.moduleCode}</span>
                            <span className="text-xs font-semibold text-[#1C2A39]">{mod.moduleName}</span>
                            <span className="text-[10px] text-[#6B7280] bg-gray-100 px-1.5 py-0.5 rounded-md">{mod.credits} cr</span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getGradePalette(mod.currentGrade)}`}>
                              {mod.currentGrade} ({mod.currentGP.toFixed(1)})
                            </span>
                            <svg className="w-4 h-4 text-[#F2994A] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getGradePalette(mod.newGrade)}`}>
                              {mod.newGrade} ({mod.newGP.toFixed(1)})
                            </span>
                            <span className="text-[10px] font-black bg-[#2BB673]/10 text-[#2BB673] px-2.5 py-1 rounded-full border border-[#2BB673]/15">
                              +{mod.gainPoints.toFixed(1)} pts
                            </span>
                          </div>

                          <div className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${mod.isEnough ? 'text-[#2BB673]' : 'text-[#F2994A]'}`}>
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span>
                              CGPA after retake: <strong>{mod.cgpaAfter.toFixed(2)}</strong>
                              <span className="mx-1.5 opacity-30">·</span>
                              Max achievable: <strong>{mod.maxPossibleAfter.toFixed(2)}</strong>
                              {mod.isEnough && (
                                <><span className="mx-1.5 opacity-30">·</span>Future grade needed: <strong>{mod.futureGradeNeeded}</strong></>
                              )}
                            </span>
                          </div>

                          {mod.isEnough && (
                            <div className="mt-3 flex items-center gap-2 p-2.5 bg-[#2BB673]/8 rounded-xl border border-[#2BB673]/20">
                              <div className="w-5 h-5 rounded-full bg-[#2BB673] flex items-center justify-center shrink-0">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <p className="text-xs font-bold text-[#2BB673]">
                                Repeating up to this module + scoring {mod.futureGradeNeeded} in future modules makes your target achievable!
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="p-3.5 rounded-xl bg-[#F7F9FB] border border-gray-100 flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-[#6B7280] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[11px] text-[#6B7280] leading-relaxed">
                      Repeat eligibility depends on your institution's policy. This is a planning guide only — consult your academic advisor before registering for repeats.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Grade Reference ── */}
      <div style={fadeIn(360)}>
        <SectionCard>
          <div className="p-4 sm:p-5">
            <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.15em] mb-3">Grade Point Reference</p>
            <div className="flex flex-wrap gap-2">
              {gradingStyle.filter((g) => g.isPass).map((g) => {
                const isRequired = hasGrades && hasFutureModules && prediction.isAchievable && g.grade === getGradeForGP(prediction.requiredAvgGP)?.grade;
                return (
                  <div key={g.grade}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${isRequired
                      ? 'ring-2 ring-[#1E3A5F] ring-offset-1 bg-gradient-to-r from-[#1E3A5F] to-[#1F5F73] text-white scale-110 shadow-md'
                      : getGradePalette(g.grade)}`}
                  >
                    <span>{g.grade}</span>
                    <span className="opacity-60">({g.gradePoint.toFixed(1)})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default TargetPredictor;