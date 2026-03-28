import { useState, useMemo, useEffect } from 'react';
import gradingStyle from '../it_data/grading_style.json';

const UPCOMING_MODULES = [
  { moduleCode: 'IT3120', moduleName: 'Industry Economics & Management', credits: 4, year: 3, semester: 1 },
  { moduleCode: 'IT3130', moduleName: 'Application Development', credits: 4, year: 3, semester: 1 },
  { moduleCode: 'IT3140', moduleName: 'Database Systems', credits: 4, year: 3, semester: 1 },
  { moduleCode: 'IT3150', moduleName: 'IT Process & Infrastructure Management', credits: 4, year: 3, semester: 1 },
];

const DEFAULT_PAST_MODULES = [
  { id: 1, moduleCode: 'IT1120', moduleName: 'Introduction to Programming', credits: 4, grade: 'A-' },
  { id: 2, moduleCode: 'IE1030', moduleName: 'Data Communication Networks', credits: 4, grade: 'B+' },
  { id: 3, moduleCode: 'IT1130', moduleName: 'Mathematics for Computing', credits: 4, grade: 'C+' },
  { id: 4, moduleCode: 'IT1140', moduleName: 'Fundamentals of Computing', credits: 4, grade: 'B' },
  { id: 5, moduleCode: 'IT1160', moduleName: 'Discrete Mathematics', credits: 4, grade: 'B' },
  { id: 6, moduleCode: 'IT1170', moduleName: 'Data Structures and Algorithms', credits: 4, grade: 'C+' },
  { id: 7, moduleCode: 'SE1010', moduleName: 'Software Engineering', credits: 4, grade: 'B+' },
  { id: 8, moduleCode: 'IT1150', moduleName: 'Technical Writing', credits: 4, grade: 'C+' },
  { id: 9, moduleCode: 'IT2120', moduleName: 'Probability and Statistics', credits: 4, grade: 'B-' },
  { id: 10, moduleCode: 'SE2010', moduleName: 'Object Oriented Programming', credits: 4, grade: 'B' },
  { id: 11, moduleCode: 'IT2130', moduleName: 'Operating Systems & System Admin', credits: 4, grade: 'C+' },
  { id: 12, moduleCode: 'IT2140', moduleName: 'Database Design and Development', credits: 4, grade: 'B-' },
  { id: 13, moduleCode: 'IT2011', moduleName: 'Artificial Intelligence & ML', credits: 4, grade: 'A-' },
  { id: 14, moduleCode: 'IT2150', moduleName: 'IT Project', credits: 4, grade: 'B' },
  { id: 15, moduleCode: 'SE2020', moduleName: 'Web and Mobile Technologies', credits: 4, grade: 'C+' },
  { id: 16, moduleCode: 'IT2160', moduleName: 'Professional Skills', credits: 4, grade: 'B-' },
];

// ── Grade utilities ──
const gradePointMap = Object.fromEntries(gradingStyle.map((g) => [g.grade, g.gradePoint]));
const getGradePoint = (grade) => gradePointMap[grade] ?? null;

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

const computeCGPA = (modules) => {
  let totalPoints = 0, totalCredits = 0;
  modules.forEach((m) => {
    const gp = getGradePoint(m.grade);
    if (gp !== null) { totalPoints += gp * m.credits; totalCredits += m.credits; }
  });
  return totalCredits > 0 ? { cgpa: totalPoints / totalCredits, totalCredits, totalPoints } : { cgpa: 0, totalCredits: 0, totalPoints: 0 };
};

const TARGET_REPEAT_GP = 3.7;

const computeRepeatPlan = (pastModules, targetGPA, futureCredits) => {
  const base = computeCGPA(pastModules);
  const grandTotal = base.totalCredits + futureCredits;
  if (grandTotal === 0) return null;
  const candidates = pastModules
    .map((m) => ({ ...m, currentGP: getGradePoint(m.grade) ?? 0 }))
    .filter((m) => (TARGET_REPEAT_GP - m.currentGP) * m.credits > 0.001)
    .sort((a, b) => (TARGET_REPEAT_GP - a.currentGP) * a.credits < (TARGET_REPEAT_GP - b.currentGP) * b.credits ? 1 : -1);

  let simPoints = base.totalPoints, simCredits = base.totalCredits;
  const repeatList = [];

  for (const mod of candidates) {
    const grandTotalNow = simCredits + futureCredits;
    const maxBefore = (simPoints + 4.0 * futureCredits) / grandTotalNow;
    if (maxBefore >= targetGPA) break;
    simPoints = simPoints - mod.currentGP * mod.credits + TARGET_REPEAT_GP * mod.credits;
    const newCGPA = simPoints / simCredits;
    const newMaxPossible = (simPoints + 4.0 * futureCredits) / grandTotalNow;
    repeatList.push({ ...mod, newGP: TARGET_REPEAT_GP, newGrade: 'A-', cgpaAfter: newCGPA, maxPossibleAfter: newMaxPossible, isEnough: newMaxPossible >= targetGPA });
    if (newMaxPossible >= targetGPA) break;
  }
  return { repeatList, finalMaxPossible: (simPoints + 4.0 * futureCredits) / (simCredits + futureCredits) };
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

const TargetPredictor = () => {
  const [pastModules, setPastModules] = useState(DEFAULT_PAST_MODULES);
  const [targetGPA, setTargetGPA] = useState(3.2);
  const [targetGPAInput, setTargetGPAInput] = useState('3.20');
  const [preferredGrade, setPreferredGrade] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const currentStats = useMemo(() => computeCGPA(pastModules), [pastModules]);

  const prediction = useMemo(() => {
    const futureCredits = UPCOMING_MODULES.reduce((s, m) => s + m.credits, 0);
    const grandTotalCredits = currentStats.totalCredits + futureCredits;
    const currentTotalPoints = currentStats.totalPoints;
    const requiredAvgGP = grandTotalCredits > 0 ? (targetGPA * grandTotalCredits - currentTotalPoints) / futureCredits : 99;
    const maxPossible = grandTotalCredits > 0 ? (currentTotalPoints + 4.0 * futureCredits) / grandTotalCredits : 0;
    const isAchievable = requiredAvgGP <= 4.0 && grandTotalCredits > 0;
    const isTough = requiredAvgGP > 3.3;
    const requiredGrade = getGradeForGP(requiredAvgGP);
    let confidence = 0;
    if (requiredAvgGP <= 2.0) confidence = 95;
    else if (requiredAvgGP <= 2.7) confidence = 80;
    else if (requiredAvgGP <= 3.0) confidence = 65;
    else if (requiredAvgGP <= 3.3) confidence = 50;
    else if (requiredAvgGP <= 3.7) confidence = 35;
    else if (requiredAvgGP <= 4.0) confidence = 15;
    let preferredOutcome = null;
    if (preferredGrade) {
      const gp = getGradePoint(preferredGrade);
      if (gp !== null && grandTotalCredits > 0)
        preferredOutcome = (currentTotalPoints + gp * futureCredits) / grandTotalCredits;
    }
    const repeatPlan = !isAchievable ? computeRepeatPlan(pastModules, targetGPA, futureCredits) : null;
    return { futureCredits, grandTotalCredits, currentTotalPoints, requiredAvgGP: Math.max(0, requiredAvgGP), requiredGrade, isAchievable, isTough, maxPossible, confidence, preferredOutcome, repeatPlan };
  }, [targetGPA, currentStats, preferredGrade, pastModules]);

  // ── VALIDATION: only positive numbers, max 4.00 ──
  const handleTargetGPAInput = (val) => {
    // Block minus sign immediately (handles typed and pasted input)
    if (val.includes('-')) return;

    setTargetGPAInput(val);
    const num = parseFloat(val);

    if (!isNaN(num)) {
      if (num < 0) return;         // extra guard against negatives
      if (num > 4.0) {             // clamp to maximum 4.00
        setTargetGPAInput('4.00');
        setTargetGPA(4.0);
        return;
      }
      setTargetGPA(num);
    }
  };

  const handleSliderChange = (val) => {
    const num = parseFloat(val);
    setTargetGPA(num);
    setTargetGPAInput(num.toFixed(2));
  };
  const updateModuleGrade = (id, grade) =>
    setPastModules((prev) => prev.map((m) => m.id === id ? { ...m, grade } : m));

  const getMotivation = () => {
    if (!prediction.isAchievable)
      return { emoji: '⚠️', text: 'Target not reachable this semester — see the Repeat Advisor below.', type: 'error' };
    if (prediction.requiredAvgGP > 3.7)
      return { emoji: '🔥', text: 'Extremely ambitious — near-perfect scores needed every module!', type: 'warning' };
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
  const passGrades = gradingStyle.filter((g) => g.isPass).sort((a, b) => b.gradePoint - a.gradePoint);
  const gradeOptions = [...gradingStyle].sort((a, b) => b.gradePoint - a.gradePoint);
  const isInputValid = currentStats.totalCredits > 0;

  const fadeIn = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(18px)',
    transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
  });

  const getClassification = (gpa) => {
    if (gpa >= 3.7) return 'First Class';
    if (gpa >= 3.3) return '2nd Upper';
    if (gpa >= 3.0) return '2nd Lower';
    if (gpa >= 2.0) return 'General Pass';
    if (gpa > 0) return 'Below Std.';
    return '';
  };

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
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <StepBadge number="1" />
                <div>
                  <h2 className="text-sm font-bold text-[#1C2A39]">Your Current Standing</h2>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">{pastModules.length} modules · {currentStats.totalCredits} credits completed</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditor(!showEditor)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all duration-200 ${showEditor
                  ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                  : 'text-[#1E3A5F] border-[#1E3A5F]/20 bg-[#1E3A5F]/5 hover:bg-[#1E3A5F]/10'
                  }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {showEditor ? 'Done Editing' : 'Edit Grades'}
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl p-3.5 text-center bg-gradient-to-br from-[#1E3A5F]/6 to-[#1F5F73]/6 border border-[#1E3A5F]/10">
                <p className="text-[9px] font-black text-[#6B7280] uppercase tracking-[0.15em] mb-1">Current CGPA</p>
                <p className="text-2xl font-black text-[#1E3A5F]">{currentStats.cgpa.toFixed(2)}</p>
                {getClassification(currentStats.cgpa) && (
                  <p className="text-[9px] font-bold text-[#1E3A5F]/60 mt-0.5">{getClassification(currentStats.cgpa)}</p>
                )}
              </div>
              <div className="rounded-xl p-3.5 text-center bg-[#F7F9FB] border border-gray-100">
                <p className="text-[9px] font-black text-[#6B7280] uppercase tracking-[0.15em] mb-1">Credits Done</p>
                <p className="text-2xl font-black text-[#1C2A39]">{currentStats.totalCredits}</p>
                <p className="text-[9px] text-[#6B7280] mt-0.5">of all modules</p>
              </div>
              <div className="rounded-xl p-3.5 text-center bg-gradient-to-br from-[#2BB673]/6 to-[#1F5F73]/6 border border-[#2BB673]/15">
                <p className="text-[9px] font-black text-[#6B7280] uppercase tracking-[0.15em] mb-1">Max Possible</p>
                <p className="text-2xl font-black text-[#2BB673]">{prediction.maxPossible.toFixed(2)}</p>
                <p className="text-[9px] text-[#6B7280] mt-0.5">with A+ in all</p>
              </div>
            </div>

            {/* CGPA bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-semibold text-[#6B7280]">
                <span>Current GPA progress</span>
                <span>{((currentStats.cgpa / 4) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(currentStats.cgpa / 4) * 100}%`, background: 'linear-gradient(90deg, #1E3A5F, #2BB673)' }}
                />
              </div>
            </div>

            {/* Editor */}
            {showEditor && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.15em] mb-3">Edit your past module grades</p>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                  {pastModules.map((mod) => (
                    <div
                      key={mod.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F7F9FB] border border-gray-100 hover:border-[#1E3A5F]/15 transition-colors duration-150"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[10px] font-black text-[#1E3A5F] bg-[#1E3A5F]/8 px-2 py-0.5 rounded-lg shrink-0">
                          {mod.moduleCode}
                        </span>
                        <span className="text-xs text-[#1C2A39] truncate font-medium">{mod.moduleName}</span>
                      </div>
                      <select
                        value={mod.grade}
                        onChange={(e) => updateModuleGrade(mod.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 shrink-0 cursor-pointer transition-all duration-200 ${getGradePalette(mod.grade)}`}
                      >
                        {gradeOptions.map((g) => (
                          <option key={g.grade} value={g.grade}>{g.grade} ({g.gradePoint.toFixed(1)})</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                <p className="text-[10px] text-[#6B7280] mt-0.5">Drag the slider or type your target</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Slider */}
              <div className="flex-1 w-full space-y-3">
                <div className="flex justify-between text-[9px] font-bold text-[#6B7280] uppercase tracking-wider px-0.5">
                  <span>1.00</span>
                  <span className="text-[#F2994A]">Pass 2.0</span>
                  <span className="text-[#1F5F73]">2nd Lower 3.0</span>
                  <span className="text-[#1E3A5F]">1st 3.7</span>
                  <span>4.00</span>
                </div>
                <div className="relative">
                  <input
                    type="range" min="1.0" max="4.0" step="0.05" value={targetGPA}
                    onChange={(e) => handleSliderChange(e.target.value)}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #1E3A5F 0%, #2BB673 ${((targetGPA - 1) / 3) * 100}%, #e5e7eb ${((targetGPA - 1) / 3) * 100}%, #e5e7eb 100%)`,
                      accentColor: '#1E3A5F',
                    }}
                  />
                </div>
                {/* Quick-pick buttons */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: 'Pass', value: 2.0, color: 'border-[#F2994A]/30 text-[#F2994A] bg-[#F2994A]/5 hover:bg-[#F2994A]/10' },
                    { label: '2nd Low', value: 3.0, color: 'border-[#1F5F73]/30 text-[#1F5F73] bg-[#1F5F73]/5 hover:bg-[#1F5F73]/10' },
                    { label: '2nd Upp', value: 3.3, color: 'border-[#1E3A5F]/30 text-[#1E3A5F] bg-[#1E3A5F]/5 hover:bg-[#1E3A5F]/10' },
                    { label: '1st Cls', value: 3.7, color: 'border-[#2BB673]/30 text-[#2BB673] bg-[#2BB673]/5 hover:bg-[#2BB673]/10' },
                  ].map((q) => (
                    <button
                      key={q.label}
                      onClick={() => handleSliderChange(q.value.toFixed(2))}
                      className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all duration-200 ${q.color} ${Math.abs(targetGPA - q.value) < 0.04 ? 'scale-105 shadow-sm' : ''}`}
                    >
                      {q.label} {q.value.toFixed(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── VALIDATION: Target number input ── */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="4.0"
                    step="0.01"
                    value={targetGPAInput}
                    onChange={(e) => handleTargetGPAInput(e.target.value)}
                    onKeyDown={(e) => {
                      // Block minus and plus keys at keyboard level
                      if (e.key === '-' || e.key === '+') e.preventDefault();
                    }}
                    onPaste={(e) => {
                      // Block pasting negative values
                      const pasted = e.clipboardData.getData('text');
                      if (pasted.includes('-')) e.preventDefault();
                    }}
                    className="w-20 h-12 text-center text-2xl font-black text-[#1E3A5F] border-2 border-[#1E3A5F]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/25 focus:border-[#1E3A5F]/50 transition-all bg-[#1E3A5F]/4"
                  />
                </div>
                <span className="text-sm text-[#6B7280] font-medium">/ 4.00</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ══ STEP 3: Grade Simulator ══ */}
      <div style={fadeIn(180)}>
        <SectionCard>
          <div className="h-1 bg-gradient-to-r from-[#2BB673] to-[#F2994A]" />
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <StepBadge number="3" />
              <div>
                <h2 className="text-sm font-bold text-[#1C2A39]">
                  Grade Simulator <span className="font-normal text-[#6B7280]">(optional)</span>
                </h2>
                <p className="text-[10px] text-[#6B7280] mt-0.5">
                  See what CGPA you'd reach if you scored this grade in all upcoming modules
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {passGrades.map((g) => (
                <button
                  key={g.grade}
                  onClick={() => setPreferredGrade(preferredGrade === g.grade ? '' : g.grade)}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border-2 transition-all duration-200 font-bold text-sm hover:scale-105 active:scale-95 ${preferredGrade === g.grade
                    ? 'border-[#1E3A5F] bg-gradient-to-br from-[#1E3A5F] to-[#1F5F73] text-white scale-105 shadow-md'
                    : getGradePalette(g.grade)
                    }`}
                >
                  <span className="text-sm font-black">{g.grade}</span>
                  <span className={`text-[9px] font-semibold mt-0.5 ${preferredGrade === g.grade ? 'text-white/70' : 'opacity-50'}`}>
                    {g.gradePoint.toFixed(1)}
                  </span>
                </button>
              ))}
            </div>

            {preferredGrade && prediction.preferredOutcome !== null && (
              <div
                className={`mt-4 p-4 rounded-xl flex items-center gap-4 border transition-all duration-300 ${getGradePalette(preferredGrade)}`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-xl shrink-0">🎓</div>
                <div>
                  <p className="text-xs text-[#6B7280]">
                    If you score <strong className="text-[#1C2A39]">{preferredGrade}</strong> in all Y3 S1 modules, your CGPA would be:
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <p className="text-2xl font-black text-[#1C2A39]">{prediction.preferredOutcome.toFixed(2)}</p>
                    <span className="text-sm text-[#6B7280]">/ 4.00</span>
                    {getClassification(prediction.preferredOutcome) && (
                      <span className="text-[10px] font-bold text-[#1E3A5F] bg-[#1E3A5F]/8 px-2 py-0.5 rounded-full ml-1">
                        {getClassification(prediction.preferredOutcome)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* ══ Prediction Result ══ */}
      {isInputValid ? (
        <div style={fadeIn(240)}>
          <div className={`rounded-2xl border-2 shadow-md overflow-hidden transition-all duration-500 ${prediction.isAchievable ? 'border-[#2BB673]/25' : 'border-red-200'
            }`}>
            <div className={`px-5 sm:px-6 py-4 flex items-center justify-between ${prediction.isAchievable
              ? 'bg-gradient-to-r from-[#1E3A5F] to-[#1F5F73]'
              : 'bg-gradient-to-r from-red-600 to-red-500'
              }`}>
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{motivation.emoji}</span>
                <div>
                  <h2 className="text-sm font-bold text-white">Prediction Result</h2>
                  <p className="text-[10px] text-white/60 mt-0.5">Target: {targetGPA.toFixed(2)} CGPA</p>
                </div>
              </div>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${prediction.isAchievable
                ? 'bg-[#2BB673]/20 text-[#2BB673] border-[#2BB673]/30'
                : 'bg-white/10 text-white border-white/20'
                }`}>
                {prediction.isAchievable ? '✓ Achievable' : '✗ Not Achievable'}
              </span>
            </div>

            <div className="bg-white p-5 sm:p-6">
              {prediction.isAchievable ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-gray-100 bg-[#F7F9FB] p-4">
                      <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.14em] mb-2">Required Grade</p>
                      <div className="flex items-end gap-2">
                        <span className={`text-5xl font-black ${prediction.isTough ? 'text-[#F2994A]' : 'text-[#2BB673]'}`}>
                          {prediction.requiredGrade.grade}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] mt-1.5 font-medium">
                        {prediction.requiredGrade.gradePoint.toFixed(1)} GP avg needed
                      </p>
                      <p className="text-[10px] text-[#6B7280] mt-0.5">
                        Min avg GP: <span className="font-bold text-[#1C2A39]">{prediction.requiredAvgGP.toFixed(2)}</span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-[#F7F9FB] p-4 flex flex-col items-center justify-center">
                      <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.14em] mb-2">Feasibility</p>
                      <div className="relative w-20 h-20">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none" stroke="#e5e7eb" strokeWidth="3" />
                          <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none" stroke={confidenceConfig.bar} strokeWidth="3"
                            strokeDasharray={`${prediction.confidence}, 100`} strokeLinecap="round"
                            style={{ transition: 'stroke-dasharray 0.7s ease' }}
                          />
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

                  <div>
                    <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.14em] mb-3">
                      What you need per upcoming module
                    </p>
                    <div className="space-y-2">
                      {UPCOMING_MODULES.map((mod) => (
                        <div
                          key={mod.moduleCode}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F9FB] border border-gray-100 hover:border-[#1E3A5F]/15 hover:bg-white transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-[#1E3A5F] bg-[#1E3A5F]/8 px-2 py-0.5 rounded-lg shrink-0">
                              {mod.moduleCode}
                            </span>
                            <div>
                              <p className="text-xs font-semibold text-[#1C2A39]">{mod.moduleName}</p>
                              <p className="text-[10px] text-[#6B7280]">{mod.credits} credits</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-black border ${prediction.isTough ? 'text-[#F2994A] bg-[#F2994A]/8 border-[#F2994A]/20' : 'text-[#2BB673] bg-[#2BB673]/8 border-[#2BB673]/20'
                            }`}>
                            {prediction.requiredGrade.grade}+
                          </span>
                        </div>
                      ))}
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
                      <p className="text-sm font-bold text-red-600">Target not reachable this semester</p>
                      <p className="text-xs text-red-400 mt-0.5">
                        Even with A+ in all upcoming modules, max CGPA = <strong>{prediction.maxPossible.toFixed(2)}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSliderChange(prediction.maxPossible.toFixed(2))}
                    className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[#1E3A5F] border border-[#1E3A5F]/20 bg-[#1E3A5F]/5 hover:bg-[#1E3A5F]/10 rounded-xl py-3 transition-all duration-200 hover:shadow-sm"
                  >
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
      ) : (
        <div style={fadeIn(240)} className="rounded-2xl border-2 border-dashed border-gray-200 bg-[#F7F9FB] p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1E3A5F]/8 flex items-center justify-center text-2xl mb-3">📊</div>
          <p className="text-sm font-semibold text-[#6B7280]">Your prediction will appear here</p>
          <p className="text-xs text-[#6B7280]/60 mt-1">Enter module grades above to get started</p>
        </div>
      )}

      {/* ══ Module Repeat Advisor ══ */}
      {isInputValid && !prediction.isAchievable && prediction.repeatPlan && (
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
                  <p className="text-[10px] text-[#6B7280] mt-0.5">
                    Modules ranked by CGPA boost — retake these to make your target reachable
                  </p>
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
                  Modules are added to the plan until your target becomes achievable.
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
                    <div
                      key={mod.id}
                      className={`rounded-xl border p-4 transition-all duration-300 ${mod.isEnough
                        ? 'bg-[#2BB673]/4 border-[#2BB673]/25 shadow-sm ring-1 ring-[#2BB673]/15'
                        : 'bg-[#F7F9FB] border-gray-100'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-black text-xs mt-0.5 ${mod.isEnough ? 'bg-[#2BB673] text-white shadow-sm' : 'bg-[#F2994A]/15 text-[#F2994A]'
                          }`}>
                          {idx + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="text-[10px] font-black text-[#1E3A5F] bg-[#1E3A5F]/8 px-2 py-0.5 rounded-lg">
                              {mod.moduleCode}
                            </span>
                            <span className="text-xs font-semibold text-[#1C2A39]">{mod.moduleName}</span>
                            <span className="text-[10px] text-[#6B7280] bg-gray-100 px-1.5 py-0.5 rounded-md">{mod.credits} cr</span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getGradePalette(mod.grade)}`}>
                              {mod.grade} ({mod.currentGP.toFixed(1)})
                            </span>
                            <svg className="w-4 h-4 text-[#F2994A] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getGradePalette(mod.newGrade)}`}>
                              {mod.newGrade} ({mod.newGP.toFixed(1)})
                            </span>
                            <span className="text-[10px] font-black bg-[#2BB673]/10 text-[#2BB673] px-2.5 py-1 rounded-full border border-[#2BB673]/15">
                              +{((mod.newGP - mod.currentGP) * mod.credits).toFixed(1)} pts
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
                                Repeating up to this module makes your target achievable!
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
              {gradingStyle.filter((g) => g.isPass).map((g) => (
                <div
                  key={g.grade}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${g.grade === prediction.requiredGrade?.grade && isInputValid && prediction.isAchievable
                    ? 'ring-2 ring-[#1E3A5F] ring-offset-1 bg-gradient-to-r from-[#1E3A5F] to-[#1F5F73] text-white scale-110 shadow-md'
                    : getGradePalette(g.grade)
                    }`}
                >
                  <span>{g.grade}</span>
                  <span className="opacity-60">({g.gradePoint.toFixed(1)})</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default TargetPredictor;