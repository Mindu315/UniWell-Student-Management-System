import { useMemo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
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

const getGradeBadgeColor = (grade) => {
  if (!grade) return 'bg-gray-100 text-gray-400';
  if (['A+', 'A', 'A-'].includes(grade)) return 'bg-[#2BB673]/12 text-[#2BB673] border border-[#2BB673]/20';
  if (['B+', 'B', 'B-'].includes(grade)) return 'bg-[#1F5F73]/12 text-[#1F5F73] border border-[#1F5F73]/20';
  if (['C+', 'C'].includes(grade)) return 'bg-[#F2994A]/12 text-[#F2994A] border border-[#F2994A]/20';
  return 'bg-red-50 text-red-500 border border-red-100';
};

const getGradeRingColor = (gpa) => {
  if (gpa >= 3.7) return '#2BB673';
  if (gpa >= 3.0) return '#1F5F73';
  if (gpa >= 2.0) return '#F2994A';
  return '#ef4444';
};

// ── Tooltip Components ──

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

// ── Reusable UI Components ──

const ChartCard = ({ title, subtitle, children, accent, action }) => (
  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
    {accent && <div className="h-1" style={{ background: accent }} />}
    <div className="p-4 sm:p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#1C2A39]">{title}</h3>
          {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0 ml-3">{action}</div>}
      </div>
      {children}
    </div>
  </div>
);

const StatPill = ({ label, value, color }) => (
  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#F7F9FB]">
    <span className="text-xs text-[#6B7280] font-medium">{label}</span>
    <span className="text-xs font-black" style={{ color }}>{value}</span>
  </div>
);

// ── GPA Ring ──
const GpaRing = ({ gpa, size = 80 }) => {
  const pct = (gpa / 4) * 100;
  const color = getGradeRingColor(gpa);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" viewBox="0 0 36 36">
        <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
          fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
        <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
          fill="none" stroke={color} strokeWidth="3.5"
          strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-[#1C2A39] leading-none" style={{ fontSize: size * 0.2 }}>{gpa.toFixed(2)}</span>
      </div>
    </div>
  );
};

// ── Section Header ──
const SectionHeader = ({ title, subtitle }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="flex-1">
      <h2 className="text-sm font-black text-[#1C2A39] uppercase tracking-widest">{title}</h2>
      {subtitle && <p className="text-xs text-[#9CA3AF] mt-0.5">{subtitle}</p>}
    </div>
    <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
  </div>
);

// ── Classification Badge ──
const classificationInfo = {
  'First Class Honours':  { color: '#2BB673', bg: 'bg-[#2BB673]/10', border: 'border-[#2BB673]/25', minGPA: 3.7, nextTarget: null },
  'Second Class Upper':   { color: '#1F5F73', bg: 'bg-[#1F5F73]/10', border: 'border-[#1F5F73]/25', minGPA: 3.3, nextTarget: 3.7 },
  'Second Class Lower':   { color: '#1E3A5F', bg: 'bg-[#1E3A5F]/10', border: 'border-[#1E3A5F]/25', minGPA: 3.0, nextTarget: 3.3 },
  'General Pass':         { color: '#F2994A', bg: 'bg-[#F2994A]/10', border: 'border-[#F2994A]/25', minGPA: 2.0, nextTarget: 3.0 },
  'Below Standard':       { color: '#ef4444', bg: 'bg-red-50',        border: 'border-red-200',         minGPA: 0,   nextTarget: 2.0 },
};

// ── Main Component ──

const Analyzer = ({ selectedGrades }) => {
  const { specialization, syllabusType } = useParams();
  const syllabusData = syllabusMap[specialization]?.[syllabusType] || [];
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedYear, setExpandedYear] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const getGradePoint = (grade) => {
    const g = gradingStyle.find((g) => g.grade === grade);
    return g ? g.gradePoint : null;
  };

  const isPass = (grade) => {
    const g = gradingStyle.find((g) => g.grade === grade);
    return g ? g.isPass : false;
  };

  const analytics = useMemo(() => {
    // ── Group by semester ──
    const semGroups = {};
    syllabusData.forEach((mod) => {
      const key = `Y${mod.year}S${mod.semester}`;
      if (!semGroups[key]) semGroups[key] = { label: key, year: mod.year, semester: mod.semester, modules: [] };
      semGroups[key].modules.push(mod);
    });

    const ordered = Object.values(semGroups).sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.semester - b.semester
    );

    // ── Semester & CGPA arrays ──
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

    // ── Grade counts & module performance ──
    const gradeCounts = {};
    let creditsEarnedVal = 0, modsCompleted = 0;
    let passCount = 0, failCount = 0;
    const modulePerformance = [];

    syllabusData.forEach((mod) => {
      const grade = selectedGrades[mod.moduleCode];
      if (grade) {
        gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
        creditsEarnedVal += mod.credits;
        modsCompleted += 1;
        const gp = getGradePoint(grade);
        const passed = isPass(grade);
        if (passed) passCount++; else failCount++;
        if (gp !== null) modulePerformance.push({
          code: mod.moduleCode, name: mod.moduleName, grade, gp,
          credits: mod.credits, isGPA: mod.isGPA, year: mod.year, semester: mod.semester,
        });
      }
    });

    // ── Grade distribution ──
    const distData = [];
    Object.entries(gradeGroups).forEach(([groupLabel, grades]) => {
      const count = grades.reduce((sum, g) => sum + (gradeCounts[g] || 0), 0);
      if (count > 0) distData.push({ name: groupLabel, value: count, color: groupColors[groupLabel] });
    });

    const creditsTotalVal = syllabusData.reduce((sum, m) => sum + m.credits, 0);
    const overallCGPA = cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : 0;

    // ── Best / worst semesters ──
    let bestSem = null, worstSem = null;
    if (semesterArr.length > 0) {
      bestSem = semesterArr.reduce((a, b) => (a.GPA >= b.GPA ? a : b));
      worstSem = semesterArr.reduce((a, b) => (a.GPA <= b.GPA ? a : b));
    }

    const semesterDeltas = semesterArr.map((sem, i) => ({
      ...sem,
      delta: i > 0 ? parseFloat((sem.GPA - semesterArr[i - 1].GPA).toFixed(2)) : 0,
    }));

    // ── Consistency score ──
    let consistency = 0;
    if (semesterArr.length > 1) {
      const mean = semesterArr.reduce((s, v) => s + v.GPA, 0) / semesterArr.length;
      const variance = semesterArr.reduce((s, v) => s + (v.GPA - mean) ** 2, 0) / semesterArr.length;
      consistency = Math.max(0, Math.min(100, Math.round((1 - Math.sqrt(variance) / 2) * 100)));
    } else if (semesterArr.length === 1) {
      consistency = 100;
    }

    // ── Classification ──
    let classification = '', classStyle = '';
    if (overallCGPA >= 3.7) { classification = 'First Class Honours'; classStyle = 'bg-[#2BB673]/12 text-[#2BB673] border border-[#2BB673]/25'; }
    else if (overallCGPA >= 3.3) { classification = 'Second Class Upper'; classStyle = 'bg-[#1F5F73]/12 text-[#1F5F73] border border-[#1F5F73]/25'; }
    else if (overallCGPA >= 3.0) { classification = 'Second Class Lower'; classStyle = 'bg-[#1E3A5F]/12 text-[#1E3A5F] border border-[#1E3A5F]/25'; }
    else if (overallCGPA >= 2.0) { classification = 'General Pass'; classStyle = 'bg-[#F2994A]/12 text-[#F2994A] border border-[#F2994A]/25'; }
    else if (overallCGPA > 0) { classification = 'Below Standard'; classStyle = 'bg-red-50 text-red-600 border border-red-200'; }

    const gpaModules = modulePerformance.filter((m) => m.isGPA).sort((a, b) => b.gp - a.gp);
    const topModules = gpaModules.slice(0, 5);
    const bottomModules = [...gpaModules].sort((a, b) => a.gp - b.gp).slice(0, 5);

    // ── Credits by tier (for stacked area) ──
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

    // ── Per-year breakdown ──
    const years = [...new Set(syllabusData.map((m) => m.year))].sort();
    const yearBreakdown = years.map((yr) => {
      const mods = syllabusData.filter((m) => m.year === yr);
      const graded = mods.filter((m) => selectedGrades[m.moduleCode] && m.isGPA);
      let totalCr = 0, totalPts = 0;
      graded.forEach((m) => {
        const gp = getGradePoint(selectedGrades[m.moduleCode]);
        if (gp !== null) { totalCr += m.credits; totalPts += gp * m.credits; }
      });
      const yearGPA = totalCr > 0 ? totalPts / totalCr : null;
      const aCount = graded.filter((m) => ['A+', 'A', 'A-'].includes(selectedGrades[m.moduleCode])).length;
      const failMods = mods.filter((m) => selectedGrades[m.moduleCode] && !isPass(selectedGrades[m.moduleCode]));
      return { year: yr, gpa: yearGPA, totalModules: mods.length, gradedModules: graded.length, aCount, failMods };
    });

    // ── Insights ──
    const insights = [];
    if (semesterArr.length >= 2) {
      const lastTwo = semesterArr.slice(-2);
      const diff = lastTwo[1].GPA - lastTwo[0].GPA;
      if (diff > 0.2) insights.push({ icon: '🚀', text: `Strong improvement of +${diff.toFixed(2)} in your latest semester`, type: 'positive', tip: 'Keep up this momentum — you\'re on a great trajectory!' });
      else if (diff > 0) insights.push({ icon: '📈', text: `Slight improvement of +${diff.toFixed(2)} in your latest semester`, type: 'positive', tip: 'Consistent upward movement adds up over time.' });
      else if (diff < -0.2) insights.push({ icon: '⚠️', text: `GPA dropped by ${Math.abs(diff).toFixed(2)} in your latest semester`, type: 'warning', tip: 'Review which modules dragged your average down and plan targeted revision.' });
      else if (diff < 0) insights.push({ icon: '📉', text: `Minor dip of ${Math.abs(diff).toFixed(2)} in your latest semester`, type: 'neutral', tip: 'Small fluctuations are normal — focus on key modules next semester.' });
      else insights.push({ icon: '🎯', text: 'Perfectly consistent GPA across your last two semesters', type: 'positive', tip: 'Stability is a strength — aim to push the ceiling next.' });
    }

    const aCount = ['A+', 'A', 'A-'].reduce((s, g) => s + (gradeCounts[g] || 0), 0);
    if (modsCompleted > 0) {
      const aPct = Math.round((aCount / modsCompleted) * 100);
      if (aPct >= 60) insights.push({ icon: '⭐', text: `${aPct}% of your modules are in the A range — outstanding`, type: 'positive', tip: 'Excellent academic excellence. Consider research projects or academic awards.' });
      else if (aPct >= 30) insights.push({ icon: '👍', text: `${aPct}% A-range modules — solid performance`, type: 'positive', tip: 'Push for another 10% — every A significantly boosts your GPA.' });
    }

    const failCountVal = ['C-', 'D+', 'D', 'E'].reduce((s, g) => s + (gradeCounts[g] || 0), 0);
    if (failCountVal > 0) insights.push({ icon: '🔴', text: `${failCountVal} module${failCountVal > 1 ? 's' : ''} below pass threshold — consider retaking`, type: 'warning', tip: 'These modules pull your GPA down significantly. Retaking with improvement can have a major positive impact.' });

    if (consistency >= 85) insights.push({ icon: '🧊', text: `Consistency score of ${consistency}/100 — very stable performance`, type: 'positive', tip: 'Stable academic performance is valued highly by employers and postgrad programs.' });
    else if (consistency < 50 && semesterArr.length >= 3) insights.push({ icon: '🎢', text: `Consistency score of ${consistency}/100 — your GPA fluctuates significantly`, type: 'warning', tip: 'Focus on maintaining study habits across all semesters, not just before exams.' });

    const completionPct = creditsTotalVal > 0 ? Math.round((creditsEarnedVal / creditsTotalVal) * 100) : 0;
    if (completionPct >= 75) insights.push({ icon: '🏁', text: `${completionPct}% of your degree is complete — almost there!`, type: 'positive', tip: 'The final stretch matters most. Stay focused.' });
    else if (completionPct >= 50) insights.push({ icon: '🎓', text: `${completionPct}% of your degree complete — halfway there`, type: 'neutral', tip: 'Great time to reflect on your academic goals for the remaining semesters.' });

    let heaviestHitter = null;
    if (gpaModules.length > 0) {
      heaviestHitter = [...gpaModules].sort((a, b) => (b.gp * b.credits) - (a.gp * a.credits))[0];
    }

    // ── What grade needed for next class ──
    let neededForUpgrade = null;
    if (classification && overallCGPA > 0) {
      const info = classificationInfo[classification];
      if (info?.nextTarget) {
        const remainingCredits = creditsTotalVal - cumulativeCredits;
        if (remainingCredits > 0) {
          const needed = (info.nextTarget * (cumulativeCredits + remainingCredits) - cumulativePoints) / remainingCredits;
          if (needed <= 4.0) neededForUpgrade = { target: info.nextTarget, needed: Math.ceil(needed * 100) / 100, nextClass: Object.keys(classificationInfo).find(k => classificationInfo[k].minGPA === info.nextTarget) };
        }
      }
    }

    // ── Radar data: GPA by year ──
    const radarData = yearBreakdown
      .filter((y) => y.gpa !== null)
      .map((y) => ({ subject: `Year ${y.year}`, GPA: parseFloat(y.gpa.toFixed(2)), fullMark: 4 }));

    return {
      semesterData: semesterArr, cgpaProgressData: cgpaArr, gradeDistribution: distData,
      creditsEarned: creditsEarnedVal, creditsTotal: creditsTotalVal,
      modulesCompleted: modsCompleted, modulesTotal: syllabusData.length,
      overallCGPA, bestSem, worstSem, semesterDeltas,
      consistency, classification, classStyle, topModules, bottomModules,
      creditsByTier, insights, heaviestHitter, completionPct,
      yearBreakdown, passCount, failCount: failCountVal, neededForUpgrade, radarData,
    };
  }, [selectedGrades, syllabusData]);

  const hasData = Object.keys(selectedGrades).length > 0 && analytics.semesterData.length > 0;

  if (!hasData) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 sm:py-36"
        style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease' }}
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1E3A5F]/8 to-[#2BB673]/8 flex items-center justify-center mb-6 shadow-sm border border-[#1E3A5F]/10">
          <svg className="w-10 h-10 text-[#1E3A5F]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#1C2A39] mb-2">No Analytics Yet</h2>
        <p className="text-sm text-[#6B7280] text-center max-w-xs leading-relaxed">
          Head to the GPA Calculator and enter your module grades to unlock your full academic analytics dashboard.
        </p>
        <div className="mt-6 flex items-center gap-1.5 text-xs text-[#1E3A5F] font-semibold bg-[#1E3A5F]/8 px-4 py-2.5 rounded-full border border-[#1E3A5F]/12 hover:bg-[#1E3A5F]/12 transition-colors cursor-pointer">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm2.25-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm2.25-6.75V4.5A2.25 2.25 0 0012.75 2h-1.5A2.25 2.25 0 009 4.5v.75m6.75 0h-6.75m6.75 0v13.5" />
          </svg>
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
    yearBreakdown, passCount, failCount, neededForUpgrade, radarData,
  } = analytics;

  const fadeIn = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'progress', label: 'Progress', icon: '📈' },
    { id: 'modules', label: 'Modules', icon: '📚' },
    { id: 'insights', label: 'Insights', icon: '💡' },
  ];

  const classInfo = classificationInfo[classification] || {};

  return (
    <div className="space-y-5 pb-10">

      {/* ── Page Header ── */}
      <div style={fadeIn(0)} className="px-1 pt-2">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] mb-1">Academic Dashboard</p>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1C2A39] tracking-tight">Analyzer</h1>
          </div>
          {classification && (
            <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${classStyle}`}>
              {classification}
            </span>
          )}
        </div>
        {/* Progress Bar */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${completionPct}%`, background: 'linear-gradient(90deg, #1E3A5F, #2BB673)' }}
            />
          </div>
          <span className="text-[11px] font-bold text-[#6B7280] shrink-0">{completionPct}% complete</span>
        </div>
      </div>

      {/* ── Hero CGPA Banner ── */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-lg"
        style={{ ...fadeIn(40), background: 'linear-gradient(135deg, #1E3A5F 0%, #1F5F73 55%, #2BB673 100%)' }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full -translate-y-24 translate-x-24 opacity-10"
          style={{ background: 'radial-gradient(circle, #2BB673, transparent)' }} />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full translate-y-12 opacity-8"
          style={{ background: 'radial-gradient(circle, #F2994A, transparent)' }} />

        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* CGPA Ring */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <svg width={96} height={96} className="-rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                    fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3.5" />
                  <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                    fill="none" stroke="#2BB673" strokeWidth="3.5"
                    strokeDasharray={`${(overallCGPA / 4) * 100}, 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white leading-none">{overallCGPA.toFixed(2)}</span>
                  <span className="text-[9px] text-white/40 font-bold">/ 4.00</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.18em] mb-0.5">Overall CGPA</p>
                {classification && (
                  <p className="text-sm font-black text-white/90">{classification}</p>
                )}
                {neededForUpgrade && (
                  <p className="text-[11px] text-white/50 mt-1">
                    Need avg <span className="text-white/80 font-bold">{neededForUpgrade.needed.toFixed(2)}</span> to reach {neededForUpgrade.nextClass}
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-16 bg-white/12 self-center" />

            {/* Stats Row */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 sm:flex-1">
              {[
                { label: 'Consistency', value: `${consistency}/100`, sub: consistency >= 70 ? 'Stable' : consistency >= 40 ? 'Moderate' : 'Variable' },
                { label: 'Modules', value: `${modulesCompleted}/${modulesTotal}`, sub: `${creditsEarned} credits` },
                { label: 'Passed', value: passCount, sub: `${failCount} failed` },
                { label: 'Best Sem', value: bestSem ? bestSem.GPA.toFixed(2) : '—', sub: bestSem?.name || '' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{s.label}</p>
                  <p className="text-lg font-black text-white leading-tight">{s.value}</p>
                  <p className="text-[10px] text-white/40">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CGPA Progress Bar within banner */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-white/60 transition-all duration-700"
                style={{ width: `${(overallCGPA / 4) * 100}%` }} />
            </div>
            {classInfo.nextTarget && (
              <div className="relative flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-[#2BB673]/80 transition-all duration-700"
                  style={{ width: `${Math.min(100, ((overallCGPA - (classInfo.minGPA || 0)) / (classInfo.nextTarget - (classInfo.minGPA || 0))) * 100)}%` }} />
                <div className="absolute inset-0 flex items-center justify-end pr-1">
                  <span className="text-[8px] text-white/40 font-bold">→ {classInfo.nextTarget}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div style={fadeIn(80)} className="flex gap-1 p-1 bg-[#F7F9FB] rounded-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-[#1C2A39] shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#6B7280]'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-4">

          {/* ── Quick Stats Grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={fadeIn(100)}>
            {[
              { label: 'Credits Earned', value: creditsEarned, sub: `of ${creditsTotal}`, icon: '📚', pct: (creditsEarned / Math.max(creditsTotal, 1)) * 100 },
              { label: 'Credits Left', value: creditsTotal - creditsEarned, sub: 'remaining', icon: '⏳', pct: ((creditsTotal - creditsEarned) / Math.max(creditsTotal, 1)) * 100 },
              { label: 'Modules Done', value: modulesCompleted, sub: `of ${modulesTotal}`, icon: '✅', pct: (modulesCompleted / Math.max(modulesTotal, 1)) * 100 },
              { label: 'Semesters', value: semesterData.length, sub: 'with data', icon: '📅', pct: (semesterData.length / 8) * 100 },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.12em]">{s.label}</p>
                  <span className="text-base">{s.icon}</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-black text-[#1E3A5F]">{s.value}</span>
                  <span className="text-xs text-[#9CA3AF] font-medium">{s.sub}</span>
                </div>
                <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#1E3A5F] to-[#2BB673] transition-all duration-700"
                    style={{ width: `${Math.min(100, s.pct)}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* ── Best / Worst / Booster ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={fadeIn(140)}>
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
            {worstSem && bestSem?.name !== worstSem?.name && (
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

          {/* ── Pass vs Fail Summary ── */}
          <div style={fadeIn(160)}>
            <ChartCard
              title="Pass / Fail Summary"
              subtitle="Module outcome breakdown"
              accent="linear-gradient(90deg, #2BB673, #ef4444)"
            >
              <div className="flex items-center gap-4">
                {/* Stacked bar */}
                <div className="flex-1 h-8 rounded-full overflow-hidden flex">
                  {passCount > 0 && (
                    <div
                      className="h-full flex items-center justify-center text-[11px] font-black text-white transition-all duration-700"
                      style={{ width: `${(passCount / (passCount + failCount)) * 100}%`, background: '#2BB673' }}
                    >
                      {passCount > 2 && `${passCount} passed`}
                    </div>
                  )}
                  {failCount > 0 && (
                    <div
                      className="h-full flex items-center justify-center text-[11px] font-black text-white transition-all duration-700"
                      style={{ width: `${(failCount / (passCount + failCount)) * 100}%`, background: '#ef4444' }}
                    >
                      {failCount > 0 && `${failCount} failed`}
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-bold text-[#2BB673]">{passCount} passed</p>
                  <p className="text-xs font-bold text-red-500">{failCount} failed</p>
                </div>
              </div>
              {failCount > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-red-50/60 border border-red-100 text-xs text-red-600 font-medium">
                  ⚠️ You have {failCount} failed module{failCount > 1 ? 's' : ''}. Retaking these can significantly improve your CGPA.
                </div>
              )}
            </ChartCard>
          </div>

          {/* ── Year-by-Year Breakdown ── */}
          <div style={fadeIn(200)}>
            <SectionHeader title="Year by Year" subtitle="Expand to see details" />
            <div className="space-y-2">
              {yearBreakdown.map((yr) => (
                <div key={yr.year} className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                  <button
                    className="w-full flex items-center gap-4 p-4 hover:bg-[#F7F9FB] transition-colors duration-200"
                    onClick={() => setExpandedYear(expandedYear === yr.year ? null : yr.year)}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                      style={{
                        background: yr.gpa ? `${getGradeRingColor(yr.gpa)}18` : '#F7F9FB',
                        color: yr.gpa ? getGradeRingColor(yr.gpa) : '#9CA3AF',
                      }}>
                      Y{yr.year}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-[#1C2A39]">Year {yr.year}</p>
                      <p className="text-xs text-[#9CA3AF]">{yr.gradedModules}/{yr.totalModules} modules graded</p>
                    </div>
                    {yr.gpa !== null && (
                      <div className="text-right shrink-0">
                        <p className="text-lg font-black text-[#1E3A5F]">{yr.gpa.toFixed(2)}</p>
                        <p className="text-[10px] text-[#9CA3AF]">GPA</p>
                      </div>
                    )}
                    {yr.gpa === null && (
                      <span className="text-xs text-[#9CA3AF] shrink-0">No data yet</span>
                    )}
                    <svg
                      className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 shrink-0 ${expandedYear === yr.year ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedYear === yr.year && (
                    <div className="px-4 pb-4 border-t border-gray-50">
                      <div className="grid grid-cols-3 gap-3 mt-3 mb-3">
                        <StatPill label="Year GPA" value={yr.gpa?.toFixed(2) || '—'} color={yr.gpa ? getGradeRingColor(yr.gpa) : '#9CA3AF'} />
                        <StatPill label="A-grades" value={yr.aCount} color="#2BB673" />
                        <StatPill label="Failed" value={yr.failMods.length} color={yr.failMods.length > 0 ? '#ef4444' : '#2BB673'} />
                      </div>
                      {yr.failMods.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Modules below pass threshold</p>
                          {yr.failMods.map((mod) => (
                            <div key={mod.moduleCode} className="flex items-center justify-between px-3 py-2 rounded-xl bg-red-50/50 border border-red-100">
                              <div>
                                <p className="text-xs font-semibold text-[#1C2A39] truncate max-w-[200px]">{mod.moduleName}</p>
                                <p className="text-[10px] text-[#9CA3AF]">{mod.moduleCode}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${getGradeBadgeColor(selectedGrades[mod.moduleCode])}`}>
                                {selectedGrades[mod.moduleCode] || '—'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Grade Distribution Donut ── */}
          <div style={fadeIn(240)}>
            <ChartCard title="Grade Distribution" subtitle="Breakdown of all module grades received" accent="linear-gradient(90deg, #1E3A5F, #F2994A)">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={240} className="max-w-[240px]">
                  <PieChart>
                    <Pie data={gradeDistribution} cx="50%" cy="50%" innerRadius={52} outerRadius={88} paddingAngle={4} dataKey="value" stroke="none">
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
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-[#6B7280]">
                        {d.name} <span className="font-bold text-[#1C2A39]">({d.value})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: PROGRESS
      ══════════════════════════════════════ */}
      {activeTab === 'progress' && (
        <div className="space-y-4">

          {/* ── GPA Trend Bar ── */}
          <div style={fadeIn(80)}>
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
                    <span key={sem.name} className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full ${
                      sem.delta > 0 ? 'bg-[#2BB673]/10 text-[#2BB673]' :
                      sem.delta < 0 ? 'bg-red-50 text-red-600' : 'bg-[#F7F9FB] text-[#6B7280]'
                    }`}>
                      {sem.name}
                      {sem.delta > 0
                        ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                        : sem.delta < 0
                          ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                          : <span>—</span>}
                      {sem.delta !== 0 && Math.abs(sem.delta).toFixed(2)}
                    </span>
                  ))}
                </div>
              )}
            </ChartCard>
          </div>

          {/* ── CGPA Line ── */}
          <div style={fadeIn(120)}>
            <ChartCard title="CGPA Progress" subtitle="Cumulative GPA trend over semesters" accent="linear-gradient(90deg, #1F5F73, #2BB673)">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={cgpaProgressData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F7F9FB" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 4]} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />

                  {/* Classification threshold lines */}
                  {[
                    { y: 3.7, label: 'First', color: '#2BB673' },
                    { y: 3.3, label: '2U', color: '#1F5F73' },
                    { y: 3.0, label: '2L', color: '#1E3A5F' },
                    { y: 2.0, label: 'Pass', color: '#F2994A' },
                  ].map((ref) => (
                    <g key={ref.y}>
                      {/* recharts doesn't support svg directly, using ReferenceLine is not imported, so we skip */}
                    </g>
                  ))}

                  <defs>
                    <linearGradient id="cgpaGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#1E3A5F" />
                      <stop offset="100%" stopColor="#2BB673" />
                    </linearGradient>
                  </defs>
                  <Line type="monotone" dataKey="CGPA" stroke="url(#cgpaGrad)" strokeWidth={3}
                    dot={{ r: 5, fill: '#1E3A5F', strokeWidth: 2.5, stroke: '#fff' }}
                    activeDot={{ r: 7, fill: '#2BB673', strokeWidth: 2.5, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>

              {/* Classification thresholds legend */}
              <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-3">
                {[
                  { label: 'First Class', gpa: 3.7, color: '#2BB673' },
                  { label: '2nd Upper', gpa: 3.3, color: '#1F5F73' },
                  { label: '2nd Lower', gpa: 3.0, color: '#1E3A5F' },
                  { label: 'General Pass', gpa: 2.0, color: '#F2994A' },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-1.5">
                    <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-[10px] text-[#9CA3AF] font-medium">{c.label} ≥{c.gpa}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* ── Credits by Tier ── */}
          {creditsByTier.length > 0 && (
            <div style={fadeIn(160)}>
              <ChartCard title="Credits by Grade Tier" subtitle="How credits distribute across grade ranges per semester" accent="linear-gradient(90deg, #2BB673, #F2994A)">
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

          {/* ── GPA by Year Radar ── */}
          {radarData.length >= 3 && (
            <div style={fadeIn(200)}>
              <ChartCard title="GPA by Year (Radar)" subtitle="Visual comparison of your GPA across academic years" accent="linear-gradient(90deg, #1E3A5F, #2BB673)">
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#F1F5F9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickCount={5} />
                    <Radar name="GPA" dataKey="GPA" stroke="#1F5F73" fill="#1F5F73" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}

          {/* ── Semester GPA Table ── */}
          <div style={fadeIn(240)}>
            <ChartCard title="Semester Summary Table" subtitle="All semester GPA data at a glance" accent="linear-gradient(90deg, #1E3A5F, #1F5F73)">
              <div className="space-y-2">
                {semesterDeltas.map((sem, i) => (
                  <div key={sem.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F7F9FB] transition-colors duration-150">
                    <div className="w-16 text-xs font-black text-[#6B7280]">{sem.name}</div>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(sem.GPA / 4) * 100}%`,
                          backgroundColor: sem.GPA >= 3.7 ? '#2BB673' : sem.GPA >= 3.0 ? '#1F5F73' : sem.GPA >= 2.0 ? '#F2994A' : '#ef4444',
                        }}
                      />
                    </div>
                    <div className="w-12 text-right">
                      <span className="text-sm font-black text-[#1C2A39]">{sem.GPA.toFixed(2)}</span>
                    </div>
                    {i > 0 && (
                      <span className={`w-14 text-right text-[11px] font-bold ${sem.delta > 0 ? 'text-[#2BB673]' : sem.delta < 0 ? 'text-red-500' : 'text-[#9CA3AF]'}`}>
                        {sem.delta > 0 ? '+' : ''}{sem.delta.toFixed(2)}
                      </span>
                    )}
                    {i === 0 && <span className="w-14" />}
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: MODULES
      ══════════════════════════════════════ */}
      {activeTab === 'modules' && (
        <div className="space-y-4">

          {/* ── Top & Bottom Modules ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={fadeIn(80)}>
            {topModules.length > 0 && (
              <ChartCard title="🏅 Top Performing" subtitle="Your highest-graded GPA modules" accent="linear-gradient(90deg, #2BB673, #1F5F73)">
                <div className="space-y-2">
                  {topModules.map((mod, i) => (
                    <div key={mod.code} className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F9FB] hover:bg-[#2BB673]/6 transition-colors duration-200">
                      <span className="text-[11px] font-black text-[#9CA3AF] w-5 text-center shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-[#1C2A39] truncate">{mod.name}</p>
                        <p className="text-[10px] text-[#9CA3AF] font-medium mt-0.5">{mod.code} · {mod.credits} cr · Y{mod.year}S{mod.semester}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${getGradeBadgeColor(mod.grade)}`}>{mod.grade}</span>
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
                      <span className="text-[11px] font-black text-[#9CA3AF] w-5 text-center shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-[#1C2A39] truncate">{mod.name}</p>
                        <p className="text-[10px] text-[#9CA3AF] font-medium mt-0.5">{mod.code} · {mod.credits} cr · Y{mod.year}S{mod.semester}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${getGradeBadgeColor(mod.grade)}`}>{mod.grade}</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            )}
          </div>

          {/* ── All Graded Modules Full List ── */}
          <div style={fadeIn(120)}>
            <ChartCard title="All Graded Modules" subtitle={`${modulesCompleted} modules entered`} accent="linear-gradient(90deg, #1E3A5F, #1F5F73)">
              <div className="space-y-1.5">
                {syllabusData
                  .filter((m) => selectedGrades[m.moduleCode])
                  .sort((a, b) => a.year !== b.year ? a.year - b.year : a.semester !== b.semester ? a.semester - b.semester : 0)
                  .map((mod) => {
                    const grade = selectedGrades[mod.moduleCode];
                    const gp = getGradePoint(grade);
                    const passed = isPass(grade);
                    return (
                      <div key={mod.moduleCode} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 ${!passed ? 'bg-red-50/40 border border-red-100' : 'hover:bg-[#F7F9FB]'}`}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                          style={{ background: `${getGradeRingColor(gp || 0)}15`, color: getGradeRingColor(gp || 0) }}>
                          Y{mod.year}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1C2A39] truncate">{mod.moduleName}</p>
                          <p className="text-[10px] text-[#9CA3AF]">{mod.moduleCode} · {mod.credits} cr {!mod.isGPA ? '· non-GPA' : ''}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-black border shrink-0 ${getGradeBadgeColor(grade)}`}>{grade}</span>
                        {!passed && <span className="text-[10px] text-red-400 font-bold shrink-0">FAIL</span>}
                      </div>
                    );
                  })}
              </div>
            </ChartCard>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: INSIGHTS
      ══════════════════════════════════════ */}
      {activeTab === 'insights' && (
        <div className="space-y-4">

          {/* ── Upgrade Path ── */}
          {neededForUpgrade && (
            <div style={fadeIn(60)}
              className="rounded-2xl p-5 sm:p-6 overflow-hidden relative shadow-sm border border-[#1F5F73]/15"
              style={{ background: 'linear-gradient(135deg, #1E3A5F08, #2BB67308)' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1F5F73]/12 flex items-center justify-center text-xl shrink-0">🎯</div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">Upgrade Path</p>
                  <p className="text-sm font-bold text-[#1C2A39]">
                    To achieve <span style={{ color: classificationInfo[neededForUpgrade.nextClass]?.color }}>{neededForUpgrade.nextClass}</span>, you need an average GPA of <span className="text-[#1E3A5F]">{neededForUpgrade.needed.toFixed(2)}</span> in remaining modules.
                  </p>
                  <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, (overallCGPA / neededForUpgrade.target) * 100)}%`,
                        background: 'linear-gradient(90deg, #1E3A5F, #2BB673)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-[#9CA3AF]">Current: {overallCGPA.toFixed(2)}</span>
                    <span className="text-[10px] text-[#9CA3AF]">Target: {neededForUpgrade.target}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Insights List ── */}
          {insights.length > 0 && (
            <div style={fadeIn(100)}>
              <SectionHeader title="Performance Insights" subtitle="Auto-generated observations from your data" />
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                      insight.type === 'positive' ? 'border-[#2BB673]/15 bg-[#2BB673]/5' :
                      insight.type === 'warning' ? 'border-[#F2994A]/20 bg-[#F2994A]/5' :
                      'border-gray-100 bg-[#F7F9FB]'
                    }`}
                  >
                    <div className="flex items-start gap-3 p-4">
                      <span className="text-xl shrink-0 mt-0.5">{insight.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold leading-snug ${
                          insight.type === 'positive' ? 'text-[#1C2A39]' :
                          insight.type === 'warning' ? 'text-[#1C2A39]' : 'text-[#6B7280]'
                        }`}>{insight.text}</p>
                        {insight.tip && (
                          <p className="text-xs text-[#9CA3AF] mt-1.5 leading-relaxed">{insight.tip}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Classification Scale ── */}
          <div style={fadeIn(160)}>
            <SectionHeader title="Classification Scale" subtitle="Where your CGPA sits" />
            <div className="space-y-2">
              {Object.entries(classificationInfo).reverse().map(([label, info]) => {
                const isCurrent = label === classification;
                return (
                  <div
                    key={label}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 ${
                      isCurrent
                        ? 'border-current shadow-sm'
                        : 'border-gray-100 bg-white opacity-60'
                    }`}
                    style={isCurrent ? { borderColor: `${info.color}30`, background: `${info.color}08` } : {}}
                  >
                    <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: info.color, opacity: isCurrent ? 1 : 0.4 }} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1C2A39]">{label}</p>
                      <p className="text-[11px] text-[#9CA3AF]">≥ {info.minGPA.toFixed(1)} GPA</p>
                    </div>
                    {isCurrent && (
                      <span className="text-[11px] font-black px-2.5 py-1 rounded-full border"
                        style={{ color: info.color, background: `${info.color}15`, borderColor: `${info.color}25` }}>
                        You are here
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Consistency Score ── */}
          <div style={fadeIn(200)}>
            <ChartCard title="Consistency Score" subtitle="How stable your GPA is across semesters" accent="linear-gradient(90deg, #1E3A5F, #2BB673)">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 shrink-0">
                  <svg width={96} height={96} className="-rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                      fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                    <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                      fill="none"
                      stroke={consistency >= 70 ? '#2BB673' : consistency >= 40 ? '#F2994A' : '#ef4444'}
                      strokeWidth="3.5"
                      strokeDasharray={`${consistency}, 100`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-[#1C2A39]">{consistency}</span>
                    <span className="text-[9px] text-[#9CA3AF] font-bold">/100</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-sm font-bold text-[#1C2A39]">
                    {consistency >= 85 ? 'Excellent stability' : consistency >= 70 ? 'Good stability' : consistency >= 50 ? 'Moderate variation' : consistency >= 30 ? 'High variation' : 'Very unstable'}
                  </p>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    {consistency >= 85
                      ? 'Your GPA barely fluctuates semester to semester — a sign of strong study habits.'
                      : consistency >= 50
                        ? 'Your performance varies somewhat across semesters. Aim for more consistent study habits.'
                        : 'Significant swings in your GPA suggest inconsistent preparation. Focus on building steady routines.'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {bestSem && <StatPill label="Best" value={bestSem.GPA.toFixed(2)} color="#2BB673" />}
                    {worstSem && <StatPill label="Worst" value={worstSem.GPA.toFixed(2)} color="#ef4444" />}
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>

        </div>
      )}

    </div>
  );
};

export default Analyzer;