import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://asueiylnppjxlpbmzxmz.supabase.co',
  'sb_publishable_URPMSXfHCT9qbM_IZXx8kg_gg9XWSsK'
);

const C = {
  bg: '#F4F6F9',
  card: '#FFFFFF',
  teal: '#0B6E8A',
  tealLight: '#E6F3F7',
  tealMid: '#0D8CAD',
  dark: '#0D1B2A',
  text: '#0D1B2A',
  textSoft: '#3D5166',
  textMuted: '#8A9BB0',
  border: '#E2E8F0',
  green: '#16A34A',
  greenLight: '#DCFCE7',
  amber: '#D97706',
  amberLight: '#FEF3C7',
  red: '#DC2626',
  redLight: '#FEE2E2',
  shadow: '0 1px 3px rgba(13,27,42,0.06), 0 4px 16px rgba(13,27,42,0.06)',
};

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
      Promise.all([fetchAppointments(), fetchPatients(), fetchMedicines(), fetchAllPrescriptions()]);
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
      name: walkInName,
      phone: 'walkin',
      time: `Today ${now}`,
      appointment_date: today,
      age: walkInAge || null,
      consent: true,
      status: 'accepted'
    }]);
    const { data: existing } = await supabase.from('patients').select('*').eq('phone', 'walkin_' + walkInName).single();
    if (!existing) {
      await supabase.from('patients').insert([{ name: walkInName, phone: 'walkin_' + walkInName, age: walkInAge || null, last_visit: new Date().toISOString(), visit_count: 1 }]);
    }
    setWalkInName('');
    setWalkInAge('');
    setShowWalkIn(false);
    fetchAppointments();
    fetchPatients();
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
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.name,
      patient_phone: selectedPatient.phone,
      medicines: medicineText,
      notes
    }]);
    setShowPrescription(false);
    setSelectedMedicines([]);
    setNotes('');
    fetchPrescriptions(selectedPatient.id);
    fetchAllPrescriptions();
    alert('Prescription saved!');
  }

  const today = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(a => a.appointment_date === today);
  const pendingCount = appointments.filter(a => !a.status || a.status === 'pending').length;
  const nextPatient = todayApts.find(a => a.status === 'accepted' || a.status === 'pending');
  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchPatient.toLowerCase()));

  if (authLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: "'Poppins', sans-serif", color: C.textMuted }}>Loading...</div>;

  // LOGIN
  if (!session) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: C.bg, fontFamily: "'Poppins', sans-serif", display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: C.teal, letterSpacing: '-1px', marginBottom: 6 }}>Varcare</div>
          <div style={{ fontSize: 14, color: C.textMuted }}>Less chaos. More care.</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: C.shadow }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 24 }}>Doctor Login</div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.textSoft, marginBottom: 6 }}>Email</div>
            <input style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: "'Poppins', sans-serif", color: C.text, outline: 'none', boxSizing: 'border-box' }} type="email" placeholder="doctor@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin(e)} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.textSoft, marginBottom: 6 }}>Password</div>
            <input style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: "'Poppins', sans-serif", color: C.text, outline: 'none', boxSizing: 'border-box' }} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin(e)} />
          </div>
          {loginError && <div style={{ background: C.redLight, color: C.red, borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{loginError}</div>}
          <button style={{ width: '100%', padding: 15, background: C.teal, color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }} onClick={handleLogin} disabled={loginLoading}>
            {loginLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: C.textMuted }}>Secure clinic management by Varcare</div>
      </div>
    );
  }

  // PRESCRIPTION BUILDER
  if (showPrescription) {
    const filtered = medicines.filter(m => m.name.toLowerCase().includes(searchMed.toLowerCase()));
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: C.bg, fontFamily: "'Poppins', sans-serif", paddingBottom: 100 }}>
        <div style={{ background: C.teal, padding: '48px 20px 24px', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => setShowPrescription(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '7px 16px', borderRadius: 99, fontSize: 12, fontFamily: "'Poppins', sans-serif", cursor: 'pointer', marginBottom: 12 }}>← Back</button>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>New Prescription</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{selectedPatient.name}{selectedPatient.age ? `, ${selectedPatient.age} yrs` : ''}</div>
        </div>
        <div style={{ padding: 16 }}>
          <input style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: `1px solid ${C.border}`, fontSize: 14, fontFamily: "'Poppins', sans-serif", background: '#fff', color: C.text, outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} placeholder="Search medicines..." value={searchMed} onChange={e => setSearchMed(e.target.value)} />
          <SectionLabel text="SELECT MEDICINES" />
          {filtered.map(med => {
            const sel = selectedMedicines.find(m => m.id === med.id);
            return (
              <div key={med.id} style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, boxShadow: C.shadow, border: sel ? `2px solid ${C.teal}` : `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{med.name} <span style={{ fontWeight: 400, color: C.textMuted, fontSize: 13 }}>{med.dosage}</span></div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{med.unit}</div>
                  </div>
                  <button onClick={() => toggleMedicine(med)} style={{ background: sel ? C.teal : C.tealLight, color: sel ? '#fff' : C.teal, border: 'none', borderRadius: 99, padding: '7px 16px', fontSize: 12, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }}>
                    {sel ? 'Added' : 'Add'}
                  </button>
                </div>
                {sel && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 6, fontWeight: 500 }}>FREQUENCY</div>
                      <select style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: "'Poppins', sans-serif", color: C.text, background: '#fff' }} value={frequency[med.id]} onChange={e => setFrequency(f => ({ ...f, [med.id]: e.target.value }))}>
                        <option>once daily</option><option>twice daily</option><option>three times daily</option>
                        <option>at night</option><option>before food</option><option>after food</option><option>SOS</option>
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 6, fontWeight: 500 }}>DURATION</div>
                      <select style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: "'Poppins', sans-serif", color: C.text, background: '#fff' }} value={duration[med.id]} onChange={e => setDuration(d => ({ ...d, [med.id]: e.target.value }))}>
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
              <div style={{ background: C.tealLight, borderRadius: 16, padding: 16, marginBottom: 14, border: `1px solid rgba(11,110,138,0.15)` }}>
                <SectionLabel text={`SELECTED — ${selectedMedicines.length}`} />
                {selectedMedicines.map(m => (
                  <div key={m.id} style={{ fontSize: 13, color: C.text, padding: '5px 0', borderBottom: `1px solid rgba(11,110,138,0.1)`, lineHeight: 1.6 }}>
                    <b>{m.name} {m.dosage}</b> — {frequency[m.id]} for {duration[m.id]}
                  </div>
                ))}
              </div>
              <textarea style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "'Poppins', sans-serif", minHeight: 90, resize: 'none', background: '#fff', color: C.text, outline: 'none', marginBottom: 14, boxSizing: 'border-box' }} placeholder="Doctor notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
              <button style={{ width: '100%', padding: 15, background: C.teal, color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }} onClick={savePrescription}>
                Save & Send Prescription
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // PATIENT DETAIL
  if (selectedPatient) {
    const patientApts = appointments.filter(a => a.phone === selectedPatient.phone);
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: C.bg, fontFamily: "'Poppins', sans-serif", paddingBottom: 100 }}>
        <div style={{ background: C.dark, padding: '48px 20px 24px' }}>
          <button onClick={() => setSelectedPatient(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '7px 16px', borderRadius: 99, fontSize: 12, fontFamily: "'Poppins', sans-serif", cursor: 'pointer', marginBottom: 16 }}>← Back</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>{selectedPatient.name}</div>
              {selectedPatient.age && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Age {selectedPatient.age}</div>}
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{selectedPatient.phone?.replace('whatsapp:+91', '+91 ')}</div>
            </div>
            <div style={{ background: C.teal, borderRadius: 16, padding: '12px 16px', textAlign: 'center', minWidth: 60 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{selectedPatient.visit_count}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>visits</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 12 }}>
            Last visit {new Date(selectedPatient.last_visit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <button style={{ width: '100%', padding: 15, background: C.teal, color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer', marginBottom: 24 }} onClick={() => { fetchPrescriptions(selectedPatient.id); setShowPrescription(true); }}>
            + New Prescription
          </button>
          <SectionLabel text="PAST PRESCRIPTIONS" />
          {prescriptions.length === 0
            ? <div style={{ textAlign: 'center', padding: 24, fontSize: 13, color: C.textMuted, background: '#fff', borderRadius: 14, marginBottom: 16 }}>No prescriptions yet</div>
            : prescriptions.map(p => (
              <div key={p.id} style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, boxShadow: C.shadow }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.teal, letterSpacing: '0.06em', marginBottom: 10 }}>{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                {p.medicines.split('\n').map((line, i) => <div key={i} style={{ fontSize: 13, color: C.textSoft, padding: '4px 0', borderBottom: `1px solid ${C.border}`, lineHeight: 1.6 }}>{line}</div>)}
                {p.notes && <div style={{ fontSize: 12, color: C.textMuted, fontStyle: 'italic', marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>{p.notes}</div>}
              </div>
            ))}
          <SectionLabel text="VISIT HISTORY" />
          {patientApts.length === 0
            ? <div style={{ textAlign: 'center', padding: 24, fontSize: 13, color: C.textMuted, background: '#fff', borderRadius: 14 }}>No visits recorded</div>
            : patientApts.map(apt => (
              <div key={apt.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: C.shadow }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{apt.time}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{new Date(apt.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                </div>
                <StatusPill status={apt.status} />
              </div>
            ))}
        </div>
      </div>
    );
  }

  // WALK-IN MODAL
  const WalkInModal = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 480 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>Add Walk-in Patient</div>
        <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 24 }}>Patient will be added to today's queue immediately</div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: C.textSoft, marginBottom: 6 }}>Patient Name *</div>
          <input style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: "'Poppins', sans-serif", color: C.text, outline: 'none', boxSizing: 'border-box' }} placeholder="Enter name" value={walkInName} onChange={e => setWalkInName(e.target.value)} autoFocus />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: C.textSoft, marginBottom: 6 }}>Age (optional)</div>
          <input style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: "'Poppins', sans-serif", color: C.text, outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. 35" value={walkInAge} onChange={e => setWalkInAge(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button style={{ padding: 14, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 14, fontWeight: 500, fontFamily: "'Poppins', sans-serif", cursor: 'pointer', color: C.textSoft }} onClick={() => setShowWalkIn(false)}>Cancel</button>
          <button style={{ padding: 14, background: C.teal, border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer', color: '#fff' }} onClick={addWalkIn}>Add Patient</button>
        </div>
      </div>
    </div>
  );

  // MAIN APP
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: C.bg, fontFamily: "'Poppins', sans-serif", paddingBottom: 80 }}>

      {showWalkIn && <WalkInModal />}

      {/* TODAY TAB */}
      {tab === 'today' && (
        <>
          <div style={{ background: C.dark, borderRadius: '0 0 28px 28px', padding: '48px 20px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Varcare</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontWeight: 300 }}>Good {getTimeOfDay()}, Doctor</div>
              </div>
              <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', padding: '7px 14px', borderRadius: 99, fontSize: 12, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }}>Sign out</button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'Today', value: todayApts.length },
                { label: 'Total', value: appointments.length },
                { label: 'Patients', value: patients.length },
              ].map(stat => (
                <div key={stat.label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 12px' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 16 }}>
            {/* Next Patient Hero Card */}
            {nextPatient && (
              <>
                <SectionLabel text="NEXT PATIENT" />
                <div style={{ background: C.teal, borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: '0 4px 20px rgba(11,110,138,0.25)' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{nextPatient.name}</div>
                  {nextPatient.age && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Age {nextPatient.age}</div>}
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}>{nextPatient.time}</div>
                  {(!nextPatient.status || nextPatient.status === 'pending') && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <button style={{ padding: '11px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, fontSize: 13, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }} onClick={() => updateStatus(nextPatient.id, 'accepted', nextPatient)}>Accept</button>
                      <button style={{ padding: '11px', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontSize: 13, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }} onClick={() => updateStatus(nextPatient.id, 'rejected', nextPatient)}>Reject</button>
                    </div>
                  )}
                  {nextPatient.status === 'accepted' && (
                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '11px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#fff' }}>Confirmed</div>
                  )}
                </div>
              </>
            )}

            {/* Today's Queue */}
            <SectionLabel text={`TODAY'S QUEUE — ${todayApts.length} appointments`} />
            {todayApts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', border: `1.5px dashed ${C.border}`, borderRadius: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>No appointments today</div>
                <div style={{ fontSize: 13, color: C.textMuted }}>Tap + to add a walk-in patient</div>
              </div>
            ) : todayApts.map(apt => (
              <div key={apt.id} style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', marginBottom: 10, boxShadow: C.shadow, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{apt.name}{apt.age ? <span style={{ fontSize: 13, fontWeight: 400, color: C.textMuted }}>, {apt.age} yrs</span> : ''}</div>
                  <div style={{ fontSize: 13, color: C.textSoft, marginTop: 4 }}>{apt.time}</div>
                </div>
                <StatusPill status={apt.status} />
              </div>
            ))}

            {/* All pending */}
            {pendingCount > 0 && (
              <>
                <SectionLabel text={`PENDING REQUESTS — ${pendingCount}`} />
                {appointments.filter(a => !a.status || a.status === 'pending').map(apt => (
                  <div key={apt.id} style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, boxShadow: C.shadow }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{apt.name}{apt.age ? <span style={{ fontSize: 13, fontWeight: 400, color: C.textMuted }}>, {apt.age} yrs</span> : ''}</div>
                        <div style={{ fontSize: 13, color: C.textSoft, marginTop: 4 }}>{apt.time}</div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{apt.phone?.replace('whatsapp:+91', '+91 ')}</div>
                      </div>
                      <StatusPill status={apt.status} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <button style={{ padding: '10px', background: C.greenLight, color: C.green, border: `1px solid rgba(22,163,74,0.2)`, borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }} onClick={() => updateStatus(apt.id, 'accepted', apt)}>Accept</button>
                      <button style={{ padding: '10px', background: C.redLight, color: C.red, border: `1px solid rgba(220,38,38,0.2)`, borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }} onClick={() => updateStatus(apt.id, 'rejected', apt)}>Reject</button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Walk-in FAB */}
          <button onClick={() => setShowWalkIn(true)} style={{ position: 'fixed', bottom: 90, right: 'calc(50% - 228px)', background: C.teal, border: 'none', borderRadius: 99, width: 56, height: 56, fontSize: 28, color: '#fff', boxShadow: '0 4px 20px rgba(11,110,138,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 300 }}>+</button>
        </>
      )}

      {/* PATIENTS TAB */}
      {tab === 'patients' && (
        <>
          <div style={{ background: C.dark, borderRadius: '0 0 28px 28px', padding: '48px 20px 24px' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Patients</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{patients.length} registered</div>
          </div>
          <div style={{ padding: 16 }}>
            <input style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: `1px solid ${C.border}`, fontSize: 14, fontFamily: "'Poppins', sans-serif", background: '#fff', color: C.text, outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} placeholder="Search patients..." value={searchPatient} onChange={e => setSearchPatient(e.target.value)} />
            {filteredPatients.length === 0
              ? <div style={{ textAlign: 'center', padding: '48px 20px', border: `1.5px dashed ${C.border}`, borderRadius: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>No patients yet</div>
                  <div style={{ fontSize: 13, color: C.textMuted }}>Accept an appointment to register a patient</div>
                </div>
              : filteredPatients.map(patient => (
                <div key={patient.id} style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, boxShadow: C.shadow, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => { setSelectedPatient(patient); fetchPrescriptions(patient.id); }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{patient.name}{patient.age ? <span style={{ fontSize: 13, fontWeight: 400, color: C.textMuted }}>, {patient.age} yrs</span> : ''}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{patient.phone?.replace('whatsapp:+91', '+91 ')}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Last visit {new Date(patient.last_visit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  <div style={{ background: C.teal, borderRadius: 14, padding: '10px 14px', textAlign: 'center', minWidth: 52 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{patient.visit_count}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>visits</div>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {/* PRESCRIPTIONS TAB */}
      {tab === 'prescriptions' && (
        <>
          <div style={{ background: C.dark, borderRadius: '0 0 28px 28px', padding: '48px 20px 24px' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Prescriptions</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{allPrescriptions.length} total</div>
          </div>
          <div style={{ padding: 16 }}>
            {allPrescriptions.length === 0
              ? <div style={{ textAlign: 'center', padding: '48px 20px', border: `1.5px dashed ${C.border}`, borderRadius: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>No prescriptions yet</div>
                  <div style={{ fontSize: 13, color: C.textMuted }}>Open a patient profile to create one</div>
                </div>
              : allPrescriptions.map(p => (
                <div key={p.id} style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, boxShadow: C.shadow }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{p.patient_name}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  {p.medicines.split('\n').map((line, i) => <div key={i} style={{ fontSize: 13, color: C.textSoft, padding: '4px 0', borderBottom: `1px solid ${C.border}`, lineHeight: 1.6 }}>{line}</div>)}
                  {p.notes && <div style={{ fontSize: 12, color: C.textMuted, fontStyle: 'italic', marginTop: 10 }}>{p.notes}</div>}
                </div>
              ))}
          </div>
        </>
      )}

      {/* MORE TAB */}
      {tab === 'more' && (
        <>
          <div style={{ background: C.dark, borderRadius: '0 0 28px 28px', padding: '48px 20px 24px' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>More</div>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: C.shadow }}>
              {[
                { label: 'Total appointments', value: appointments.length },
                { label: 'Accepted', value: appointments.filter(a => a.status === 'accepted').length },
                { label: 'Rejected', value: appointments.filter(a => a.status === 'rejected').length },
                { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length },
                { label: 'Registered patients', value: patients.length },
                { label: 'Prescriptions written', value: allPrescriptions.length },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: i < 5 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ fontSize: 14, color: C.textSoft }}>{item.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{item.value}</div>
                </div>
              ))}
            </div>
            <button onClick={handleLogout} style={{ width: '100%', padding: 15, background: '#fff', color: C.red, border: `1px solid ${C.border}`, borderRadius: 14, fontSize: 14, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer', marginTop: 16 }}>Sign out</button>
          </div>
        </>
      )}

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: '#fff', borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 50, paddingBottom: 8 }}>
        {[
          { key: 'today', label: 'Today', icon: '⊡' },
          { key: 'patients', label: 'Patients', icon: '⊕' },
          { key: 'prescriptions', label: 'Rx', icon: '⊗' },
          { key: 'more', label: 'More', icon: '⋯' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: '10px 0 6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ fontSize: 18, color: tab === t.key ? C.teal : C.textMuted }}>{t.icon}</div>
            <div style={{ fontSize: 10, fontWeight: tab === t.key ? 600 : 400, color: tab === t.key ? C.teal : C.textMuted, fontFamily: "'Poppins', sans-serif" }}>{t.label}</div>
          </button>
        ))}
      </div>

    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    accepted: { bg: '#DCFCE7', color: '#16A34A', label: 'Confirmed' },
    rejected: { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected' },
    cancelled: { bg: '#F3F4F6', color: '#6B7280', label: 'Cancelled' },
    pending: { bg: '#FEF9C3', color: '#D97706', label: 'Pending' },
  };
  const s = map[status] || map.pending;
  return <div style={{ background: s.bg, color: s.color, borderRadius: 99, padding: '4px 12px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{s.label}</div>;
}

function SectionLabel({ text }) {
  return <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#8A9BB0', marginBottom: 10, marginTop: 4 }}>{text}</div>;
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}