import { useMemo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts';

// Import all syllabus JSON files
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

// Palette-aligned grade group colors
const gradeGroups = {
  'A+ / A / A-': ['A+', 'A', 'A-'],
  'B+ / B / B-': ['B+', 'B', 'B-'],
  'C+ / C / C-': ['C+', 'C', 'C-'],
  'D+ / D': ['D+', 'D'],
  'E': ['E'],
};

const groupColors = {
  'A+ / A / A-': '#2BB673',
  'B+ / B / B-': '#1F5F73',
  'C+ / C / C-': '#F2994A',
  'D+ / D': '#ef4444',
  'E': '#94a3b8',
};

// ── Sub-components ──

const getGradeBadgeColor = (grade) => {
  if (['A+', 'A', 'A-'].includes(grade)) return 'bg-[#2BB673]/12 text-[#2BB673]';
  if (['B+', 'B', 'B-'].includes(grade)) return 'bg-[#1F5F73]/12 text-[#1F5F73]';
  if (['C+', 'C', 'C-'].includes(grade)) return 'bg-[#F2994A]/12 text-[#F2994A]';
  return 'bg-red-50 text-red-600';
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/98 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl border border-gray-100/80">
      <p className="text-[11px] font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-sm font-bold" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
        </p>
      ))}
    </div>
  );
};

const DeltaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white/98 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl border border-gray-100/80">
      <p className="text-[11px] font-bold text-[#6B7280] mb-1">{label}</p>
      <p className="text-sm font-bold text-[#1C2A39]">GPA: {d.GPA.toFixed(2)}</p>
      {d.delta !== 0 && (
        <p className={`text-xs font-semibold mt-0.5 ${d.delta > 0 ? 'text-[#2BB673]' : 'text-red-500'}`}>
          {d.delta > 0 ? '+' : ''}{d.delta.toFixed(2)} from previous
        </p>
      )}
    </div>
  );
};

const ChartCard = ({ title, subtitle, children, accent }) => (
  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
    {accent && <div className="h-1" style={{ background: accent }} />}
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-sm sm:text-base font-bold text-[#1C2A39]">{title}</h3>
        {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  </div>
);

const MetricCard = ({ label, value, sub, icon, gradient }) => (
  <div className={`rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 ${gradient || 'bg-white border border-gray-100'}`}>
    <div className="flex items-start justify-between mb-3">
      <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.14em]">{label}</p>
      {icon && <span className="text-lg">{icon}</span>}
    </div>
    <div className="flex items-baseline gap-1.5">
      <span className="text-2xl sm:text-3xl font-black text-[#1E3A5F]">{value}</span>
      <span className="text-xs text-[#6B7280] font-medium">{sub}</span>
    </div>
  </div>
);

// ── Main Component ──

const Analyzer = ({ selectedGrades }) => {
  const { specialization, syllabusType } = useParams();
  const syllabusData = syllabusMap[specialization]?.[syllabusType] || [];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const getGradePoint = (grade) => {
    const gradeInfo = gradingStyle.find((g) => g.grade === grade);
    return gradeInfo ? gradeInfo.gradePoint : null;
  };

  const analytics = useMemo(() => {
    const semGroups = {};
    syllabusData.forEach((mod) => {
      const key = `Y${mod.year}S${mod.semester}`;
      if (!semGroups[key]) semGroups[key] = { label: key, year: mod.year, semester: mod.semester, modules: [] };
      semGroups[key].modules.push(mod);
    });

    const ordered = Object.values(semGroups).sort((a, b) => a.year !== b.year ? a.year - b.year : a.semester - b.semester);

    const semesterArr = [];
    let cumulativeCredits = 0, cumulativePoints = 0;
    const cgpaArr = [];

    ordered.forEach((sem) => {
      let semCredits = 0, semPoints = 0;
      sem.modules.forEach((mod) => {
        if (!mod.isGPA) return;
        const grade = selectedGrades[mod.moduleCode];
        if (!grade) return;
        const gp = getGradePoint(grade);
        if (gp !== null) { semCredits += mod.credits; semPoints += gp * mod.credits; }
      });
      if (semCredits > 0) {
        const gpa = semPoints / semCredits;
        semesterArr.push({ name: sem.label, GPA: parseFloat(gpa.toFixed(2)) });
        cumulativeCredits += semCredits;
        cumulativePoints += semPoints;
        cgpaArr.push({ name: sem.label, CGPA: parseFloat((cumulativePoints / cumulativeCredits).toFixed(2)) });
      }
    });

    const gradeCounts = {};
    let creditsEarnedVal = 0, modsCompleted = 0;
    const modulePerformance = [];

    syllabusData.forEach((mod) => {
      const grade = selectedGrades[mod.moduleCode];
      if (grade) {
        gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
        creditsEarnedVal += mod.credits;
        modsCompleted += 1;
        const gp = getGradePoint(grade);
        if (gp !== null) modulePerformance.push({ code: mod.moduleCode, name: mod.moduleName, grade, gp, credits: mod.credits, isGPA: mod.isGPA });
      }
    });

    const distData = [];
    Object.entries(gradeGroups).forEach(([groupLabel, grades]) => {
      const count = grades.reduce((sum, g) => sum + (gradeCounts[g] || 0), 0);
      if (count > 0) distData.push({ name: groupLabel, value: count, color: groupColors[groupLabel] });
    });

    const creditsTotalVal = syllabusData.reduce((sum, m) => sum + m.credits, 0);
    const overallCGPA = cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : 0;

    let bestSem = null, worstSem = null;
    if (semesterArr.length > 0) {
      bestSem = semesterArr.reduce((a, b) => (a.GPA >= b.GPA ? a : b));
      worstSem = semesterArr.reduce((a, b) => (a.GPA <= b.GPA ? a : b));
    }

    const semesterDeltas = semesterArr.map((sem, i) => ({
      ...sem,
      delta: i > 0 ? parseFloat((sem.GPA - semesterArr[i - 1].GPA).toFixed(2)) : 0,
    }));

    let consistency = 0;
    if (semesterArr.length > 1) {
      const mean = semesterArr.reduce((s, v) => s + v.GPA, 0) / semesterArr.length;
      const variance = semesterArr.reduce((s, v) => s + (v.GPA - mean) ** 2, 0) / semesterArr.length;
      consistency = Math.max(0, Math.min(100, Math.round((1 - Math.sqrt(variance) / 2) * 100)));
    } else if (semesterArr.length === 1) {
      consistency = 100;
    }

    let classification = '', classStyle = '';
    if (overallCGPA >= 3.7) { classification = 'First Class Honours'; classStyle = 'bg-[#2BB673]/12 text-[#2BB673] border border-[#2BB673]/25'; }
    else if (overallCGPA >= 3.3) { classification = 'Second Class Upper'; classStyle = 'bg-[#1F5F73]/12 text-[#1F5F73] border border-[#1F5F73]/25'; }
    else if (overallCGPA >= 3.0) { classification = 'Second Class Lower'; classStyle = 'bg-[#1E3A5F]/12 text-[#1E3A5F] border border-[#1E3A5F]/25'; }
    else if (overallCGPA >= 2.0) { classification = 'General Pass'; classStyle = 'bg-[#F2994A]/12 text-[#F2994A] border border-[#F2994A]/25'; }
    else if (overallCGPA > 0) { classification = 'Below Standard'; classStyle = 'bg-red-50 text-red-600 border border-red-200'; }

    const gpaModules = modulePerformance.filter((m) => m.isGPA).sort((a, b) => b.gp - a.gp);
    const topModules = gpaModules.slice(0, 5);
    const bottomModules = [...gpaModules].sort((a, b) => a.gp - b.gp).slice(0, 5);

    const creditsByTier = ordered.map((sem) => {
      const row = { name: sem.label };
      let a = 0, b = 0, c = 0, low = 0;
      sem.modules.forEach((mod) => {
        const grade = selectedGrades[mod.moduleCode];
        if (!grade) return;
        if (['A+', 'A', 'A-'].includes(grade)) a += mod.credits;
        else if (['B+', 'B', 'B-'].includes(grade)) b += mod.credits;
        else if (['C+', 'C', 'C-'].includes(grade)) c += mod.credits;
        else low += mod.credits;
      });
      if (a + b + c + low === 0) return null;
      row['A-tier'] = a; row['B-tier'] = b; row['C-tier'] = c; row['Low'] = low;
      return row;
    }).filter(Boolean);

    const insights = [];
    if (semesterArr.length >= 2) {
      const lastTwo = semesterArr.slice(-2);
      const diff = lastTwo[1].GPA - lastTwo[0].GPA;
      if (diff > 0.2) insights.push({ icon: '🚀', text: `Strong improvement of +${diff.toFixed(2)} in your latest semester`, type: 'positive' });
      else if (diff > 0) insights.push({ icon: '📈', text: `Slight improvement of +${diff.toFixed(2)} in your latest semester`, type: 'positive' });
      else if (diff < -0.2) insights.push({ icon: '⚠️', text: `GPA dropped by ${Math.abs(diff).toFixed(2)} in your latest semester`, type: 'warning' });
      else if (diff < 0) insights.push({ icon: '📉', text: `Minor dip of ${Math.abs(diff).toFixed(2)} in your latest semester`, type: 'neutral' });
      else insights.push({ icon: '🎯', text: 'Perfectly consistent GPA across your last two semesters', type: 'positive' });
    }

    const aCount = ['A+', 'A', 'A-'].reduce((s, g) => s + (gradeCounts[g] || 0), 0);
    if (modsCompleted > 0) {
      const aPct = Math.round((aCount / modsCompleted) * 100);
      if (aPct >= 60) insights.push({ icon: '⭐', text: `${aPct}% of your modules are in the A range — outstanding`, type: 'positive' });
      else if (aPct >= 30) insights.push({ icon: '👍', text: `${aPct}% A-range modules — solid performance`, type: 'positive' });
    }

    const failCount = ['C-', 'D+', 'D', 'E'].reduce((s, g) => s + (gradeCounts[g] || 0), 0);
    if (failCount > 0) insights.push({ icon: '🔴', text: `${failCount} module${failCount > 1 ? 's' : ''} below pass threshold — consider retaking`, type: 'warning' });
    if (consistency >= 85) insights.push({ icon: '🧊', text: `Consistency score of ${consistency}/100 — very stable performance`, type: 'positive' });
    else if (consistency < 50 && semesterArr.length >= 3) insights.push({ icon: '🎢', text: `Consistency score of ${consistency}/100 — your GPA fluctuates a lot`, type: 'warning' });

    const completionPct = creditsTotalVal > 0 ? Math.round((creditsEarnedVal / creditsTotalVal) * 100) : 0;
    if (completionPct >= 75) insights.push({ icon: '🏁', text: `${completionPct}% of your degree is complete — almost there!`, type: 'positive' });

    let heaviestHitter = null;
    if (gpaModules.length > 0) {
      heaviestHitter = [...gpaModules].sort((a, b) => (b.gp * b.credits) - (a.gp * a.credits))[0];
    }

    return {
      semesterData: semesterArr, cgpaProgressData: cgpaArr, gradeDistribution: distData,
      creditsEarned: creditsEarnedVal, creditsTotal: creditsTotalVal,
      modulesCompleted: modsCompleted, modulesTotal: syllabusData.length,
      overallCGPA, bestSem, worstSem, semesterDeltas,
      consistency, classification, classStyle, topModules, bottomModules,
      creditsByTier, insights, heaviestHitter,
      completionPct,
    };
  }, [selectedGrades, syllabusData]);

  const hasData = Object.keys(selectedGrades).length > 0 && analytics.semesterData.length > 0;

  if (!hasData) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 sm:py-36"
        style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease' }}
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1E3A5F]/10 to-[#1F5F73]/10 flex items-center justify-center mb-5 shadow-sm">
          <svg className="w-9 h-9 text-[#1E3A5F]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#1C2A39] mb-2">No Analytics Yet</h2>
        <p className="text-sm text-[#6B7280] text-center max-w-xs leading-relaxed">
          Head to the GPA Calculator and enter your module grades to unlock your full academic analytics.
        </p>
        <div className="mt-6 flex items-center gap-1.5 text-xs text-[#1E3A5F] font-semibold bg-[#1E3A5F]/8 px-4 py-2 rounded-full">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm2.25-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm2.25-6.75V4.5A2.25 2.25 0 0012.75 2h-1.5A2.25 2.25 0 009 4.5v.75m6.75 0h-6.75m6.75 0v13.5A2.25 2.25 0 0113.5 21h-3a2.25 2.25 0 01-2.25-2.25V5.25" /></svg>
          Go to Calculator
        </div>
      </div>
    );
  }

  const {
    semesterData, cgpaProgressData, gradeDistribution, creditsEarned, creditsTotal,
    modulesCompleted, modulesTotal, overallCGPA, bestSem, worstSem, semesterDeltas,
    consistency, classification, classStyle, topModules, bottomModules,
    creditsByTier, insights, heaviestHitter, completionPct,
  } = analytics;

  const fadeIn = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
  });

  return (
    <div className="space-y-5 pb-8">
      {/* ── Page Header ── */}
      <div style={fadeIn(0)} className="px-6 py-4"> {/* Added the padding right here! */}
  <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2A39] tracking-tight">Analyzer</h1>
  <p className="text-sm text-[#6B7280] mt-1">Your complete academic performance dashboard</p>
</div>

      {/* ── Hero: CGPA Banner ── */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-lg"
        style={{ ...fadeIn(60), background: 'linear-gradient(135deg, #1E3A5F 0%, #1F5F73 60%, #2BB673 100%)' }}
      >
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-20 translate-x-20 opacity-15" style={{ background: 'radial-gradient(circle, #2BB673, transparent)' }} />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full translate-y-12 opacity-10" style={{ background: 'radial-gradient(circle, #F2994A, transparent)' }} />

        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-white/10">
          {/* CGPA */}
          <div className="p-5 sm:p-6 col-span-2 sm:col-span-1">
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.18em] mb-1">Overall CGPA</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-black text-white">{overallCGPA.toFixed(2)}</span>
              <span className="text-white/40 font-medium">/ 4.00</span>
            </div>
            {classification && (
              <span className={`inline-block mt-2 text-[11px] font-bold px-2.5 py-1 rounded-full ${classStyle}`}>
                {classification}
              </span>
            )}
            <div className="mt-3 h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full rounded-full bg-white/70 transition-all duration-700" style={{ width: `${(overallCGPA / 4) * 100}%` }} />
            </div>
          </div>

          {/* Completion */}
          <div className="p-5 sm:p-6 flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2BB673" strokeWidth="3" strokeDasharray={`${completionPct}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base sm:text-lg font-black text-white">{completionPct}%</span>
              </div>
            </div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-wider">Complete</p>
          </div>

          {/* Consistency */}
          <div className="p-5 sm:p-6">
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.18em] mb-1">Consistency</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-white">{consistency}</span>
              <span className="text-white/40 text-sm">/100</span>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${consistency}%`, background: consistency >= 70 ? '#2BB673' : consistency >= 40 ? '#F2994A' : '#ef4444' }}
              />
            </div>
            <p className="text-[10px] text-white/40 mt-1.5">{consistency >= 70 ? 'Very stable' : consistency >= 40 ? 'Moderate swings' : 'Highly variable'}</p>
          </div>

          {/* Modules */}
          <div className="p-5 sm:p-6">
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.18em] mb-1">Modules</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-white">{modulesCompleted}</span>
              <span className="text-white/40 text-sm">/ {modulesTotal}</span>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full rounded-full bg-white/60 transition-all duration-700" style={{ width: `${(modulesCompleted / Math.max(modulesTotal, 1)) * 100}%` }} />
            </div>
            <p className="text-[10px] text-white/40 mt-1.5">{creditsEarned} / {creditsTotal} credits</p>
          </div>
        </div>
      </div>

      {/* ── Best / Worst / Booster ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4" style={fadeIn(120)}>
        {bestSem && (
          <div className="rounded-2xl border border-[#2BB673]/20 bg-gradient-to-br from-[#2BB673]/6 to-[#1F5F73]/6 p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#2BB673]/15 flex items-center justify-center text-base">🏆</div>
              <p className="text-[10px] font-black text-[#2BB673] uppercase tracking-widest">Best Semester</p>
            </div>
            <p className="text-3xl font-black text-[#1C2A39]">{bestSem.GPA.toFixed(2)}</p>
            <p className="text-xs text-[#6B7280] mt-0.5 font-medium">{bestSem.name}</p>
          </div>
        )}
        {worstSem && (
          <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50/60 to-red-50/30 p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-base">📍</div>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Lowest Semester</p>
            </div>
            <p className="text-3xl font-black text-[#1C2A39]">{worstSem.GPA.toFixed(2)}</p>
            <p className="text-xs text-[#6B7280] mt-0.5 font-medium">{worstSem.name}</p>
          </div>
        )}
        {heaviestHitter && (
          <div className="rounded-2xl border border-[#1F5F73]/20 bg-gradient-to-br from-[#1E3A5F]/6 to-[#1F5F73]/6 p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#1F5F73]/12 flex items-center justify-center text-base">💎</div>
              <p className="text-[10px] font-black text-[#1F5F73] uppercase tracking-widest">Biggest Booster</p>
            </div>
            <p className="text-sm font-bold text-[#1C2A39] truncate leading-tight">{heaviestHitter.name}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{heaviestHitter.code} · {heaviestHitter.grade} · {heaviestHitter.credits} cr</p>
          </div>
        )}
      </div>

      {/* ── Insights ── */}
      {insights.length > 0 && (
        <div style={fadeIn(160)}>
          <ChartCard
            title="Performance Insights"
            subtitle="Auto-generated observations from your data"
            accent="linear-gradient(90deg, #1E3A5F, #2BB673)"
          >
            <div className="space-y-2">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl text-sm transition-colors duration-200 hover:brightness-95 ${
                    insight.type === 'positive' ? 'bg-[#2BB673]/8 border border-[#2BB673]/12' :
                    insight.type === 'warning' ? 'bg-[#F2994A]/8 border border-[#F2994A]/12' :
                    'bg-[#F7F9FB] border border-gray-100'
                  }`}
                >
                  <span className="text-base mt-0.5 shrink-0">{insight.icon}</span>
                  <span className={`text-xs sm:text-sm leading-relaxed font-medium ${
                    insight.type === 'positive' ? 'text-[#1C2A39]' :
                    insight.type === 'warning' ? 'text-[#1C2A39]' : 'text-[#6B7280]'
                  }`}>{insight.text}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      )}

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" style={fadeIn(200)}>
        <MetricCard label="Credits Earned" value={creditsEarned} sub={`of ${creditsTotal}`} icon="📚" />
        <MetricCard label="Credits Left" value={creditsTotal - creditsEarned} sub="remaining" icon="⏳" />
        <MetricCard label="Modules Done" value={modulesCompleted} sub={`of ${modulesTotal}`} icon="✅" />
        <MetricCard label="Semesters" value={semesterData.length} sub="with grades" icon="📅" />
      </div>

      {/* ── GPA Trend Bar Chart ── */}
      <div style={fadeIn(240)}>
        <ChartCard
          title="Semester GPA Trend"
          subtitle="Performance with semester-over-semester delta"
          accent="linear-gradient(90deg, #1E3A5F, #1F5F73)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={semesterDeltas} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F7F9FB" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 4]} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip content={<DeltaTooltip />} cursor={{ fill: '#F7F9FB', radius: 8 }} />
              <Bar dataKey="GPA" radius={[8, 8, 0, 0]} maxBarSize={48}>
                {semesterDeltas.map((entry, index) => (
                  <Cell key={index} fill={entry.GPA >= 3.7 ? '#2BB673' : entry.GPA >= 3.0 ? '#1F5F73' : entry.GPA >= 2.0 ? '#F2994A' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {semesterDeltas.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
              {semesterDeltas.map((sem, i) => i > 0 && (
                <span
                  key={sem.name}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full ${
                    sem.delta > 0 ? 'bg-[#2BB673]/10 text-[#2BB673]' :
                    sem.delta < 0 ? 'bg-red-50 text-red-600' :
                    'bg-[#F7F9FB] text-[#6B7280]'
                  }`}
                >
                  {sem.name}
                  {sem.delta > 0 ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                    : sem.delta < 0 ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    : <span>—</span>}
                  {sem.delta !== 0 && Math.abs(sem.delta).toFixed(2)}
                </span>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── CGPA Progress Line ── */}
      <div style={fadeIn(280)}>
        <ChartCard title="CGPA Progress" subtitle="Cumulative GPA trend over semesters" accent="linear-gradient(90deg, #1F5F73, #2BB673)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={cgpaProgressData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F7F9FB" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 4]} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="cgpaGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1E3A5F" />
                  <stop offset="100%" stopColor="#2BB673" />
                </linearGradient>
              </defs>
              <Line type="monotone" dataKey="CGPA" stroke="url(#cgpaGrad)" strokeWidth={3} dot={{ r: 5, fill: '#1E3A5F', strokeWidth: 2.5, stroke: '#fff' }} activeDot={{ r: 7, fill: '#2BB673', strokeWidth: 2.5, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Credits by Tier Stacked Area ── */}
      {creditsByTier.length > 0 && (
        <div style={fadeIn(320)}>
          <ChartCard title="Credits by Grade Tier" subtitle="How your credits distribute across grade ranges per semester" accent="linear-gradient(90deg, #2BB673, #F2994A)">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={creditsByTier} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F7F9FB" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="A-tier" stackId="1" stroke="#2BB673" fill="#2BB673" fillOpacity={0.55} />
                <Area type="monotone" dataKey="B-tier" stackId="1" stroke="#1F5F73" fill="#1F5F73" fillOpacity={0.5} />
                <Area type="monotone" dataKey="C-tier" stackId="1" stroke="#F2994A" fill="#F2994A" fillOpacity={0.45} />
                <Area type="monotone" dataKey="Low" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.35} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-50">
              {[{ label: 'A-tier', color: '#2BB673' }, { label: 'B-tier', color: '#1F5F73' }, { label: 'C-tier', color: '#F2994A' }, { label: 'Low', color: '#ef4444' }].map((t) => (
                <div key={t.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-[11px] text-[#6B7280] font-medium">{t.label}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      )}

      {/* ── Grade Distribution Donut ── */}
      <div style={fadeIn(360)}>
        <ChartCard title="Grade Distribution" subtitle="Breakdown of all module grades received" accent="linear-gradient(90deg, #1E3A5F, #F2994A)">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={240} className="max-w-[260px]">
              <PieChart>
                <Pie data={gradeDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                  {gradeDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white/98 rounded-xl px-3 py-2.5 shadow-lg border border-gray-100">
                      <p className="text-xs font-bold text-[#1C2A39]">{d.name}</p>
                      <p className="text-xs text-[#6B7280]">{d.value} module{d.value > 1 ? 's' : ''}</p>
                    </div>
                  );
                }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap sm:flex-col gap-2.5 justify-center">
              {gradeDistribution.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-[#6B7280]">
                    {d.name} <span className="font-bold text-[#1C2A39]">({d.value})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── Top & Bottom Modules ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={fadeIn(400)}>
        {topModules.length > 0 && (
          <ChartCard title="🏅 Top Performing Modules" subtitle="Your highest-graded GPA modules" accent="linear-gradient(90deg, #2BB673, #1F5F73)">
            <div className="space-y-2">
              {topModules.map((mod, i) => (
                <div key={mod.code} className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F9FB] hover:bg-[#2BB673]/6 transition-colors duration-200">
                  <span className="text-[11px] font-black text-[#6B7280] w-5 text-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-[#1C2A39] truncate">{mod.name}</p>
                    <p className="text-[10px] text-[#6B7280] font-medium mt-0.5">{mod.code} · {mod.credits} credits</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black ${getGradeBadgeColor(mod.grade)}`}>{mod.grade}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        )}
        {bottomModules.length > 0 && (
          <ChartCard title="🔧 Needs Improvement" subtitle="Modules with the lowest grades" accent="linear-gradient(90deg, #F2994A, #ef4444)">
            <div className="space-y-2">
              {bottomModules.map((mod, i) => (
                <div key={mod.code} className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F9FB] hover:bg-[#F2994A]/6 transition-colors duration-200">
                  <span className="text-[11px] font-black text-[#6B7280] w-5 text-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-[#1C2A39] truncate">{mod.name}</p>
                    <p className="text-[10px] text-[#6B7280] font-medium mt-0.5">{mod.code} · {mod.credits} credits</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black ${getGradeBadgeColor(mod.grade)}`}>{mod.grade}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  );
};

export default Analyzer;