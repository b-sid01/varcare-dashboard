import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://asueiylnppjxlpbmzxmz.supabase.co',
  'sb_publishable_URPMSXfHCT9qbM_IZXx8kg_gg9XWSsK'
);

const G = {
  bg: '#F7F8F5',
  card: '#FFFFFF',
  green: '#1B6B3A',
  greenLight: '#EAF3EE',
  greenMid: '#2D8653',
  text: '#111714',
  textSoft: '#4A5450',
  textMuted: '#8A9690',
  border: '#E4EBE7',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  red: '#DC2626',
  redLight: '#FEE2E2',
  shadow: '0 1px 3px rgba(27,107,58,0.06), 0 4px 16px rgba(27,107,58,0.06)',
};

const css = `
 @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
  body { background: ${G.bg}; font-family: 'Poppins', sans-serif; }
  button { font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s ease; }
  button:active { transform: scale(0.97); }
  input, select, textarea { font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${G.border}; border-radius: 4px; }
`;

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

  // PRESCRIPTION SCREEN
  if (showPrescription) {
    const filtered = medicines.filter(m => m.name.toLowerCase().includes(searchMed.toLowerCase()));
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: G.bg }}>
        <style>{css}</style>
        <div style={{ background: G.green, padding: '20px 20px 24px', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => setShowPrescription(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>← Back</button>
          <div style={{ fontFamily: 'Fraunces', fontSize: 22, color: '#fff', fontWeight: 600 }}>New Prescription</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 }}>
            {selectedPatient.name}{selectedPatient.age ? `, ${selectedPatient.age} yrs` : ''}
          </div>
        </div>

        <div style={{ padding: '20px 16px' }}>
          <input
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${G.border}`, fontSize: 14, background: '#fff', color: G.text, outline: 'none', marginBottom: 16 }}
            placeholder="🔍  Search medicines..."
            value={searchMed}
            onChange={e => setSearchMed(e.target.value)}
          />

          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: G.textMuted, textTransform: 'uppercase', marginBottom: 10 }}>Select Medicines</div>

          {filtered.map(med => {
            const selected = selectedMedicines.find(m => m.id === med.id);
            return (
              <div key={med.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, border: selected ? `2px solid ${G.green}` : `1px solid ${G.border}`, boxShadow: selected ? `0 0 0 4px ${G.greenLight}` : G.shadow, transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: G.text }}>{med.name} <span style={{ color: G.textMuted, fontWeight: 400 }}>{med.dosage}</span></div>
                    <div style={{ fontSize: 12, color: G.textMuted, marginTop: 2, textTransform: 'capitalize' }}>{med.unit}</div>
                  </div>
                  <button onClick={() => toggleMedicine(med)} style={{ background: selected ? G.green : G.greenLight, color: selected ? '#fff' : G.green, border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600 }}>
                    {selected ? '✓ Added' : '+ Add'}
                  </button>
                </div>
                {selected && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${G.border}` }}>
                    <div>
                      <div style={{ fontSize: 11, color: G.textMuted, marginBottom: 6, fontWeight: 500 }}>Frequency</div>
                      <select value={frequency[med.id]} onChange={e => setFrequency(f => ({ ...f, [med.id]: e.target.value }))} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${G.border}`, fontSize: 13, color: G.text, background: G.bg }}>
                        <option>once daily</option>
                        <option>twice daily</option>
                        <option>three times daily</option>
                        <option>at night</option>
                        <option>before food</option>
                        <option>after food</option>
                        <option>SOS</option>
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: G.textMuted, marginBottom: 6, fontWeight: 500 }}>Duration</div>
                      <select value={duration[med.id]} onChange={e => setDuration(d => ({ ...d, [med.id]: e.target.value }))} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${G.border}`, fontSize: 13, color: G.text, background: G.bg }}>
                        <option>3 days</option>
                        <option>5 days</option>
                        <option>7 days</option>
                        <option>10 days</option>
                        <option>14 days</option>
                        <option>1 month</option>
                        <option>3 months</option>
                        <option>ongoing</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {selectedMedicines.length > 0 && (
            <>
              <div style={{ background: G.greenLight, borderRadius: 14, padding: 16, margin: '16px 0', border: `1px solid rgba(27,107,58,0.15)` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: G.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Selected — {selectedMedicines.length} medicine(s)</div>
                {selectedMedicines.map(m => (
                  <div key={m.id} style={{ fontSize: 13, color: G.text, padding: '4px 0', borderBottom: `1px solid rgba(27,107,58,0.1)`, lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 600 }}>{m.name} {m.dosage}</span> — {frequency[m.id]} for {duration[m.id]}
                  </div>
                ))}
              </div>

              <textarea
                style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${G.border}`, fontSize: 14, minHeight: 90, resize: 'none', background: '#fff', color: G.text, outline: 'none', marginBottom: 16 }}
                placeholder="Doctor's notes (optional) — e.g. Take after food, avoid cold drinks"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />

              <button onClick={savePrescription} style={{ width: '100%', padding: '16px', background: G.green, color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 600, letterSpacing: '0.01em' }}>
                Save Prescription ✓
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // PATIENT DETAIL SCREEN
  if (selectedPatient) {
    const patientApts = appointments.filter(a => a.phone === selectedPatient.phone);
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: G.bg }}>
        <style>{css}</style>
        <div style={{ background: G.green, padding: '20px 20px 28px' }}>
          <button onClick={() => setSelectedPatient(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: 13, marginBottom: 16 }}>← Back</button>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'Fraunces', fontSize: 26, color: '#fff', fontWeight: 600, lineHeight: 1.2 }}>{selectedPatient.name}</div>
              {selectedPatient.age && <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 6 }}>Age {selectedPatient.age}</div>}
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 3 }}>{selectedPatient.phone?.replace('whatsapp:+91', '+91 ')}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 16px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Fraunces', fontSize: 24, color: '#fff', fontWeight: 700 }}>{selectedPatient.visit_count}</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 }}>visits</div>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 10 }}>
            Last visit {new Date(selectedPatient.last_visit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>

        <div style={{ padding: '20px 16px' }}>
          <button onClick={() => { fetchPrescriptions(selectedPatient.id); setShowPrescription(true); }} style={{ width: '100%', padding: '14px', background: G.green, color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 600, marginBottom: 24 }}>
            + New Prescription
          </button>

          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: G.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>Past Prescriptions</div>
          {prescriptions.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 14, padding: '24px', textAlign: 'center', border: `1px dashed ${G.border}`, marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: G.textMuted }}>No prescriptions yet</div>
            </div>
          ) : prescriptions.map(p => (
            <div key={p.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, boxShadow: G.shadow }}>
              <div style={{ fontSize: 12, color: G.green, fontWeight: 600, marginBottom: 8 }}>
                📋 {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              {p.medicines.split('\n').map((line, i) => (
                <div key={i} style={{ fontSize: 13, color: G.textSoft, padding: '4px 0', borderBottom: i < p.medicines.split('\n').length - 1 ? `1px solid ${G.border}` : 'none', lineHeight: 1.6 }}>{line}</div>
              ))}
              {p.notes && <div style={{ marginTop: 10, fontSize: 12, color: G.textMuted, fontStyle: 'italic', paddingTop: 10, borderTop: `1px solid ${G.border}` }}>Note: {p.notes}</div>}
            </div>
          ))}

          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: G.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>Visit History</div>
          {patientApts.map(apt => (
            <div key={apt.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, boxShadow: G.shadow, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: G.text }}>{apt.time}</div>
                <div style={{ fontSize: 12, color: G.textMuted, marginTop: 3 }}>{new Date(apt.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
              </div>
              <StatusBadge status={apt.status} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // MAIN SCREEN
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: G.bg }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ background: G.green, padding: '28px 20px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'Fraunces', fontSize: 28, color: '#fff', fontWeight: 700, letterSpacing: '-0.02em' }}>Varcare</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>Good {getTimeOfDay()}, Doctor 👋</div>
          </div>
          {pending > 0 && (
            <div style={{ background: G.amber, borderRadius: 20, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, background: '#fff', borderRadius: '50%' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{pending} pending</span>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 20 }}>
          {[
            { label: 'Total', value: appointments.length },
            { label: 'Accepted', value: appointments.filter(a => a.status === 'accepted').length },
            { label: 'Patients', value: patients.length },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontFamily: 'Fraunces', fontSize: 22, color: '#fff', fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav tabs */}
      <div style={{ background: '#fff', padding: '4px', margin: '16px 16px 0', borderRadius: 14, display: 'flex', boxShadow: G.shadow }}>
        {[['appointments', '📋 Appointments'], ['patients', '👥 Patients']].map(([key, label]) => (
          <button key={key} onClick={() => setScreen(key)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: screen === key ? 600 : 400, background: screen === key ? G.green : 'transparent', color: screen === key ? '#fff' : G.textMuted, transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: G.textMuted }}>Loading...</div>
        ) : screen === 'appointments' ? (
          <>
            {appointments.length === 0 ? (
              <EmptyState text="No appointments yet" sub="Patients who book via WhatsApp will appear here" />
            ) : appointments.map(apt => (
              <div key={apt.id} style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, boxShadow: G.shadow, border: `1px solid ${G.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: apt.status && apt.status !== 'pending' ? 0 : 14 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: G.text, fontFamily: 'Fraunces' }}>
                      {apt.name}{apt.age ? <span style={{ fontFamily: 'DM Sans', fontWeight: 400, fontSize: 13, color: G.textMuted }}>, {apt.age} yrs</span> : ''}
                    </div>
                    <div style={{ fontSize: 13, color: G.textSoft, marginTop: 4 }}>⏰ {apt.time}</div>
                    <div style={{ fontSize: 12, color: G.textMuted, marginTop: 2 }}>{apt.phone?.replace('whatsapp:+91', '+91 ')}</div>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
                {(!apt.status || apt.status === 'pending') && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button onClick={() => updateStatus(apt.id, 'accepted', apt)} style={{ padding: '10px', background: G.greenLight, color: G.green, border: `1px solid rgba(27,107,58,0.2)`, borderRadius: 10, fontSize: 14, fontWeight: 600 }}>✓ Accept</button>
                    <button onClick={() => updateStatus(apt.id, 'rejected', apt)} style={{ padding: '10px', background: G.redLight, color: G.red, border: `1px solid rgba(220,38,38,0.2)`, borderRadius: 10, fontSize: 14, fontWeight: 600 }}>✗ Reject</button>
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          <>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: G.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>{patients.length} Patients Registered</div>
            {patients.length === 0 ? (
              <EmptyState text="No patients yet" sub="Accept an appointment to register a patient" />
            ) : patients.map(patient => (
              <div key={patient.id} onClick={() => { setSelectedPatient(patient); fetchPrescriptions(patient.id); }} style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, boxShadow: G.shadow, border: `1px solid ${G.border}`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: G.text, fontFamily: 'Fraunces' }}>
                    {patient.name}{patient.age ? <span style={{ fontFamily: 'DM Sans', fontWeight: 400, fontSize: 13, color: G.textMuted }}>, {patient.age} yrs</span> : ''}
                  </div>
                  <div style={{ fontSize: 12, color: G.textMuted, marginTop: 4 }}>{patient.phone?.replace('whatsapp:+91', '+91 ')}</div>
                  <div style={{ fontSize: 12, color: G.textMuted, marginTop: 2 }}>Last visit {new Date(patient.last_visit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                </div>
                <div style={{ background: G.greenLight, borderRadius: 12, padding: '10px 14px', textAlign: 'center', minWidth: 52 }}>
                  <div style={{ fontFamily: 'Fraunces', fontSize: 20, fontWeight: 700, color: G.green }}>{patient.visit_count}</div>
                  <div style={{ fontSize: 10, color: G.green, marginTop: 1 }}>visit{patient.visit_count > 1 ? 's' : ''}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    accepted: { bg: '#EAF3EE', color: '#1B6B3A', label: 'Accepted' },
    rejected: { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected' },
    cancelled: { bg: '#F3F4F6', color: '#6B7280', label: 'Cancelled' },
    pending: { bg: '#FEF3C7', color: '#D97706', label: 'Pending' },
  };
  const s = map[status] || map.pending;
  return (
    <div style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>{s.label}</div>
  );
}

function EmptyState({ text, sub }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '40px 20px', textAlign: 'center', border: `1px dashed #E4EBE7` }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🏥</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#111714', marginBottom: 6 }}>{text}</div>
      <div style={{ fontSize: 13, color: '#8A9690' }}>{sub}</div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}