// Habitrack — Friends screen (dark redesign)
// 480px mobile inside dark phone frame.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "jointState": "populated",
  "showActivityBadge": true,
  "accent": "purple"
}/*EDITMODE-END*/;

const COLORS = {
  bg:        "#0A0A0F",
  surface:   "#1A1A24",
  elevated:  "#252535",
  border:    "rgba(255,255,255,0.06)",
  text:      "rgba(255,255,255,0.95)",
  text2:     "#A1A1AA",
  text3:     "#71717A",
  purple:    "#8B5CF6",
  purple2:   "#6366F1",
  fire:      "#F97316",
  gold:      "#F59E0B",
  cyan:      "#06B6D4",
  emerald:   "#10B981",
  emerald2:  "#059669",
};

/* ─── Tinted rounded-2xl icon container (44px default) ─── */
function IconTile({ color = "purple", size = 44, radius = 14, children, style }) {
  const tints = {
    purple:  { bg: "rgba(139,92,246,0.16)", fg: COLORS.purple  },
    gold:    { bg: "rgba(245,158,11,0.16)", fg: COLORS.gold    },
    cyan:    { bg: "rgba(6,182,212,0.16)",  fg: COLORS.cyan    },
    emerald: { bg: "rgba(16,185,129,0.18)", fg: COLORS.emerald },
    fire:    { bg: "rgba(249,115,22,0.16)", fg: COLORS.fire    },
    white:   { bg: "rgba(255,255,255,0.15)",fg: "#fff"          },
  }[color] || { bg: "rgba(255,255,255,0.08)", fg: "#fff" };
  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: radius,
        background: tints.bg,
        color: tints.fg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        ...style,
      }}
    >{children}</div>
  );
}

/* ─── Status bar (iOS-style mock) ─── */
function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 text-white tab-num"
         style={{ height: 44, fontSize: 15, fontWeight: 600 }}>
      <div>9:41</div>
      <div className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.92)" }}>
        <IconSignal size={16} />
        <IconWifi size={15} />
        <IconBattery size={26} />
      </div>
    </div>
  );
}

/* ─── Mini App header (generic — bot title + menu/close) ─── */
function MiniAppHeader() {
  return (
    <div
      className="flex items-center justify-between px-4"
      style={{
        height: 48,
        background: "rgba(10,10,15,0.92)",
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="flex items-center justify-center"
          style={{
            width: 26, height: 26, borderRadius: 8,
            background: "linear-gradient(135deg,#8B5CF6,#6366F1)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06) inset",
          }}
        >
          <IconCheck size={15} style={{ color: "#fff" }} strokeWidth={3} />
        </div>
        <div className="min-w-0 leading-tight">
          <div className="truncate" style={{ fontSize: 14, fontWeight: 600 }}>Habitrack</div>
          <div className="truncate" style={{ fontSize: 11, color: COLORS.text3, marginTop: 1 }}>
            Отслеживание привычек
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1" style={{ color: COLORS.text2 }}>
        <button className="press flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 10 }}>
          <IconDots size={18} />
        </button>
        <button className="press flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 10 }}>
          <IconX size={18} />
        </button>
      </div>
    </div>
  );
}

/* ─── Page title row ─── */
function PageTitle() {
  return (
    <div className="flex items-end justify-between" style={{ paddingTop: 18, paddingBottom: 14 }}>
      <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.01em", margin: 0, lineHeight: 1.1 }}>
        Друзья
      </h1>
      <div style={{ fontSize: 12, color: COLORS.text3, marginBottom: 4 }}>2 друга</div>
    </div>
  );
}

/* ─── Invite hero card ─── */
function InviteHero({ onShare, onCopy, copied }) {
  return (
    <div
      className="relative hero-pattern fade-up"
      style={{
        background: "linear-gradient(135deg,#8B5CF6 0%, #6366F1 100%)",
        borderRadius: 20,
        padding: 20,
        boxShadow: "0 8px 24px -8px rgba(99,102,241,0.45), 0 0 0 1px rgba(255,255,255,0.06) inset",
        overflow: "hidden",
      }}
    >
      <div className="relative" style={{ zIndex: 1 }}>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center"
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: "rgba(255,255,255,0.16)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.18) inset",
              color: COLORS.gold,
            }}
          >
            <IconHeartHandshake size={22} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>
            Пригласить друга
          </div>
        </div>
        <p style={{
          fontSize: 13, color: "rgba(255,255,255,0.78)", marginTop: 10, marginBottom: 0,
          lineHeight: 1.45,
        }}>
          Поделись ссылкой — кто перейдёт, станет твоим другом.
        </p>
        <div className="flex items-center" style={{ marginTop: 14, gap: 8 }}>
          <button
            onClick={onShare}
            className="press flex-1 flex items-center justify-center gap-2"
            style={{
              height: 48, borderRadius: 14,
              background: "#fff", color: "#3F2D9F",
              fontSize: 15, fontWeight: 600,
              boxShadow: "0 4px 14px -6px rgba(0,0,0,0.35)",
            }}
          >
            <IconShare size={17} strokeWidth={2.4} />
            Поделиться
          </button>
          <button
            onClick={onCopy}
            className="press flex items-center justify-center"
            style={{
              width: 48, height: 48, borderRadius: 14,
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.16) inset",
            }}
            aria-label="Скопировать ссылку"
          >
            {copied ? <IconCheck size={19} strokeWidth={2.6} /> : <IconCopy size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Friend row ─── */
function FriendRow({ initial, color, name, handle, level, xp }) {
  return (
    <div
      className="press flex items-center"
      style={{
        background: COLORS.surface,
        borderRadius: 18,
        padding: "12px 14px",
        gap: 12,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset",
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 44, height: 44, borderRadius: 22,
          background: color === "purple"
            ? "linear-gradient(135deg,#8B5CF6,#6366F1)"
            : "linear-gradient(135deg,#10B981,#059669)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 17,
          letterSpacing: "-0.01em",
          boxShadow: color === "purple"
            ? "0 4px 12px -4px rgba(139,92,246,0.55)"
            : "0 4px 12px -4px rgba(16,185,129,0.5)",
        }}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5" style={{ fontSize: 15, fontWeight: 500, color: COLORS.text }}>
          <span className="truncate">{name}</span>
        </div>
        <div className="truncate" style={{ fontSize: 12, color: COLORS.text3, marginTop: 2 }}>
          {handle}
        </div>
      </div>
      <div className="flex flex-col items-end" style={{ gap: 4 }}>
        <div
          className="flex items-center gap-1"
          style={{
            fontSize: 12, fontWeight: 600,
            color: COLORS.gold,
            background: "rgba(245,158,11,0.12)",
            padding: "3px 8px", borderRadius: 999,
            boxShadow: "0 0 0 1px rgba(245,158,11,0.18) inset",
          }}
        >
          <IconStar size={11} strokeWidth={2.4} style={{ fill: "currentColor" }} />
          <span className="tab-num">{level}</span>
        </div>
        <div style={{ fontSize: 11, color: COLORS.text3 }} className="tab-num">{xp} XP</div>
      </div>
      <IconChevronRight size={16} style={{ color: COLORS.text3, marginLeft: 2 }} />
    </div>
  );
}

/* ─── Friends list section ─── */
function FriendsSection() {
  return (
    <section>
      <div className="flex items-end justify-between" style={{ marginBottom: 10 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, letterSpacing: "-0.005em" }}>
          Твои друзья
          <span style={{ color: COLORS.text3, fontWeight: 500, marginLeft: 6 }}>(2)</span>
        </h2>
      </div>
      <div className="flex flex-col" style={{ gap: 10 }}>
        <FriendRow initial="l" color="purple"  name="l"  handle="@saintmarinemanager" level={2} xp={150} />
        <FriendRow initial="d" color="emerald" name="di" handle="@kweksee"            level={1} xp={0}   />
      </div>
    </section>
  );
}

/* ─── Mini avatar (for stacks) ─── */
function MiniAvatar({ initial, color, ring = true }) {
  const grad = color === "purple"
    ? "linear-gradient(135deg,#8B5CF6,#6366F1)"
    : color === "emerald"
    ? "linear-gradient(135deg,#10B981,#059669)"
    : "linear-gradient(135deg,#F59E0B,#F97316)";
  return (
    <div
      className={ring ? "av-ring" : ""}
      style={{
        width: 22, height: 22, borderRadius: 11,
        background: grad,
        color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700,
      }}
    >{initial}</div>
  );
}

/* ─── Joint habit card (populated) ─── */
function JointHabitCard({ tone, icon, title, sub, you, friend, streak, status, statusTone }) {
  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: 18,
        padding: 14,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset",
      }}
    >
      <div className="flex items-start" style={{ gap: 12 }}>
        <IconTile color={tone} size={44} radius={14}>{icon}</IconTile>
        <div className="min-w-0 flex-1">
          <div style={{ fontSize: 15, fontWeight: 500, color: COLORS.text, letterSpacing: "-0.005em" }}>
            {title}
          </div>
          <div className="truncate" style={{ fontSize: 12, color: COLORS.text3, marginTop: 2 }}>
            {sub}
          </div>
        </div>
      </div>
      <div className="flex items-center" style={{ marginTop: 12, gap: 10 }}>
        <div className="flex items-center" style={{ marginLeft: -2 }}>
          <MiniAvatar initial={you.initial}    color={you.color} />
          <div style={{ marginLeft: -8 }}>
            <MiniAvatar initial={friend.initial} color={friend.color} />
          </div>
        </div>
        <div
          className="flex items-center gap-1 tab-num"
          style={{
            fontSize: 12, fontWeight: 600, color: COLORS.fire,
            background: "rgba(249,115,22,0.13)",
            padding: "3px 9px", borderRadius: 999,
            boxShadow: "0 0 0 1px rgba(249,115,22,0.2) inset",
          }}
        >
          🔥 <span>{streak}</span>
        </div>
        <div
          className="flex items-center gap-1.5 truncate"
          style={{
            fontSize: 11,
            color: statusTone === "emerald" ? COLORS.emerald : COLORS.gold,
            marginLeft: "auto",
            fontWeight: 500,
          }}
        >
          {statusTone === "emerald"
            ? <IconCheck size={13} strokeWidth={2.6} />
            : <IconBolt size={13} strokeWidth={2.4} style={{ fill: "currentColor" }} />}
          <span className="truncate">{status}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Joint habits empty card ─── */
function JointHabitsEmpty() {
  return (
    <div
      className="flex flex-col items-center text-center"
      style={{
        background: COLORS.surface,
        borderRadius: 20,
        padding: "26px 24px 24px",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset",
      }}
    >
      <IconTile color="purple" size={56} radius={18}>
        <IconUsersRound size={28} strokeWidth={2} />
      </IconTile>
      <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, marginTop: 14 }}>
        Пока пусто
      </div>
      <p style={{
        fontSize: 13, color: COLORS.text2, marginTop: 6, marginBottom: 0,
        lineHeight: 1.5, maxWidth: 320,
      }}>
        Создай совместную привычку и пригласи друга — стрик будет расти у вас обоих.
      </p>
      <button
        className="press flex items-center justify-center gap-2"
        style={{
          marginTop: 16,
          height: 42, padding: "0 18px",
          borderRadius: 999,
          background: "linear-gradient(135deg,#8B5CF6,#6366F1)",
          color: "#fff", fontSize: 14, fontWeight: 600,
          boxShadow: "0 6px 18px -6px rgba(139,92,246,0.6)",
        }}
      >
        <IconPlus size={16} strokeWidth={2.6} />
        Создать совместную привычку
      </button>
    </div>
  );
}

/* ─── Joint habits section ─── */
function JointHabitsSection({ state }) {
  return (
    <section>
      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, letterSpacing: "-0.005em" }}>
          Совместные привычки
        </h2>
        <button
          className="press flex items-center gap-1"
          style={{ color: COLORS.purple, fontSize: 13, fontWeight: 600 }}
        >
          Создать <IconPlus size={13} strokeWidth={2.8} />
        </button>
      </div>
      <div style={{ fontSize: 12, color: COLORS.text3, marginBottom: 12 }}>
        Делайте привычку вместе с друзьями
      </div>
      {state === "empty" ? (
        <JointHabitsEmpty />
      ) : (
        <div className="flex flex-col" style={{ gap: 10 }}>
          <JointHabitCard
            tone="emerald"
            icon={<IconDroplet size={22} strokeWidth={2} style={{ fill: "currentColor", color: COLORS.emerald }} />}
            title={<>Пить воду <span aria-hidden>💧</span></>}
            sub={<>С <span style={{ color: COLORS.text2 }}>@saintmarinemanager</span> · 7 дней вместе</>}
            you={{ initial: "S", color: "purple" }}
            friend={{ initial: "l", color: "purple" }}
            streak={7}
            status="оба отметили сегодня"
            statusTone="emerald"
          />
          <JointHabitCard
            tone="fire"
            icon={<IconRun size={22} strokeWidth={2} />}
            title={<>Бег по утрам <span aria-hidden>🏃</span></>}
            sub={<>С <span style={{ color: COLORS.text2 }}>@kweksee</span> · 3 дня вместе</>}
            you={{ initial: "S", color: "purple" }}
            friend={{ initial: "d", color: "emerald" }}
            streak={3}
            status="ты отметил, друг — нет"
            statusTone="gold"
          />
          {/* Create CTA at end of list */}
          <button
            className="press flex items-center justify-center gap-2"
            style={{
              borderRadius: 18,
              padding: "14px 16px",
              background: "transparent",
              color: COLORS.purple,
              fontSize: 14, fontWeight: 600,
              boxShadow: `0 0 0 1px rgba(139,92,246,0.35) inset`,
              border: "1px dashed transparent",
            }}
          >
            <IconPlus size={16} strokeWidth={2.6} />
            Создать совместную привычку
          </button>
        </div>
      )}
    </section>
  );
}

/* ─── Activity feed item ─── */
function FeedItem({ icon, tone, lines, time }) {
  return (
    <div
      className="flex items-start"
      style={{
        background: COLORS.surface,
        borderRadius: 18,
        padding: "12px 14px",
        gap: 12,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset",
      }}
    >
      <IconTile color={tone} size={36} radius={12}>{icon}</IconTile>
      <div className="min-w-0 flex-1" style={{ paddingTop: 1 }}>
        <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.4 }}>{lines}</div>
        <div style={{ fontSize: 11, color: COLORS.text3, marginTop: 3 }}>{time}</div>
      </div>
    </div>
  );
}

/* ─── Activity feed section ─── */
function ActivitySection() {
  const Bold = ({ children }) => <strong style={{ fontWeight: 600, color: COLORS.text }}>{children}</strong>;
  return (
    <section>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <div className="flex items-center gap-2">
          <div style={{ color: COLORS.cyan }}>
            <IconClipboardList size={17} strokeWidth={2} />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, letterSpacing: "-0.005em" }}>
            Лента активности
          </h2>
        </div>
        <span style={{ fontSize: 11, color: COLORS.text3 }}>сегодня</span>
      </div>
      <div className="flex flex-col" style={{ gap: 10 }}>
        <FeedItem
          tone="gold"
          icon={<IconMedal size={20} strokeWidth={2} />}
          lines={<><Bold>Saint</Bold> вышел на уровень <Bold>2</Bold> <span aria-hidden>🎖</span></>}
          time="22 ч назад"
        />
        <FeedItem
          tone="emerald"
          icon={<IconCheckCircle size={20} strokeWidth={2} />}
          lines={<><Bold>l</Bold> выполнил <Bold>Утреннюю зарядку</Bold></>}
          time={<>Сегодня · <span style={{ color: COLORS.fire }}>🔥 5 дней</span></>}
        />
        <FeedItem
          tone="fire"
          icon={<IconFlame size={20} strokeWidth={2} />}
          lines={<><Bold>di</Bold> начал стрик в <Bold>Чтении</Bold></>}
          time="Вчера"
        />
        <FeedItem
          tone="purple"
          icon={<IconSparkle size={20} strokeWidth={2} />}
          lines={<><Bold>Saint</Bold> и <Bold>l</Bold> сравняли уровни</>}
          time="2 дня назад"
        />
      </div>
    </section>
  );
}

/* ─── Bottom navigation ─── */
function BottomNav({ showBadge }) {
  const items = [
    { key: "home",     label: "Дом",      Icon: IconHome },
    { key: "habits",   label: "Привычки", Icon: IconTarget },
    { key: "stats",    label: "Стата",    Icon: IconBarChart },
    { key: "friends",  label: "Друзья",   Icon: IconUsers, active: true, badge: showBadge },
    { key: "profile",  label: "Профиль",  Icon: IconUserCircle },
  ];
  return (
    <div
      style={{
        background: "rgba(10,10,15,0.92)",
        borderTop: `1px solid ${COLORS.border}`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        paddingTop: 8, paddingBottom: 18,
      }}
    >
      <div className="flex items-stretch" style={{ paddingInline: 8 }}>
        {items.map(({ key, label, Icon: I, active, badge }) => (
          <button
            key={key}
            className="press flex-1 flex flex-col items-center justify-center"
            style={{ gap: 4, padding: "4px 0", position: "relative" }}
          >
            <div
              className="relative flex items-center justify-center"
              style={{
                width: 44, height: 28, borderRadius: 14,
                background: active ? "rgba(139,92,246,0.16)" : "transparent",
                color: active ? COLORS.purple : COLORS.text3,
                transition: "all .2s ease",
              }}
            >
              <I size={20} strokeWidth={active ? 2.2 : 1.8} />
              {badge && (
                <div
                  className="nav-dot"
                  style={{
                    position: "absolute", top: 1, right: 8,
                    width: 7, height: 7, borderRadius: 999,
                    background: COLORS.fire,
                    boxShadow: "0 0 0 2px #0A0A0F",
                  }}
                />
              )}
            </div>
            <div style={{
              fontSize: 10.5, fontWeight: active ? 600 : 500,
              color: active ? COLORS.purple : COLORS.text3,
              letterSpacing: "-0.005em",
            }}>{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── The screen ─── */
function FriendsScreen({ tweaks }) {
  const [copied, setCopied] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  function fireToast(text) {
    setToast(text);
    clearTimeout(fireToast._t);
    fireToast._t = setTimeout(() => setToast(null), 1800);
  }
  function onShare() { fireToast("Открываем поделиться…"); }
  function onCopy()  {
    setCopied(true);
    fireToast("Ссылка скопирована");
    clearTimeout(onCopy._t);
    onCopy._t = setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div
      data-screen-label="Друзья"
      className="relative flex flex-col"
      style={{
        width: 480, minHeight: 900,
        background: COLORS.bg,
        color: COLORS.text,
        overflow: "hidden",
        borderRadius: 44,
        boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7), 0 0 0 8px #0e0e14, 0 0 0 9px #1d1d28",
      }}
    >
      <StatusBar />
      <MiniAppHeader />
      <div
        className="flex-1 overflow-y-auto scroll-hide"
        style={{ paddingInline: 16, paddingBottom: 24 }}
      >
        <PageTitle />
        <div className="flex flex-col" style={{ gap: 22 }}>
          <InviteHero onShare={onShare} onCopy={onCopy} copied={copied} />
          <FriendsSection />
          <JointHabitsSection state={tweaks.jointState} />
          <ActivitySection />
        </div>
        <div
          className="text-center"
          style={{ fontSize: 11, color: COLORS.text3, marginTop: 22, paddingBottom: 6 }}
        >
          @my_hab1ts_tracker_bot
        </div>
      </div>
      <BottomNav showBadge={tweaks.showActivityBadge} />

      {/* Toast */}
      {toast && (
        <div
          className="absolute left-1/2"
          style={{
            transform: "translateX(-50%)",
            bottom: 110,
            background: "rgba(37,37,53,0.96)",
            color: "#fff",
            fontSize: 13, fontWeight: 500,
            padding: "10px 16px",
            borderRadius: 999,
            boxShadow: "0 12px 28px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08) inset",
            animation: "fadeUp .25s ease both",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

/* ─── App shell with stage + tweaks ─── */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  return (
    <div
      className="relative flex items-start justify-center stage-glow"
      style={{
        minHeight: "100vh",
        padding: "40px 24px 60px",
        background: "radial-gradient(120% 80% at 50% 0%, #15131f 0%, #050509 60%)",
      }}
    >
      <FriendsScreen tweaks={t} />

      <TweaksPanel>
        <TweakSection label="Состояние" />
        <TweakRadio
          label="Совм. привычки"
          value={t.jointState}
          options={[
            { value: "populated", label: "С данными" },
            { value: "empty",     label: "Пусто" },
          ]}
          onChange={(v) => setTweak("jointState", v)}
        />
        <TweakToggle
          label="Точка на ленте"
          value={t.showActivityBadge}
          onChange={(v) => setTweak("showActivityBadge", v)}
        />
      </TweaksPanel>
    </div>
  );
}

Object.assign(window, { App, FriendsScreen });
