import React, { useEffect, useState } from 'react'
import Login from './components/Login'
import Home from './components/Home'

export default function App(){
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  useEffect(()=>{
    const t = localStorage.getItem('token')
    if(t) setToken(t)
  },[])
  return token ? <Home onLogout={() => { localStorage.removeItem('token'); setToken(null) }} /> : <Login onLogin={(t)=>{ localStorage.setItem('token', t); setToken(t) }} />
}
