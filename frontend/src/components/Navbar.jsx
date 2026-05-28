import React from 'react'

export default function Navbar(){
  return (
    <div style={{background:'#071126',color:'#fff',padding:'16px 20px'}}>
      <div className="container" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:20,fontWeight:700}}>Breathe ESG Prototype</div>
          <div style={{fontSize:12,opacity:0.9}}>Enterprise Emissions Review Platform — Prototype for ESG Data Normalization & Audit Workflow</div>
        </div>
        <div style={{fontSize:13,opacity:0.9}}>Demo Analyst</div>
      </div>
    </div>
  )
}
