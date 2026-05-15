import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://asueiylnppjxlpbmzxmz.supabase.co',
  'sb_publishable_URPMSXfHCT9qbM_IZXx8kg_gg9XWSsK'
);

export default function App() {
  const [screen, setScreen] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showPrescription, setShowPrescription] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [notes, setNotes] = useState('');
  const [frequency, setFrequency] = useState({});
  const [duration, setDuration] = useState({});
  const [searchMed, setSearchMed] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAppointments(), fetchPatients(), fetchMedicines()])
      .finally(() => setLoading(false));
  }, []);

  async function fetchAppointments() {
    const { data } = await supabase.from('Appointments').select('*').order('created_at', { ascending: false });
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
  async function fetchPrescriptions(patientId) {
    const { data } = await supabase.from('prescriptions').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
    setPrescriptions(data || []);
  }
  async function updateStatus(id, status, apt) {
    await supabase.from('Appointments').update({ status }).eq('id', id);
    if (status === 'accepted') {
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
    await supabase.from('prescriptions').insert([{ patient_id: selectedPatient.id, patient_name: selectedPatient.name, patient_phone: selectedPatient.phone, medicines: medicineText, notes }]);
    setShowPrescription(false);
    setSelectedMedicines([]);
    setNotes('');
    fetchPrescriptions(selectedPatient.id);
    alert('Prescription saved!');
  }

  const pending = appointments.filter(a => !a.status || a.status === 'pending').length;
  const S = st;

  // PRESCRIPTION SCREEN
  if (showPrescription) {
    const filtered = medicines.filter(m => m.name.toLowerCase().includes(searchMed.toLowerCase()));
    return (
      <div style={S.page}>
        <div style={S.header}>
          <button onClick={() => setShowPrescription(false)} style={S.backBtn}>← Back</button>
          <div style={S.headerTitle}>New Prescription</div>
          <div style={S.headerSub}>{selectedPatient.name}{selectedPatient.age ? `, ${selectedPatient.age} yrs` : ''}</div>
        </div>
        <div style={S.body}>
          <input style={S.searchInput} placeholder="Search medicines..." value={searchMed} onChange={e => setSearchMed(e.target.value)} />
          <Label text="MEDICINES" />
          {filtered.map(med => {
            const sel = selectedMedicines.find(m => m.id === med.id);
            return (
              <div key={med.id} style={{ ...S.card, outline: sel ? '2px solid #111' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={S.medName}>{med.name} <span style={S.medDose}>{med.dosage}</span></div>
                    <div style={S.metaText}>{med.unit}</div>
                  </div>
                  <button onClick={() => toggleMedicine(med)} style={sel ? S.pillBtnDark : S.pillBtnLight}>
                    {sel ? 'Added' : 'Add'}
                  </button>
                </div>
                {sel && (
                  <div style={S.freqGrid}>
                    <div>
                      <div style={S.freqLabel}>Frequency</div>
                      <select style={S.select} value={frequency[med.id]} onChange={e => setFrequency(f => ({ ...f, [med.id]: e.target.value }))}>
                        <option>once daily</option><option>twice daily</option><option>three times daily</option>
                        <option>at night</option><option>before food</option><option>after food</option><option>SOS</option>
                      </select>
                    </div>
                    <div>
                      <div style={S.freqLabel}>Duration</div>
                      <select style={S.select} value={duration[med.id]} onChange={e => setDuration(d => ({ ...d, [med.id]: e.target.value }))}>
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
              <div style={S.summaryBox}>
                <Label text={`SELECTED — ${selectedMedicines.length}`} />
                {selectedMedicines.map(m => (
                  <div key={m.id} style={S.summaryLine}>
                    <b>{m.name} {m.dosage}</b> — {frequency[m.id]} for {duration[m.id]}
                  </div>
                ))}
              </div>
              <textarea style={S.textarea} placeholder="Doctor notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
              <button style={S.primaryBtn} onClick={savePrescription}>Save Prescription</button>
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
      <div style={S.page}>
        <div style={S.header}>
          <button onClick={() => setSelectedPatient(null)} style={S.backBtn}>← Back</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 10 }}>
            <div>
              <div style={S.headerTitle}>{selectedPatient.name}</div>
              {selectedPatient.age && <div style={S.headerSub}>Age {selectedPatient.age}</div>}
              <div style={S.headerSub}>{selectedPatient.phone?.replace('whatsapp:+91', '+91 ')}</div>
            </div>
            <div style={S.visitBadge}>
              <div style={S.visitNum}>{selectedPatient.visit_count}</div>
              <div style={S.visitLabel}>visits</div>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 10, fontWeight: 300 }}>
            Last visit {new Date(selectedPatient.last_visit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div style={S.body}>
          <button style={S.primaryBtn} onClick={() => { fetchPrescriptions(selectedPatient.id); setShowPrescription(true); }}>
            + New Prescription
          </button>
          <Label text="PAST PRESCRIPTIONS" />
          {prescriptions.length === 0
            ? <div style={S.emptySmall}>No prescriptions yet</div>
            : prescriptions.map(p => (
              <div key={p.id} style={S.card}>
                <div style={S.prescDate}>{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                {p.medicines.split('\n').map((line, i) => <div key={i} style={S.prescLine}>{line}</div>)}
                {p.notes && <div style={S.prescNote}>{p.notes}</div>}
              </div>
            ))}
          <Label text="VISIT HISTORY" />
          {patientApts.map(apt => (
            <div key={apt.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={S.aptName}>{apt.time}</div>
                <div style={S.metaText}>{new Date(apt.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
              </div>
              <StatusPill status={apt.status} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // MAIN SCREEN
  return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={S.logo}>Varcare</div>
            <div style={S.greeting}>Good {getTimeOfDay()}, Doctor</div>
          </div>
          {pending > 0 && (
            <div style={S.pendingPill}>
              <span style={S.pendingDot} />
              {pending} pending
            </div>
          )}
        </div>
        <div style={S.statsRow}>
          {[
            { label: 'Total', value: appointments.length },
            { label: 'Accepted', value: appointments.filter(a => a.status === 'accepted').length },
            { label: 'Patients', value: patients.length },
          ].map(stat => (
            <div key={stat.label} style={S.statBox}>
              <div style={S.statNum}>{stat.value}</div>
              <div style={S.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.tabRow}>
        {[['appointments', 'Appointments'], ['patients', 'Patients']].map(([key, label]) => (
          <button key={key} onClick={() => setScreen(key)} style={screen === key ? S.tabActive : S.tab}>
            {label}
          </button>
        ))}
      </div>

      <div style={S.body}>
        {loading ? <div style={S.loadingText}>Loading...</div>
        : screen === 'appointments' ? (
          appointments.length === 0
            ? <EmptyState text="No appointments yet" sub="Patients who book via WhatsApp will appear here" />
            : appointments.map(apt => (
              <div key={apt.id} style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: (!apt.status || apt.status === 'pending') ? 14 : 0 }}>
                  <div>
                    <div style={S.aptName}>
                      {apt.name}
                      {apt.age ? <span style={S.aptAge}>, {apt.age} yrs</span> : ''}
                    </div>
                    <div style={S.aptTime}>{apt.time}</div>
                    <div style={S.metaText}>{apt.phone?.replace('whatsapp:+91', '+91 ')}</div>
                  </div>
                  <StatusPill status={apt.status} />
                </div>
                {(!apt.status || apt.status === 'pending') && (
                  <div style={S.btnRow}>
                    <button style={S.acceptBtn} onClick={() => updateStatus(apt.id, 'accepted', apt)}>Accept</button>
                    <button style={S.rejectBtn} onClick={() => updateStatus(apt.id, 'rejected', apt)}>Reject</button>
                  </div>
                )}
              </div>
            ))
        ) : (
          <>
            <Label text={`${patients.length} PATIENTS REGISTERED`} />
            {patients.length === 0
              ? <EmptyState text="No patients yet" sub="Accept an appointment to register a patient" />
              : patients.map(patient => (
                <div key={patient.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => { setSelectedPatient(patient); fetchPrescriptions(patient.id); }}>
                  <div>
                    <div style={S.aptName}>
                      {patient.name}
                      {patient.age ? <span style={S.aptAge}>, {patient.age} yrs</span> : ''}
                    </div>
                    <div style={S.metaText}>{patient.phone?.replace('whatsapp:+91', '+91 ')}</div>
                    <div style={S.metaText}>Last visit {new Date(patient.last_visit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  <div style={S.visitBadge}>
                    <div style={S.visitNum}>{patient.visit_count}</div>
                    <div style={S.visitLabel}>visits</div>
                  </div>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    accepted: { bg: '#DCFCE7', color: '#15803D', label: 'Accepted' },
    rejected: { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected' },
    cancelled: { bg: '#F3F4F6', color: '#6B7280', label: 'Cancelled' },
    pending:   { bg: '#FEF9C3', color: '#A16207', label: 'Pending' },
  };
  const s = map[status] || map.pending;
  return (
    <div style={{ background: s.bg, color: s.color, borderRadius: 99, padding: '5px 14px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>
      {s.label}
    </div>
  );
}

function Label({ text }) {
  return <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: '#AAAAAA', marginBottom: 10, marginTop: 4 }}>{text}</div>;
}

function EmptyState({ text, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', border: '1.5px dashed #E4E4E4', borderRadius: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 6 }}>{text}</div>
      <div style={{ fontSize: 13, color: '#AAAAAA', lineHeight: 1.6 }}>{sub}</div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const st = {
  page: {
    maxWidth: 480,
    margin: '0 auto',
    minHeight: '100vh',
    background: '#F2F2F2',
    fontFamily: "'Poppins', sans-serif",
  },
  header: {
    background: '#111111',
    borderRadius: '0 0 28px 28px',
    padding: '32px 22px 26px',
  },
  logo: {
    fontSize: 30,
    fontWeight: 700,
    color: '#FFFFFF',
    letterSpacing: '-1px',
    fontFamily: "'Poppins', sans-serif",
  },
  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 4,
    fontWeight: 300,
  },
  pendingPill: {
    background: '#F59E0B',
    borderRadius: 99,
    padding: '7px 16px',
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: 7,
  },
  pendingDot: {
    width: 7,
    height: 7,
    background: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 10,
    marginTop: 22,
  },
  statBox: {
    background: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: '16px 14px',
  },
  statNum: {
    fontSize: 26,
    fontWeight: 700,
    color: '#FFFFFF',
    letterSpacing: '-0.5px',
    fontFamily: "'Poppins', sans-serif",
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 3,
    fontWeight: 400,
  },
  tabRow: {
    display: 'flex',
    background: '#fff',
    margin: '18px 16px 0',
    borderRadius: 16,
    padding: 5,
    gap: 5,
    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    padding: '11px 0',
    border: 'none',
    background: 'transparent',
    fontSize: 13,
    fontWeight: 500,
    color: '#AAAAAA',
    borderRadius: 12,
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    flex: 1,
    padding: '11px 0',
    border: 'none',
    background: '#111',
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
    borderRadius: 12,
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  body: { padding: '16px' },
  card: {
    background: '#FFFFFF',
    borderRadius: 20,
    padding: '18px 16px',
    marginBottom: 10,
    boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
  },
  aptName: {
    fontSize: 15,
    fontWeight: 600,
    color: '#111',
    marginBottom: 5,
    fontFamily: "'Poppins', sans-serif",
  },
  aptAge: {
    fontSize: 13,
    fontWeight: 400,
    color: '#AAAAAA',
  },
  aptTime: {
    fontSize: 13,
    color: '#444',
    marginBottom: 3,
    fontWeight: 400,
  },
  metaText: {
    fontSize: 12,
    color: '#BBBBBB',
    marginTop: 2,
  },
  btnRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  acceptBtn: {
    padding: '11px',
    background: '#DCFCE7',
    color: '#15803D',
    border: 'none',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
    letterSpacing: '0.01em',
  },
  rejectBtn: {
    padding: '11px',
    background: '#FEE2E2',
    color: '#DC2626',
    border: 'none',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
    letterSpacing: '0.01em',
  },
  visitBadge: {
    background: '#111',
    borderRadius: 16,
    padding: '12px 16px',
    textAlign: 'center',
    minWidth: 60,
  },
  visitNum: {
    fontSize: 22,
    fontWeight: 700,
    color: '#fff',
    fontFamily: "'Poppins', sans-serif",
  },
  visitLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  backBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: '#fff',
    padding: '7px 16px',
    borderRadius: 99,
    fontSize: 12,
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-0.3px',
    fontFamily: "'Poppins', sans-serif",
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  primaryBtn: {
    width: '100%',
    padding: '15px',
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 16,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
    marginBottom: 20,
    letterSpacing: '0.01em',
  },
  searchInput: {
    width: '100%',
    padding: '13px 16px',
    borderRadius: 14,
    border: '1px solid #E8E8E8',
    fontSize: 14,
    fontFamily: "'Poppins', sans-serif",
    background: '#fff',
    color: '#111',
    outline: 'none',
    marginBottom: 16,
    boxSizing: 'border-box',
  },
  medName: { fontSize: 14, fontWeight: 600, color: '#111' },
  medDose: { fontWeight: 400, color: '#999', fontSize: 13 },
  pillBtnLight: {
    background: '#F2F2F2',
    border: 'none',
    borderRadius: 99,
    padding: '7px 16px',
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
    color: '#444',
  },
  pillBtnDark: {
    background: '#111',
    border: 'none',
    borderRadius: 99,
    padding: '7px 16px',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
    color: '#fff',
  },
  freqGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTop: '1px solid #F0F0F0',
  },
  freqLabel: {
    fontSize: 10,
    color: '#AAA',
    fontWeight: 500,
    marginBottom: 6,
    letterSpacing: '0.06em',
  },
  select: {
    width: '100%',
    padding: '9px 10px',
    borderRadius: 10,
    border: '1px solid #E8E8E8',
    fontSize: 12,
    fontFamily: "'Poppins', sans-serif",
    color: '#111',
    background: '#fff',
  },
  summaryBox: {
    background: '#F9F9F9',
    borderRadius: 16,
    padding: '16px',
    marginBottom: 14,
    border: '1px solid #EFEFEF',
  },
  summaryLine: {
    fontSize: 13,
    color: '#111',
    padding: '6px 0',
    borderBottom: '1px solid #EFEFEF',
    lineHeight: 1.6,
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 14,
    border: '1px solid #E8E8E8',
    fontSize: 13,
    fontFamily: "'Poppins', sans-serif",
    minHeight: 90,
    resize: 'none',
    background: '#fff',
    color: '#111',
    outline: 'none',
    marginBottom: 14,
    boxSizing: 'border-box',
  },
  prescDate: {
    fontSize: 11,
    fontWeight: 600,
    color: '#AAA',
    letterSpacing: '0.06em',
    marginBottom: 10,
  },
  prescLine: {
    fontSize: 13,
    color: '#333',
    padding: '5px 0',
    borderBottom: '1px solid #F5F5F5',
    lineHeight: 1.6,
  },
  prescNote: {
    fontSize: 12,
    color: '#AAA',
    fontStyle: 'italic',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1px solid #F5F5F5',
  },
  emptySmall: {
    textAlign: 'center',
    padding: '24px',
    fontSize: 13,
    color: '#AAA',
    background: '#F9F9F9',
    borderRadius: 14,
    marginBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
    padding: 40,
    color: '#AAA',
    fontSize: 14,
  },
};