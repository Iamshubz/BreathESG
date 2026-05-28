import React, {useState} from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default function Upload(){
  const [file, setFile] = useState(null)
  const [source, setSource] = useState('sap')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e){
    e.preventDefault()
    if(!file) return setMsg('Select a file')
    const fd = new FormData()
    fd.append('file', file)
    setLoading(true)
    setMsg('')
    try{
      const res = await fetch(`${API_BASE}/api/upload/?source_type=${source}`, {method:'POST', body:fd})
      const data = await res.json()
      if(!res.ok){
        setMsg('Upload failed: ' + (data.detail || JSON.stringify(data)))
      } else {
        setMsg('Uploaded ' + (data.uploaded_rows || 0) + ' rows')
        // refresh the dashboard to show new rows
        window.location.reload()
      }
    }catch(err){
      setMsg('Network error: ' + err.message)
    } finally{
      setLoading(false)
    }
  }

  // sample loading removed per user request

  return (
    <div className="card">
      <h3>Upload CSV</h3>
      <div style={{display:'flex',gap:16,alignItems:'center'}}>
        <form onSubmit={submit} style={{flex:1}}>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <label style={{fontSize:14}}>Source:</label>
            <select value={source} onChange={e=>setSource(e.target.value)}>
              <option value="sap">SAP</option>
              <option value="utility">Utility</option>
              <option value="travel">Travel</option>
            </select>
            <input type="file" accept=".csv" onChange={e=>setFile(e.target.files[0])} style={{marginLeft:8}} />
            <button className="btn btn-primary" type="submit" disabled={loading} style={{marginLeft:8}}>{loading ? 'Uploading...' : 'Upload'}</button>
          </div>
          <div style={{marginTop:8,fontSize:13,color:'#475569'}}>{file ? file.name : 'No file selected'}</div>
        </form>
        <div style={{width:260}}>
          <div style={{fontSize:13,fontWeight:600}}>Quick tips</div>
          <div style={{fontSize:13,color:'#64748b',marginTop:6}}>Upload CSV exports from your systems. We auto-normalize dates, units and airport distances.</div>
        </div>
      </div>
      <div style={{marginTop:8}}>{msg}</div>
    </div>
  )
}
