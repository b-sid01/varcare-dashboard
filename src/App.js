import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://asueiylnppjxlpbmzxmz.supabase.co',
  'yoursb_publishable_URPMSXfHCT9qbM_IZXx8kg_gg9XWSsK'
);

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
    --accent-border: rgba(74,158,255,0.25);
    --green: #34D399;
    --green-dim: rgba(52,211,153,0.12);
    --green-border: rgba(52,211,153,0.25);
    --amber: #FBBF24;
    --amber-dim: rgba(251,191,36,0.10);
    --amber-border: rgba(251,191,36,0.25);
    --red: #F87171;
    --red-dim: rgba(248,113,113,0.10);
    --red-border: rgba(248,113,113,0.25);
    --text-1: #E8ECF4;
    --text-2: #8B93A8;
    --text-3: #505668;
    --radius: 10px;
    --radius-lg: 14px;
    --font: 'DM Sans', sans-serif;
    --mono: 'DM Mono', monospace;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); font-family: var(--font); color: var(--text-1); }

  .vc-app { max-width: 480px; margin: 0 auto; min-height: 100vh; background: var(--bg); font-family: var(--font); padding-bottom: 80px; }

  /* LOGIN */
  .vc-login { max-width: 480px; margin: 0 auto; min-height: 100vh; background: var(--bg); font-family: var(--font); display: flex; flex-direction: column; justify-content: center; padding: 0 28px; }
  .vc-login-logo { font-size: 40px; font-weight: 300; color: var(--text-1); letter-spacing: -2px; line-height: 1; }
  .vc-login-sub { font-size: 13px; color: var(--text-3); margin-top: 6px; }
  .vc-login-form { margin-top: 48px; display: flex; flex-direction: column; gap: 16px; }
  .vc-field-label { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: var(--text-3); margin-bottom: 6px; }
  .vc-input { width: 100%; padding: 13px 16px; border-radius: var(--radius-lg); border: 1px solid var(--border); font-size: 14px; font-family: var(--font); color: var(--text-1); background: var(--surface); outline: none; transition: border-color 0.15s; }
  .vc-input:focus { border-color: var(--accent-border); }
  .vc-input::placeholder { color: var(--text-3); }
  .vc-btn-primary { width: 100%; padding: 14px; background: var(--accent); color: #fff; border: none; border-radius: var(--radius-lg); font-size: 14px; font-weight: 500; font-family: var(--font); cursor: pointer; margin-top: 8px; transition: opacity 0.15s; }
  .vc-btn-primary:hover { opacity: 0.9; }
  .vc-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .vc-error { background: var(--red-dim); color: var(--red); border: 1px solid var(--red-border); border-radius: var(--radius); padding: 12px 16px; font-size: 13px; }

  /* HEADER */
  .vc-header { background: var(--surface); padding: 52px 20px 20px; border-bottom: 1px solid var(--border); }
  .vc-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
  .vc-brand { font-size: 28px; font-weight: 300; color: var(--text-1); letter-spacing: -1px; }
  .vc-greeting { font-size: 12px; color: var(--text-3); margin-top: 4px; }
  .vc-signout { background: var(--surface-2); border: 1px solid var(--border); color: var(--text-2); padding: 7px 14px; border-radius: 99px; font-size: 12px; font-family: var(--font); cursor: pointer; }

  /* STAT CARDS */
  .vc-stat-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .vc-stat { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px; }
  .vc-stat-val { font-size: 26px; font-weight: 300; letter-spacing: -1px; color: var(--text-1); }
  .vc-stat-lbl { font-size: 11px; color: var(--text-3); margin-top: 4px; }

  /* CONTENT */
  .vc-content { padding: 16px; }

  /* SECTION LABEL */
  .vc-section { font-size: 10px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; color: var(--text-3); margin: 16px 0 8px; }

  /* CARDS */
  .vc-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px 16px; margin-bottom: 10px; }
  .vc-card:hover { background: var(--surface-hover); }
  .vc-card-row { display: flex; justify-content: space-between; align-items: center; }

  /* PATIENT NAME */
  .vc-patient-name { font-size: 15px; font-weight: 500; color: var(--text-1); }
  .vc-patient-age { font-size: 13px; font-weight: 400; color: var(--text-3); }
  .vc-patient-sub { font-size: 12px; color: var(--text-3); margin-top: 3px; }

  /* NEXT PATIENT CARD */
  .vc-next-card { background: var(--accent-dim); border: 1px solid var(--accent-border); border-radius: var(--radius-lg); padding: 18px; margin-bottom: 10px; }
  .vc-next-name { font-size: 22px; font-weight: 300; color: var(--text-1); }
  .vc-next-time { font-size: 13px; color: var(--text-2); margin-top: 4px; margin-bottom: 16px; }
  .vc-btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .vc-btn-accept { padding: 11px; background: var(--green-dim); color: var(--green); border: 1px solid var(--green-border); border-radius: var(--radius); font-size: 13px; font-weight: 500; font-family: var(--font); cursor: pointer; }
  .vc-btn-reject { padding: 11px; background: var(--red-dim); color: var(--red); border: 1px solid var(--red-border); border-radius: var(--radius); font-size: 13px; font-weight: 500; font-family: var(--font); cursor: pointer; }
  .vc-confirmed-badge { background: var(--green-dim); color: var(--green); border: 1px solid var(--green-border); border-radius: var(--radius); padding: 10px; text-align: center; font-size: 13px; font-weight: 500; }

  /* PENDING ALERT */
  .vc-pending-alert { background: var(--amber-dim); border: 1px solid var(--amber-border); border-radius: var(--radius); padding: 12px 16px; margin-bottom: 14px; display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--amber); }
  .vc-pending-dot { width: 7px; height: 7px; background: var(--amber); border-radius: 50%; flex-shrink: 0; }

  /* STATUS PILL */
  .vc-pill { border-radius: 99px; padding: 4px 12px; font-size: 11px; font-weight: 500; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; }
  .vc-pill::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
  .pill-confirmed { background: var(--green-dim); color: var(--green); }
  .pill-pending { background: var(--amber-dim); color: var(--amber); }
  .pill-rejected { background: var(--red-dim); color: var(--red); }
  .pill-cancelled { background: rgba(255,255,255,0.06); color: var(--text-3); }

  /* VISIT COUNT BADGE */
  .vc-visit-badge { background: var(--accent-dim); border: 1px solid var(--accent-border); border-radius: var(--radius); padding: 10px 14px; text-align: center; min-width: 52px; }
  .vc-visit-num { font-size: 20px; font-weight: 300; color: var(--accent); }
  .vc-visit-lbl { font-size: 10px; color: var(--text-3); margin-top: 2px; }

  /* FAB */
  .vc-fab { position: fixed; bottom: 88px; right: calc(50% - 228px); background: var(--accent); border: none; border-radius: 99px; width: 52px; height: 52px; font-size: 26px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 24px rgba(74,158,255,0.3); z-index: 40; }

  /* BOTTOM NAV */
  .vc-bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; background: var(--surface); border-top: 1px solid var(--border); display: flex; z-index: 50; padding-bottom: 6px; }
  .vc-nav-btn { flex: 1; padding: 10px 0 4px; border: none; background: transparent; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--text-3); font-family: var(--font); transition: color 0.15s; }
  .vc-nav-btn.active { color: var(--accent); }
  .vc-nav-label { font-size: 10px; font-weight: 400; }
  .vc-nav-btn.active .vc-nav-label { font-weight: 500; }

  /* MODAL */
  .vc-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 100; display: flex; align-items: flex-end; justify-content: center; }
  .vc-modal { background: var(--surface); border-radius: 20px 20px 0 0; padding: 24px 24px 48px; width: 100%; max-width: 480px; border: 1px solid var(--border); border-bottom: none; }
  .vc-modal-handle { width: 36px; height: 3px; background: var(--border-hover); border-radius: 99px; margin: 0 auto 20px; }
  .vc-modal-title { font-size: 18px; font-weight: 500; color: var(--text-1); margin-bottom: 4px; }
  .vc-modal-sub { font-size: 12px; color: var(--text-3); margin-bottom: 20px; }
  .vc-modal-field { margin-bottom: 14px; }
  .vc-modal-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 24px; }
  .vc-btn-cancel { padding: 13px; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius); font-size: 13px; font-weight: 500; font-family: var(--font); cursor: pointer; color: var(--text-2); }

  /* BACK HEADER */
  .vc-back-header { background: var(--surface); padding: 52px 20px 20px; border-bottom: 1px solid var(--border); }
  .vc-back-btn { background: var(--surface-2); border: 1px solid var(--border); color: var(--text-2); padding: 7px 14px; border-radius: 99px; font-size: 12px; font-family: var(--font); cursor: pointer; margin-bottom: 16px; }
  .vc-detail-name { font-size: 24px; font-weight: 300; color: var(--text-1); }
  .vc-detail-sub { font-size: 12px; color: var(--text-3); margin-top: 3px; }

  /* PRESCRIPTION */
  .vc-med-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px 16px; margin-bottom: 10px; transition: border-color 0.15s; }
  .vc-med-card.selected { border-color: var(--accent-border); background: var(--accent-dim); }
  .vc-med-name { font-size: 14px; font-weight: 500; color: var(--text-1); }
  .vc-med-dose { font-size: 12px; font-weight: 400; color: var(--text-3); }
  .vc-med-unit { font-size: 11px; color: var(--text-3); margin-top: 3px; }
  .vc-med-row { display: flex; justify-content: space-between; align-items: center; }
  .vc-btn-add { background: var(--surface-2); color: var(--text-2); border: 1px solid var(--border); border-radius: 99px; padding: 6px 16px; font-size: 12px; font-weight: 500; font-family: var(--font); cursor: pointer; }
  .vc-btn-add.added { background: var(--accent-dim); color: var(--accent); border-color: var(--accent-border); }
  .vc-med-selects { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
  .vc-select-label { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: var(--text-3); margin-bottom: 6px; }
  .vc-select { width: 100%; padding: 9px 10px; border-radius: var(--radius); border: 1px solid var(--border); font-size: 12px; font-family: var(--font); color: var(--text-1); background: var(--surface-2); outline: none; }
  .vc-selected-summary { background: var(--accent-dim); border: 1px solid var(--accent-border); border-radius: var(--radius-lg); padding: 14px 16px; margin-bottom: 14px; }
  .vc-selected-line { font-size: 13px; color: var(--text-2); padding: 5px 0; border-bottom: 1px solid var(--border); line-height: 1.6; }
  .vc-selected-line:last-child { border-bottom: none; }
  .vc-textarea { width: 100%; padding: 12px 16px; border-radius: var(--radius-lg); border: 1px solid var(--border); font-size: 13px; font-family: var(--font); color: var(--text-1); background: var(--surface); outline: none; min-height: 80px; resize: none; }
  .vc-textarea::placeholder { color: var(--text-3); }

  /* PRESCRIPTION HISTORY */
  .vc-rx-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px 16px; margin-bottom: 10px; }
  .vc-rx-date { font-size: 11px; font-weight: 500; color: var(--accent); letter-spacing: 0.5px; margin-bottom: 10px; }
  .vc-rx-line { font-size: 13px; color: var(--text-2); padding: 4px 0; border-bottom: 1px solid var(--border); line-height: 1.6; }
  .vc-rx-line:last-child { border-bottom: none; }
  .vc-rx-notes { font-size: 12px; color: var(--text-3); font-style: italic; margin-top: 8px; }

  /* MORE TAB */
  .vc-stats-list { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 16px; }
  .vc-stats-row-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--border); }
  .vc-stats-row-item:last-child { border-bottom: none; }
  .vc-stats-item-label { font-size: 13px; color: var(--text-2); }
  .vc-stats-item-val { font-size: 18px; font-weight: 300; color: var(--text-1); }
  .vc-btn-signout { width: 100%; padding: 14px; background: var(--red-dim); color: var(--red); border: 1px solid var(--red-border); border-radius: var(--radius-lg); font-size: 13px; font-weight: 500; font-family: var(--font); cursor: pointer; }

  /* EMPTY */
  .vc-empty { text-align: center; padding: 40px 20px; border: 1px dashed var(--border); border-radius: var(--radius-lg); margin-bottom: 14px; }
  .vc-empty-text { font-size: 14px; color: var(--text-3); }
  .vc-empty-sub { font-size: 12px; color: var(--text-3); opacity: 0.6; margin-top: 4px; }

  /* PAGE TITLE */
  .vc-page-title { font-size: 26px; font-weight: 300; color: var(--text-1); letter-spacing: -0.5px; }
  .vc-page-sub { font-size: 12px; color: var(--text-3); margin-top: 4px; }
`;

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState('today');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [allPrescriptions, setAllPrescriptions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showPrescription, setShowPrescription] = useState(false);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInAge, setWalkInAge] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [notes, setNotes] = useState('');
  const [frequency, setFrequency] = useState({});
  const [duration, setDuration] = useState({});
  const [searchMed, setSearchMed] = useState('');
  const [searchPatient, setSearchPatient] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchAppointments();
      fetchPatients();
      fetchMedicines();
      fetchAllPrescriptions();
    }
  }, [session]);

  async function fetchAppointments() {
    const { data } = await supabase.from('Appointments').select('*').order('appointment_date', { ascending: true }).order('created_at', { ascending: true });
    setAppointments(data || []);
  }
  async function fetchPatients() {
    const { data } = await supabase.from('patients').select('*').order('last_visit', { ascending: false });
    setPatients(data || []);
  }
  async function fetchMedicines() {
    const { data } = await supabase.from('medicines').select('*').order('name');
    setMedicines(data || []);
  }
  async function fetchAllPrescriptions() {
    const { data } = await supabase.from('prescriptions').select('*').order('created_at', { ascending: false });
    setAllPrescriptions(data || []);
  }
  async function fetchPrescriptions(patientId) {
    const { data } = await supabase.from('prescriptions').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
    setPrescriptions(data || []);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError('Incorrect email or password.');
    setLoginLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function updateStatus(id, status, apt) {
    await supabase.from('Appointments').update({ status }).eq('id', id);
    if (status === 'accepted') {
      try {
        await fetch('https://varcare.onrender.com/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: apt.phone, name: apt.name, time: apt.time, doctorName: 'Dr. Sharma' })
        });
      } catch (e) { console.error(e); }
      const { data: existing } = await supabase.from('patients').select('*').eq('phone', apt.phone).single();
      if (existing) {
        await supabase.from('patients').update({ last_visit: new Date().toISOString(), visit_count: (existing.visit_count || 0) + 1 }).eq('phone', apt.phone);
      } else {
        await supabase.from('patients').insert([{ name: apt.name, phone: apt.phone, age: apt.age, last_visit: new Date().toISOString(), visit_count: 1 }]);
      }
    }
    fetchAppointments();
    fetchPatients();
  }

  async function addWalkIn() {
    if (!walkInName.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    await supabase.from('Appointments').insert([{
      name: walkInName, phone: 'walkin', time: `Today ${now}`,
      appointment_date: today, age: walkInAge || null, consent: true, status: 'accepted'
    }]);
    setWalkInName(''); setWalkInAge(''); setShowWalkIn(false);
    fetchAppointments(); fetchPatients();
  }

  function toggleMedicine(med) {
    const exists = selectedMedicines.find(m => m.id === med.id);
    if (exists) {
      setSelectedMedicines(selectedMedicines.filter(m => m.id !== med.id));
    } else {
      setSelectedMedicines([...selectedMedicines, med]);
      setFrequency(f => ({ ...f, [med.id]: 'twice daily' }));
      setDuration(d => ({ ...d, [med.id]: '5 days' }));
    }
  }

  async function savePrescription() {
    if (selectedMedicines.length === 0) return;
    const medicineText = selectedMedicines.map(m =>
      `${m.name} ${m.dosage} — ${frequency[m.id] || 'twice daily'} for ${duration[m.id] || '5 days'}`
    ).join('\n');
    await supabase.from('prescriptions').insert([{
      patient_id: selectedPatient.id, patient_name: selectedPatient.name,
      patient_phone: selectedPatient.phone, medicines: medicineText, notes
    }]);
    setShowPrescription(false); setSelectedMedicines([]); setNotes('');
    fetchPrescriptions(selectedPatient.id); fetchAllPrescriptions();
    alert('Prescription saved!');
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(a => a.appointment_date === todayStr);
  const pendingApts = appointments.filter(a => !a.status || a.status === 'pending');
  const nextPatient = todayApts.find(a => a.status === 'accepted' || a.status === 'pending');
  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchPatient.toLowerCase()));

  if (authLoading) return (
    <>
      <style>{styles}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-3)', fontFamily: 'var(--font)' }}>Loading...</div>
    </>
  );

  // LOGIN
  if (!session) return (
    <>
      <style>{styles}</style>
      <div className="vc-login">
        <div>
          <div className="vc-login-logo">Varcare</div>
          <div className="vc-login-sub">Less chaos. More care.</div>
        </div>
        <div className="vc-login-form">
          <div>
            <div className="vc-field-label">Email</div>
            <input className="vc-input" type="email" placeholder="doctor@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin(e)} />
          </div>
          <div>
            <div className="vc-field-label">Password</div>
            <input className="vc-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin(e)} />
          </div>
          {loginError && <div className="vc-error">{loginError}</div>}
          <button className="vc-btn-primary" onClick={handleLogin} disabled={loginLoading}>
            {loginLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 11, color: 'var(--text-3)' }}>Secure clinic management</div>
      </div>
    </>
  );

  // PRESCRIPTION BUILDER
  if (showPrescription) {
    const filtered = medicines.filter(m => m.name.toLowerCase().includes(searchMed.toLowerCase()));
    return (
      <>
        <style>{styles}</style>
        <div className="vc-app" style={{ paddingBottom: 40 }}>
          <div className="vc-back-header">
            <button className="vc-back-btn" onClick={() => setShowPrescription(false)}>← Back</button>
            <div className="vc-detail-name">New Prescription</div>
            <div className="vc-detail-sub">{selectedPatient.name}{selectedPatient.age ? `, ${selectedPatient.age} yrs` : ''}</div>
          </div>
          <div className="vc-content">
            <input className="vc-input" style={{ marginBottom: 16 }} placeholder="Search medicines..." value={searchMed} onChange={e => setSearchMed(e.target.value)} />
            <div className="vc-section">Medicines</div>
            {filtered.map(med => {
              const sel = selectedMedicines.find(m => m.id === med.id);
              return (
                <div key={med.id} className={`vc-med-card${sel ? ' selected' : ''}`}>
                  <div className="vc-med-row">
                    <div>
                      <div className="vc-med-name">{med.name} <span className="vc-med-dose">{med.dosage}</span></div>
                      <div className="vc-med-unit">{med.unit}</div>
                    </div>
                    <button className={`vc-btn-add${sel ? ' added' : ''}`} onClick={() => toggleMedicine(med)}>
                      {sel ? 'Added' : 'Add'}
                    </button>
                  </div>
                  {sel && (
                    <div className="vc-med-selects">
                      <div>
                        <div className="vc-select-label">Frequency</div>
                        <select className="vc-select" value={frequency[med.id]} onChange={e => setFrequency(f => ({ ...f, [med.id]: e.target.value }))}>
                          <option>once daily</option><option>twice daily</option><option>three times daily</option>
                          <option>at night</option><option>before food</option><option>after food</option><option>SOS</option>
                        </select>
                      </div>
                      <div>
                        <div className="vc-select-label">Duration</div>
                        <select className="vc-select" value={duration[med.id]} onChange={e => setDuration(d => ({ ...d, [med.id]: e.target.value }))}>
                          <option>3 days</option><option>5 days</option><option>7 days</option><option>10 days</option>
                          <option>14 days</option><option>1 month</option><option>3 months</option><option>ongoing</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {selectedMedicines.length > 0 && (
              <>
                <div className="vc-selected-summary">
                  <div className="vc-section" style={{ margin: '0 0 8px' }}>Selected — {selectedMedicines.length}</div>
                  {selectedMedicines.map(m => (
                    <div key={m.id} className="vc-selected-line">
                      <strong>{m.name} {m.dosage}</strong> <span style={{ color: 'var(--text-3)' }}>— {frequency[m.id]} for {duration[m.id]}</span>
                    </div>
                  ))}
                </div>
                <textarea className="vc-textarea" style={{ marginBottom: 14 }} placeholder="Doctor notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
                <button className="vc-btn-primary" onClick={savePrescription}>Save Prescription</button>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  // PATIENT DETAIL
  if (selectedPatient) {
    const patientApts = appointments.filter(a => a.phone === selectedPatient.phone);
    return (
      <>
        <style>{styles}</style>
        <div className="vc-app" style={{ paddingBottom: 40 }}>
          <div className="vc-back-header">
            <button className="vc-back-btn" onClick={() => setSelectedPatient(null)}>← Back</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="vc-detail-name">{selectedPatient.name}</div>
                {selectedPatient.age && <div className="vc-detail-sub">Age {selectedPatient.age}</div>}
                <div className="vc-detail-sub">{selectedPatient.phone?.replace('whatsapp:+91', '+91 ')}</div>
              </div>
              <div className="vc-visit-badge">
                <div className="vc-visit-num">{selectedPatient.visit_count}</div>
                <div className="vc-visit-lbl">visits</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10 }}>
              Last visit {new Date(selectedPatient.last_visit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <div className="vc-content">
            <button className="vc-btn-primary" onClick={() => { fetchPrescriptions(selectedPatient.id); setShowPrescription(true); }}>
              + New Prescription
            </button>
            <div className="vc-section">Past Prescriptions</div>
            {prescriptions.length === 0
              ? <EmptyCard text="No prescriptions yet" />
              : prescriptions.map(p => (
                <div key={p.id} className="vc-rx-card">
                  <div className="vc-rx-date">{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  {p.medicines.split('\n').map((line, i) => <div key={i} className="vc-rx-line">{line}</div>)}
                  {p.notes && <div className="vc-rx-notes">{p.notes}</div>}
                </div>
              ))}
            <div className="vc-section">Visit History</div>
            {patientApts.length === 0
              ? <EmptyCard text="No visits recorded" />
              : patientApts.map(apt => (
                <div key={apt.id} className="vc-card">
                  <div className="vc-card-row">
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>{apt.time}</div>
                      <div className="vc-patient-sub">{new Date(apt.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    </div>
                    <StatusPill status={apt.status} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="vc-app">

        {/* WALK-IN MODAL */}
        {showWalkIn && (
          <div className="vc-modal-overlay">
            <div className="vc-modal">
              <div className="vc-modal-handle" />
              <div className="vc-modal-title">Walk-in Patient</div>
              <div className="vc-modal-sub">Added to today's queue immediately</div>
              <div className="vc-modal-field">
                <div className="vc-field-label">Patient Name</div>
                <input className="vc-input" placeholder="Enter name" value={walkInName} onChange={e => setWalkInName(e.target.value)} autoFocus />
              </div>
              <div className="vc-modal-field">
                <div className="vc-field-label">Age (optional)</div>
                <input className="vc-input" placeholder="e.g. 35" value={walkInAge} onChange={e => setWalkInAge(e.target.value)} />
              </div>
              <div className="vc-modal-btns">
                <button className="vc-btn-cancel" onClick={() => setShowWalkIn(false)}>Cancel</button>
                <button className="vc-btn-primary" style={{ margin: 0 }} onClick={addWalkIn}>Add Patient</button>
              </div>
            </div>
          </div>
        )}

        {/* TODAY TAB */}
        {tab === 'today' && (
          <>
            <div className="vc-header">
              <div className="vc-header-row">
                <div>
                  <div className="vc-brand">Varcare</div>
                  <div className="vc-greeting">Good {getTimeOfDay()}, Doctor</div>
                </div>
                <button className="vc-signout" onClick={handleLogout}>Sign out</button>
              </div>
              <div className="vc-stat-row">
                <div className="vc-stat"><div className="vc-stat-val" style={{ color: 'var(--accent)' }}>{todayApts.length}</div><div className="vc-stat-lbl">Today</div></div>
                <div className="vc-stat"><div className="vc-stat-val">{appointments.length}</div><div className="vc-stat-lbl">Total</div></div>
                <div className="vc-stat"><div className="vc-stat-val">{patients.length}</div><div className="vc-stat-lbl">Patients</div></div>
              </div>
            </div>
            <div className="vc-content">
              {pendingApts.length > 0 && (
                <div className="vc-pending-alert">
                  <div className="vc-pending-dot" />
                  {pendingApts.length} pending request{pendingApts.length > 1 ? 's' : ''} need your attention
                </div>
              )}
              {nextPatient && (
                <>
                  <div className="vc-section">Next Patient</div>
                  <div className="vc-next-card">
                    <div className="vc-next-name">{nextPatient.name}{nextPatient.age ? <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-3)' }}>, {nextPatient.age} yrs</span> : ''}</div>
                    <div className="vc-next-time">{nextPatient.time}</div>
                    {(!nextPatient.status || nextPatient.status === 'pending') && (
                      <div className="vc-btn-grid">
                        <button className="vc-btn-accept" onClick={() => updateStatus(nextPatient.id, 'accepted', nextPatient)}>Accept</button>
                        <button className="vc-btn-reject" onClick={() => updateStatus(nextPatient.id, 'rejected', nextPatient)}>Reject</button>
                      </div>
                    )}
                    {nextPatient.status === 'accepted' && <div className="vc-confirmed-badge">Confirmed</div>}
                  </div>
                </>
              )}
              <div className="vc-section">Today's Queue — {todayApts.length}</div>
              {todayApts.length === 0
                ? <EmptyCard text="No appointments today" sub="Tap + to add a walk-in patient" />
                : todayApts.map(apt => (
                  <div key={apt.id} className="vc-card">
                    <div className="vc-card-row">
                      <div>
                        <div className="vc-patient-name">{apt.name}{apt.age ? <span className="vc-patient-age">, {apt.age} yrs</span> : ''}</div>
                        <div className="vc-patient-sub">{apt.time}</div>
                      </div>
                      <StatusPill status={apt.status} />
                    </div>
                  </div>
                ))}
              {pendingApts.length > 0 && (
                <>
                  <div className="vc-section">Pending Requests — {pendingApts.length}</div>
                  {pendingApts.map(apt => (
                    <div key={apt.id} className="vc-card" style={{ borderColor: 'var(--amber-border)' }}>
                      <div className="vc-card-row" style={{ marginBottom: 12 }}>
                        <div>
                          <div className="vc-patient-name">{apt.name}{apt.age ? <span className="vc-patient-age">, {apt.age} yrs</span> : ''}</div>
                          <div className="vc-patient-sub">{apt.time}</div>
                          <div className="vc-patient-sub">{apt.phone?.replace('whatsapp:+91', '+91 ')}</div>
                        </div>
                        <StatusPill status={apt.status} />
                      </div>
                      <div className="vc-btn-grid">
                        <button className="vc-btn-accept" onClick={() => updateStatus(apt.id, 'accepted', apt)}>Accept</button>
                        <button className="vc-btn-reject" onClick={() => updateStatus(apt.id, 'rejected', apt)}>Reject</button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            <button className="vc-fab" onClick={() => setShowWalkIn(true)}>+</button>
          </>
        )}

        {/* PATIENTS TAB */}
        {tab === 'patients' && (
          <>
            <div className="vc-header">
              <div className="vc-page-title">Patients</div>
              <div className="vc-page-sub">{patients.length} registered</div>
            </div>
            <div className="vc-content">
              <input className="vc-input" style={{ marginBottom: 14 }} placeholder="Search patients..." value={searchPatient} onChange={e => setSearchPatient(e.target.value)} />
              {filteredPatients.length === 0
                ? <EmptyCard text="No patients yet" sub="Accept an appointment to register" />
                : filteredPatients.map(patient => (
                  <div key={patient.id} className="vc-card" style={{ cursor: 'pointer' }}
                    onClick={() => { setSelectedPatient(patient); fetchPrescriptions(patient.id); }}>
                    <div className="vc-card-row">
                      <div>
                        <div className="vc-patient-name">{patient.name}{patient.age ? <span className="vc-patient-age">, {patient.age} yrs</span> : ''}</div>
                        <div className="vc-patient-sub">{patient.phone?.replace('whatsapp:+91', '+91 ')}</div>
                        <div className="vc-patient-sub">Last visit {new Date(patient.last_visit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      </div>
                      <div className="vc-visit-badge">
                        <div className="vc-visit-num">{patient.visit_count}</div>
                        <div className="vc-visit-lbl">visits</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}

        {/* PRESCRIPTIONS TAB */}
        {tab === 'prescriptions' && (
          <>
            <div className="vc-header">
              <div className="vc-page-title">Prescriptions</div>
              <div className="vc-page-sub">{allPrescriptions.length} total</div>
            </div>
            <div className="vc-content">
              {allPrescriptions.length === 0
                ? <EmptyCard text="No prescriptions yet" sub="Open a patient profile to create one" />
                : allPrescriptions.map(p => (
                  <div key={p.id} className="vc-rx-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>{p.patient_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    </div>
                    {p.medicines.split('\n').map((line, i) => <div key={i} className="vc-rx-line">{line}</div>)}
                    {p.notes && <div className="vc-rx-notes">{p.notes}</div>}
                  </div>
                ))}
            </div>
          </>
        )}

        {/* MORE TAB */}
        {tab === 'more' && (
          <>
            <div className="vc-header">
              <div className="vc-page-title">More</div>
            </div>
            <div className="vc-content">
              <div className="vc-stats-list">
                {[
                  { label: 'Total appointments', value: appointments.length },
                  { label: 'Accepted', value: appointments.filter(a => a.status === 'accepted').length },
                  { label: 'Pending', value: pendingApts.length },
                  { label: 'Rejected', value: appointments.filter(a => a.status === 'rejected').length },
                  { label: 'Registered patients', value: patients.length },
                  { label: 'Prescriptions written', value: allPrescriptions.length },
                ].map((item, i) => (
                  <div key={i} className="vc-stats-row-item">
                    <div className="vc-stats-item-label">{item.label}</div>
                    <div className="vc-stats-item-val">{item.value}</div>
                  </div>
                ))}
              </div>
              <button className="vc-btn-signout" onClick={handleLogout}>Sign out</button>
            </div>
          </>
        )}

        {/* BOTTOM NAV */}
        <div className="vc-bottom-nav">
          {[
            { key: 'today', label: 'Today', icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
            { key: 'patients', label: 'Patients', icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
            { key: 'prescriptions', label: 'Rx', icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
            { key: 'more', label: 'More', icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg> },
          ].map(t => (
            <button key={t.key} className={`vc-nav-btn${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
              {t.icon}
              <span className="vc-nav-label">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function StatusPill({ status }) {
  const map = {
    accepted: 'confirmed',
    confirmed: 'confirmed',
    rejected: 'rejected',
    cancelled: 'cancelled',
    pending: 'pending',
  };
  const cls = map[status] || 'pending';
  const label = { confirmed: 'Confirmed', rejected: 'Rejected', cancelled: 'Cancelled', pending: 'Pending' }[cls];
  return <span className={`vc-pill pill-${cls}`}>{label}</span>;
}

function EmptyCard({ text, sub }) {
  return (
    <div className="vc-empty">
      <div className="vc-empty-text">{text}</div>
      {sub && <div className="vc-empty-sub">{sub}</div>}
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}