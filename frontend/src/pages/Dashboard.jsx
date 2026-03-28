import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import GpaCalculator from './GpaCalculator';
import Analyzer from './Analyzer';
import TargetPredictor from './TargetPredictor';
import useLocalStorage from '../hooks/useLocalStorage';

// ─── Color palette ────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#1E3A5F',
  secondary: '#1F5F73',
  accent: '#2BB673',
  warning: '#F2994A',
  bg: '#F7F9FB',
  card: '#FFFFFF',
  text: '#1C2A39',
  muted: '#6B7280',
};

// ─── Per-specialization meta ──────────────────────────────────────────────────
const SPEC_META = {
  se: { label: 'Software Engineering', code: 'SE', color: COLORS.primary, icon: '💻' },
  ds: { label: 'Data Science', code: 'DS', color: COLORS.secondary, icon: '📊' },
  it: { label: 'Information Technology', code: 'IT', color: COLORS.accent, icon: '🖥️' },
  cyber: { label: 'Cyber Security', code: 'CYB', color: COLORS.warning, icon: '🔐' },
  cs: { label: 'Computer Science', code: 'CS', color: COLORS.primary, icon: '🧠' },
  im: { label: 'Interactive Media', code: 'IM', color: COLORS.accent, icon: '🎨' },
  csne: { label: 'Computer Systems & Network Eng.', code: 'CSNE', color: COLORS.secondary, icon: '🌐' },
  ise: { label: 'Information Systems Engineering', code: 'ISE', color: COLORS.accent, icon: '💼' },
};

// ─── Tabs config ──────────────────────────────────────────────────────────────
const TABS = [
  {
    id: 'calculator',
    label: 'GPA Calculator',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'analyzer',
    label: 'Analyzer',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'predictor',
    label: 'Target Predictor',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { specialization, syllabusType } = useParams();
  const navigate = useNavigate();

  const storageKey = `gpa-grades-${specialization}-${syllabusType}`;
  const tabStorageKey = `gpa-activeTab-${specialization}-${syllabusType}`;

  const [selectedGrades, setSelectedGrades] = useLocalStorage(storageKey, {});
  const [activeTab, setActiveTab] = useLocalStorage(tabStorageKey, 'calculator');

  const validSpecs = ['it', 'se', 'ds', 'cyber', 'im', 'cs', 'csne', 'ise'];
  const validTypes = ['new', 'old'];

  const spec = SPEC_META[specialization] ?? { label: specialization, code: '??', color: COLORS.primary, icon: '📚' };
  const accentColor = spec.color;

  // ── Invalid route ────────────────────────────────────────────────────────
  if (!validSpecs.includes(specialization) || !validTypes.includes(syllabusType)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: COLORS.bg }}>

        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 animate-pulse"
            style={{ backgroundColor: COLORS.primary, filter: 'blur(80px)' }} />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 animate-pulse"
            style={{ backgroundColor: COLORS.secondary, filter: 'blur(80px)', animationDelay: '1.2s' }} />
        </div>

        <div className="relative rounded-3xl p-10 text-center max-w-sm w-full"
          style={{ backgroundColor: COLORS.card, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid rgba(30,58,95,0.08)' }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: COLORS.bg }}>
            <svg className="w-9 h-9" fill="none" stroke={COLORS.primary} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-xl font-bold mb-2" style={{ color: COLORS.text }}>Invalid Route</p>
          <p className="text-sm mb-8" style={{ color: COLORS.muted }}>
            The specialization or syllabus type is not recognised.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-2xl font-semibold text-white text-sm transition-all duration-300 hover:opacity-90 hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, boxShadow: `0 8px 24px ${COLORS.primary}40` }}
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // ── Tab content ──────────────────────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case 'calculator':
        return <GpaCalculator selectedGrades={selectedGrades} setSelectedGrades={setSelectedGrades} />;
      case 'analyzer':
        return <Analyzer selectedGrades={selectedGrades} />;
      case 'predictor':
        return <TargetPredictor />;
      default:
        return null;
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }}>

      {/* Global keyframes */}
      <style>{`
        @keyframes orb-float {
          0%,100% { transform:translateY(0) scale(1); }
          50%      { transform:translateY(-28px) scale(1.06); }
        }
        @keyframes slide-down {
          from { opacity:0; transform:translateY(-18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fade-up {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes tab-pop {
          0%   { transform:scale(0.95); opacity:0; }
          60%  { transform:scale(1.02); }
          100% { transform:scale(1);    opacity:1; }
        }
        .anim-slide-down { animation:slide-down 0.5s ease forwards; }
        .anim-fade-up    { animation:fade-up 0.5s ease 0.15s forwards; opacity:0; }
        .anim-tab-pop    { animation:tab-pop 0.35s cubic-bezier(.34,1.56,.64,1) forwards; }
      `}</style>

      {/* Background orbs + dot grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-52 -right-52 w-[480px] h-[480px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${accentColor}18, transparent 70%)`,
            animation: 'orb-float 9s ease-in-out infinite'
          }} />
        <div className="absolute bottom-0 -left-32 w-80 h-80 rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.secondary}12, transparent 70%)`,
            animation: 'orb-float 11s ease-in-out infinite reverse'
          }} />
        <div className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: `radial-gradient(circle, ${COLORS.primary} 1.2px, transparent 1.2px)`,
            backgroundSize: '28px 28px'
          }} />
      </div>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 anim-slide-down"
        style={{
          backgroundColor: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(30,58,95,0.07)',
          boxShadow: '0 1px 24px rgba(0,0,0,0.04)',
        }}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

          {/* Back + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="group flex items-center gap-1.5 text-sm font-medium transition-all duration-200"
              style={{ color: COLORS.muted }}
              onMouseEnter={e => (e.currentTarget.style.color = accentColor)}
              onMouseLeave={e => (e.currentTarget.style.color = COLORS.muted)}
            >
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <span className="w-px h-4" style={{ backgroundColor: 'rgba(30,58,95,0.12)' }} />

            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-base leading-none"
                style={{ backgroundColor: `${accentColor}14` }}>
                {spec.icon}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full tracking-wider"
                style={{ color: accentColor, backgroundColor: `${accentColor}14` }}>
                {spec.code}
              </span>
              <span className="text-sm font-semibold hidden sm:block" style={{ color: COLORS.text }}>
                {spec.label}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg font-semibold capitalize"
                style={{
                  backgroundColor: syllabusType === 'new' ? `${COLORS.accent}18` : `${COLORS.warning}18`,
                  color: syllabusType === 'new' ? COLORS.accent : COLORS.warning,
                }}>
                {syllabusType} syllabus
              </span>
            </div>
          </div>

          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                boxShadow: `0 4px 14px ${COLORS.primary}40`
              }}>
              <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-black hidden sm:block" style={{ color: COLORS.text }}>
              GPA<span style={{ color: accentColor }}>Calc</span>
            </span>
          </div>
        </div>
      </header>

      {/* ── TAB BAR ────────────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-40"
        style={{
          backgroundColor: 'rgba(247,249,251,0.92)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(30,58,95,0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto px-5 py-2.5 flex gap-1.5">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 select-none"
                style={{
                  backgroundColor: active ? accentColor : 'transparent',
                  color: active ? '#fff' : COLORS.muted,
                  boxShadow: active ? `0 4px 18px ${accentColor}38` : 'none',
                  transform: active ? 'scale(1.03)' : 'scale(1)',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = `${accentColor}12`;
                    e.currentTarget.style.color = accentColor;
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = COLORS.muted;
                  }
                }}
              >
                {tab.icon}
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            );
          })}

          {/* auto-saved pill */}
          <div className="ml-auto hidden md:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl"
            style={{ backgroundColor: `${accentColor}10`, color: accentColor }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 13l4 4L19 7" />
            </svg>
            Auto-saved
          </div>
        </div>
      </div>

      {/* ── MAIN ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-6xl mx-auto px-5 py-8 anim-fade-up">

        {/* Hero banner */}
        <div className="rounded-3xl p-6 mb-6 flex items-center justify-between overflow-hidden relative"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
            boxShadow: `0 12px 40px ${COLORS.primary}35`,
          }}
        >
          {/* glare overlay */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, transparent 55%)' }} />
          <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="absolute -right-2 -bottom-8 w-28 h-28 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.03)' }} />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {spec.code} · {syllabusType === 'new' ? 'New' : 'Old'} Syllabus
            </p>
            <h1 className="text-xl font-black text-white leading-tight">{spec.label}</h1>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {activeTab === 'calculator' && 'Enter your grades to calculate your GPA'}
              {activeTab === 'analyzer' && 'Analyse your academic performance'}
              {activeTab === 'predictor' && 'Predict the grades needed to hit your target'}
            </p>
          </div>

          {/* Mini tab switcher inside banner (desktop) */}
          <div className="relative hidden sm:flex items-center gap-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl transition-all duration-200"
                style={{
                  backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.85)',
                  border: activeTab === tab.id ? '1px solid rgba(255,255,255,0.28)' : '1px solid transparent',
                  transform: activeTab === tab.id ? 'scale(1.06)' : 'scale(1)',
                }}
              >
                {tab.icon}
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab panel with pop-in animation on switch */}
        <div
          key={activeTab}
          className="anim-tab-pop rounded-3xl overflow-hidden"
          style={{
            backgroundColor: COLORS.card,
            boxShadow: '0 4px 30px rgba(0,0,0,0.06)',
            border: '1px solid rgba(30,58,95,0.07)',
          }}
        >
          {renderTab()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;