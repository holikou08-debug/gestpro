import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';

export default function Predictions() {
  const [data, setData] = useState(null);
  const [seg, setSeg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/analytics/predictions'),
      axios.get('http://localhost:5000/api/analytics/segmentation')
    ]).then(([p,s]) => { setData(p.data); setSeg(s.data); setLoading(false); })
     .catch(() => setLoading(false));
  }, []);

  if(loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:'1rem'}}>
      <div style={{width:'50px',height:'50px',border:'4px solid #e5e7eb',borderTop:'4px solid #6366f1',borderRadius:'50%'}}></div>
      <p style={{color:'#6366f1',fontWeight:'600'}}>Analyse IA en cours...</p>
    </div>
  );

  if(!data) return <div style={{padding:'2rem',color:'red'}}>Erreur chargement</div>;

  const chartData = [
    ...(data.historique||[]).map(h=>({mois:h.mois,historique:h.valeur,prediction:null})),
    ...(data.predictions||[]).map(p=>({mois:p.mois,historique:null,prediction:p.valeur}))
  ];

  return (
    <div style={{padding:'2rem',background:'#f8fafc',minHeight:'100vh'}}>
      <div style={{marginBottom:'2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h1 style={{fontSize:'1.8rem',fontWeight:'800',color:'#1e1b4b'}}>Predictions IA</h1>
          <p style={{color:'#9ca3af'}}>Analyse predictive par regression lineaire</p>
        </div>
        <div style={{background:data.tendance==='hausse'?'linear-gradient(135deg,#10b981,#059669)':'linear-gradient(135deg,#ef4444,#dc2626)',color:'white',padding:'0.75rem 1.5rem',borderRadius:'1rem',fontWeight:'700'}}>
          {data.tendance==='hausse' ? 'Tendance hausse' : 'Tendance baisse'}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1.2rem',marginBottom:'2rem'}}>
        {(data.predictions||[]).map((p,i)=>(
          <div key={i} style={{background:'linear-gradient(135deg,#1e1b4b,#4f46e5)',borderRadius:'1.2rem',padding:'1.5rem',color:'white',boxShadow:'0 8px 25px rgba(99,102,241,0.3)'}}>
            <div style={{fontSize:'0.8rem',color:'#a5b4fc',marginBottom:'0.5rem',fontWeight:'600'}}>MOIS {i+1}</div>
            <div style={{fontSize:'0.95rem',color:'#c4b5fd',marginBottom:'0.5rem'}}>{p.mois}</div>
            <div style={{fontSize:'1.6rem',fontWeight:'800'}}>{p.valeur.toLocaleString('fr')} FCFA</div>
            <div style={{fontSize:'0.75rem',color:'#a5b4fc',marginTop:'0.5rem'}}>Prediction ML</div>
          </div>
        ))}
      </div>

      <div style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)',marginBottom:'1.5rem'}}>
        <h3 style={{color:'#1e1b4b',fontWeight:'700',marginBottom:'1.5rem'}}>Courbe historique vs predictions</h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="h" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="p" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
            <XAxis dataKey="mois" tick={{fill:'#9ca3af',fontSize:12}}/>
            <YAxis tick={{fill:'#9ca3af',fontSize:12}} tickFormatter={v=>v.toLocaleString('fr')}/>
            <Tooltip formatter={(v,n)=>[v?v.toLocaleString('fr')+' FCFA':'N/A',n==='historique'?'Historique':'Prediction']}/>
            <Legend/>
            <Area type="monotone" dataKey="historique" stroke="#6366f1" strokeWidth={3} fill="url(#h)" dot={{fill:'#6366f1',r:5}} connectNulls={false}/>
            <Area type="monotone" dataKey="prediction" stroke="#10b981" strokeWidth={3} strokeDasharray="8 4" fill="url(#p)" dot={{fill:'#10b981',r:6}} connectNulls={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
        <div style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
          <h3 style={{color:'#1e1b4b',fontWeight:'700',marginBottom:'1rem'}}>Tableau des predictions</h3>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#1e1b4b',color:'white'}}>
                <th style={{padding:'0.75rem',textAlign:'left',fontSize:'0.85rem'}}>Mois</th>
                <th style={{padding:'0.75rem',textAlign:'right',fontSize:'0.85rem'}}>CA Predit</th>
                <th style={{padding:'0.75rem',textAlign:'center',fontSize:'0.85rem'}}>Type</th>
              </tr>
            </thead>
            <tbody>
              {(data.historique||[]).slice(-3).map((h,i)=>(
                <tr key={i} style={{borderBottom:'1px solid #e5e7eb',background:i%2===0?'#f8fafc':'white'}}>
                  <td style={{padding:'0.75rem',color:'#6b7280'}}>{h.mois}</td>
                  <td style={{padding:'0.75rem',textAlign:'right',fontWeight:'600'}}>{h.valeur.toLocaleString('fr')} FCFA</td>
                  <td style={{padding:'0.75rem',textAlign:'center'}}><span style={{background:'#e0e7ff',color:'#4f46e5',padding:'0.2rem 0.6rem',borderRadius:'1rem',fontSize:'0.75rem'}}>Historique</span></td>
                </tr>
              ))}
              {(data.predictions||[]).map((p,i)=>(
                <tr key={'p'+i} style={{borderBottom:'1px solid #e5e7eb',background:'#f0fdf4'}}>
                  <td style={{padding:'0.75rem',fontWeight:'600',color:'#1e1b4b'}}>{p.mois}</td>
                  <td style={{padding:'0.75rem',textAlign:'right',fontWeight:'700',color:'#10b981'}}>{p.valeur.toLocaleString('fr')} FCFA</td>
                  <td style={{padding:'0.75rem',textAlign:'center'}}><span style={{background:'#dcfce7',color:'#16a34a',padding:'0.2rem 0.6rem',borderRadius:'1rem',fontSize:'0.75rem'}}>Prediction</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
          <h3 style={{color:'#1e1b4b',fontWeight:'700',marginBottom:'1rem'}}>Segmentation clients</h3>
          {seg&&(
            <div style={{display:'flex',flexDirection:'column',gap:'0.8rem'}}>
              {[['VIP',seg.vip,'#f59e0b','Premium'],['Actifs',seg.actifs,'#10b981','Achat < 30j'],['A risque',seg.risque,'#f97316','Inactifs 30-90j'],['Perdus',seg.perdus,'#ef4444','Inactifs > 90j']].map(([label,val,color,desc])=>(
                <div key={label} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'0.9rem',borderRadius:'0.75rem',background:color+'15',border:'1px solid '+color+'40'}}>
                  <div style={{width:'44px',height:'44px',background:color,borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',fontWeight:'800',color:'white'}}>{val}</div>
                  <div>
                    <div style={{fontWeight:'700',color:'#1e1b4b'}}>{label}</div>
                    <div style={{fontSize:'0.8rem',color:'#6b7280'}}>{desc}</div>
                  </div>
                  <div style={{marginLeft:'auto',width:'60px',height:'6px',background:'#e5e7eb',borderRadius:'3px'}}>
                    <div style={{height:'100%',width:Math.min(100,val>0?(val/((seg.vip+seg.actifs+seg.risque+seg.perdus)||1))*100:0)+'%',background:color,borderRadius:'3px'}}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}