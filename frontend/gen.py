import os

accueil = """import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getVentes, getClients, getProduits, getCommerciaux, getEvenements } from '../api';
const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444'];
function KpiCard({ title, value, icon, color, sub }) {
  return (
    <div style={{background:'white',borderRadius:'1rem',padding:'1.5rem',boxShadow:'0 1px 10px rgba(0,0,0,0.07)',borderLeft:'4px solid '+color,display:'flex',alignItems:'center',gap:'1rem'}}>
      <div style={{width:'48px',height:'48px',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem'}}>{icon}</div>
      <div><div style={{fontSize:'0.8rem',color:'#6b7280',fontWeight:'500'}}>{title}</div><div style={{fontSize:'1.6rem',fontWeight:'700',color:'#1e1b4b'}}>{value}</div>{sub&&<div style={{fontSize:'0.75rem',color:'#10b981'}}>{sub}</div>}</div>
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
    Promise.all([getVentes(), getClients(), getProduits(), getCommerciaux(), getEvenements()])
      .then(([v,c,p,com,e]) => {
        setVentes(v.data); setClients(c.data); setProduits(p.data);
        setCommerciaux(com.data); setEvenements(e.data); setLoading(false);
      });
  }, []);
  const totalCA = ventes.reduce((s,v) => s + (v.quantite * v.prixUnitaire), 0);
  const ventesParMois = Array.from({length:6}, (_,i) => {
    const d = new Date(); d.setMonth(d.getMonth()-5+i);
    const mois = d.toLocaleString('fr',{month:'short'});
    const total = ventes.filter(v => { const dv = new Date(v.date); return dv.getMonth()===d.getMonth()&&dv.getFullYear()===d.getFullYear(); }).reduce((s,v)=>s+(v.quantite*v.prixUnitaire),0);
    return {mois, total: Math.round(total)};
  });
  const ventesParCategorie = produits.slice(0,5).map(p => ({ name: p.categorie||p.nom, value: ventes.filter(v=>v.produit?._id===p._id||v.produit===p._id).reduce((s,v)=>s+(v.quantite*v.prixUnitaire),0) })).filter(x=>x.value>0);
  const topCommerciaux = commerciaux.map(c => ({ name: c.nom, ca: Math.round(ventes.filter(v=>v.commercialId?._id===c._id||v.commercialId===c._id).reduce((s,v)=>s+(v.quantite*v.prixUnitaire),0)) })).sort((a,b)=>b.ca-a.ca).slice(0,5);
  if(loading) return <div style={{padding:'3rem',textAlign:'center',color:'#6366f1'}}>Chargement...</div>;
  return (
    <div style={{padding:'2rem',background:'#f8fafc',minHeight:'100vh'}}>
      <div style={{marginBottom:'2rem'}}><h1 style={{fontSize:'1.5rem',fontWeight:'700',color:'#1e1b4b'}}>Tableau de bord</h1><p style={{color:'#6b7280',fontSize:'0.9rem'}}>Vue en temps reel de toutes vos activites</p></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2rem'}}>
        <KpiCard title='Chiffre affaires' value={totalCA.toLocaleString('fr')+' euro'} icon='💶' color='#6366f1' sub='Total cumule' />
        <KpiCard title='Clients' value={clients.length} icon='👥' color='#06b6d4' sub='Inscrits' />
        <KpiCard title='Produits' value={produits.length} icon='📦' color='#10b981' sub='En catalogue' />
        <KpiCard title='Evenements' value={evenements.length} icon='🎭' color='#f59e0b' sub='Programmes' />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1.5rem',marginBottom:'1.5rem'}}>
        <div style={{background:'white',borderRadius:'1rem',padding:'1.5rem',boxShadow:'0 1px 10px rgba(0,0,0,0.07)'}}>
          <h3 style={{marginBottom:'1rem',color:'#1e1b4b',fontWeight:'600'}}>Evolution du CA sur 6 mois</h3>
          <ResponsiveContainer width='100%' height={250}><LineChart data={ventesParMois}><CartesianGrid strokeDasharray='3 3'/><XAxis dataKey='mois'/><YAxis/><Tooltip/><Line type='monotone' dataKey='total' stroke='#6366f1' strokeWidth={3}/></LineChart></ResponsiveContainer>
        </div>
        <div style={{background:'white',borderRadius:'1rem',padding:'1.5rem',boxShadow:'0 1px 10px rgba(0,0,0,0.07)'}}>
          <h3 style={{marginBottom:'1rem',color:'#1e1b4b',fontWeight:'600'}}>Ventes par categorie</h3>
          {ventesParCategorie.length>0 ? <ResponsiveContainer width='100%' height={250}><PieChart><Pie data={ventesParCategorie} cx='50%' cy='50%' outerRadius={80} dataKey='value' label={({name})=>name}>{ventesParCategorie.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer> : <div style={{textAlign:'center',padding:'3rem',color:'#9ca3af'}}>Ajoutez des ventes pour voir ce graphique</div>}
        </div>
      </div>
      <div style={{background:'white',borderRadius:'1rem',padding:'1.5rem',boxShadow:'0 1px 10px rgba(0,0,0,0.07)'}}>
        <h3 style={{marginBottom:'1rem',color:'#1e1b4b',fontWeight:'600'}}>Top 5 Commerciaux</h3>
        {topCommerciaux.length>0 ? <ResponsiveContainer width='100%' height={220}><BarChart data={topCommerciaux}><CartesianGrid strokeDasharray='3 3'/><XAxis dataKey='name'/><YAxis/><Tooltip/><Bar dataKey='ca' fill='#6366f1' radius={[6,6,0,0]}/></BarChart></ResponsiveContainer> : <div style={{textAlign:'center',padding:'3rem',color:'#9ca3af'}}>Ajoutez des commerciaux et ventes pour voir ce graphique</div>}
      </div>
    </div>
  );
}"""

with open('src/pages/Accueil.jsx', 'w', encoding='utf-8') as f:
    f.write(accueil)
print('Accueil.jsx cree!')
