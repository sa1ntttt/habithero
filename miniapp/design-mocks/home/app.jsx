// HabitHero — Dashboard

const { useState, useMemo, useEffect } = React;

// ─── Tokens ───────────────────────────────────────────────────
const C = {
  bg: '#0A0A0F',
  surface: '#1A1A24',
  surfaceHi: '#252535',
  border: 'rgba(255,255,255,0.08)',
  borderHi: 'rgba(255,255,255,0.14)',
  text: 'rgba(255,255,255,0.95)',
  text2: '#A1A1AA',
  text3: '#71717A',
  brand: '#8B5CF6',
  brand2: '#6366F1',
};

// ─── Initial habit state ──────────────────────────────────────
const INITIAL_HABITS = [
  { id: 'gym',  name: 'Утренняя зарядка', meta: '15 мин',           xp: 50, tone: 'fitness',    Icon: IconDumbbell, done: true,  streak: 23 },
  { id: 'h2o',  name: 'Вода',             meta: 'стаканов',         xp: 5,  tone: 'water',      Icon: IconDroplet,  quantity: { current: 5, target: 8 }, streak: 9 },
  { id: 'read', name: 'Читать',           meta: '30 страниц',       xp: 40, tone: 'reading',    Icon: IconBook,     done: false, streak: 12 },
  { id: 'med',  name: 'Медитация',        meta: '10 мин',           xp: 30, tone: 'meditation', Icon: IconLotus,    done: false, streak: 7  },
  { id: 'run',  name: 'Бег',              meta: '5 км',             xp: 80, tone: 'running',    Icon: IconRunner,   done: true,  streak: 31 },
];

// ─── Small bits ───────────────────────────────────────────────
function Bar({ pct, gradient = 'linear-gradient(90deg, #A78BFA, #6366F1)', height = 6, track = 'rgba(255,255,255,0.10)' }) {
  return (
    <div style={{ width: '100%', height, background: track, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{
        width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%',
        background: gradient, borderRadius: 999,
        transition: 'width 600ms cubic-bezier(.2,.8,.2,1)',
      }} />
    </div>
  );
}

function FireChip({ n }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '1px 7px 1px 5px', borderRadius: 999,
      background: 'rgba(251,146,60,0.10)',
      border: '1px solid rgba(251,146,60,0.18)',
      fontSize: 10.5, fontWeight: 600, color: '#FDBA74',
      letterSpacing: '-0.01em',
    }}>
      <svg width="9" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 3.5c.8 2.4 3.5 3.8 3.5 7.5a3.5 3.5 0 0 1-7 0c0-1.2.5-2 1.2-2.5 0 1.3.5 1.8 1 1.8-.2-1.8-.8-3 1.3-6.8Z" stroke="#FB923C" strokeWidth="2" strokeLinejoin="round" /></svg>
      {n}
    </span>
  );
}

function CardSurface({ children, style = {}, glow }) {
  return (
    <div style={{
      background: C.surface,
      borderRadius: 16,
      border: `1px solid ${C.border}`,
      boxShadow: glow
        ? `0 1px 0 rgba(255,255,255,0.06) inset, 0 10px 30px -10px ${glow}`
        : '0 1px 0 rgba(255,255,255,0.06) inset, 0 4px 12px rgba(0,0,0,0.3)',
      ...style,
    }}>{children}</div>
  );
}

// ─── Telegram-style mini-app header (generic) ─────────────────
function MiniAppHeader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 16px 10px', height: 44,
      borderBottom: `1px solid ${C.border}`,
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      <button style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 0, padding: 0, color: '#A78BFA', fontSize: 15, fontWeight: 400, cursor: 'pointer' }}>
        <ChevLeft />
        <span style={{ marginLeft: -2 }}>Чаты</span>
      </button>
      <div style={{ textAlign: 'center', lineHeight: 1.1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.text, letterSpacing: '-0.01em' }}>HabitHero</div>
        <div style={{ fontSize: 11, color: C.text3, marginTop: 1 }}>мини-приложение</div>
      </div>
      <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 0, padding: 0, color: C.text2, fontSize: 15, cursor: 'pointer' }}>
        <span>Закрыть</span>
      </button>
    </div>
  );
}

// ─── Hero level card ──────────────────────────────────────────
function HeroCard({ level, xp, xpNext, title }) {
  const remaining = xpNext - xp;
  const pct = Math.round((xp / xpNext) * 100);

  return (
    <div style={{ position: 'relative', marginTop: 4 }}>
      {/* soft glow */}
      <div style={{
        position: 'absolute', inset: '12px 14px -10px',
        background: 'radial-gradient(60% 80% at 50% 50%, rgba(139,92,246,0.32), rgba(139,92,246,0) 70%)',
        filter: 'blur(22px)', borderRadius: 24, zIndex: 0, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'relative', zIndex: 1,
        borderRadius: 20, padding: '18px 18px 16px',
        background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.14) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 18px 36px -16px rgba(99,102,241,0.40)',
        border: '1px solid rgba(255,255,255,0.12)',
        overflow: 'hidden',
      }}>
        {/* subtle pattern */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.18, mixBlendMode: 'overlay' }} width="100%" height="100%">
          <defs>
            <radialGradient id="hero-spot" cx="20%" cy="10%" r="60%">
              <stop offset="0%" stopColor="white" stopOpacity="0.7" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-spot)" />
        </svg>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Level medallion */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.55), rgba(255,255,255,0.05) 60%), linear-gradient(160deg, #C4B5FD, #6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset, 0 -2px 4px rgba(0,0,0,0.2) inset, 0 6px 14px rgba(99,102,241,0.4)',
            border: '1px solid rgba(255,255,255,0.35)', flexShrink: 0,
          }}>
            <span style={{
              fontSize: 28, fontWeight: 800, color: 'white',
              fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}>{level}</span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>Уровень {level}</div>
            <div style={{
              fontSize: 19, fontWeight: 700, color: 'white',
              letterSpacing: '-0.02em', marginTop: 2,
            }}>{title}</div>
            <div style={{
              fontSize: 12.5, color: 'rgba(255,255,255,0.78)',
              fontVariantNumeric: 'tabular-nums', marginTop: 4,
            }}>
              <span style={{ fontWeight: 600, color: 'white' }}>{xp.toLocaleString('ru-RU')} XP</span>
              <span style={{ opacity: 0.65 }}> / до {xpNext.toLocaleString('ru-RU')} XP</span>
            </div>
          </div>
        </div>

        {/* progress */}
        <div style={{ position: 'relative', marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Bar
              pct={pct}
              gradient="linear-gradient(90deg, #FFFFFF, rgba(255,255,255,0.85))"
              track="rgba(255,255,255,0.22)"
              height={6}
            />
          </div>
          <div style={{
            fontSize: 11.5, fontWeight: 600, color: 'white',
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
          }}>+{remaining} XP</div>
        </div>
      </div>
    </div>
  );
}

// ─── Stats row ────────────────────────────────────────────────
function StatCard({ Icon, value, suffix, label }) {
  return (
    <CardSurface style={{ flex: 1, padding: '12px 10px 12px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={36} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {value}<span style={{ fontSize: 11, color: C.text2, fontWeight: 500, marginLeft: 2 }}>{suffix}</span>
          </div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4, fontWeight: 500 }}>{label}</div>
        </div>
      </div>
    </CardSurface>
  );
}

function StatsRow({ streak, active, awards }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <StatCard Icon={IconFire}   value={streak}     suffix="дн."  label="Серия" />
      <StatCard Icon={IconBars}   value={active}     suffix="актив." label="Привычки" />
      <StatCard Icon={IconTrophy} value={`${awards[0]}/${awards[1]}`} label="Награды" />
    </div>
  );
}

// ─── Today progress ───────────────────────────────────────────
function TodayProgress({ done, total }) {
  const pct = Math.round((done / total) * 100);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Сегодня</div>
        <div style={{ fontSize: 12, color: C.text2, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ color: C.text, fontWeight: 700 }}>{done}</span>
          <span style={{ opacity: 0.6 }}> / {total} выполнено</span>
        </div>
      </div>
      <Bar pct={pct} height={4} />
    </div>
  );
}

// ─── Habit cards ──────────────────────────────────────────────
function CheckCircle({ done, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={done ? 'Сделано' : 'Отметить выполненным'}
      style={{
        width: 32, height: 32, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: done ? '0' : '1.6px solid rgba(255,255,255,0.18)',
        background: done
          ? '#10B981'
          : 'transparent',
        boxShadow: done
          ? '0 2px 6px -1px rgba(16,185,129,0.35)'
          : 'none',
        cursor: 'pointer', flexShrink: 0,
        transition: 'all 200ms ease',
      }}
    >
      {done && <GlyphCheck s={18} />}
    </button>
  );
}

function PlusButton({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label="Добавить"
      style={{
        width: 32, height: 32, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '0',
        background: disabled
          ? 'rgba(255,255,255,0.06)'
          : '#3B82F6',
        boxShadow: disabled
          ? 'none'
          : '0 2px 6px -1px rgba(59,130,246,0.40)',
        cursor: disabled ? 'default' : 'pointer', flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
        transition: 'all 150ms ease',
      }}
    >
      <GlyphPlus s={16} />
    </button>
  );
}

function HabitCard({ habit, onToggle, onIncrement }) {
  const { Icon, name, meta, xp, tone, done, streak, quantity } = habit;
  const isQuantity = !!quantity;
  const qFull = isQuantity && quantity.current >= quantity.target;
  const cardDone = done || qFull;
  const showStreak = streak >= 5 && !cardDone;

  return (
    <CardSurface
      style={{
        padding: '12px 12px 12px 12px',
        background: cardDone
          ? 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(5,150,105,0.02)), #1A1A24'
          : C.surface,
        borderColor: cardDone ? 'rgba(16,185,129,0.16)' : C.border,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icon size={44} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 15, fontWeight: 600, color: C.text,
              letterSpacing: '-0.015em',
              textDecoration: cardDone && !isQuantity ? 'none' : 'none',
            }}>{name}</span>
            {showStreak && <FireChip n={streak} />}
          </div>

          {isQuantity ? (
            <div style={{ marginTop: 5 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontSize: 12, color: C.text2, fontVariantNumeric: 'tabular-nums' }}>
                <span style={{ color: C.text, fontWeight: 600 }}>{quantity.current}/{quantity.target}</span>
                <span style={{ opacity: 0.8 }}>{meta}</span>
                <span style={{ marginLeft: 'auto', color: C.text3, fontSize: 11 }}>+{xp} XP за стакан</span>
              </div>
              <div style={{ marginTop: 6 }}>
                <Bar
                  pct={(quantity.current / quantity.target) * 100}
                  gradient="linear-gradient(90deg, #60A5FA, #3B82F6)"
                  height={4}
                />
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: C.text2, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
              {meta} <span style={{ color: C.text3 }}>·</span> <span style={{ color: cardDone ? '#34D399' : C.text2, fontWeight: cardDone ? 600 : 400 }}>+{xp} XP</span>
            </div>
          )}
        </div>

        {isQuantity ? (
          qFull
            ? <CheckCircle done={true} />
            : <PlusButton onClick={() => onIncrement(habit.id)} />
        ) : (
          <CheckCircle done={cardDone} onClick={() => onToggle(habit.id)} />
        )}
      </div>
    </CardSurface>
  );
}

// ─── Bottom nav ───────────────────────────────────────────────
function NavItem({ Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, background: 'none', border: 0, padding: '8px 0 6px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        cursor: 'pointer', position: 'relative',
      }}
    >
      <Icon active={active} />
      <span style={{
        fontSize: 10.5, fontWeight: 500,
        color: active ? '#A78BFA' : C.text3,
        letterSpacing: '-0.01em',
      }}>{label}</span>
      {active && (
        <span style={{
          position: 'absolute', bottom: -2,
          width: 4, height: 4, borderRadius: '50%',
          background: '#A78BFA',
          boxShadow: '0 0 8px #A78BFA',
        }} />
      )}
    </button>
  );
}

function BottomNav({ tab, setTab }) {
  return (
    <div style={{
      position: 'sticky', bottom: 0, left: 0, right: 0,
      marginTop: 'auto',
      background: 'rgba(10,10,15,0.78)',
      backdropFilter: 'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      borderTop: `1px solid ${C.border}`,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{ display: 'flex', padding: '0 4px' }}>
        <NavItem Icon={NavHome}    label="Дом"      active={tab === 'home'}     onClick={() => setTab('home')} />
        <NavItem Icon={NavHabits}  label="Привычки" active={tab === 'habits'}   onClick={() => setTab('habits')} />
        <NavItem Icon={NavStats}   label="Стата"    active={tab === 'stats'}    onClick={() => setTab('stats')} />
        <NavItem Icon={NavFriends} label="Друзья"   active={tab === 'friends'}  onClick={() => setTab('friends')} />
        <NavItem Icon={NavProfile} label="Профиль"  active={tab === 'profile'}  onClick={() => setTab('profile')} />
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────
function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
      <div style={{ fontSize: 17, fontWeight: 600, color: C.text, letterSpacing: '-0.02em' }}>{title}</div>
      {action && (
        <button style={{
          background: 'none', border: 0, padding: 0,
          color: '#A78BFA', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 2,
        }}>{action} <span style={{ marginLeft: 2 }}>→</span></button>
      )}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────
function Dashboard() {
  const [habits, setHabits] = useState(INITIAL_HABITS);
  const [xp, setXp] = useState(2840);
  const [tab, setTab] = useState('home');
  const [flash, setFlash] = useState(null); // {id, xp}

  const xpNext = 3500;
  const level = 12;

  // computed
  const completedCount = habits.filter(h => h.done || (h.quantity && h.quantity.current >= h.quantity.target)).length;
  const totalCount = habits.length;
  const longestStreak = Math.max(...habits.map(h => h.streak || 0));

  const toggle = (id) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const next = !h.done;
      setXp(curr => Math.max(0, Math.min(xpNext, curr + (next ? h.xp : -h.xp))));
      if (next) {
        setFlash({ id, xp: h.xp });
        setTimeout(() => setFlash(null), 1100);
      }
      return { ...h, done: next };
    }));
  };

  const increment = (id) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id || !h.quantity) return h;
      if (h.quantity.current >= h.quantity.target) return h;
      setXp(curr => Math.max(0, Math.min(xpNext, curr + h.xp)));
      setFlash({ id, xp: h.xp });
      setTimeout(() => setFlash(null), 900);
      return { ...h, quantity: { ...h.quantity, current: h.quantity.current + 1 } };
    }));
  };

  return (
    <div data-screen-label="Dashboard" style={{
      background: C.bg, color: C.text, minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, Roboto, sans-serif',
      position: 'relative',
    }}>
      {/* subtle bg */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(60% 30% at 50% 0%, rgba(139,92,246,0.06), transparent 70%)',
      }} />

      <MiniAppHeader />

      <div style={{
        flex: 1, padding: '12px 16px 80px',
        display: 'flex', flexDirection: 'column', gap: 14,
        position: 'relative', zIndex: 1,
      }}>
        <HeroCard level={level} xp={xp} xpNext={xpNext} title="Дисциплинированный" />

        <StatsRow streak={longestStreak} active={totalCount} awards={[14, 42]} />

        <TodayProgress done={completedCount} total={totalCount} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SectionHeader title="Привычки сегодня" action="Все" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {habits.map(h => (
              <div key={h.id} style={{ position: 'relative' }}>
                <HabitCard habit={h} onToggle={toggle} onIncrement={increment} />
                {flash && flash.id === h.id && (
                  <div style={{
                    position: 'absolute', right: 56, top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 12.5, fontWeight: 600, color: '#34D399',
                    fontVariantNumeric: 'tabular-nums',
                    pointerEvents: 'none',
                    animation: 'xpFloat 1100ms cubic-bezier(.2,.7,.2,1) forwards',
                    textShadow: '0 2px 8px rgba(16,185,129,0.4)',
                  }}>+{flash.xp} XP</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav tab={tab} setTab={setTab} />

      <style>{`
        @keyframes xpFloat {
          0%   { opacity: 0; transform: translateY(-30%) scale(0.8); }
          25%  { opacity: 1; transform: translateY(-60%) scale(1.05); }
          100% { opacity: 0; transform: translateY(-180%) scale(1); }
        }
      `}</style>
    </div>
  );
}

Object.assign(window, { Dashboard });
