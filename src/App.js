cat > /mnt/user-data/outputs/App.js << 'ENDOFFILE'
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://asueiylnppjxlpbmzxmz.supabase.co',
  'yoursb_publishable_URPMSXfHCT9qbM_IZXx8kg_gg9XWSsK'
);

const C = {
  black: '#000000',
  dark1: '#0A0A0A',
  dark2: '#111111',
  dark3: '#1A1A1A',
  dark4: '#222222',
  teal: '#0891B2',
  tealGlow: 'rgba(8,145,178,0.3)',
  tealLight: 'rgba(8,145,178,0.12)',
  white: '#FFFFFF',
  white80: 'rgba(255,255,255,0.8)',
  white60: 'rgba(255,255,255,0.6)',
  white40: 'rgba(255,255,255,0.4)',
  white20: 'rgba(255,255,255,0.2)',
  white10: 'rgba(255,255,255,0.1)',
  white06: 'rgba(255,255,255,0.06)',
  green: '#22C55E',
  greenBg: 'rgba(34,197,94,0.12)',
  amber: '#F59E0B',
  amberBg: 'rgba(245,158,11,0.12)',
  red: '#EF4444',
  redBg: 'rgba(239,68,68,0.12)',
  border: 'rgba(255,255,255,0.08)',
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

  const today = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(a => a.appointment_date === today);
  const pendingApts = appointments.filter(a => !a.status || a.status === 'pending');
  const nextPatient = todayApts.find(a => a.status === 'accepted' || a.status === 'pending');
  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchPatient.toLowerCase()));

  const inputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: 14,
    border: `1px solid ${C.border}`, fontSize: 15,
    fontFamily: "'Poppins', sans-serif", color: C.white,
    outline: 'none', boxSizing: 'border-box',
    background: C.dark3,
  };

  if (authLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: C.black, fontFamily: "'Poppins', sans-serif", color: C.white40 }}>
      Loading...
    </div>
  );

  // LOGIN
  if (!session) return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: C.black, fontFamily: "'Poppins', sans-serif", display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 42, fontWeight: 800, color: C.white, letterSpacing: '-2px', lineHeight: 1 }}>Varcare</div>
        <div style={{ fontSize: 14, color: C.white40, marginTop: 8, fontWeight: 300 }}>Less chaos. More care.</div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.white40, marginBottom: 8, letterSpacing: '0.05em' }}>EMAIL</div>
        <input style={inputStyle} type="email" placeholder="doctor@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin(e)} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.white40, marginBottom: 8, letterSpacing: '0.05em' }}>PASSWORD</div>
        <input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin(e)} />
      </div>
      {loginError && <div style={{ background: C.redBg, color: C.red, borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 16, border: `1px solid rgba(239,68,68,0.2)` }}>{loginError}</div>}
      <button style={{ width: '100%', padding: 16, background: C.teal, color: C.white, border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer', boxShadow: `0 0 32px ${C.tealGlow}` }} onClick={handleLogin} disabled={loginLoading}>
        {loginLoading ? 'Signing in...' : 'Sign in'}
      </button>
      <div style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: C.white20 }}>Secure clinic management</div>
    </div>
  );

  // PRESCRIPTION BUILDER
  if (showPrescription) {
    const filtered = medicines.filter(m => m.name.toLowerCase().includes(searchMed.toLowerCase()));
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: C.black, fontFamily: "'Poppins', sans-serif", paddingBottom: 40 }}>
        <div style={{ background: C.dark2, padding: '56px 20px 20px', borderBottom: `1px solid ${C.border}` }}>
          <button onClick={() => setShowPrescription(false)} style={{ background: C.white10, border: 'none', color: C.white60, padding: '8px 16px', borderRadius: 99, fontSize: 13, fontFamily: "'Poppins', sans-serif", cursor: 'pointer', marginBottom: 16 }}>← Back</button>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.white }}>New Prescription</div>
          <div style={{ fontSize: 14, color: C.white40, marginTop: 4 }}>{selectedPatient.name}{selectedPatient.age ? `, ${selectedPatient.age} yrs` : ''}</div>
        </div>
        <div style={{ padding: 16 }}>
          <input style={{ ...inputStyle, marginBottom: 20 }} placeholder="Search medicines..." value={searchMed} onChange={e => setSearchMed(e.target.value)} />
          <SectionLabel text="MEDICINES" />
          {filtered.map(med => {
            const sel = selectedMedicines.find(m => m.id === med.id);
            return (
              <div key={med.id} style={{ background: sel ? 'rgba(8,145,178,0.08)' : C.dark2, borderRadius: 16, padding: 16, marginBottom: 10, border: sel ? `1px solid ${C.teal}` : `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.white }}>{med.name} <span style={{ fontWeight: 400, color: C.white40, fontSize: 13 }}>{med.dosage}</span></div>
                    <div style={{ fontSize: 12, color: C.white40, marginTop: 3 }}>{med.unit}</div>
                  </div>
                  <button onClick={() => toggleMedicine(med)} style={{ background: sel ? C.teal : C.white10, color: sel ? C.white : C.white60, border: 'none', borderRadius: 99, padding: '8px 18px', fontSize: 13, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }}>
                    {sel ? 'Added' : 'Add'}
                  </button>
                </div>
                {sel && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontSize: 10, color: C.white40, marginBottom: 6, fontWeight: 500, letterSpacing: '0.08em' }}>FREQUENCY</div>
                      <select style={{ width: '100%', padding: '10px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: "'Poppins', sans-serif", color: C.white, background: C.dark3 }} value={frequency[med.id]} onChange={e => setFrequency(f => ({ ...f, [med.id]: e.target.value }))}>
                        <option>once daily</option><option>twice daily</option><option>three times daily</option>
                        <option>at night</option><option>before food</option><option>after food</option><option>SOS</option>
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: C.white40, marginBottom: 6, fontWeight: 500, letterSpacing: '0.08em' }}>DURATION</div>
                      <select style={{ width: '100%', padding: '10px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: "'Poppins', sans-serif", color: C.white, background: C.dark3 }} value={duration[med.id]} onChange={e => setDuration(d => ({ ...d, [med.id]: e.target.value }))}>
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
              <div style={{ background: C.tealLight, borderRadius: 16, padding: 16, marginBottom: 14, border: `1px solid rgba(8,145,178,0.2)` }}>
                <SectionLabel text={`SELECTED — ${selectedMedicines.length}`} />
                {selectedMedicines.map(m => (
                  <div key={m.id} style={{ fontSize: 13, color: C.white80, padding: '6px 0', borderBottom: `1px solid ${C.border}`, lineHeight: 1.6 }}>
                    <b>{m.name} {m.dosage}</b> <span style={{ color: C.white40 }}>— {frequency[m.id]} for {duration[m.id]}</span>
                  </div>
                ))}
              </div>
              <textarea style={{ ...inputStyle, minHeight: 90, resize: 'none', marginBottom: 14 }} placeholder="Doctor notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
              <button style={{ width: '100%', padding: 16, background: C.teal, color: C.white, border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer', boxShadow: `0 0 24px ${C.tealGlow}` }} onClick={savePrescription}>
                Save Prescription
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
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: C.black, fontFamily: "'Poppins', sans-serif", paddingBottom: 40 }}>
        <div style={{ background: C.dark2, padding: '56px 20px 24px', borderBottom: `1px solid ${C.border}` }}>
          <button onClick={() => setSelectedPatient(null)} style={{ background: C.white10, border: 'none', color: C.white60, padding: '8px 16px', borderRadius: 99, fontSize: 13, fontFamily: "'Poppins', sans-serif", cursor: 'pointer', marginBottom: 16 }}>← Back</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.white }}>{selectedPatient.name}</div>
              {selectedPatient.age && <div style={{ fontSize: 13, color: C.white40, marginTop: 4 }}>Age {selectedPatient.age}</div>}
              <div style={{ fontSize: 12, color: C.white40, marginTop: 2 }}>{selectedPatient.phone?.replace('whatsapp:+91', '+91 ')}</div>
            </div>
            <div style={{ background: C.tealLight, border: `1px solid rgba(8,145,178,0.3)`, borderRadius: 16, padding: '12px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.teal }}>{selectedPatient.visit_count}</div>
              <div style={{ fontSize: 10, color: C.white40, marginTop: 2 }}>visits</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: C.white20, marginTop: 12 }}>
            Last visit {new Date(selectedPatient.last_visit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <button style={{ width: '100%', padding: 16, background: C.teal, color: C.white, border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer', marginBottom: 24, boxShadow: `0 0 24px ${C.tealGlow}` }}
            onClick={() => { fetchPrescriptions(selectedPatient.id); setShowPrescription(true); }}>
            + New Prescription
          </button>
          <SectionLabel text="PAST PRESCRIPTIONS" />
          {prescriptions.length === 0
            ? <EmptyCard text="No prescriptions yet" />
            : prescriptions.map(p => (
              <div key={p.id} style={{ background: C.dark2, borderRadius: 16, padding: 16, marginBottom: 10, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.teal, letterSpacing: '0.08em', marginBottom: 10 }}>{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                {p.medicines.split('\n').map((line, i) => <div key={i} style={{ fontSize: 13, color: C.white60, padding: '4px 0', borderBottom: `1px solid ${C.border}`, lineHeight: 1.6 }}>{line}</div>)}
                {p.notes && <div style={{ fontSize: 12, color: C.white40, fontStyle: 'italic', marginTop: 10 }}>{p.notes}</div>}
              </div>
            ))}
          <SectionLabel text="VISIT HISTORY" />
          {patientApts.length === 0
            ? <EmptyCard text="No visits recorded" />
            : patientApts.map(apt => (
              <div key={apt.id} style={{ background: C.dark2, borderRadius: 14, padding: 16, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.white }}>{apt.time}</div>
                  <div style={{ fontSize: 12, color: C.white40, marginTop: 3 }}>{new Date(apt.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: C.dark2, borderRadius: '24px 24px 0 0', padding: '28px 24px 48px', width: '100%', maxWidth: 480, border: `1px solid ${C.border}`, borderBottom: 'none' }}>
        <div style={{ width: 40, height: 4, background: C.white20, borderRadius: 99, margin: '0 auto 24px' }} />
        <div style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 4 }}>Walk-in Patient</div>
        <div style={{ fontSize: 13, color: C.white40, marginBottom: 24 }}>Added to today's queue immediately</div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: C.white40, marginBottom: 8, letterSpacing: '0.06em', fontWeight: 500 }}>PATIENT NAME</div>
          <input style={inputStyle} placeholder="Enter name" value={walkInName} onChange={e => setWalkInName(e.target.value)} autoFocus />
        </div>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: C.white40, marginBottom: 8, letterSpacing: '0.06em', fontWeight: 500 }}>AGE (OPTIONAL)</div>
          <input style={inputStyle} placeholder="e.g. 35" value={walkInAge} onChange={e => setWalkInAge(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button style={{ padding: 14, background: C.dark3, border: `1px solid ${C.border}`, borderRadius: 14, fontSize: 14, fontWeight: 500, fontFamily: "'Poppins', sans-serif", cursor: 'pointer', color: C.white60 }} onClick={() => setShowWalkIn(false)}>Cancel</button>
          <button style={{ padding: 14, background: C.teal, border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer', color: C.white, boxShadow: `0 0 20px ${C.tealGlow}` }} onClick={addWalkIn}>Add Patient</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: C.black, fontFamily: "'Poppins', sans-serif", paddingBottom: 80 }}>
      {showWalkIn && <WalkInModal />}

      {/* TODAY */}
      {tab === 'today' && (
        <>
          <div style={{ background: C.dark1, padding: '56px 20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 34, fontWeight: 800, color: C.white, letterSpacing: '-1.5px', lineHeight: 1 }}>Varcare</div>
                <div style={{ fontSize: 13, color: C.white40, marginTop: 6, fontWeight: 300 }}>Good {getTimeOfDay()}, Doctor</div>
              </div>
              <button onClick={handleLogout} style={{ background: C.white06, border: `1px solid ${C.border}`, color: C.white40, padding: '8px 14px', borderRadius: 99, fontSize: 12, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }}>Sign out</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'Today', value: todayApts.length, color: C.teal },
                { label: 'Total', value: appointments.length, color: C.white },
                { label: 'Patients', value: patients.length, color: C.white },
              ].map(stat => (
                <div key={stat.label} style={{ background: C.dark3, borderRadius: 16, padding: '16px 14px', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: stat.color, letterSpacing: '-1px' }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: C.white40, marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '16px 16px 0' }}>
            {pendingApts.length > 0 && (
              <div style={{ background: C.amberBg, border: `1px solid rgba(245,158,11,0.2)`, borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, background: C.amber, borderRadius: '50%' }} />
                <div style={{ fontSize: 13, color: C.amber, fontWeight: 500 }}>{pendingApts.length} pending request{pendingApts.length > 1 ? 's' : ''} need your attention</div>
              </div>
            )}

            {nextPatient && (
              <>
                <SectionLabel text="NEXT PATIENT" />
                <div style={{ background: `linear-gradient(135deg, ${C.teal}, #0369A1)`, borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: `0 8px 32px ${C.tealGlow}` }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.white, marginBottom: 4 }}>{nextPatient.name}</div>
                  {nextPatient.age && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>Age {nextPatient.age}</div>}
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 18 }}>{nextPatient.time}</div>
                  {(!nextPatient.status || nextPatient.status === 'pending') && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <button style={{ padding: 12, background: 'rgba(255,255,255,0.2)', color: C.white, border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, fontSize: 14, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }} onClick={() => updateStatus(nextPatient.id, 'accepted', nextPatient)}>Accept</button>
                      <button style={{ padding: 12, background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 14, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }} onClick={() => updateStatus(nextPatient.id, 'rejected', nextPatient)}>Reject</button>
                    </div>
                  )}
                  {nextPatient.status === 'accepted' && (
                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12, textAlign: 'center', fontSize: 14, fontWeight: 600, color: C.white }}>Confirmed</div>
                  )}
                </div>
              </>
            )}

            <SectionLabel text={`TODAY'S QUEUE — ${todayApts.length}`} />
            {todayApts.length === 0
              ? <EmptyCard text="No appointments today" sub="Tap + to add a walk-in patient" />
              : todayApts.map(apt => (
                <div key={apt.id} style={{ background: C.dark2, borderRadius: 16, padding: '14px 16px', marginBottom: 10, border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.white }}>{apt.name}{apt.age ? <span style={{ fontSize: 13, fontWeight: 400, color: C.white40 }}>, {apt.age} yrs</span> : ''}</div>
                    <div style={{ fontSize: 13, color: C.white60, marginTop: 4 }}>{apt.time}</div>
                  </div>
                  <StatusPill status={apt.status} />
                </div>
              ))}

            {pendingApts.length > 0 && (
              <>
                <SectionLabel text={`PENDING REQUESTS — ${pendingApts.length}`} />
                {pendingApts.map(apt => (
                  <div key={apt.id} style={{ background: C.dark2, borderRadius: 16, padding: 16, marginBottom: 10, border: `1px solid rgba(245,158,11,0.2)` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: C.white }}>{apt.name}{apt.age ? <span style={{ fontSize: 13, fontWeight: 400, color: C.white40 }}>, {apt.age} yrs</span> : ''}</div>
                        <div style={{ fontSize: 13, color: C.white60, marginTop: 4 }}>{apt.time}</div>
                        <div style={{ fontSize: 12, color: C.white40, marginTop: 2 }}>{apt.phone?.replace('whatsapp:+91', '+91 ')}</div>
                      </div>
                      <StatusPill status={apt.status} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <button style={{ padding: 11, background: C.greenBg, color: C.green, border: `1px solid rgba(34,197,94,0.2)`, borderRadius: 12, fontSize: 13, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }} onClick={() => updateStatus(apt.id, 'accepted', apt)}>Accept</button>
                      <button style={{ padding: 11, background: C.redBg, color: C.red, border: `1px solid rgba(239,68,68,0.2)`, borderRadius: 12, fontSize: 13, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }} onClick={() => updateStatus(apt.id, 'rejected', apt)}>Reject</button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <button onClick={() => setShowWalkIn(true)} style={{ position: 'fixed', bottom: 90, right: 'calc(50% - 228px)', background: C.teal, border: 'none', borderRadius: 99, width: 58, height: 58, fontSize: 28, color: C.white, boxShadow: `0 0 0 1px rgba(255,255,255,0.1), 0 8px 32px ${C.tealGlow}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </>
      )}

      {/* PATIENTS */}
      {tab === 'patients' && (
        <>
          <div style={{ background: C.dark1, padding: '56px 20px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.white, letterSpacing: '-0.5px' }}>Patients</div>
            <div style={{ fontSize: 13, color: C.white40, marginTop: 4 }}>{patients.length} registered</div>
          </div>
          <div style={{ padding: 16 }}>
            <input style={{ ...inputStyle, marginBottom: 16 }} placeholder="Search patients..." value={searchPatient} onChange={e => setSearchPatient(e.target.value)} />
            {filteredPatients.length === 0
              ? <EmptyCard text="No patients yet" sub="Accept an appointment to register" />
              : filteredPatients.map(patient => (
                <div key={patient.id} style={{ background: C.dark2, borderRadius: 16, padding: 16, marginBottom: 10, border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => { setSelectedPatient(patient); fetchPrescriptions(patient.id); }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.white }}>{patient.name}{patient.age ? <span style={{ fontSize: 13, fontWeight: 400, color: C.white40 }}>, {patient.age} yrs</span> : ''}</div>
                    <div style={{ fontSize: 12, color: C.white40, marginTop: 4 }}>{patient.phone?.replace('whatsapp:+91', '+91 ')}</div>
                    <div style={{ fontSize: 12, color: C.white40, marginTop: 2 }}>Last visit {new Date(patient.last_visit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  <div style={{ background: C.tealLight, border: `1px solid rgba(8,145,178,0.2)`, borderRadius: 14, padding: '10px 14px', textAlign: 'center', minWidth: 52 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: C.teal }}>{patient.visit_count}</div>
                    <div style={{ fontSize: 10, color: C.white40, marginTop: 1 }}>visits</div>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {/* PRESCRIPTIONS */}
      {tab === 'prescriptions' && (
        <>
          <div style={{ background: C.dark1, padding: '56px 20px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.white, letterSpacing: '-0.5px' }}>Prescriptions</div>
            <div style={{ fontSize: 13, color: C.white40, marginTop: 4 }}>{allPrescriptions.length} total</div>
          </div>
          <div style={{ padding: 16 }}>
            {allPrescriptions.length === 0
              ? <EmptyCard text="No prescriptions yet" sub="Open a patient profile to create one" />
              : allPrescriptions.map(p => (
                <div key={p.id} style={{ background: C.dark2, borderRadius: 16, padding: 16, marginBottom: 10, border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.white }}>{p.patient_name}</div>
                    <div style={{ fontSize: 11, color: C.white40 }}>{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  {p.medicines.split('\n').map((line, i) => <div key={i} style={{ fontSize: 13, color: C.white60, padding: '4px 0', borderBottom: `1px solid ${C.border}`, lineHeight: 1.6 }}>{line}</div>)}
                  {p.notes && <div style={{ fontSize: 12, color: C.white40, fontStyle: 'italic', marginTop: 10 }}>{p.notes}</div>}
                </div>
              ))}
          </div>
        </>
      )}

      {/* MORE */}
      {tab === 'more' && (
        <>
          <div style={{ background: C.dark1, padding: '56px 20px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.white, letterSpacing: '-0.5px' }}>More</div>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ background: C.dark2, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}`, marginBottom: 16 }}>
              {[
                { label: 'Total appointments', value: appointments.length },
                { label: 'Accepted', value: appointments.filter(a => a.status === 'accepted').length },
                { label: 'Pending', value: pendingApts.length },
                { label: 'Rejected', value: appointments.filter(a => a.status === 'rejected').length },
                { label: 'Registered patients', value: patients.length },
                { label: 'Prescriptions written', value: allPrescriptions.length },
              ].map((item, i, arr) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ fontSize: 14, color: C.white60 }}>{item.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.white }}>{item.value}</div>
                </div>
              ))}
            </div>
            <button onClick={handleLogout} style={{ width: '100%', padding: 16, background: C.redBg, color: C.red, border: `1px solid rgba(239,68,68,0.2)`, borderRadius: 16, fontSize: 14, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }}>Sign out</button>
          </div>
        </>
      )}

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: C.dark2, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 50, paddingBottom: 8 }}>
        {[
          { key: 'today', label: 'Today', svg: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
          { key: 'patients', label: 'Patients', svg: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
          { key: 'prescriptions', label: 'Rx', svg: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
          { key: 'more', label: 'More', svg: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: '10px 0 6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: tab === t.key ? C.teal : C.white40 }}>
            {t.svg}
            <div style={{ fontSize: 10, fontWeight: tab === t.key ? 600 : 400, fontFamily: "'Poppins', sans-serif" }}>{t.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    accepted: { bg: 'rgba(34,197,94,0.12)', color: '#22C55E', label: 'Confirmed', border: 'rgba(34,197,94,0.2)' },
    rejected: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', label: 'Rejected', border: 'rgba(239,68,68,0.2)' },
    cancelled: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', label: 'Cancelled', border: 'rgba(255,255,255,0.1)' },
    pending: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: 'Pending', border: 'rgba(245,158,11,0.2)' },
  };
  const s = map[status] || map.pending;
  return <div style={{ background: s.bg, color: s.color, borderRadius: 99, padding: '5px 14px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', border: `1px solid ${s.border}` }}>{s.label}</div>;
}

function SectionLabel({ text }) {
  return <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.25)', marginBottom: 10, marginTop: 4 }}>{text}</div>;
}

function EmptyCard({ text, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20, marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>{text}</div>
      {sub && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>{sub}</div>}
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
ENDOFFILE
echo "done"