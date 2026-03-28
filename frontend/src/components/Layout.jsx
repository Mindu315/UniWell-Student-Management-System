import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const specializationNames = {
  it: 'Information Technology',
  se: 'Software Engineering',
  ds: 'Data Science',
  cyber: 'Cyber Security',
  im: 'Interactive Media',
  cs: 'Computer Science',
  csne: 'CSNE',
  ise: 'ISE',
};

const specializationEmojis = {
  it: '🖥️',
  se: '💻',
  ds: '📊',
  cyber: '🔐',
  im: '🎨',
  cs: '🧑‍💻',
  csne: '🌐',
  ise: '💼',
};

// Each specialization maps to a subtle gradient pair from the palette
const specializationGradients = {
  it: 'from-[#2BB673]/10 to-[#1F5F73]/10 border-[#2BB673]/20 text-[#2BB673]',
  se: 'from-[#1E3A5F]/10 to-[#1F5F73]/10 border-[#1E3A5F]/20 text-[#1E3A5F]',
  ds: 'from-[#1F5F73]/10 to-[#2BB673]/10 border-[#1F5F73]/20 text-[#1F5F73]',
  cyber: 'from-[#F2994A]/10 to-[#1E3A5F]/10 border-[#F2994A]/20 text-[#F2994A]',
  im: 'from-[#F2994A]/10 to-[#2BB673]/10 border-[#F2994A]/20 text-[#F2994A]',
  cs: 'from-[#1E3A5F]/10 to-[#2BB673]/10 border-[#1E3A5F]/20 text-[#1E3A5F]',
  csne: 'from-[#1F5F73]/10 to-[#1E3A5F]/10 border-[#1F5F73]/20 text-[#1F5F73]',
  ise: 'from-[#2BB673]/10 to-[#1E3A5F]/10 border-[#2BB673]/20 text-[#2BB673]',
};

const navItems = [
  {
    id: 'calculator',
    label: 'GPA Calculator',
    shortLabel: 'Calculator',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm2.25-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm2.25-6.75V4.5A2.25 2.25 0 0012.75 2h-1.5A2.25 2.25 0 009 4.5v.75m6.75 0h-6.75m6.75 0v13.5A2.25 2.25 0 0113.5 21h-3a2.25 2.25 0 01-2.25-2.25V5.25" />
      </svg>
    ),
  },
  {
    id: 'analyzer',
    label: 'Analyzer',
    shortLabel: 'Analyzer',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    id: 'predictor',
    label: 'Target Predictor',
    shortLabel: 'Predictor',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
  },
];

const Layout = ({ children, activeTab, onTabChange }) => {
  const { specialization, syllabusType } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [activeTab]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const specName = specializationNames[specialization] || 'Unknown';
  const specEmoji = specializationEmojis[specialization] || '📚';
  const specGradient = specializationGradients[specialization] || 'from-gray-100 to-gray-100 border-gray-200 text-gray-600';
  const syllabusLabel = syllabusType === 'new' ? 'New Syllabus' : 'Old Syllabus';

  return (
    <div className="min-h-screen bg-[#F7F9FB]">

      {/* ── Mobile Top Bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/60">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 rounded-xl hover:bg-[#F7F9FB] active:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-[#1C2A39]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Center: app name */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#1E3A5F] to-[#1F5F73] flex items-center justify-center shadow-sm">
              <span className="text-white text-[10px] font-bold">G</span>
            </div>
            <span className="text-sm font-semibold text-[#1C2A39]">GPA Suite</span>
          </div>

          <div className="w-9" />
        </div>
      </div>

      {/* ── Mobile Overlay ── */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(28,42,57,0.35)', backdropFilter: 'blur(4px)' }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[270px]
          flex flex-col
          transition-transform duration-300 ease-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: '#FFFFFF', borderRight: '1px solid rgba(30,58,95,0.08)' }}
      >
        {/* Sidebar top decoration */}
        <div
          className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(30,58,95,0.04) 0%, transparent 100%)' }}
        />

        {/* ── Header ── */}
        <div className="relative px-5 pt-6 pb-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#1F5F73] flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#1C2A39] leading-tight tracking-tight">GPA Suite</p>
                <p className="text-[10px] text-[#6B7280] font-medium leading-none mt-0.5">Academic Tracker</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-[#F7F9FB] transition-colors"
            >
              <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Active Specialization Profile Card */}
          <div className={`rounded-2xl border bg-gradient-to-br p-4 ${specGradient}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center text-xl shadow-sm">
                {specEmoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest opacity-60 mb-0.5">Active Program</p>
                <p className="text-[13px] font-bold truncate">{specName}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-current/10 flex items-center justify-between">
              <span className="text-[11px] font-semibold bg-white/60 px-2.5 py-1 rounded-full">
                {syllabusLabel}
              </span>
              <button
                onClick={() => navigate('/')}
                className="text-[11px] font-semibold opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1 hover:underline underline-offset-2"
              >
                Change
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-3 mt-5 overflow-y-auto">
          <p className="px-3 mb-2 text-[9px] font-black text-[#6B7280]/60 uppercase tracking-[0.18em]">
            Menu
          </p>
          <div className="space-y-1">
            {navItems.map((item, i) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold
                    transition-all duration-200 ease-out relative overflow-hidden
                    ${isActive
                      ? 'bg-gradient-to-r from-[#1E3A5F] to-[#1F5F73] text-white shadow-md shadow-[#1E3A5F]/20'
                      : 'text-[#6B7280] hover:text-[#1C2A39] hover:bg-[#F7F9FB]'
                    }
                  `}
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateX(0)' : 'translateX(-12px)',
                    transition: `opacity 0.4s ease ${i * 80 + 200}ms, transform 0.4s ease ${i * 80 + 200}ms, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease`,
                  }}
                >
                  {/* Active indicator dot */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#2BB673] rounded-r-full" />
                  )}
                  <span className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-[#6B7280]'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                  {isActive && (
                    <span className="ml-auto">
                      <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ── Sidebar Footer ── */}
        <div className="px-5 py-4 border-t border-gray-100/80">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#F7F9FB] flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#1C2A39]">GPA Suite v1.0</p>
              <p className="text-[10px] text-[#6B7280]">For SLIIT Students</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="lg:ml-[270px] min-h-screen">
        {/* Mobile top bar spacer */}
        <div className="lg:hidden h-14" />

        {/* Top bar for desktop — shows active tab */}
        <div className="hidden lg:block sticky top-0 z-30 bg-[#F7F9FB]/90 backdrop-blur-md border-b border-gray-200/40 px-8 h-14">
          <div className="flex items-center h-full">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#6B7280] font-medium">GPA Suite</span>
              <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-semibold text-[#1C2A39]">
                {navItems.find((n) => n.id === activeTab)?.label}
              </span>
            </div>

            {/* Right: active program mini badge */}
            <div className="ml-auto flex items-center gap-2 bg-white border border-gray-200/80 rounded-full px-3 py-1.5 shadow-sm">
              <span className="text-base">{specEmoji}</span>
              <span className="text-xs font-semibold text-[#1C2A39]">{specName}</span>
              <span className="text-[10px] text-[#6B7280] bg-[#F7F9FB] px-2 py-0.5 rounded-full font-medium">
                {syllabusLabel}
              </span>
            </div>
          </div>
        </div>

        <div
          className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.5s ease 150ms, transform 0.5s ease 150ms',
          }}
        >
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-gray-200/60">
        <div className="flex items-center justify-around px-2 h-16 pb-safe">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`
                  flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl min-w-[64px] relative
                  transition-all duration-200
                  ${isActive ? 'text-[#1E3A5F]' : 'text-[#6B7280]'}
                `}
              >
                {/* Active pill background */}
                {isActive && (
                  <span className="absolute inset-x-1 inset-y-0 rounded-xl bg-[#1E3A5F]/8" />
                )}
                <span className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className={`relative text-[10px] font-semibold ${isActive ? 'text-[#1E3A5F]' : 'text-[#6B7280]'}`}>
                  {item.shortLabel}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#2BB673]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile bottom nav spacer */}
      <div className="lg:hidden h-16" />
    </div>
  );
};

export default Layout;