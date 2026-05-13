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

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchMedicines();
  }, []);

  async function fetchAppointments() {
    const { data } = await supabase
      .from('Appointments')
      .select('*')
      .order('created_at', { ascending: false });
    setAppointments(data || []);
  }

  async function fetchPatients() {
    const { data } = await supabase
      .from('patients')
      .select('*')
      .order('last_visit', { ascending: false });
    setPatients(data || []);
  }

  async function fetchMedicines() {
    const { data } = await supabase
      .from('medicines')
      .select('*')
      .order('name');
    setMedicines(data || []);
  }

  async function fetchPrescriptions(patientId) {
    const { data } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    setPrescriptions(data || []);
  }

  async function updateStatus(id, status, apt) {
    await supabase.from('Appointments').update({ status }).eq('id', id);
    if (status === 'accepted') {
      const { data: existing } = await supabase
        .from('patients').select('*').eq('phone', apt.phone).single();
      if (existing) {
        await supabase.from('patients').update({
          last_visit: new Date().toISOString(),
          visit_count: (existing.visit_count || 0) + 1
        }).eq('phone', apt.phone);
      } else {
        await supabase.from('patients').insert([{
          name: apt.name, phone: apt.phone,
          last_visit: new Date().toISOString(), visit_count: 1
        }]);
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

    await supabase.from('prescriptions').insert([{
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.name,
      patient_phone: selectedPatient.phone,
      medicines: medicineText,
      notes: notes
    }]);

    setShowPrescription(false);
    setSelectedMedicines([]);
    setNotes('');
    fetchPrescriptions(selectedPatient.id);
    alert('Prescription saved and will be sent to patient!');
  }

  // PRESCRIPTION BUILDER SCREEN
  if (showPrescription) {
    const filtered = medicines.filter(m =>
      m.name.toLowerCase().includes(searchMed.toLowerCase())
    );
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => setShowPrescription(false)} style={styles.backBtn}>← Back</button>
          <h1 style={styles.headerText}>New Prescription</h1>
          <p style={styles.headerSub}>Patient: {selectedPatient.name}</p>
        </div>

        <p style={styles.sectionTitle}>Search medicines</p>
        <input
          style={styles.searchInput}
          placeholder="Type medicine name..."
          value={searchMed}
          onChange={e => setSearchMed(e.target.value)}
        />

        <p style={styles.sectionTitle}>Select medicines</p>
        {filtered.map(med => {
          const selected = selectedMedicines.find(m => m.id === med.id);
          return (
            <div key={med.id} style={{
              ...styles.card,
              border: selected ? '1.5px solid #1a6b3c' : '1px solid #e0ddd5'
            }}>
              <div style={styles.cardTop}>
                <div>
                  <p style={styles.name}>{med.name} {med.dosage}</p>
                  <p style={styles.time}>{med.unit}</p>
                </div>
                <button
                  style={selected ? styles.selectedBtn : styles.selectBtn}
                  onClick={() => toggleMedicine(med)}
                >
                  {selected ? '✓ Selected' : '+ Select'}
                </button>
              </div>
              {selected && (
                <div style={styles.freqRow}>
                  <div style={styles.freqBox}>
                    <p style={styles.freqLabel}>Frequency</p>
                    <select
                      style={styles.select}
                      value={frequency[med.id]}
                      onChange={e => setFrequency(f => ({ ...f, [med.id]: e.target.value }))}
                    >
                      <option>once daily</option>
                      <option>twice daily</option>
                      <option>three times daily</option>
                      <option>at night</option>
                      <option>before food</option>
                      <option>after food</option>
                      <option>SOS</option>
                    </select>
                  </div>
                  <div style={styles.freqBox}>
                    <p style={styles.freqLabel}>Duration</p>
                    <select
                      style={styles.select}
                      value={duration[med.id]}
                      onChange={e => setDuration(d => ({ ...d, [med.id]: e.target.value }))}
                    >
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
            <p style={styles.sectionTitle}>Selected — {selectedMedicines.length} medicine(s)</p>
            <div style={styles.card}>
              {selectedMedicines.map(m => (
                <p key={m.id} style={styles.prescLine}>
                  • {m.name} {m.dosage} — {frequency[m.id]} for {duration[m.id]}
                </p>
              ))}
            </div>

            <p style={styles.sectionTitle}>Doctor notes (optional)</p>
            <textarea
              style={styles.textarea}
              placeholder="e.g. Take after food. Avoid cold water."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />

            <button style={styles.saveBtn} onClick={savePrescription}>
              Save & Send Prescription ✓
            </button>
          </>
        )}
      </div>
    );
  }

  // PATIENT DETAIL SCREEN
  if (selectedPatient) {
    const patientAppointments = appointments.filter(a => a.phone === selectedPatient.phone);
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => { setSelectedPatient(null); }} style={styles.backBtn}>← Back</button>
          <h1 style={styles.headerText}>{selectedPatient.name}</h1>
          <p style={styles.headerSub}>📱 {selectedPatient.phone?.replace('whatsapp:+91', '+91 ')}</p>
          <p style={styles.headerSub}>🏥 {selectedPatient.visit_count} visit(s)</p>
          <p style={styles.headerSub}>🕐 Last visit: {new Date(selectedPatient.last_visit).toLocaleDateString('en-IN')}</p>
        </div>

        <button style={styles.prescBtn} onClick={() => { fetchPrescriptions(selectedPatient.id); setShowPrescription(true); }}>
          + New Prescription
        </button>

        <p style={styles.sectionTitle}>Past Prescriptions</p>
        {prescriptions.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>No prescriptions yet</p>
          </div>
        ) : (
          prescriptions.map(p => (
            <div key={p.id} style={styles.card}>
              <p style={styles.name}>📋 {new Date(p.created_at).toLocaleDateString('en-IN')}</p>
              <p style={styles.prescLine}>{p.medicines}</p>
              {p.notes && <p style={styles.time}>Note: {p.notes}</p>}
            </div>
          ))
        )}

        <p style={styles.sectionTitle}>Visit History</p>
        {patientAppointments.map(apt => (
          <div key={apt.id} style={styles.card}>
            <p style={styles.name}>📅 {apt.time}</p>
            <p style={styles.time}>Booked: {new Date(apt.created_at).toLocaleDateString('en-IN')}</p>
            <div style={{
              ...styles.statusBadge,
              background: apt.status === 'accepted' ? '#e8f5ee' : '#fef2f2',
              display: 'inline-block', marginTop: 6
            }}>
              <p style={{
                ...styles.statusText,
                color: apt.status === 'accepted' ? '#1a6b3c' : '#b91c1c'
              }}>{apt.status}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerText}>Varcare</h1>
        <p style={styles.headerSub}>Doctor Dashboard</p>
      </div>

      <div style={styles.nav}>
        <button style={screen === 'appointments' ? styles.navBtnActive : styles.navBtn} onClick={() => setScreen('appointments')}>📋 Appointments</button>
        <button style={screen === 'patients' ? styles.navBtnActive : styles.navBtn} onClick={() => setScreen('patients')}>👥 Patients</button>
      </div>

      {screen === 'appointments' && (
        <>
          {appointments.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.emptyText}>No appointments yet</p>
              <p style={styles.emptySubText}>Patients who book via WhatsApp will appear here</p>
            </div>
          ) : (
            appointments.map(apt => (
              <div key={apt.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <p style={styles.name}>{apt.name}</p>
                    <p style={styles.time}>⏰ {apt.time}</p>
                    <p style={styles.phone}>📱 {apt.phone?.replace('whatsapp:+91', '+91 ')}</p>
                  </div>
                  <div style={{
                    ...styles.statusBadge,
                    background: apt.status === 'accepted' ? '#e8f5ee' :
                                apt.status === 'rejected' ? '#fef2f2' : '#fef3e2'
                  }}>
                    <p style={{
                      ...styles.statusText,
                      color: apt.status === 'accepted' ? '#1a6b3c' :
                             apt.status === 'rejected' ? '#b91c1c' : '#b45309'
                    }}>{apt.status || 'pending'}</p>
                  </div>
                </div>
                {(!apt.status || apt.status === 'pending') && (
                  <div style={styles.btnRow}>
                    <button style={styles.acceptBtn} onClick={() => updateStatus(apt.id, 'accepted', apt)}>✓ Accept</button>
                    <button style={styles.rejectBtn} onClick={() => updateStatus(apt.id, 'rejected', apt)}>✗ Reject</button>
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}

      {screen === 'patients' && (
        <>
          <p style={styles.sectionTitle}>{patients.length} patients registered</p>
          {patients.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.emptyText}>No patients yet</p>
              <p style={styles.emptySubText}>Accept an appointment to add a patient</p>
            </div>
          ) : (
            patients.map(patient => (
              <div key={patient.id} style={styles.card} onClick={() => { setSelectedPatient(patient); fetchPrescriptions(patient.id); }}>
                <div style={styles.cardTop}>
                  <div>
                    <p style={styles.name}>{patient.name}</p>
                    <p style={styles.time}>📱 {patient.phone?.replace('whatsapp:+91', '+91 ')}</p>
                    <p style={styles.phone}>🕐 Last visit: {new Date(patient.last_visit).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div style={styles.visitBadge}>
                    <p style={styles.visitCount}>{patient.visit_count}</p>
                    <p style={styles.visitLabel}>visit(s)</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 480, margin: '0 auto', padding: 16, fontFamily: 'sans-serif', background: '#f7f6f2', minHeight: '100vh' },
  header: { background: '#1a6b3c', borderRadius: 14, padding: '20px 16px', marginBottom: 16 },
  headerText: { color: '#fff', margin: 0, fontSize: 24, fontWeight: 700 },
  headerSub: { color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontSize: 13 },
  backBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer', marginBottom: 8 },
  nav: { display: 'flex', gap: 8, marginBottom: 16 },
  navBtn: { flex: 1, padding: '10px 0', background: '#fff', border: '0.5px solid #e0ddd5', borderRadius: 10, fontSize: 14, cursor: 'pointer', color: '#6b7080' },
  navBtnActive: { flex: 1, padding: '10px 0', background: '#1a6b3c', border: 'none', borderRadius: 10, fontSize: 14, cursor: 'pointer', color: '#fff', fontWeight: 600 },
  sectionTitle: { fontSize: 13, color: '#6b7080', marginBottom: 10, fontWeight: 500 },
  empty: { background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', marginTop: 20 },
  emptyText: { fontSize: 18, fontWeight: 600, color: '#0f1117', margin: 0 },
  emptySubText: { fontSize: 13, color: '#6b7080', marginTop: 8 },
  card: { background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name: { fontSize: 16, fontWeight: 600, color: '#0f1117', margin: '0 0 4px' },
  time: { fontSize: 13, color: '#3a3d4a', margin: '0 0 2px' },
  phone: { fontSize: 13, color: '#6b7080', margin: 0 },
  statusBadge: { padding: '4px 12px', borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: 500, margin: 0, textTransform: 'capitalize' },
  btnRow: { display: 'flex', gap: 8 },
  acceptBtn: { flex: 1, padding: '10px 0', background: '#e8f5ee', color: '#1a6b3c', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  rejectBtn: { flex: 1, padding: '10px 0', background: '#fef2f2', color: '#b91c1c', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  visitBadge: { background: '#e8f5ee', borderRadius: 10, padding: '8px 12px', textAlign: 'center', minWidth: 50 },
  visitCount: { fontSize: 20, fontWeight: 700, color: '#1a6b3c', margin: 0 },
  visitLabel: { fontSize: 11, color: '#1a6b3c', margin: 0 },
  prescBtn: { width: '100%', padding: '12px 0', background: '#1a6b3c', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 16 },
  searchInput: { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e0ddd5', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' },
  freqRow: { display: 'flex', gap: 8, marginTop: 8 },
  freqBox: { flex: 1 },
  freqLabel: { fontSize: 11, color: '#6b7080', margin: '0 0 4px' },
  select: { width: '100%', padding: '6px 8px', borderRadius: 8, border: '1px solid #e0ddd5', fontSize: 13 },
  prescLine: { fontSize: 13, color: '#3a3d4a', margin: '4px 0', lineHeight: 1.6 },
  textarea: { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e0ddd5', fontSize: 14, minHeight: 80, boxSizing: 'border-box', marginBottom: 12 },
  saveBtn: { width: '100%', padding: '14px 0', background: '#1a6b3c', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 32 },
};