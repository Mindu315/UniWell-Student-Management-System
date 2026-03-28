import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const specializations = [
  {
    name: "Software Engineering",
    abbr: "SE",
    emoji: "💻",
    description: "Build scalable software systems and master modern development practices",
    accentColor: "from-[#1E3A5F] to-[#1F5F73]",
    badgeBg: "bg-[#1E3A5F]/10",
    badgeText: "text-[#1E3A5F]",
    glowColor: "group-hover:shadow-[0_8px_40px_rgba(30,58,95,0.18)]",
    borderHover: "hover:border-[#1E3A5F]/30",
  },
  {
    name: "Data Science",
    abbr: "DS",
    emoji: "📊",
    description: "Analyze data, build ML models, and extract meaningful insights",
    accentColor: "from-[#1F5F73] to-[#2BB673]",
    badgeBg: "bg-[#1F5F73]/10",
    badgeText: "text-[#1F5F73]",
    glowColor: "group-hover:shadow-[0_8px_40px_rgba(31,95,115,0.18)]",
    borderHover: "hover:border-[#1F5F73]/30",
  },
  {
    name: "Information Technology",
    abbr: "IT",
    emoji: "🖥️",
    description: "Manage IT infrastructure, networks, and enterprise systems",
    accentColor: "from-[#2BB673] to-[#1F5F73]",
    badgeBg: "bg-[#2BB673]/10",
    badgeText: "text-[#2BB673]",
    glowColor: "group-hover:shadow-[0_8px_40px_rgba(43,182,115,0.18)]",
    borderHover: "hover:border-[#2BB673]/30",
  },
  {
    name: "Cyber Security",
    abbr: "CYB",
    emoji: "🔐",
    description: "Protect systems, detect threats, and secure digital assets",
    accentColor: "from-[#F2994A] to-[#1E3A5F]",
    badgeBg: "bg-[#F2994A]/10",
    badgeText: "text-[#F2994A]",
    glowColor: "group-hover:shadow-[0_8px_40px_rgba(242,153,74,0.18)]",
    borderHover: "hover:border-[#F2994A]/30",
  },
  {
    name: "Computer Science",
    abbr: "CS",
    emoji: "🧑‍💻",
    description: "Master algorithms, theory, and advanced computational concepts",
    accentColor: "from-[#1E3A5F] to-[#2BB673]",
    badgeBg: "bg-[#1E3A5F]/10",
    badgeText: "text-[#1E3A5F]",
    glowColor: "group-hover:shadow-[0_8px_40px_rgba(30,58,95,0.18)]",
    borderHover: "hover:border-[#1E3A5F]/30",
  },
  {
    name: "Interactive Media",
    abbr: "IM",
    emoji: "🎨",
    description: "Create engaging digital experiences and multimedia content",
    accentColor: "from-[#F2994A] to-[#2BB673]",
    badgeBg: "bg-[#F2994A]/10",
    badgeText: "text-[#F2994A]",
    glowColor: "group-hover:shadow-[0_8px_40px_rgba(242,153,74,0.18)]",
    borderHover: "hover:border-[#F2994A]/30",
  },
  {
    name: "Computer Systems & Network Engineering",
    abbr: "CSNE",
    emoji: "🌐",
    description: "Design and manage enterprise networks and system infrastructure",
    accentColor: "from-[#1F5F73] to-[#1E3A5F]",
    badgeBg: "bg-[#1F5F73]/10",
    badgeText: "text-[#1F5F73]",
    glowColor: "group-hover:shadow-[0_8px_40px_rgba(31,95,115,0.18)]",
    borderHover: "hover:border-[#1F5F73]/30",
  },
  {
    name: "Information Systems Engineering",
    abbr: "ISE",
    emoji: "💼",
    description: "Bridge business and technology with enterprise information systems",
    accentColor: "from-[#2BB673] to-[#1E3A5F]",
    badgeBg: "bg-[#2BB673]/10",
    badgeText: "text-[#2BB673]",
    glowColor: "group-hover:shadow-[0_8px_40px_rgba(43,182,115,0.18)]",
    borderHover: "hover:border-[#2BB673]/30",
  },
];

const slugMap = {
  "Software Engineering": "se",
  "Data Science": "ds",
  "Information Technology": "it",
  "Cyber Security": "cyber",
  "Computer Science": "cs",
  "Interactive Media": "im",
  "Computer Systems & Network Engineering": "csne",
  "Information Systems Engineering": "ise",
};

const SpecializationSelection = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = (spec, syllabus) => {
    const slug = slugMap[spec.name];
    navigate(`/calculator/${slug}/${syllabus}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] relative overflow-hidden">

      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #1E3A5F, transparent)', animationDuration: '4s' }}
        />
        <div
          className="absolute top-1/3 -right-24 w-80 h-80 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #2BB673, transparent)', animationDuration: '6s', animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full opacity-8 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #1F5F73, transparent)', animationDuration: '5s', animationDelay: '2s' }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        {/* ── Header ── */}
        <div
          className="text-center mb-12 sm:mb-16 transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(-24px)',
          }}
        >
          {/* Logo pill */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#1E3A5F]/10 rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#1E3A5F] to-[#1F5F73] flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">G</span>
            </div>
            <span className="text-xs font-semibold text-[#1C2A39] tracking-wide">GPA Suite</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1C2A39] tracking-tight mb-4 leading-[1.1]">
            What's your{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#1E3A5F] via-[#1F5F73] to-[#2BB673] bg-clip-text text-transparent">
                specialization?
              </span>
              <span
                className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-[#1E3A5F] via-[#1F5F73] to-[#2BB673]"
                style={{ opacity: 0.3 }}
              />
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#6B7280] max-w-xl mx-auto font-normal">
            Choose your degree program and syllabus to get started with your GPA calculator
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {[
              { value: '8', label: 'Programs' },
              { value: '2', label: 'syllabus' },
              { value: '100%', label: 'Accurate' },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center transition-all duration-500 ease-out"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(12px)',
                  transitionDelay: `${200 + i * 100}ms`,
                }}
              >
                <p className="text-xl sm:text-2xl font-bold text-[#1E3A5F]">{stat.value}</p>
                <p className="text-xs text-[#6B7280] font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {specializations.map((spec, index) => (
            <div
              key={spec.name}
              className={`group relative bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-400 ease-out ${spec.glowColor} ${spec.borderHover} hover:-translate-y-1.5`}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(32px)',
                transitionDelay: `${index * 60}ms`,
                transition: `opacity 0.5s ease-out ${index * 60}ms, transform 0.5s ease-out ${index * 60}ms, box-shadow 0.3s ease, border-color 0.3s ease, translate 0.3s ease`,
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Top gradient bar */}
              <div className={`h-1 w-full bg-gradient-to-r ${spec.accentColor} transition-all duration-300 group-hover:h-1.5`} />

              {/* Shimmer overlay on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)',
                }}
              />

              <div className="p-5">
                {/* Top row: emoji + badge */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: 'linear-gradient(135deg, #F7F9FB 0%, #eef2f7 100%)' }}
                  >
                    {spec.emoji}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${spec.badgeBg} ${spec.badgeText}`}>
                    {spec.abbr}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-[15px] font-semibold text-[#1C2A39] mb-1.5 leading-snug group-hover:text-[#1E3A5F] transition-colors duration-200">
                  {spec.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-[#6B7280] leading-relaxed mb-5 line-clamp-2">
                  {spec.description}
                </p>

                {/* Buttons */}
                <div className="flex gap-2">
                  {spec.name === "Computer Science" ? (
                    <button
                      onClick={() => handleSelect(spec, 'new')}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#1E3A5F] to-[#1F5F73] text-white hover:from-[#1F5F73] hover:to-[#2BB673] active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
                    >
                      Get Started
                      <svg className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSelect(spec, 'old')}
                        className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#F7F9FB] text-[#1C2A39] border border-gray-200 hover:bg-gray-100 hover:border-gray-300 active:scale-[0.98] transition-all duration-200"
                      >
                        Old
                      </button>
                      <button
                        onClick={() => handleSelect(spec, 'new')}
                        className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#1E3A5F] to-[#1F5F73] text-white hover:from-[#1F5F73] hover:to-[#2BB673] active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        New
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div
          className="text-center mt-10 transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transitionDelay: '600ms',
          }}
        >
          <p className="text-xs text-[#6B7280]">
            GPA Suite v1.0 · Built for SLIIT University Students
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpecializationSelection;