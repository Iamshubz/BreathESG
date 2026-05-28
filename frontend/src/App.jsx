import React from 'react'
import Upload from './components/Upload'
import Dashboard from './components/Dashboard'
import Navbar from './components/Navbar'

export default function App(){
  return (
    <div>
      <Navbar />
      <div className="container" style={{padding:'20px 16px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr',gap:18}}>
          <Upload />
          <Dashboard />
        </div>
      </div>
    </div>
  )
}
