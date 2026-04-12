import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';

const API = 'https://gestpro-backend.onrender.com/api';
const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444'];

export default function Analyse() {
  const [ca, setCA] = useState(null);
  const [topProduits, setTopProduits] = useState([]);
  const [panierSegment, setPanierSegment] = useState([]);
  const [conversion, setConversion] = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ debut:'', fin:'', categorie:'', region:'' });

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if(filters.debut) params.append('debut', filters.debut);
      if(filters.fin) params.append('fin', filters.fin);
      if(filters.categorie) params.append('categorie', filters.categorie);
      if(filters.region) params.append('region', filters.region);

      const [caRes, topRes, panierRes, convRes, evolRes] = await Promise.all([
        axios.get(`${API}/analytics/ca?${params}`),
        axios.get(`${API}/analytics/top-produits?${params}`),
        axios.get(`${API}/analytics/panier-segment`),
        axios.get(`${API}/analytics/conversion`),
        axios.get(`${API}/analytics/evolution`),
      ]);
      setCA(caRes.data);
      setTopProduits(topRes.data);
      setPanierSegment(panierRes.data);
      setConversion(convRes.data);
      setEvolution(evolRes.data);
    } catch(err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div style={{padding:'2rem',background:'#f8fafc',minHeight:'100vh'}}>
      <div style={{marginBottom:'2rem'}}>
        <h1 style={{fontSize:'1.8rem',fontWeight:'800',color:'#1e1b4b'}}>Interface d analyse</h1>
        <p style={{color:'#9ca3af'}}>Requetes parametrables sur vos donnees</p>
      </div>

      {/* Filtres */}
      <div style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)',marginBottom:'2rem'}}>
        <h3 style={{color:'#1e1b4b',fontWeight:'700',marginBottom:'1rem'}}>🔍 Filtres</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1rem'}}>
          <div>
            <label style={{fontSize:'0.8rem',color:'#6b7280',fontWeight:'600'}}>Date debut</label>
            <input type="date" value={filters.debut} onChange={e=>setFilters({...filters,debut:e.target.value})}
              style={{width:'100%',padding:'0.6rem',borderRadius:'0.5rem',border:'2px solid #e5e7eb',fontSize:'0.85rem',marginTop:'0.3rem'}}/>
          </div>
          <div>
            <label style={{fontSize:'0.8rem',color:'#6b7280',fontWeight:'600'}}>Date fin</label>
            <input type="date" value={filters.fin} onChange={e=>setFilters({...filters,fin:e.target.value})}
              style={{width:'100%',padding:'0.6rem',borderRadius:'0.5rem',border:'2px solid #e5e7eb',fontSize:'0.85rem',marginTop:'0.3rem'}}/>
          </div>
          <div>
            <label style={{fontSize:'0.8rem',color:'#6b7280',fontWeight:'600'}}>Categorie</label>
            <select value={filters.categorie} onChange={e=>setFilters({...filters,categorie:e.target.value})}
              style={{width:'100%',padding:'0.6rem',borderRadius:'0.5rem',border:'2px solid #e5e7eb',fontSize:'0.85rem',marginTop:'0.3rem'}}>
              <option value="">Toutes</option>
              <option value="Electronique">Electronique</option>
              <option value="Tissus">Tissus</option>
              <option value="Alimentation">Alimentation</option>
              <option value="Sport">Sport</option>
              <option value="Maison">Maison</option>
              <option value="Beaute">Beaute</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Artisanat">Artisanat</option>
            </select>
          </div>
          <div>
            <label style={{fontSize:'0.8rem',color:'#6b7280',fontWeight:'600'}}>Region</label>
            <select value={filters.region} onChange={e=>setFilters({...filters,region:e.target.value})}
              style={{width:'100%',padding:'0.6rem',borderRadius:'0.5rem',border:'2px solid #e5e7eb',fontSize:'0.85rem',marginTop:'0.3rem'}}>
              <option value="">Toutes</option>
              <option value="Lome">Lome</option>
              <option value="Sokode">Sokode</option>
              <option value="Kara">Kara</option>
              <option value="Atakpame">Atakpame</option>
              <option value="Dapaong">Dapaong</option>
              <option value="Tsevie">Tsevie</option>
              <option value="Aneho">Aneho</option>
              <option value="Bassar">Bassar</option>
            </select>
          </div>
        </div>
        <button onClick={chargerDonnees} disabled={loading}
          style={{padding:'0.75rem 2rem',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',border:'none',borderRadius:'0.75rem',cursor:'pointer',fontWeight:'600',fontSize:'0.9rem'}}>
          {loading ? 'Chargement...' : '🔍 Analyser'}
        </button>
      </div>

      {/* KPIs CA */}
      {ca && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1.2rem',marginBottom:'2rem'}}>
          {[
            ['CA Total',ca.ca.toLocaleString('fr')+' FCFA','💰','#6366f1'],
            ['Nombre de ventes',ca.nbVentes+' transactions','📊','#10b981'],
            ['Panier moyen',ca.panierMoyen.toLocaleString('fr')+' FCFA','🛒','#f59e0b'],
          ].map(([title,value,icon,color])=>(
            <div key={title} style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)',borderTop:'4px solid '+color,display:'flex',alignItems:'center',gap:'1rem'}}>
              <div style={{fontSize:'2rem'}}>{icon}</div>
              <div>
                <div style={{fontSize:'0.75rem',color:'#9ca3af',fontWeight:'700',textTransform:'uppercase'}}>{title}</div>
                <div style={{fontSize:'1.4rem',fontWeight:'800',color:'#1e1b4b'}}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evolution 12 mois */}
      <div style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)',marginBottom:'1.5rem'}}>
        <h3 style={{color:'#1e1b4b',fontWeight:'700',marginBottom:'1.5rem'}}>📈 Evolution mensuelle sur 12 mois</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={evolution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
            <XAxis dataKey="mois" tick={{fill:'#9ca3af',fontSize:11}}/>
            <YAxis tick={{fill:'#9ca3af',fontSize:11}} tickFormatter={v=>Math.round(v/1000)+'K'}/>
            <Tooltip formatter={v=>[v.toLocaleString('fr')+' FCFA','CA']}/>
            <Line type="monotone" dataKey="ca" stroke="#6366f1" strokeWidth={3} dot={{fill:'#6366f1',r:4}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',marginBottom:'1.5rem'}}>
        {/* Top 10 produits */}
        <div style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
          <h3 style={{color:'#1e1b4b',fontWeight:'700',marginBottom:'1.5rem'}}>🏆 Top 10 produits les plus vendus</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProduits} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis type="number" tick={{fill:'#9ca3af',fontSize:11}}/>
              <YAxis type="category" dataKey="nom" tick={{fill:'#6b7280',fontSize:11}} width={100}/>
              <Tooltip formatter={v=>[v+' unites','Quantite']}/>
              <Bar dataKey="quantite" radius={[0,6,6,0]}>
                {topProduits.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Panier moyen par segment */}
        <div style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
          <h3 style={{color:'#1e1b4b',fontWeight:'700',marginBottom:'1.5rem'}}>👥 Panier moyen par segment</h3>
          <div style={{display:'flex',flexDirection:'column',gap:'1rem',marginBottom:'1.5rem'}}>
            {panierSegment.map((s,i)=>(
              <div key={i} style={{padding:'1rem',borderRadius:'0.75rem',background:COLORS[i]+'15',border:'1px solid '+COLORS[i]+'30'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}>
                  <span style={{fontWeight:'700',color:'#1e1b4b',textTransform:'capitalize'}}>{s.segment}</span>
                  <span style={{fontWeight:'800',color:COLORS[i]}}>{s.panierMoyen.toLocaleString('fr')} FCFA</span>
                </div>
                <div style={{fontSize:'0.8rem',color:'#6b7280'}}>{s.nbVentes} ventes — CA total : {s.totalCA.toLocaleString('fr')} FCFA</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Taux de conversion */}
      {conversion && (
        <div style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
          <h3 style={{color:'#1e1b4b',fontWeight:'700',marginBottom:'1.5rem'}}>🔄 Taux de conversion clients</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem'}}>
            {[
              ['Total clients',conversion.total,'#6366f1'],
              ['Clients actifs',conversion.nbActifs,'#10b981'],
              ['Clients inactifs',conversion.nbInactifs,'#ef4444'],
              ['Taux conversion',conversion.tauxConversion+'%','#f59e0b'],
            ].map(([label,val,color])=>(
              <div key={label} style={{textAlign:'center',padding:'1.2rem',borderRadius:'1rem',background:color+'15',border:'1px solid '+color+'30'}}>
                <div style={{fontSize:'2rem',fontWeight:'800',color}}>{val}</div>
                <div style={{fontSize:'0.8rem',color:'#6b7280',marginTop:'0.3rem'}}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:'1rem',background:'#f8fafc',borderRadius:'0.75rem',padding:'1rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.5rem'}}>
              <div style={{height:'12px',background:'#10b981',borderRadius:'6px',width:conversion.tauxConversion+'%',transition:'width 1s ease'}}></div>
              <span style={{fontSize:'0.8rem',color:'#10b981',fontWeight:'700'}}>{conversion.tauxConversion}% actifs</span>
            </div>
            <div style={{fontSize:'0.8rem',color:'#6b7280'}}>Un client est considere inactif sans achat depuis 3 mois</div>
          </div>
        </div>
      )}
    </div>
  );
}