import React, {useEffect, useState} from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Stat({label, value, color}){
  return (
    <div className="card" style={{padding:12,display:'flex',flexDirection:'column',gap:6}}>
      <div style={{fontSize:12,color:'#475569'}}>{label}</div>
      <div style={{fontSize:20,fontWeight:700,color:color || '#0b1220'}}>{value}</div>
    </div>
  )
}

function Row({r, onAction}){
  const n = r.normalized || {}
  let scope = 'Scope 3'
  if(r.source_type === 'utility') scope = 'Scope 2'
  if(r.source_type === 'sap') scope = 'Scope 1'

  let suspicious = false
  if(n.reading_kwh && n.reading_kwh > 10000) suspicious = true
  if(n.quantity_kwh && n.quantity_kwh > 10000) suspicious = true
  if(n.distance_km && n.distance_km > 20000) suspicious = true

  return (
    <div className="card" style={{marginBottom:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:14}}><strong>{r.source_type.toUpperCase()}</strong> <small style={{color:'#64748b'}}>#{r.id}</small></div>
          <div style={{fontSize:12,color:'#475569'}}>{r.received_at ? new Date(r.received_at).toLocaleString() : ''}</div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {suspicious && <div style={{color:'#b45309',fontWeight:700}}>⚠ Suspicious</div>}
          <span className={`badge ${r.status.toLowerCase()}`}>{r.status}</span>
        </div>
      </div>

      <div style={{marginTop:8}}>
        <div style={{marginBottom:8,fontSize:12,color:'#64748b'}}>Source: <span style={{fontWeight:700}}>{r.source_file_filename || r.source_type}</span></div>
        <div style={{marginBottom:8,fontSize:12,color:'#64748b'}}>Uploaded by: <span style={{fontWeight:700}}>{r.approved_by || 'uploader'}</span> • Approved at: <span style={{fontWeight:700}}>{r.approved_at ? new Date(r.approved_at).toLocaleString() : '-'}</span></div>
        {r.source_type === 'utility' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div><strong>Meter:</strong> {n.meter_id}</div>
            <div><strong>Period:</strong> {n.start_date} → {n.end_date}</div>
            <div><strong>Usage:</strong> {n.reading_kwh} kWh</div>
            <div><strong>Scope:</strong> <span className="badge pending">{scope}</span></div>
          </div>
        )}

        {r.source_type === 'sap' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div><strong>Date:</strong> {n.date}</div>
            <div><strong>Plant:</strong> {n.plant_code}</div>
            <div><strong>Quantity:</strong> {n.quantity} {n.unit}</div>
            <div><strong>Quantity (kWh equiv):</strong> {n.quantity_kwh || '-'}</div>
          </div>
        )}

        {r.source_type === 'travel' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div><strong>Trip:</strong> {n.trip_id}</div>
            <div><strong>Employee:</strong> {n.employee_id}</div>
            <div><strong>Route:</strong> {n.from} → {n.to}</div>
            <div><strong>Distance:</strong> {n.distance_km ? n.distance_km + ' km' : '-'}</div>
          </div>
        )}
      </div>

      <div style={{marginTop:8,display:'flex',gap:8}}>
        {r.status==='PENDING' && (
          <>
            <button className="btn btn-primary" onClick={()=>onAction(r.id,'approve')}>Approve</button>
            <button className="btn" onClick={()=>onAction(r.id,'reject')}>Reject</button>
          </>
        )}
      </div>
    </div>
  )
}

export default function Dashboard(){
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('ALL')

  async function fetchRows(){
    const res = await fetch(`${API_BASE}/api/rows/`)
    const data = await res.json()
    setRows(data)
  }

  useEffect(()=>{fetchRows()}, [])

  async function onAction(id, action){
    await fetch(`${API_BASE}/api/rows/${id}/action/`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action, actor: 'demo-analyst'})})
    fetchRows()
  }

  const filtered = rows.filter(r=> filter==='ALL' ? true : r.status===filter)

  const total = rows.length
  const approved = rows.filter(r=> r.status==='APPROVED').length
  const rejected = rows.filter(r=> r.status==='REJECTED').length
  const suspicious = rows.filter(r=> {
    const n = r.normalized || {}
    return (n.reading_kwh && n.reading_kwh > 10000) || (n.quantity_kwh && n.quantity_kwh > 10000) || (n.distance_km && n.distance_km > 20000)
  }).length

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>Review Dashboard</h2>
        <div className="controls">
          <button onClick={fetchRows}>Refresh</button>
          <select value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginTop:12}}>
        <Stat label="Total Records" value={total} />
        <Stat label="Approved" value={approved} color="#065f46" />
        <Stat label="Rejected" value={rejected} color="#9f1239" />
        <Stat label="Suspicious" value={suspicious} color="#b45309" />
      </div>

      <div style={{marginTop:16}}>
        {filtered.length === 0 && (
          <div className="card">No records uploaded yet. Upload a CSV to begin review.</div>
        )}
        {filtered.map(r=> <Row key={r.id} r={r} onAction={onAction} />)}
      </div>
    </div>
  )
}
