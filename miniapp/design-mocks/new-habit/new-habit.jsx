// NewHabitScreen.jsx — HabitHero "Новая привычка"

const { useState, useRef, useEffect } = React;

// ────────────────────────────────────────────────────────────
// Tokens
// ────────────────────────────────────────────────────────────
const T = {
  bg: '#0A0A0F',
  surface: '#1A1A24',
  surfaceHi: '#252535',
  surfaceDim: '#15151E',
  primary: '#8B5CF6',
  primary2: '#6366F1',
  textPri: 'rgba(255,255,255,0.95)',
  textSec: '#A1A1AA',
  textTer: '#71717A',
  border: 'rgba(255,255,255,0.08)',
  borderHi: 'rgba(255,255,255,0.14)',
  dot: '#2A2A38',
};

// helper: hex to rgba with given alpha (works on #RRGGBB)
const tint = (hex, a) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

// ────────────────────────────────────────────────────────────
// Icon catalog
// ────────────────────────────────────────────────────────────
const ICONS = [
  { id: 'dumbbell', label: 'Спорт',     glyph: 'dumbbell', color: '#F97316' },
  { id: 'droplet',  label: 'Вода',      glyph: 'droplet',  color: '#06B6D4' },
  { id: 'book',     label: 'Чтение',    glyph: 'book',     color: '#F59E0B' },
  { id: 'lotus',    label: 'Медитация', glyph: 'lotus',    color: '#A855F7' },
  { id: 'runner',   label: 'Бег',       glyph: 'runner',   color: '#14B8A6' },
  { id: 'brain',    label: 'Учёба',     glyph: 'brain',    color: '#EC4899' },
  { id: 'pencil',   label: 'Письмо',    glyph: 'pencil',   color: '#EAB308' },
  { id: 'note',     label: 'Музыка',    glyph: 'note',     color: '#8B5CF6' },
  { id: 'apple',    label: 'Здоровье',  glyph: 'apple',    color: '#10B981' },
  { id: 'moon',     label: 'Сон',       glyph: 'moon',     color: '#6366F1' },
  { id: 'sun',      label: 'Утро',      glyph: 'sun',      color: '#F97316' },
  { id: 'heart',    label: 'Любовь',    glyph: 'heart',    color: '#F43F5E' },
];

// ────────────────────────────────────────────────────────────
// Small primitives
// ────────────────────────────────────────────────────────────
function SectionLabel({ children, mt = 24 }) {
  return (
    <div style={{
      marginTop: mt, marginBottom: 10, paddingLeft: 4,
      color: T.textSec, fontSize: 11.5, fontWeight: 600,
      letterSpacing: '0.08em', textTransform: 'uppercase',
    }}>{children}</div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{
      marginBottom: 8, color: T.textPri, fontSize: 17, fontWeight: 600,
      letterSpacing: '-0.01em',
    }}>{children}</div>
  );
}

// Flat 2D tinted icon tile
function IconTile({ item, selected, onClick }) {
  const G = window.Glyphs[item.glyph];
  return (
    <button onClick={onClick}
      style={{
        position: 'relative',
        width: '100%', aspectRatio: '1',
        borderRadius: 16,
        background: tint(item.color, 0.14),
        border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0,
        transition: 'transform 140ms cubic-bezier(.2,.7,.3,1.2)',
        transform: selected ? 'scale(1.04)' : 'scale(1)',
        outline: 'none',
      }}>
      <G size={26} color={item.color} sw={1.9} />
      {selected && (
        <span style={{
          position: 'absolute', inset: -3, borderRadius: 19,
          border: `2px solid ${T.primary}`,
          boxShadow: `0 0 0 3px ${tint('#8B5CF6', 0.18)}`,
          pointerEvents: 'none',
        }} />
      )}
    </button>
  );
}

function CustomTile({ onClick }) {
  return (
    <button onClick={onClick}
      style={{
        width: '100%', aspectRatio: '1', borderRadius: 16,
        background: 'transparent',
        border: `1.5px dashed ${T.borderHi}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 2, cursor: 'pointer',
        color: T.textSec,
      }}>
      <window.Glyphs.plus size={18} color={T.textSec} />
      <span style={{ fontSize: 10.5, color: T.textTer, fontWeight: 500 }}>Свой</span>
    </button>
  );
}

// Habit type card
function TypeCard({ active, title, desc, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        position: 'relative', width: '100%',
        textAlign: 'left',
        background: active
          ? `linear-gradient(135deg, ${tint(T.primary, 0.10)}, ${tint(T.primary2, 0.06)}), ${T.surface}`
          : T.surface,
        border: 'none', padding: 0, cursor: 'pointer',
        borderRadius: 18,
      }}>
      {/* gradient border for active */}
      <span style={{
        position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
        padding: 1.25,
        background: active
          ? `linear-gradient(135deg, ${T.primary}, ${T.primary2})`
          : T.border,
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor', maskComposite: 'exclude',
      }} />
      <div style={{
        position: 'relative',
        padding: '14px 16px',
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        {/* radio dot */}
        <div style={{
          width: 22, height: 22, borderRadius: 999, marginTop: 1,
          background: active
            ? `linear-gradient(135deg, ${T.primary}, ${T.primary2})`
            : 'transparent',
          border: active ? 'none' : `1.5px solid ${T.borderHi}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: active ? `0 4px 12px ${tint(T.primary, 0.35)}` : 'none',
          flexShrink: 0,
        }}>
          {active && <window.Glyphs.check size={14} color="#fff" />}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            color: T.textPri, fontSize: 15, fontWeight: 600,
            letterSpacing: '-0.01em', marginBottom: 2,
          }}>{title}</div>
          <div style={{ color: T.textSec, fontSize: 13, lineHeight: 1.4 }}>{desc}</div>
        </div>
      </div>
    </button>
  );
}

// Schedule chip
function Chip({ active, children, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        whiteSpace: 'nowrap',
        padding: '10px 14px', borderRadius: 999,
        border: active ? 'none' : `1px solid ${T.border}`,
        background: active
          ? `linear-gradient(135deg, ${T.primary}, ${T.primary2})`
          : T.surface,
        color: active ? '#fff' : T.textPri,
        fontSize: 13.5, fontWeight: active ? 600 : 500,
        letterSpacing: '-0.005em',
        boxShadow: active ? `0 6px 18px ${tint(T.primary, 0.3)}` : 'none',
        cursor: 'pointer',
        flexShrink: 0,
      }}>{children}</button>
  );
}

// Toggle switch
function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)}
      style={{
        width: 46, height: 28, borderRadius: 999,
        background: on
          ? `linear-gradient(135deg, ${T.primary}, ${T.primary2})`
          : '#2A2A38',
        border: 'none', position: 'relative', cursor: 'pointer',
        padding: 0,
        boxShadow: on ? `0 4px 14px ${tint(T.primary, 0.4)}` : 'inset 0 0 0 1px rgba(255,255,255,0.04)',
        transition: 'background 180ms',
      }}>
      <span style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 22, height: 22, borderRadius: 999,
        background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(0,0,0,0.06)',
        transition: 'left 200ms cubic-bezier(.3,.7,.3,1.2)',
      }} />
    </button>
  );
}

// Progress dots — 4, first filled
function ProgressDots({ step = 0, total = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '6px 0 4px' }}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} style={{
          width: i === step ? 18 : 6, height: 6, borderRadius: 999,
          background: i === step ? T.primary : T.dot,
          transition: 'width 200ms ease',
        }} />
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Header
// ────────────────────────────────────────────────────────────
function MiniAppHeader({ onBack }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '4px 8px 6px',
      height: 44,
    }}>
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: T.primary, fontSize: 15, padding: '8px 10px',
        marginLeft: -4, letterSpacing: '-0.01em',
      }}>
        <window.Glyphs.back size={20} color={T.primary} />
        <span style={{ fontWeight: 500 }}>Назад</span>
      </button>
      <div style={{
        position: 'absolute', left: 0, right: 0, textAlign: 'center',
        color: T.textPri, fontSize: 17, fontWeight: 600,
        letterSpacing: '-0.01em', pointerEvents: 'none',
      }}>Новая привычка</div>
      <div style={{ flex: 1 }} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────────────────────
function NewHabitScreen() {
  const [name, setName] = useState('');
  const [iconId, setIconId] = useState('book'); // 3rd one selected (index 2)
  const [type, setType] = useState('binary');
  const [schedule, setSchedule] = useState('daily');
  const [desc, setDesc] = useState('');
  const [reminder, setReminder] = useState(false);
  const [created, setCreated] = useState(false);

  const MAX_NAME = 64;
  const isValid = name.trim().length > 0;
  const scrollRef = useRef(null);

  const onCreate = () => {
    if (!isValid) return;
    setCreated(true);
    setTimeout(() => setCreated(false), 1800);
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: T.bg,
      color: T.textPri,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif',
      fontFeatureSettings: '"tnum" 1, "cv11" 1, "ss01" 1',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header band sits below status bar — pad top for it */}
      <div style={{ position: 'relative', paddingTop: 44 }}>
        <MiniAppHeader onBack={() => {}} />
        <ProgressDots step={0} total={4} />
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto',
        padding: '8px 20px 140px',
        WebkitOverflowScrolling: 'touch',
      }}>
        {/* ─── Название ─── */}
        <SectionLabel mt={16}>Название</SectionLabel>
        <div style={{
          position: 'relative',
          background: T.surface,
          borderRadius: 16,
          border: `1px solid ${T.border}`,
          padding: '14px 16px',
        }}>
          <input
            value={name}
            maxLength={MAX_NAME}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например, Утренняя зарядка"
            style={{
              width: '100%', background: 'transparent', border: 'none',
              outline: 'none', color: T.textPri, fontSize: 15,
              fontFamily: 'inherit', padding: 0,
              letterSpacing: '-0.01em',
            }}
          />
          <div style={{
            position: 'absolute', right: 14, bottom: 6,
            fontSize: 10.5, color: T.textTer, opacity: 0.5,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.02em',
          }}>{name.length} / {MAX_NAME}</div>
        </div>

        {/* ─── Иконка ─── */}
        <SectionLabel>Выбери иконку</SectionLabel>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 10,
        }}>
          {ICONS.map((it) => (
            <IconTile key={it.id} item={it}
              selected={iconId === it.id}
              onClick={() => setIconId(it.id)} />
          ))}
          <CustomTile onClick={() => {}} />
        </div>

        {/* ─── Тип привычки ─── */}
        <SectionLabel>Как считать выполнение</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <TypeCard
            active={type === 'binary'}
            title="Бинарная"
            desc="Выполнил / не выполнил"
            onClick={() => setType('binary')}
          />
          <TypeCard
            active={type === 'quant'}
            title="Количественная"
            desc="С целью (например, 8 стаканов воды)"
            onClick={() => setType('quant')}
          />
        </div>

        {/* ─── Расписание ─── */}
        <SectionLabel>Когда выполнять</SectionLabel>
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto',
          margin: '0 -20px', padding: '2px 20px 6px',
          scrollbarWidth: 'none',
        }}
        className="no-scrollbar">
          <Chip active={schedule === 'daily'} onClick={() => setSchedule('daily')}>Каждый день</Chip>
          <Chip active={schedule === 'weekdays'} onClick={() => setSchedule('weekdays')}>По дням недели</Chip>
          <Chip active={schedule === 'xweek'} onClick={() => setSchedule('xweek')}>X раз в неделю</Chip>
          <Chip active={schedule === 'every'} onClick={() => setSchedule('every')}>Каждые N дней</Chip>
        </div>

        {/* ─── Описание ─── */}
        <SectionLabel>Описание (необязательно)</SectionLabel>
        <div style={{
          background: T.surface,
          borderRadius: 16,
          border: `1px solid ${T.border}`,
          padding: '14px 16px',
        }}>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Зачем эта привычка? Опционально"
            rows={3}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              outline: 'none', color: T.textPri, fontSize: 15,
              fontFamily: 'inherit', padding: 0, resize: 'none',
              lineHeight: 1.45,
              letterSpacing: '-0.01em',
            }}
          />
        </div>

        {/* ─── Напоминание ─── */}
        <div style={{ height: 24 }} />
        <div style={{
          background: T.surface,
          borderRadius: 16,
          border: `1px solid ${T.border}`,
          padding: '14px 16px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 11,
                background: tint(T.primary, 0.14),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <window.Glyphs.bell size={18} color={T.primary} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: T.textPri, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
                  Напоминание
                </div>
              </div>
            </div>
            <Toggle on={reminder} onChange={setReminder} />
          </div>
          <div style={{
            color: T.textTer, fontSize: 12.5, lineHeight: 1.4,
            marginTop: 10, paddingLeft: 48,
          }}>
            Бот пришлёт тебе сообщение в нужное время
          </div>
          {reminder && (
            <div style={{
              marginTop: 12, paddingTop: 12,
              borderTop: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingLeft: 48,
            }}>
              <span style={{ color: T.textSec, fontSize: 13.5 }}>Время</span>
              <span style={{
                color: T.textPri, fontSize: 14, fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                background: T.surfaceHi, padding: '6px 12px', borderRadius: 999,
              }}>09:00</span>
            </div>
          )}
        </div>

        <div style={{ height: 8 }} />
      </div>

      {/* ─── Sticky bottom button ─── */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '16px 20px 34px',
        background: `linear-gradient(to top, ${T.bg} 60%, ${tint('#0A0A0F', 0)})`,
        pointerEvents: 'none',
      }}>
        <button
          onClick={onCreate}
          disabled={!isValid}
          style={{
            pointerEvents: 'auto',
            width: '100%', padding: '15px 18px',
            borderRadius: 999, border: 'none',
            background: isValid
              ? `linear-gradient(135deg, ${T.primary}, ${T.primary2})`
              : '#2A2A38',
            color: isValid ? '#fff' : T.textTer,
            fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em',
            fontFamily: 'inherit',
            cursor: isValid ? 'pointer' : 'not-allowed',
            boxShadow: isValid
              ? `0 10px 28px ${tint(T.primary, 0.45)}, 0 2px 0 rgba(255,255,255,0.08) inset`
              : 'none',
            transition: 'transform 120ms, box-shadow 200ms',
          }}
          onMouseDown={(e) => isValid && (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {created ? '✓ Привычка создана' : 'Создать привычку'}
        </button>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        ::-webkit-scrollbar { width: 0; height: 0; }
        input::placeholder, textarea::placeholder {
          color: ${T.textTer};
          opacity: 1;
        }
        ::selection { background: ${tint(T.primary, 0.4)}; }
      `}</style>
    </div>
  );
}

window.NewHabitScreen = NewHabitScreen;
