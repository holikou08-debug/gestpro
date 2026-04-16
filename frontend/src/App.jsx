// APP.JSX - Point dentree principal du frontend GestPro
// Contient la navigation sidebar et les routes React
// Technologies : React, React Router DOM
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Accueil from './pages/Accueil';
import Evenements from './pages/Evenements';
import Clients from './pages/Clients';
import Produits from './pages/Produits';
import Ventes from './pages/Ventes';
import Commerciaux from './pages/Commerciaux';
import Assistant from './pages/Assistant';
import Analyse from './pages/Analyse';
import Predictions from './pages/Predictions';

const navItems = [
  { path:'/', label:'Tableau de bord', icon:'📊' },
  { path:'/clients', label:'Clients', icon:'👥' },
  { path:'/produits', label:'Produits', icon:'📦' },
  { path:'/ventes', label:'Ventes', icon:'💰' },
  { path:'/commerciaux', label:'Commerciaux', icon:'🏆' },
  { path:'/predictions', label:'Predictions IA', icon:'🔮' },
  { path:'/analyse', label:'Analyse', icon:'🔍' },
  { path:'/assistant', label:'Assistant IA', icon:'🤖' },
];

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',system-ui,sans-serif; background:#f8fafc; }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeInLeft { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.3)} 50%{box-shadow:0 0 40px rgba(99,102,241,0.6)} }
  .nav-link { transition:all 0.25s cubic-bezier(0.4,0,0.2,1) !important; }
  .nav-link:hover { background:rgba(99,102,241,0.2) !important; color:white !important; transform:translateX(4px); }
  .card { animation:fadeInUp 0.5s ease both; }
  .card:hover { transform:translateY(-4px) !important; box-shadow:0 20px 40px rgba(99,102,241,0.15) !important; transition:all 0.3s ease; }
  button { transition:all 0.2s ease !important; }
  button:hover:not(:disabled) { transform:translateY(-2px) !important; box-shadow:0 8px 20px rgba(0,0,0,0.15) !important; }
  button:active { transform:translateY(0) !important; }
  input,select { transition:all 0.2s ease; }
  input:focus,select:focus { outline:none !important; border-color:#6366f1 !important; box-shadow:0 0 0 4px rgba(99,102,241,0.1) !important; }
  table tr { transition:background 0.15s ease; }
  table tr:hover td { background:#f5f3ff !important; }
  ::-webkit-scrollbar { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:#f1f5f9; }
  ::-webkit-scrollbar-thumb { background:linear-gradient(#6366f1,#8b5cf6); border-radius:3px; }
`;

function Sidebar() {
  const location = useLocation();
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{width:'260px',minHeight:'100vh',background:'linear-gradient(180deg,#0f0e1a 0%,#1e1b4b 50%,#312e81 100%)',display:'flex',flexDirection:'column',position:'fixed',left:0,top:0,zIndex:100,boxShadow:'4px 0 30px rgba(0,0,0,0.4)'}}>

      <div style={{padding:'1.5rem',borderBottom:'1px solid rgba(255,255,255,0.08)',marginBottom:'0.5rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem',animation:'fadeInLeft 0.5s ease'}}>
          <div style={{width:'44px',height:'44px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',boxShadow:'0 4px 15px rgba(99,102,241,0.5)',animation:'glow 3s ease infinite'}}>🎯</div>
          <div>
            <div style={{color:'white',fontWeight:'800',fontSize:'1.1rem',letterSpacing:'-0.02em'}}>GestPro</div>
            <div style={{color:'#a5b4fc',fontSize:'0.72rem',fontWeight:'500'}}>🇹🇬 Plateforme Togo</div>
          </div>
        </div>
      </div>

      <div style={{padding:'0.5rem 0.75rem',marginBottom:'0.5rem'}}>
        <div style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.3)',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',padding:'0 0.75rem',marginBottom:'0.25rem'}}>Navigation</div>
      </div>

      <nav style={{flex:1,padding:'0 0.75rem',display:'flex',flexDirection:'column',gap:'0.2rem'}}>
        {navItems.map((item,i) => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="nav-link"
              onMouseEnter={()=>setHovered(item.path)}
              onMouseLeave={()=>setHovered(null)}
              style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.7rem 0.75rem',color:active?'white':'#94a3b8',textDecoration:'none',background:active?'linear-gradient(135deg,rgba(99,102,241,0.4),rgba(139,92,246,0.2))':'transparent',borderRadius:'0.75rem',border:active?'1px solid rgba(99,102,241,0.4)':'1px solid transparent',animation:`fadeInLeft ${0.3+i*0.05}s ease both`,position:'relative',overflow:'hidden'}}>
              {active && <div style={{position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',width:'3px',height:'60%',background:'linear-gradient(#6366f1,#8b5cf6)',borderRadius:'0 2px 2px 0'}}></div>}
              <span style={{fontSize:'1.1rem',filter:active?'none':'grayscale(30%)'}}>{item.icon}</span>
              <span style={{fontSize:'0.875rem',fontWeight:active?'600':'400'}}>{item.label}</span>
              {active && <div style={{marginLeft:'auto',width:'6px',height:'6px',background:'#6366f1',borderRadius:'50%',boxShadow:'0 0 8px #6366f1'}}></div>}
            </Link>
          );
        })}
      </nav>

      <div style={{padding:'1rem',margin:'0.75rem',background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))',borderRadius:'1rem',border:'1px solid rgba(99,102,241,0.2)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.5rem'}}>
          <div style={{width:'8px',height:'8px',background:'#10b981',borderRadius:'50%',boxShadow:'0 0 8px #10b981'}}></div>
          <span style={{color:'#a5b4fc',fontSize:'0.75rem',fontWeight:'600'}}>Systeme actif</span>
        </div>
        <div style={{color:'rgba(255,255,255,0.5)',fontSize:'0.7rem'}}>Fait par le Groupe 1</div>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <BrowserRouter>
      <div style={{display:'flex',minHeight:'100vh',background:'#f8fafc'}}>
        <Sidebar/>
        <div style={{marginLeft:'260px',flex:1,minHeight:'100vh'}}>
          <Routes>
            <Route path='/' element={<Accueil/>}/>
            <Route path='/clients' element={<Clients/>}/>
            <Route path='/produits' element={<Produits/>}/>
            <Route path='/ventes' element={<Ventes/>}/>
            <Route path='/commerciaux' element={<Commerciaux/>}/>
            <Route path='/predictions' element={<Predictions/>}/>
            <Route path='/analyse' element={<Analyse/>}/>
            <Route path='/assistant' element={<Assistant/>}/>
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}