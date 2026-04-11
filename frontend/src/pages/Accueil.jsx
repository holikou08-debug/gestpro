import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getVentes, getClients, getProduits, getCommerciaux, getEvenements } from '../api';

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444'];

function KpiCard({ title, value, icon, color, sub, delay=0 }) {
  return (
    <div className="card" style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)',borderTop:'4px solid '+color,display:'flex',alignItems:'center',gap:'1rem',animationDelay:delay+'s',cursor:'pointer'}}>
      <div style={{width:'56px',height:'56px',borderRadius:'16px',background:'linear-gradient(135deg,'+color+'25,'+color+'10)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',flexShrink:0}}>{icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:'0.75rem',color:'#9ca3af',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'0.2rem'}}>{title}</div>
        <div style={{fontSize:'1.6rem',fontWeight:'800',color:'#1e1b4b',lineHeight:1.1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{value}</div>
        <div style={{fontSize:'0.75rem',color:color,fontWeight:'600',marginTop:'0.2rem'}}>{sub}</div>
      </div>
    </div>
  );
}

export default function Accueil() {
  const [ventes, setVentes] = useState([]);
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [commerciaux, setCommerciaux] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getVentes(),getClients(),getProduits(),getCommerciaux(),getEvenements()])
      .then(([v,c,p,com,e]) => {
        setVentes(v.data); setClients(c.data); setProduits(p.data);
        setCommerciaux(com.data); setEvenements(e.data); setLoading(false);
      });
  }, []);

  const totalCA = ventes.reduce((s,v)=>s+(v.quantite*v.prixUnitaire),0);
  const panierMoyen = ventes.length>0 ? Math.round(totalCA/ventes.length) : 0;

  const ventesParMois = Array.from({length:6},(_,i)=>{
    const d=new Date(); d.setMonth(d.getMonth()-5+i);
    const mois=d.toLocaleString('fr',{month:'short'});
    const total=ventes.filter(v=>{ const dv=new Date(v.date); return dv.getMonth()===d.getMonth()&&dv.getFullYear()===d.getFullYear(); }).reduce((s,v)=>s+(v.quantite*v.prixUnitaire),0);
    return {mois,total:Math.round(total)};
  });

  const ventesParCategorie = Object.entries(
    ventes.reduce((acc,v)=>{ const cat=v.produit?.categorie||'Autre'; acc[cat]=(acc[cat]||0)+(v.quantite*v.prixUnitaire); return acc; },{})
  ).map(([name,value])=>({name,value:Math.round(value)})).slice(0,6);

  const topCommerciaux = commerciaux.map(c=>({
    name:c.nom.split(' ')[0],
    ca:Math.round(ventes.filter(v=>v.commercialId?._id===c._id||v.commercialId===c._id).reduce((s,v)=>s+(v.quantite*v.prixUnitaire),0))
  })).sort((a,b)=>b.ca-a.ca).slice(0,5);

  if(loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:'1.5rem',background:'linear-gradient(135deg,#f8fafc,#ede9fe)'}}>
      <div style={{width:'60px',height:'60px',border:'4px solid #e5e7eb',borderTop:'4px solid #6366f1',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}></div>
      <div style={{color:'#6366f1',fontWeight:'700',fontSize:'1.1rem'}}>Chargement du tableau de bord...</div>
      <div style={{color:'#9ca3af',fontSize:'0.85rem'}}>Connexion a MongoDB Atlas</div>
    </div>
  );

  return (
    <div style={{padding:'2rem',background:'#f8fafc',minHeight:'100vh'}}>

      <div style={{marginBottom:'2rem',animation:'fadeInUp 0.5s ease both'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <h1 style={{fontSize:'2rem',fontWeight:'800',color:'#1e1b4b',letterSpacing:'-0.03em'}}>Bonjour 👋</h1>
            <p style={{color:'#9ca3af',fontSize:'0.95rem',marginTop:'0.2rem'}}>Bienvenue sur votre tableau de bord GestPro</p>
          </div>
          <div style={{display:'flex',gap:'0.75rem',alignItems:'center'}}>
            <div style={{background:'linear-gradient(135deg,#1e1b4b,#4f46e5)',color:'white',padding:'0.75rem 1.25rem',borderRadius:'1rem',fontWeight:'600',fontSize:'0.85rem',boxShadow:'0 4px 15px rgba(99,102,241,0.4)',display:'flex',alignItems:'center',gap:'0.5rem'}}>
              🇹🇬 Togo — GestPro
            </div>
            <div style={{background:'white',padding:'0.75rem 1.25rem',borderRadius:'1rem',fontWeight:'600',fontSize:'0.85rem',boxShadow:'0 4px 15px rgba(0,0,0,0.08)',color:'#6b7280'}}>
              {new Date().toLocaleDateString('fr',{weekday:'long',day:'numeric',month:'long'})}
            </div>
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1.2rem',marginBottom:'2rem'}}>
        <KpiCard title="Chiffre d'affaires" value={Math.round(totalCA/1000)+'K FCFA'} icon="💰" color="#6366f1" sub={ventes.length+' transactions'} delay={0.1}/>
        <KpiCard title="Clients" value={clients.length} icon="👥" color="#06b6d4" sub={clients.filter(c=>c.segment==='professionnel').length+' professionnels'} delay={0.2}/>
        <KpiCard title="Panier moyen" value={Math.round(panierMoyen/1000)+'K FCFA'} icon="🛒" color="#10b981" sub="Par transaction" delay={0.3}/>
        <KpiCard title="Evenements" value={evenements.length} icon="🎭" color="#f59e0b" sub={produits.length+' produits'} delay={0.4}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1.5rem',marginBottom:'1.5rem'}}>
        <div className="card" style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)',animationDelay:'0.3s'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
            <h3 style={{color:'#1e1b4b',fontWeight:'700',fontSize:'1rem'}}>📈 Evolution du CA</h3>
            <span style={{background:'#ede9fe',color:'#7c3aed',padding:'0.3rem 0.8rem',borderRadius:'2rem',fontSize:'0.75rem',fontWeight:'600'}}>6 derniers mois</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={ventesParMois}>
              <defs>
                <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="mois" tick={{fill:'#9ca3af',fontSize:12}}/>
              <YAxis tick={{fill:'#9ca3af',fontSize:12}} tickFormatter={v=>Math.round(v/1000)+'K'}/>
              <Tooltip formatter={v=>[v.toLocaleString('fr')+' FCFA','CA']}/>
              <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fill="url(#colorCA)" dot={{fill:'#6366f1',r:5,strokeWidth:2,stroke:'white'}} activeDot={{r:8}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)',animationDelay:'0.4s'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
            <h3 style={{color:'#1e1b4b',fontWeight:'700',fontSize:'1rem'}}>🥧 Par categorie</h3>
          </div>
          {ventesParCategorie.length>0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={ventesParCategorie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={4}>
                  {ventesParCategorie.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>[v.toLocaleString('fr')+' FCFA','CA']}/>
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{textAlign:'center',padding:'3rem',color:'#9ca3af'}}>Pas de donnees</div>}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
        <div className="card" style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)',animationDelay:'0.5s'}}>
          <h3 style={{color:'#1e1b4b',fontWeight:'700',fontSize:'1rem',marginBottom:'1.5rem'}}>🏆 Top Commerciaux</h3>
          {topCommerciaux.length>0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topCommerciaux} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis type="number" tick={{fill:'#9ca3af',fontSize:11}} tickFormatter={v=>Math.round(v/1000)+'K'}/>
                <YAxis type="category" dataKey="name" tick={{fill:'#6b7280',fontSize:12}} width={60}/>
                <Tooltip formatter={v=>[v.toLocaleString('fr')+' FCFA','CA']}/>
                <Bar dataKey="ca" radius={[0,8,8,0]}>
                  {topCommerciaux.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{textAlign:'center',padding:'2rem',color:'#9ca3af'}}>Pas de donnees</div>}
        </div>

        <div className="card" style={{background:'linear-gradient(135deg,#1e1b4b,#312e81)',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 8px 30px rgba(30,27,75,0.3)',animationDelay:'0.6s'}}>
          <h3 style={{color:'white',fontWeight:'700',fontSize:'1rem',marginBottom:'1.5rem'}}>📊 Resume</h3>
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            {[
              ['Total ventes',ventes.length+' transactions','#a5b4fc'],
              ['CA total',Math.round(totalCA/1000)+'K FCFA','#6ee7b7'],
              ['Clients actifs',clients.length+' inscrits','#fde68a'],
              ['Commerciaux',commerciaux.length+' agents','#fca5a5'],
              ['Evenements',evenements.length+' programmes','#c4b5fd'],
            ].map(([label,val,color])=>(
              <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.65rem 1rem',background:'rgba(255,255,255,0.07)',borderRadius:'0.75rem',backdropFilter:'blur(10px)'}}>
                <span style={{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem'}}>{label}</span>
                <span style={{color,fontWeight:'700',fontSize:'0.9rem'}}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}