import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');

  :root {
    --bg: #0F1117;
    --surface: #161B26;
    --surface-2: #1C2333;
    --surface-hover: #1F2840;
    --border: rgba(255,255,255,0.07);
    --border-hover: rgba(255,255,255,0.13);
    --accent: #4A9EFF;
    --accent-dim: rgba(74,158,255,0.12);
    --green: #34D399;
    --green-dim: rgba(52,211,153,0.12);
    --amber: #FBBF24;
    --amber-dim: rgba(251,191,36,0.10);
    --red: #F87171;
    --red-dim: rgba(248,113,113,0.10);
    --text-1: #E8ECF4;
    --text-2: #8B93A8;
    --text-3: #505668;
    --radius: 10px;
    --radius-lg: 14px;
    --font: 'DM Sans', sans-serif;
    --mono: 'DM Mono', monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    font-family: var(--font);
    color: var(--text-1);
  }

  .vc-shell {
    display: flex;
    min-height: 100vh;
    font-family: var(--font);
    color: var(--text-1);
    background: var(--bg);
    font-size: 13.5px;
    line-height: 1.5;
  }

  /* SIDEBAR */
  .vc-sidebar {
    width: 220px;
    min-width: 220px;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 20px 0;
    gap: 4px;
    position: sticky;
    top: 0;
    height: 100vh;
  }

  .vc-logo-wrap {
    padding: 0 18px 20px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 8px;
  }

  .vc-logo {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .vc-logo-mark {
    width: 30px; height: 30px;
    background: var(--accent-dim);
    border: 1px solid rgba(74,158,255,0.25);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
  }

  .vc-logo-mark svg {
    width: 15px; height: 15px;
    stroke: var(--accent); fill: none; stroke-width: 1.8;
  }

  .vc-logo-name {
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 0.3px;
    color: var(--text-1);
  }

  .vc-logo-sub {
    font-size: 10px;
    color: var(--text-3);
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-top: 1px;
  }

  .vc-nav-section { padding: 4px 10px; }

  .vc-nav-label {
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--text-3);
    padding: 8px 8px 4px;
  }

  .vc-nav-item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-2);
    transition: all 0.15s;
    font-size: 13px;
    font-weight: 400;
    user-select: none;
  }

  .vc-nav-item:hover { background: var(--surface-hover); color: var(--text-1); }

  .vc-nav-item.active {
    background: var(--accent-dim);
    color: var(--accent);
    font-weight: 500;
  }

  .vc-badge {
    margin-left: auto;
    background: var(--accent-dim);
    color: var(--accent);
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 20px;
    font-family: var(--mono);
    font-weight: 400;
  }

  .vc-badge.green { background: var(--green-dim); color: var(--green); }
  .vc-badge.amber { background: var(--amber-dim); color: var(--amber); }

  .vc-sidebar-footer {
    margin-top: auto;
    padding: 16px 10px 0;
    border-top: 1px solid var(--border);
  }

  .vc-doctor-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
  }

  .vc-doctor-card:hover { background: var(--surface-hover); }

  .vc-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1E3A5F 0%, #2D5A9B 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 500; color: var(--accent);
    flex-shrink: 0;
    border: 1px solid rgba(74,158,255,0.2);
  }

  .vc-doctor-name { font-size: 12.5px; font-weight: 500; color: var(--text-1); }
  .vc-doctor-role { font-size: 11px; color: var(--text-3); }

  /* MAIN */
  .vc-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  .vc-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 28px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .vc-page-title { font-size: 15px; font-weight: 500; color: var(--text-1); }
  .vc-page-date { font-size: 12px; color: var(--text-3); margin-top: 2px; }

  .vc-topbar-right { display: flex; align-items: center; gap: 12px; }

  .vc-search {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 6px 12px;
    width: 200px;
    cursor: text;
  }

  .vc-search span { font-size: 12.5px; color: var(--text-3); }

  .vc-icon-btn {
    width: 34px; height: 34px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: var(--text-2);
    position: relative;
    transition: border-color 0.15s, color 0.15s;
  }

  .vc-icon-btn:hover { border-color: var(--border-hover); color: var(--text-1); }

  .vc-notif-dot {
    position: absolute; top: 6px; right: 6px;
    width: 6px; height: 6px;
    background: var(--red); border-radius: 50%;
    border: 1.5px solid var(--surface);
  }

  /* CONTENT */
  .vc-content {
    padding: 24px 28px;
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* STATS */
  .vc-stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }

  .vc-stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 16px 18px;
  }

  .vc-stat-top {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
  }

  .vc-stat-label { font-size: 11.5px; color: var(--text-3); letter-spacing: 0.3px; }

  .vc-stat-icon {
    width: 28px; height: 28px;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
  }

  .vc-stat-icon.blue { background: var(--accent-dim); color: var(--accent); }
  .vc-stat-icon.green { background: var(--green-dim); color: var(--green); }
  .vc-stat-icon.amber { background: var(--amber-dim); color: var(--amber); }

  .vc-stat-value {
    font-size: 26px; font-weight: 300;
    color: var(--text-1); letter-spacing: -0.5px; line-height: 1;
  }

  .vc-stat-unit { font-size: 13px; font-weight: 400; color: var(--text-3); margin-left: 2px; }

  .vc-stat-change { margin-top: 8px; font-size: 11px; color: var(--text-3); }
  .vc-up { color: var(--green); }
  .vc-down { color: var(--red); }
  .vc-warn { color: var(--amber); }

  /* WA BANNER */
  .vc-wa-banner {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .vc-wa-icon {
    width: 38px; height: 38px;
    background: rgba(37,211,102,0.1);
    border: 1px solid rgba(37,211,102,0.2);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .vc-wa-icon svg { width: 18px; height: 18px; }
  .vc-wa-title { font-size: 12.5px; font-weight: 500; color: var(--text-1); }
  .vc-wa-sub { font-size: 11.5px; color: var(--text-3); margin-top: 2px; }

  .vc-wa-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }

  .vc-pulse-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 0 3px var(--green-dim);
    flex-shrink: 0;
  }

  .vc-wa-stat { font-size: 12px; color: var(--text-3); }
  .vc-wa-stat strong { color: var(--green); font-weight: 500; }

  /* TWO COL */
  .vc-two-col {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 14px;
  }

  /* CARD */
  .vc-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .vc-card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border);
  }

  .vc-card-title { font-size: 13px; font-weight: 500; color: var(--text-1); }
  .vc-card-action { font-size: 11.5px; color: var(--accent); cursor: pointer; }

  /* TABLE */
  .vc-table-head {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1fr 1fr 80px;
    padding: 8px 18px;
    gap: 8px;
    border-bottom: 1px solid var(--border);
  }

  .vc-th {
    font-size: 11px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .vc-table-row {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1fr 1fr 80px;
    padding: 11px 18px;
    gap: 8px;
    border-bottom: 1px solid var(--border);
    align-items: center;
    cursor: pointer;
    transition: background 0.12s;
  }

  .vc-table-row:hover { background: var(--surface-hover); }
  .vc-table-row:last-child { border-bottom: none; }

  .vc-patient-cell { display: flex; align-items: center; gap: 10px; }

  .vc-mini-avatar {
    width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 500;
  }

  .ma-blue   { background: rgba(74,158,255,0.15);  color: var(--accent); }
  .ma-green  { background: rgba(52,211,153,0.15);  color: var(--green); }
  .ma-amber  { background: rgba(251,191,36,0.12);  color: var(--amber); }
  .ma-red    { background: rgba(248,113,113,0.12); color: var(--red); }
  .ma-purple { background: rgba(167,139,250,0.12); color: #A78BFA; }

  .vc-cell-main { font-size: 12.5px; color: var(--text-1); }
  .vc-cell-sub  { font-size: 11px;   color: var(--text-3); }
  .vc-cell-mono { font-size: 12px; font-family: var(--mono); color: var(--text-1); }

  .vc-status {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 20px; font-size: 11px;
  }

  .vc-status::before {
    content: ''; width: 5px; height: 5px;
    border-radius: 50%; background: currentColor;
  }

  .vc-status.confirmed { background: var(--green-dim); color: var(--green); }
  .vc-status.pending   { background: var(--amber-dim); color: var(--amber); }
  .vc-status.cancelled { background: var(--red-dim);   color: var(--red); }

  /* SCHEDULE */
  .vc-sched-label {
    padding: 12px 18px 6px;
    font-size: 11px; color: var(--text-3);
    letter-spacing: 0.5px; text-transform: uppercase;
  }

  .vc-appt-slot {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 18px;
    cursor: pointer;
    transition: background 0.12s;
  }

  .vc-appt-slot:hover { background: var(--surface-hover); }

  .vc-time {
    font-size: 11px; color: var(--text-3);
    font-family: var(--mono); width: 46px;
    flex-shrink: 0; text-align: right;
  }

  .vc-appt-bar { width: 3px; height: 36px; border-radius: 3px; flex-shrink: 0; }

  .vc-appt-name { font-size: 12.5px; color: var(--text-1); }
  .vc-appt-type { font-size: 11px; color: var(--text-3); margin-top: 1px; }
  .vc-appt-dur  { margin-left: auto; font-size: 10px; font-family: var(--mono); color: var(--text-3); }

  .vc-divider { height: 1px; background: var(--border); margin: 4px 0; }
`;

const NAV = [
  { icon: "layout-dashboard", label: "Overview",     badge: null,  badgeColor: "blue",  active: true  },
  { icon: "calendar",         label: "Appointments", badge: "12",  badgeColor: "blue",  active: false },
  { icon: "users",            label: "Patients",     badge: null,  badgeColor: null,    active: false },
  { icon: "message-circle",  label: "WhatsApp Bot",  badge: "Live",badgeColor: "green", active: false },
];

const NAV2 = [
  { icon: "file-text",  label: "Records",   badge: null, badgeColor: null  },
  { icon: "receipt",    label: "Billing",   badge: "3",  badgeColor: "amber" },
  { icon: "chart-bar",  label: "Analytics", badge: null, badgeColor: null  },
];

const STATS = [
  { label: "Today's Patients", value: "18",    unit: "today",  change: <>↑ 4 from yesterday</>,    iconClass: "blue",  icon: "users"          },
  { label: "Pending Confirm",  value: "5",     unit: "slots",  change: <span className="vc-warn">Needs action</span>, iconClass: "amber", icon: "clock" },
  { label: "Revenue Today",    value: "4,200", unit: "₹",      change: <>↑ 12% vs last week</>,     iconClass: "green", icon: "coin-rupee"    },
  { label: "Bot Messages",     value: "47",    unit: "msgs",   change: <>23 auto-resolved</>,        iconClass: "green", icon: "message-circle" },
];

const PATIENTS = [
  { init: "AK", color: "ma-blue",   name: "Anjali K.",  age: "F · 34", complaint: "Fever + Cough",      time: "09:00", status: "confirmed", via: "WhatsApp", viaColor: "var(--green)" },
  { init: "RM", color: "ma-amber",  name: "Ravi M.",    age: "M · 52", complaint: "BP Checkup",         time: "09:30", status: "confirmed", via: "WhatsApp", viaColor: "var(--green)" },
  { init: "SP", color: "ma-purple", name: "Sunita P.",  age: "F · 27", complaint: "Routine Visit",      time: "10:15", status: "pending",   via: "Walk-in",  viaColor: "var(--text-3)" },
  { init: "DK", color: "ma-green",  name: "Deepak K.",  age: "M · 41", complaint: "Diabetes Follow-up", time: "11:00", status: "confirmed", via: "WhatsApp", viaColor: "var(--green)" },
  { init: "NG", color: "ma-red",    name: "Nisha G.",   age: "F · 19", complaint: "Skin Rash",          time: "11:30", status: "cancelled", via: "Walk-in",  viaColor: "var(--text-3)" },
];

const SCHEDULE_MORNING = [
  { time: "9:00",  name: "Anjali K.",  type: "Fever + Cough",       dur: "30m",   color: "var(--accent)" },
  { time: "9:30",  name: "Ravi M.",    type: "BP Checkup",          dur: "20m",   color: "var(--amber)"  },
  { time: "10:15", name: "Sunita P.",  type: "Routine Visit",       dur: "15m",   color: "var(--text-3)" },
];

const SCHEDULE_LATE = [
  { time: "11:00", name: "Deepak K.", type: "Diabetes Follow-up",   dur: "30m",   color: "var(--green)" },
  { time: "11:30", name: "Nisha G.",  type: "Skin Rash",            dur: "Canc.", color: "var(--red)"   },
];

const SCHEDULE_AFTERNOON = [
  { time: "2:00", name: "Meena S.", type: "Thyroid Review",         dur: "25m",   color: "var(--accent)" },
];

function Icon({ name, size = 16, style }) {
  return <i className={`ti ti-${name}`} style={{ fontSize: size, ...style }} aria-hidden="true" />;
}

export default function VarcareDashboard() {
  const [activeNav, setActiveNav] = useState("Overview");
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <style>{styles}</style>
      <div className="vc-shell">

        {/* SIDEBAR */}
        <aside className="vc-sidebar">
          <div className="vc-logo-wrap">
            <div className="vc-logo">
              <div className="vc-logo-mark">
                <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M8 12h8M12 8v8"/></svg>
              </div>
              <div>
                <div className="vc-logo-name">Varcare</div>
                <div className="vc-logo-sub">Clinic OS</div>
              </div>
            </div>
          </div>

          <div className="vc-nav-section">
            <div className="vc-nav-label">Main</div>
            {NAV.map(n => (
              <div
                key={n.label}
                className={`vc-nav-item${activeNav === n.label ? " active" : ""}`}
                onClick={() => setActiveNav(n.label)}
              >
                <Icon name={n.icon} size={16} />
                {n.label}
                {n.badge && <span className={`vc-badge ${n.badgeColor || ""}`}>{n.badge}</span>}
              </div>
            ))}
          </div>

          <div className="vc-nav-section">
            <div className="vc-nav-label">Clinic</div>
            {NAV2.map(n => (
              <div
                key={n.label}
                className={`vc-nav-item${activeNav === n.label ? " active" : ""}`}
                onClick={() => setActiveNav(n.label)}
              >
                <Icon name={n.icon} size={16} />
                {n.label}
                {n.badge && <span className={`vc-badge ${n.badgeColor || ""}`}>{n.badge}</span>}
              </div>
            ))}
          </div>

          <div className="vc-nav-section">
            <div className="vc-nav-label">System</div>
            <div className="vc-nav-item"><Icon name="settings" size={16} /> Settings</div>
          </div>

          <div className="vc-sidebar-footer">
            <div className="vc-doctor-card">
              <div className="vc-avatar">DR</div>
              <div>
                <div className="vc-doctor-name">Dr. Ramesh</div>
                <div className="vc-doctor-role">General Physician</div>
              </div>
              <Icon name="chevron-right" size={14} style={{ color: "var(--text-3)", marginLeft: "auto" }} />
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="vc-main">
          <div className="vc-topbar">
            <div>
              <div className="vc-page-title">Good morning, Doctor</div>
              <div className="vc-page-date">{today}</div>
            </div>
            <div className="vc-topbar-right">
              <div className="vc-search">
                <Icon name="search" size={15} style={{ color: "var(--text-3)" }} />
                <span>Search patients...</span>
              </div>
              <div className="vc-icon-btn">
                <Icon name="bell" size={16} />
                <div className="vc-notif-dot" />
              </div>
              <div className="vc-icon-btn">
                <Icon name="help-circle" size={16} />
              </div>
            </div>
          </div>

          <div className="vc-content">

            {/* STATS */}
            <div className="vc-stats-row">
              {STATS.map(s => (
                <div className="vc-stat-card" key={s.label}>
                  <div className="vc-stat-top">
                    <div className="vc-stat-label">{s.label}</div>
                    <div className={`vc-stat-icon ${s.iconClass}`}>
                      <Icon name={s.icon} size={14} />
                    </div>
                  </div>
                  <div className="vc-stat-value">
                    {s.value}<span className="vc-stat-unit">{s.unit}</span>
                  </div>
                  <div className="vc-stat-change">{s.change}</div>
                </div>
              ))}
            </div>

            {/* WA BANNER */}
            <div className="vc-wa-banner">
              <div className="vc-wa-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" stroke="#25D366" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.5 9.5s0 3 3 4.5" stroke="#25D366" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="vc-wa-title">AI Receptionist Active</div>
                <div className="vc-wa-sub">Handling bookings, reminders & queries via WhatsApp</div>
              </div>
              <div className="vc-wa-right">
                <div className="vc-pulse-dot" />
                <div className="vc-wa-stat"><strong>100%</strong> uptime today</div>
              </div>
            </div>

            {/* TABLE + SCHEDULE */}
            <div className="vc-two-col">

              {/* PATIENTS TABLE */}
              <div className="vc-card">
                <div className="vc-card-header">
                  <div className="vc-card-title">Recent Patients</div>
                  <div className="vc-card-action">View all →</div>
                </div>
                <div className="vc-table-head">
                  {["Patient", "Complaint", "Time", "Status", "Via"].map(h => (
                    <div className="vc-th" key={h}>{h}</div>
                  ))}
                </div>
                {PATIENTS.map(p => (
                  <div className="vc-table-row" key={p.name}>
                    <div className="vc-patient-cell">
                      <div className={`vc-mini-avatar ${p.color}`}>{p.init}</div>
                      <div>
                        <div className="vc-cell-main">{p.name}</div>
                        <div className="vc-cell-sub">{p.age}</div>
                      </div>
                    </div>
                    <div className="vc-cell-main">{p.complaint}</div>
                    <div className="vc-cell-mono">{p.time}</div>
                    <div><span className={`vc-status ${p.status}`}>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span></div>
                    <div className="vc-cell-sub" style={{ color: p.viaColor }}>{p.via}</div>
                  </div>
                ))}
              </div>

              {/* SCHEDULE */}
              <div className="vc-card">
                <div className="vc-card-header">
                  <div className="vc-card-title">Today's Schedule</div>
                  <div className="vc-card-action">+ Add slot</div>
                </div>

                <div className="vc-sched-label">Morning</div>
                {SCHEDULE_MORNING.map(s => (
                  <div className="vc-appt-slot" key={s.time + s.name}>
                    <div className="vc-time">{s.time}</div>
                    <div className="vc-appt-bar" style={{ background: s.color }} />
                    <div>
                      <div className="vc-appt-name">{s.name}</div>
                      <div className="vc-appt-type">{s.type}</div>
                    </div>
                    <div className="vc-appt-dur">{s.dur}</div>
                  </div>
                ))}

                <div className="vc-divider" />
                <div className="vc-sched-label">Late Morning</div>
                {SCHEDULE_LATE.map(s => (
                  <div className="vc-appt-slot" key={s.time + s.name}>
                    <div className="vc-time">{s.time}</div>
                    <div className="vc-appt-bar" style={{ background: s.color }} />
                    <div>
                      <div className="vc-appt-name">{s.name}</div>
                      <div className="vc-appt-type">{s.type}</div>
                    </div>
                    <div className="vc-appt-dur">{s.dur}</div>
                  </div>
                ))}

                <div className="vc-divider" />
                <div className="vc-sched-label">Afternoon</div>
                {SCHEDULE_AFTERNOON.map(s => (
                  <div className="vc-appt-slot" key={s.time + s.name}>
                    <div className="vc-time">{s.time}</div>
                    <div className="vc-appt-bar" style={{ background: s.color }} />
                    <div>
                      <div className="vc-appt-name">{s.name}</div>
                      <div className="vc-appt-type">{s.type}</div>
                    </div>
                    <div className="vc-appt-dur">{s.dur}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}