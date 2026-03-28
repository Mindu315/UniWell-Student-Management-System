import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

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

const getGradeColors = (grade) => {
  if (!grade) return 'bg-[#F7F9FB] text-[#6B7280] border border-gray-200';
  if (['A+', 'A', 'A-'].includes(grade)) return 'bg-[#2BB673]/12 text-[#2BB673] border border-[#2BB673]/25';
  if (['B+', 'B', 'B-'].includes(grade)) return 'bg-[#1F5F73]/12 text-[#1F5F73] border border-[#1F5F73]/25';
  if (['C+', 'C', 'C-'].includes(grade)) return 'bg-[#F2994A]/12 text-[#F2994A] border border-[#F2994A]/25';
  if (['D+', 'D', 'E'].includes(grade)) return 'bg-red-50 text-red-600 border border-red-200';
  return 'bg-[#F7F9FB] text-[#6B7280] border border-gray-200';
};

const VALID_GRADES = ['A+', 'A-', 'B+', 'B-', 'C+', 'C-', 'D+', 'A', 'B', 'C', 'D', 'E'];

const GpaCalculator = ({ selectedGrades, setSelectedGrades }) => {
  const { specialization, syllabusType } = useParams();
  const syllabusData = syllabusMap[specialization]?.[syllabusType] || [];
  const [expandedSemesters, setExpandedSemesters] = useState({});
  const [isParsing, setIsParsing] = useState(false);
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const syllabusModuleCodes = useMemo(() => new Set(syllabusData.map((m) => m.moduleCode)), [syllabusData]);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  const parsePdfForGrades = useCallback(async (file) => {
    if (!file || file.type !== 'application/pdf') { showToast('Please select a valid PDF file.', 'error'); return; }
    setIsParsing(true);
    try {
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
      });
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const allRows = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const items = [];
        textContent.items.forEach((item) => {
          if (!item.str.trim()) return;
          items.push({ x: item.transform[4], y: item.transform[5], text: item.str.trim() });
        });
        items.sort((a, b) => b.y - a.y);
        const rows = [];
        let currentRow = [], currentY = null;
        items.forEach((item) => {
          if (currentY === null || Math.abs(item.y - currentY) <= 5) {
            currentRow.push(item);
            if (currentY === null) currentY = item.y;
          } else {
            if (currentRow.length > 0) rows.push(currentRow);
            currentRow = [item]; currentY = item.y;
          }
        });
        if (currentRow.length > 0) rows.push(currentRow);
        rows.forEach((row) => {
          row.sort((a, b) => a.x - b.x);
          let rowText = row.map((it) => it.text).join(' ');
          rowText = rowText.replace(/\b([A-E])\s*[−–—\-]/g, '$1-');
          rowText = rowText.replace(/\b([A-E])\s*\+/g, '$1+');
          allRows.push(rowText);
        });
      }
      const gradePattern = VALID_GRADES.map((g) => g.replace('+', '\\+')).join('|');
      const moduleCodeRegex = /\b([A-Z]{2}\d{4})\b/;
      const gradeRegex = new RegExp(`(?<![A-Za-z0-9.])(${gradePattern})(?![A-Za-z0-9.])`, 'g');
      const extracted = {};
      for (const row of allRows) {
        const codeMatch = row.match(moduleCodeRegex);
        if (!codeMatch) continue;
        const moduleCode = codeMatch[1];
        const afterCode = row.slice(row.indexOf(moduleCode) + moduleCode.length);
        const gradeMatches = [...afterCode.matchAll(gradeRegex)];
        if (gradeMatches.length > 0) extracted[moduleCode] = gradeMatches[gradeMatches.length - 1][1];
      }
      const matched = {}, ignoredFromPdf = [], missingFromPdf = [];
      Object.entries(extracted).forEach(([code, grade]) => {
        if (syllabusModuleCodes.has(code)) matched[code] = grade;
        else ignoredFromPdf.push(code);
      });
      syllabusModuleCodes.forEach((code) => { if (!(code in extracted)) missingFromPdf.push(code); });
      if (Object.keys(matched).length === 0) { showToast('No matching modules found. Please upload the correct result sheet.', 'error'); return; }
      if (ignoredFromPdf.length > 0) { showToast(`Wrong result sheet! This PDF contains ${ignoredFromPdf.length} module(s) from a different specialization.`, 'error'); return; }
      setSelectedGrades((prev) => ({ ...prev, ...matched }));
      const matchedCount = Object.keys(matched).length;
      if (missingFromPdf.length === 0) showToast(`All ${matchedCount} module grade(s) imported successfully!`, 'success');
      else showToast(`Imported ${matchedCount} module grade(s) successfully!`, 'success');
    } catch (err) {
      showToast('Failed to parse the PDF. Please try again.', 'error');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [syllabusModuleCodes, setSelectedGrades, showToast]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) parsePdfForGrades(file);
  }, [parsePdfForGrades]);

  const groupedModules = useMemo(() => {
    const groups = {};
    syllabusData.forEach((module) => {
      const key = `${module.year}-${module.semester}`;
      if (!groups[key]) groups[key] = { year: module.year, semester: module.semester, modules: [] };
      groups[key].modules.push(module);
    });
    return Object.values(groups).sort((a, b) => a.year !== b.year ? a.year - b.year : a.semester - b.semester);
  }, [syllabusData]);

  useMemo(() => {
    const initial = {};
    groupedModules.forEach((group) => { initial[`${group.year}-${group.semester}`] = true; });
    if (Object.keys(expandedSemesters).length === 0 && groupedModules.length > 0) setExpandedSemesters(initial);
  }, [groupedModules]);

  const getGradePoint = (grade) => {
    const gradeInfo = gradingStyle.find((g) => g.grade === grade);
    return gradeInfo ? gradeInfo.gradePoint : null;
  };

  const calculateSemesterGPA = (modules) => {
    let totalCredits = 0, totalPoints = 0;
    modules.forEach((module) => {
      if (!module.isGPA) return;
      const grade = selectedGrades[module.moduleCode];
      if (!grade) return;
      const gp = getGradePoint(grade);
      if (gp !== null) { totalCredits += module.credits; totalPoints += gp * module.credits; }
    });
    if (totalCredits === 0) return null;
    return (totalPoints / totalCredits).toFixed(2);
  };

  const calculateCGPA = useMemo(() => {
    let totalCredits = 0, totalPoints = 0;
    syllabusData.forEach((module) => {
      if (!module.isGPA) return;
      const grade = selectedGrades[module.moduleCode];
      if (!grade) return;
      const gp = getGradePoint(grade);
      if (gp !== null) { totalCredits += module.credits; totalPoints += gp * module.credits; }
    });
    if (totalCredits === 0) return '0.00';
    return (totalPoints / totalCredits).toFixed(2);
  }, [selectedGrades, syllabusData]);

  const totalCreditsCompleted = useMemo(() => {
    let credits = 0;
    syllabusData.forEach((module) => { if (selectedGrades[module.moduleCode]) credits += module.credits; });
    return credits;
  }, [selectedGrades, syllabusData]);

  const totalCredits = useMemo(() => syllabusData.reduce((sum, m) => sum + m.credits, 0), [syllabusData]);

  const semestersCompleted = useMemo(() => {
    const set = new Set();
    syllabusData.forEach((module) => {
      if (selectedGrades[module.moduleCode]) set.add(`${module.year}-${module.semester}`);
    });
    return set.size;
  }, [selectedGrades, syllabusData]);

  const handleGradeChange = (moduleCode, grade) => {
    setSelectedGrades((prev) => ({ ...prev, [moduleCode]: grade }));
  };

  const toggleAccordion = (key) => {
    setExpandedSemesters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const cgpaFloat = parseFloat(calculateCGPA);
  const cgpaPercent = Math.min((cgpaFloat / 4) * 100, 100);

  const getClassification = (gpa) => {
    if (gpa >= 3.7) return { label: 'First Class', color: 'text-[#2BB673]', bg: 'bg-[#2BB673]/10' };
    if (gpa >= 3.3) return { label: '2nd Upper', color: 'text-[#1F5F73]', bg: 'bg-[#1F5F73]/10' };
    if (gpa >= 3.0) return { label: '2nd Lower', color: 'text-[#1E3A5F]', bg: 'bg-[#1E3A5F]/10' };
    if (gpa >= 2.0) return { label: 'General Pass', color: 'text-[#F2994A]', bg: 'bg-[#F2994A]/10' };
    if (gpa > 0) return { label: 'Below Std.', color: 'text-red-500', bg: 'bg-red-50' };
    return null;
  };

  const classification = cgpaFloat > 0 ? getClassification(cgpaFloat) : null;

  return (
    <div className="space-y-5">
      {/* Hidden PDF input */}
      <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] max-w-sm px-4 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md flex items-start gap-3 transition-all duration-300`}
          style={{
            animation: 'slideInRight 0.3s ease-out',
            background: toast.type === 'success' ? 'rgba(43,182,115,0.08)' : toast.type === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.95)',
            borderColor: toast.type === 'success' ? 'rgba(43,182,115,0.3)' : toast.type === 'error' ? 'rgba(239,68,68,0.3)' : '#e5e7eb',
          }}
        >
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-[#2BB673]/15 text-[#2BB673]' : toast.type === 'error' ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
            {toast.type === 'success' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
          <p className="text-sm font-medium text-[#1C2A39] leading-snug">{toast.message}</p>
        </div>
      )}

      {/* ── Page Header ── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(-12px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
      >
        <div className="px-4 py-1"> {/* Added px-6 for left/right spacing, and py-4 for a little top/bottom breathing room! */}
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2A39] tracking-tight">
            GPA Calculator
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Select grades for each module to calculate your GPA
          </p>
</div>
        <button
  onClick={() => fileInputRef.current?.click()}
  disabled={isParsing}
  className={`mr-6 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm cursor-pointer whitespace-nowrap ${
    isParsing
      ? 'bg-gray-100 text-[#6B7280] cursor-not-allowed'
      : 'bg-gradient-to-r from-[#1E3A5F] to-[#1F5F73] text-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
  }`}
>
  {isParsing ? (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )}
  {isParsing ? 'Parsing...' : 'Import PDF Results'}
</button>
      </div>

      {/* ── CGPA Summary Card (top) ── */}
      <div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#1F5F73] p-5 sm:p-6 shadow-lg"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)', transition: 'opacity 0.5s ease 100ms, transform 0.5s ease 100ms' }}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 -translate-y-16 translate-x-16" style={{ background: 'radial-gradient(circle, #2BB673, transparent)' }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-8 translate-y-10 -translate-x-8" style={{ background: 'radial-gradient(circle, #F2994A, transparent)' }} />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="text-[11px] font-bold text-white/50 uppercase tracking-[0.18em] mb-1">Cumulative CGPA</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-black text-white">{calculateCGPA}</span>
              <span className="text-lg text-white/40 font-medium">/ 4.00</span>
            </div>
            {classification && (
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${classification.bg} ${classification.color}`}>
                {classification.label}
              </span>
            )}
          </div>

          <div className="w-full sm:w-56 space-y-2">
            <div className="flex justify-between text-xs text-white/60 font-medium">
              <span>Progress</span>
              <span>{totalCreditsCompleted} / {totalCredits} credits</span>
            </div>
            <div className="h-2 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2BB673] transition-all duration-700 ease-out"
                style={{ width: `${(totalCreditsCompleted / Math.max(totalCredits, 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/50">
              <span>{semestersCompleted} semester{semestersCompleted !== 1 ? 's' : ''} completed</span>
              <span>{Math.round((totalCreditsCompleted / Math.max(totalCredits, 1)) * 100)}%</span>
            </div>

            {/* GPA bar */}
            <div className="pt-1">
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>GPA Scale</span>
                <span>{cgpaPercent.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${cgpaPercent}%`, background: 'linear-gradient(90deg, #2BB673, #F2994A)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Semester Cards ── */}
      <div className="space-y-3 sm:space-y-4">
        {groupedModules.map((group, groupIndex) => {
          const key = `${group.year}-${group.semester}`;
          const isExpanded = expandedSemesters[key];
          const semesterGPA = calculateSemesterGPA(group.modules);
          const semCredits = group.modules.reduce((sum, m) => sum + m.credits, 0);
          const filledCount = group.modules.filter(m => selectedGrades[m.moduleCode]).length;
          const fillPercent = Math.round((filledCount / group.modules.length) * 100);

          return (
            <div
              key={key}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#1E3A5F]/15 hover:shadow-lg transition-all duration-300"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'none' : 'translateY(20px)',
                transition: `opacity 0.45s ease ${groupIndex * 50 + 200}ms, transform 0.45s ease ${groupIndex * 50 + 200}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
              }}
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleAccordion(key)}
                className="w-full flex justify-between items-center px-4 sm:px-6 py-4 cursor-pointer hover:bg-[#F7F9FB] active:bg-gray-100 transition-colors duration-200 group"
              >
                <div className="flex items-center gap-4">
                  {/* Semester badge */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#1F5F73] flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-white text-xs font-black">Y{group.year}S{group.semester}</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm sm:text-base font-semibold text-[#1C2A39]">
                      Year {group.year} · Semester {group.semester}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#6B7280]">{semCredits} credits</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-[#6B7280]">{filledCount}/{group.modules.length} graded</span>
                      {fillPercent === 100 && (
                        <span className="text-[10px] font-bold text-[#2BB673] bg-[#2BB673]/10 px-1.5 py-0.5 rounded-full">Complete</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {semesterGPA && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Sem GPA</p>
                      <p className="text-lg font-black text-[#1E3A5F]">{semesterGPA}</p>
                    </div>
                  )}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-[#1E3A5F]/8 rotate-180' : 'bg-[#F7F9FB] group-hover:bg-[#1E3A5F]/8'}`}>
                    <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Progress bar under header */}
              {fillPercent > 0 && (
                <div className="px-4 sm:px-6">
                  <div className="h-0.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#1E3A5F] to-[#2BB673] transition-all duration-500"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Accordion Content */}
              <div
                className={`transition-all duration-350 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
              >
                <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-3">
                  {/* Table Header */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 text-[10px] font-black text-[#6B7280] uppercase tracking-[0.14em] pb-2.5 border-b border-gray-100 mb-1">
                    <div className="col-span-2">Code</div>
                    <div className="col-span-6">Module Name</div>
                    <div className="col-span-2 text-center">Credits</div>
                    <div className="col-span-2 text-right">Grade</div>
                  </div>

                  {/* Module Rows */}
                  {group.modules.map((module, modIndex) => (
                    <div
                      key={module.moduleCode}
                      className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 py-3 sm:py-3.5 border-b border-gray-50 last:border-0 sm:items-center hover:bg-[#F7F9FB]/70 transition-colors duration-150 rounded-lg px-1 -mx-1"
                    >
                      {/* Mobile */}
                      <div className="flex sm:hidden justify-between items-start">
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[11px] font-bold text-[#1C2A39] bg-[#1E3A5F]/8 px-2 py-0.5 rounded-lg">
                              {module.moduleCode}
                            </span>
                            <span className="text-[11px] text-[#6B7280]">{module.credits} cr</span>
                            {!module.isGPA && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#F2994A]/12 text-[#F2994A] rounded-full">
                                Non-GPA
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#1C2A39] leading-snug">{module.moduleName}</span>
                        </div>
                        <select
                          value={selectedGrades[module.moduleCode] || ''}
                          onChange={(e) => handleGradeChange(module.moduleCode, e.target.value)}
                          className={`appearance-none rounded-xl px-3 py-1.5 text-xs font-bold text-center cursor-pointer outline-none shadow-sm transition-all duration-200 min-w-[60px] focus:ring-2 focus:ring-[#1E3A5F]/30 ${getGradeColors(selectedGrades[module.moduleCode])}`}
                          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.15rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em', paddingRight: '1.25rem' }}
                        >
                          <option value="">—</option>
                          {gradingStyle.map((g) => <option key={g.grade} value={g.grade}>{g.grade}</option>)}
                        </select>
                      </div>

                      {/* Desktop */}
                      <div className="hidden sm:block col-span-2">
                        <span className="text-xs font-bold text-[#1C2A39] bg-[#1E3A5F]/8 px-2.5 py-1 rounded-lg">
                          {module.moduleCode}
                        </span>
                      </div>
                      <div className="hidden sm:block col-span-6">
                        <span className="text-sm text-[#1C2A39]">{module.moduleName}</span>
                        {!module.isGPA && (
                          <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-[#F2994A]/12 text-[#F2994A] rounded-full">Non-GPA</span>
                        )}
                      </div>
                      <div className="hidden sm:flex col-span-2 justify-center">
                        <span className="text-sm text-[#6B7280] font-medium">{module.credits}</span>
                      </div>
                      <div className="hidden sm:flex col-span-2 justify-end">
                        <select
                          value={selectedGrades[module.moduleCode] || ''}
                          onChange={(e) => handleGradeChange(module.moduleCode, e.target.value)}
                          className={`appearance-none rounded-xl px-4 py-1.5 text-sm font-bold text-center cursor-pointer outline-none shadow-sm transition-all duration-200 min-w-[80px] focus:ring-2 focus:ring-[#1E3A5F]/30 ${getGradeColors(selectedGrades[module.moduleCode])}`}
                          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.35rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em', paddingRight: '1.8rem' }}
                        >
                          <option value="">—</option>
                          {gradingStyle.map((g) => <option key={g.grade} value={g.grade}>{g.grade} ({g.gradePoint.toFixed(1)})</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default GpaCalculator;