// Habits list screen — HabitHero
const { useState } = React;

// ─── Color tokens ─────────────────────────────────────────────
const C = {
  bg: '#0A0A0F',
  surface: '#1A1A24',
  elevated: '#252535',
  text: 'rgba(255,255,255,0.95)',
  sec: '#A1A1AA',
  ter: '#71717A',
  purple: '#8B5CF6',
  purple2: '#6366F1',
};

// Per-category accent tones. tint = ~14% bg, glyph = saturated stroke.
const TONES = {
  orange:  { glyph: '#FB923C', tint: 'rgba(251,146,60,0.14)' },
  cyan:    { glyph: '#22D3EE', tint: 'rgba(34,211,238,0.14)' },
  amber:   { glyph: '#F59E0B', tint: 'rgba(245,158,11,0.14)' },
  violet:  { glyph: '#A78BFA', tint: 'rgba(167,139,250,0.16)' },
  teal:    { glyph: '#2DD4BF', tint: 'rgba(45,212,191,0.14)' },
  emerald: { glyph: '#34D399', tint: 'rgba(52,211,153,0.14)' },
  pink:    { glyph: '#F472B6', tint: 'rgba(244,114,182,0.14)' },
  indigo:  { glyph: '#818CF8', tint: 'rgba(129,140,248,0.16)' },
};

// ─── Habit data ───────────────────────────────────────────────
// week array: 1 = done, 0 = missed, -1 = upcoming/not-applicable (e.g. weekends)
const HABITS = [
  { id: 1, name: 'Утренняя зарядка',  meta: 'Каждый день · бинарная', icon: 'dumbbell',  tone: 'orange',  streak: 47, week: [1,1,0,1,1,0,1] },
  { id: 2, name: 'Вода',              meta: '8 стаканов в день',       icon: 'droplet',   tone: 'cyan',    streak: 9,  week: [1,1,1,1,1,1,1] },
  { id: 3, name: 'Читать',            meta: '30 страниц в день',       icon: 'book',      tone: 'amber',   streak: 12, week: [1,1,1,0,1,1,1] },
  { id: 4, name: 'Медитация',         meta: 'По будням · бинарная',    icon: 'lotus',     tone: 'violet',  streak: 7,  week: [1,1,0,1,1,1,-1] }, // Sun upcoming/N-A
  { id: 5, name: 'Бег',               meta: '3 раза в неделю · 5 км',  icon: 'run',       tone: 'teal',    streak: 4,  week: [1,0,1,0,1,0,0] },
  { id: 6, name: 'Здоровое питание',  meta: 'Каждый день',             icon: 'leaf',      tone: 'emerald', streak: 21, week: [1,1,1,1,1,1,1] },
  { id: 7, name: 'Учить английский',  meta: 'Каждый день · 20 мин',    icon: 'languages', tone: 'pink',    streak: 0,  week: [0,0,1,0,0,1,0] },
  { id: 8, name: 'Сон до 23:00',      meta: 'Каждый день',             icon: 'moon',      tone: 'indigo',  streak: 3,  week: [1,0,1,1,0,1,0] },
];

// ─── Status bar ───────────────────────────────────────────────
function StatusBar() {
  return (
    <div style={{
      height: 50, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 28px 0 30px',
      color: '#fff', fontSize: 16, fontWeight: 600,
      letterSpacing: '-0.2px', position: 'relative', zIndex: 10,
    }}>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {/* signal */}
        <svg width="17" height="11" viewBox="0 0 17 11"><g fill="#fff">
          <rect x="0" y="7" width="3" height="4" rx="0.6"/>
          <rect x="4.5" y="4.5" width="3" height="6.5" rx="0.6"/>
          <rect x="9" y="2" width="3" height="9" rx="0.6"/>
          <rect x="13.5" y="0" width="3" height="11" rx="0.6"/>
        </g></svg>
        {/* wifi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="#fff">
          <path d="M7.5 2.5C9.6 2.5 11.5 3.3 13 4.7L14 3.6C12.3 2 10 1 7.5 1S2.7 2 1 3.6l1 1.1C3.5 3.3 5.4 2.5 7.5 2.5z"/>
          <path d="M7.5 5.7C8.8 5.7 9.9 6.2 10.7 7L11.7 6C10.6 4.9 9.1 4.2 7.5 4.2S4.4 4.9 3.3 6l1 1c.8-.8 1.9-1.3 3.2-1.3z"/>
          <circle cx="7.5" cy="9.3" r="1.3"/>
        </svg>
        {/* battery */}
        <svg width="26" height="12" viewBox="0 0 26 12">
          <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" fill="none" stroke="#fff" strokeOpacity="0.4"/>
          <rect x="2" y="2" width="19" height="8" rx="1.5" fill="#fff"/>
          <rect x="23.5" y="4" width="1.5" height="4" rx="0.5" fill="#fff" fillOpacity="0.5"/>
        </svg>
      </div>
    </div>
  );
}

// ─── 7-day indicator ──────────────────────────────────────────
function WeekDots({ week }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
      {week.map((d, i) => {
        const isDone = d === 1;
        const isMissed = d === 0;
        const isNA = d === -1;
        return (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: 3,
            background: isDone
              ? '#22C55E'
              : isMissed
              ? 'rgba(255,255,255,0.07)'
              : 'rgba(255,255,255,0.04)',
            border: isNA ? '1px dashed rgba(255,255,255,0.08)' : 'none',
            boxSizing: 'border-box',
          }} />
        );
      })}
    </div>
  );
}

// ─── Habit card ───────────────────────────────────────────────
function HabitCard({ h, pressed, onPress, onRelease }) {
  const tone = TONES[h.tone];
  const Icon = window.Icons[h.icon];
  return (
    <div
      onPointerDown={onPress}
      onPointerUp={onRelease}
      onPointerLeave={onRelease}
      style={{
        background: C.surface,
        borderRadius: 18,
        padding: 14,
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform 120ms ease',
        cursor: 'pointer',
        userSelect: 'none',
      }}>
      {/* icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: tone.tint,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: tone.glyph,
        flexShrink: 0,
      }}>{Icon}</div>

      {/* middle */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 16, fontWeight: 600, color: C.text,
          letterSpacing: '-0.2px', lineHeight: '20px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{h.name}</div>
        <div style={{
          fontSize: 12, color: C.sec, marginTop: 2, lineHeight: '16px',
          letterSpacing: '-0.1px',
        }}>{h.meta}</div>
        <WeekDots week={h.week} />
      </div>

      {/* right column */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        gap: 8, flexShrink: 0, alignSelf: 'stretch', justifyContent: 'center',
      }}>
        {h.streak > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '3px 8px 3px 6px',
            borderRadius: 999,
            background: 'rgba(251,146,60,0.14)',
            color: '#FB923C',
            fontSize: 12, fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}>
            <span style={{ display: 'inline-flex' }}>{window.Icons.flame}</span>
            {h.streak}
          </div>
        )}
        <div style={{ color: C.ter, display: 'flex', alignItems: 'center' }}>
          {window.Icons.chevron}
        </div>
      </div>
    </div>
  );
}

// ─── Filter chips ─────────────────────────────────────────────
function FilterChip({ label, count, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 14px',
      borderRadius: 999,
      background: active ? C.elevated : 'transparent',
      border: active ? 'none' : '1px solid rgba(255,255,255,0.06)',
      color: active ? '#fff' : C.sec,
      fontSize: 13, fontWeight: 500,
      letterSpacing: '-0.1px',
      cursor: 'pointer',
      fontFamily: 'inherit',
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
    }}>
      {label}
      <span style={{
        color: active ? C.sec : C.ter,
        fontWeight: 500,
      }}>{count}</span>
    </button>
  );
}

// ─── Bottom nav ───────────────────────────────────────────────
function NavItem({ icon, label, active }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 4, position: 'relative',
      color: active ? '#fff' : C.ter,
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex' }}>{icon}</div>
      <div style={{
        fontSize: 10.5, fontWeight: 500, letterSpacing: '-0.1px',
      }}>{label}</div>
      {active && (
        <div style={{
          position: 'absolute', top: -10,
          width: 4, height: 4, borderRadius: '50%',
          background: C.purple,
          boxShadow: `0 0 8px ${C.purple}`,
        }} />
      )}
    </div>
  );
}

function BottomNav() {
  const I = window.Icons;
  return (
    <div style={{
      height: 64,
      background: 'rgba(15,15,22,0.78)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      flexShrink: 0,
    }}>
      <NavItem icon={I.home}  label="Дом" />
      <NavItem icon={I.list}  label="Привычки" active />
      <NavItem icon={I.stats} label="Стата" />
      <NavItem icon={I.users} label="Друзья" />
      <NavItem icon={I.user}  label="Профиль" />
    </div>
  );
}

// ─── Create button ────────────────────────────────────────────
function CreateButton() {
  const [pressed, setPressed] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      {/* soft purple glow */}
      <div style={{
        position: 'absolute', inset: -4,
        borderRadius: 999,
        background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.45), transparent 70%)',
        filter: 'blur(8px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <button
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        style={{
          position: 'relative', zIndex: 1,
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '8px 14px 8px 12px',
          borderRadius: 999,
          background: `linear-gradient(135deg, ${C.purple} 0%, ${C.purple2} 100%)`,
          color: '#fff',
          fontSize: 13, fontWeight: 600,
          letterSpacing: '-0.1px',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          lineHeight: 1,
          boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset, 0 -1px 0 rgba(0,0,0,0.2) inset',
          transform: pressed ? 'scale(0.96)' : 'scale(1)',
          transition: 'transform 120ms ease',
        }}>
        <span style={{ display: 'inline-flex' }}>{window.Icons.plus}</span>
        Создать
      </button>
    </div>
  );
}

// ─── Screen ───────────────────────────────────────────────────
function HabitsScreen() {
  const [filter, setFilter] = useState('all');
  const [pressedId, setPressedId] = useState(null);

  const filtered = filter === 'all'
    ? HABITS
    : filter === 'today'
    ? HABITS.filter(h => h.meta.includes('Каждый день') || h.meta.includes('будням')).slice(0, 5)
    : HABITS.slice(0, 2);

  return (
    <div style={{
      width: 480,
      height: 940,
      background: C.bg,
      borderRadius: 44,
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 10px #111118, 0 0 0 11px #2a2a35',
      fontFamily: '-apple-system, "SF Pro Text", "SF Pro Display", system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      color: C.text,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <StatusBar />

      {/* scrollable content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '8px 0 12px',
      }}>
        {/* header */}
        <div style={{
          padding: '8px 16px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h1 style={{
            margin: 0, fontSize: 26, fontWeight: 600,
            letterSpacing: '-0.4px', lineHeight: '32px',
          }}>Привычки</h1>
          <CreateButton />
        </div>

        {/* filter tabs */}
        <div style={{
          marginTop: 24,
          padding: '0 16px',
          display: 'flex', gap: 8,
        }}>
          <FilterChip label="Все"     count={8} active={filter === 'all'}    onClick={() => setFilter('all')} />
          <FilterChip label="Сегодня" count={5} active={filter === 'today'}  onClick={() => setFilter('today')} />
          <FilterChip label="Архив"   count={2} active={filter === 'archive'}onClick={() => setFilter('archive')} />
        </div>

        {/* list */}
        <div style={{
          marginTop: 16,
          padding: '0 16px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {filtered.map(h => (
            <HabitCard
              key={h.id}
              h={h}
              pressed={pressedId === h.id}
              onPress={() => setPressedId(h.id)}
              onRelease={() => setPressedId(null)}
            />
          ))}
        </div>

        <div style={{ height: 16 }} />
      </div>

      <BottomNav />

      {/* home indicator */}
      <div style={{
        position: 'absolute', bottom: 6, left: '50%',
        transform: 'translateX(-50%)',
        width: 134, height: 5, borderRadius: 3,
        background: 'rgba(255,255,255,0.4)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

window.HabitsScreen = HabitsScreen;
