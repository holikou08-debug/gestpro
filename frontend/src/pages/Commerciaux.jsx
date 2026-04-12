// PAGE COMMERCIAUX - Gestion CRUD des commerciaux avec recherche
// Les commerciaux sont les agents de vente avec objectifs mensuels par region
import React, { useEffect, useState } from 'react';
import { getCommerciaux, createCommercial, deleteCommercial, getVentes } from '../api';

export default function Commerciaux() {
  // Etats principaux
  const [items, setItems] = useState([]);
  const [ventes, setVentes] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtreRegion, setFiltreRegion] = useState('');
  const [tri, setTri] = useState('recent');
  const [form, setForm] = useState({ nom:'', region:'', objectifMensuel:'' });

  // Chargement des donnees au demarrage
  useEffect(() => {
    getCommerciaux().then(r=>setItems(r.data));
    getVentes().then(r=>setVentes(r.data));
  }, []);

  // Calcul CA par commercial
  const getCA = (id) => ventes.filter(v=>v.commercialId?._id===id||v.commercialId===id).reduce((s,v)=>s+(v.quantite*v.prixUnitaire),0);

  // Calcul taux objectif atteint
  const getTaux = (id, objectif) => objectif>0 ? Math.min(100,Math.round((getCA(id)/objectif)*100)) : 0;

  // Regions uniques
  const regions = [...new Set(items.map(i=>i.region).filter(Boolean))];

  // Filtrage par recherche et region
  const filtered = items
  .filter(i =>
    i.nom?.toLowerCase().includes(recherche.toLowerCase()) &&
    (filtreRegion==='' || i.region===filtreRegion)
  )
  .sort((a,b) => {
    if(tri==='nom') return (a.nom||'').localeCompare(b.nom||'');
    if(tri==='nom-desc') return (b.nom||'').localeCompare(a.nom||'');
    if(tri==='region') return (a.region||'').localeCompare(b.region||'');
    if(tri==='objectif-desc') return b.objectifMensuel - a.objectifMensuel;
    if(tri==='objectif-asc') return a.objectifMensuel - b.objectifMensuel;
    if(tri==='ancien') return new Date(a.createdAt) - new Date(b.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Ajout d'un commercial
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createCommercial(form);
    const r = await getCommerciaux();
    setItems(r.data);
    setForm({ nom:'', region:'', objectifMensuel:'' });
  };

  // Suppression d'un commercial
  const handleDelete = async (id) => {
    if(window.confirm('Supprimer ce commercial ?')) {
      await deleteCommercial(id);
      setItems(items.filter(i=>i._id!==id));
    }
  };

  return (
    <div style={{padding:'2rem',background:'#f8fafc',minHeight:'100vh'}}>
      <div style={{marginBottom:'2rem'}}>
        <h1 style={{fontSize:'1.8rem',fontWeight:'800',color:'#1e1b4b'}}>🏆 Gestion des Commerciaux</h1>
        <p style={{color:'#9ca3af'}}>Les commerciaux sont vos agents de vente sur le terrain au Togo</p>
      </div>

      {/* Formulaire ajout commercial */}
      <div style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)',marginBottom:'1.5rem'}}>
        <h3 style={{color:'#1e1b4b',fontWeight:'700',marginBottom:'1rem'}}>➕ Ajouter un commercial</h3>
        <form onSubmit={handleSubmit} style={{display:'flex',flexWrap:'wrap',gap:'0.75rem'}}>
          <input placeholder="Nom complet" value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',minWidth:'150px'}} required/>
          <select value={form.region} onChange={e=>setForm({...form,region:e.target.value})}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem'}}>
            <option value="">Choisir region</option>
            {['Lome','Sokode','Kara','Atakpame','Dapaong','Tsevie','Aneho','Bassar'].map(r=><option key={r} value={r}>{r}</option>)}
          </select>
          <input placeholder="Objectif mensuel (FCFA)" type="number" value={form.objectifMensuel} onChange={e=>setForm({...form,objectifMensuel:e.target.value})}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',minWidth:'180px'}}/>
          <button type="submit" style={{padding:'0.7rem 1.5rem',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'white',border:'none',borderRadius:'0.75rem',cursor:'pointer',fontWeight:'600'}}>
            Ajouter
          </button>
        </form>
      </div>

      {/* Liste commerciaux */}
      <div style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'0.75rem'}}>
          <h3 style={{color:'#1e1b4b',fontWeight:'700'}}>Liste des commerciaux ({filtered.length})</h3>
          <div style={{display:'flex',gap:'0.75rem'}}>
            <select value={filtreRegion} onChange={e=>setFiltreRegion(e.target.value)}
              style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem'}}>
              <option value="">Toutes regions</option>
              {regions.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
            <select value={tri} onChange={e=>setTri(e.target.value)}
              style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem'}}>
              <option value="recent">Plus recent</option>
              <option value="ancien">Plus ancien</option>
              <option value="nom">Nom A-Z</option>
              <option value="nom-desc">Nom Z-A</option>
              <option value="region">Region</option>
              <option value="objectif-desc">Objectif decroissant</option>
              <option value="objectif-asc">Objectif croissant</option>
            </select>
            <input placeholder="🔍 Rechercher..." value={recherche} onChange={e=>setRecherche(e.target.value)}
              style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',width:'220px'}}/>
          </div>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'linear-gradient(135deg,#1e1b4b,#4f46e5)',color:'white'}}>
              <th style={{padding:'0.75rem',textAlign:'left',fontSize:'0.85rem'}}>Nom</th>
              <th style={{padding:'0.75rem',textAlign:'left',fontSize:'0.85rem'}}>Region</th>
              <th style={{padding:'0.75rem',textAlign:'right',fontSize:'0.85rem'}}>CA realise</th>
              <th style={{padding:'0.75rem',textAlign:'right',fontSize:'0.85rem'}}>Objectif</th>
              <th style={{padding:'0.75rem',textAlign:'center',fontSize:'0.85rem'}}>Progression</th>
              <th style={{padding:'0.75rem',textAlign:'center',fontSize:'0.85rem'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i,idx)=>{
              const ca = getCA(i._id);
              const taux = getTaux(i._id, i.objectifMensuel);
              return (
                <tr key={i._id} style={{borderBottom:'1px solid #e5e7eb',background:idx%2===0?'white':'#f8fafc'}}>
                  <td style={{padding:'0.75rem',fontWeight:'600',color:'#1e1b4b'}}>{i.nom}</td>
                  <td style={{padding:'0.75rem'}}>
                    <span style={{background:'#e0f2fe',color:'#0369a1',padding:'0.2rem 0.7rem',borderRadius:'1rem',fontSize:'0.75rem',fontWeight:'600'}}>{i.region}</span>
                  </td>
                  <td style={{padding:'0.75rem',textAlign:'right',fontWeight:'700',color:'#10b981'}}>{Math.round(ca).toLocaleString('fr')} FCFA</td>
                  <td style={{padding:'0.75rem',textAlign:'right',color:'#6b7280'}}>{Number(i.objectifMensuel).toLocaleString('fr')} FCFA</td>
                  <td style={{padding:'0.75rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                      <div style={{flex:1,height:'8px',background:'#e5e7eb',borderRadius:'4px'}}>
                        <div style={{height:'100%',width:taux+'%',background:taux>=100?'#10b981':taux>=50?'#f59e0b':'#ef4444',borderRadius:'4px',transition:'width 0.5s ease'}}></div>
                      </div>
                      <span style={{fontSize:'0.8rem',fontWeight:'700',color:taux>=100?'#10b981':taux>=50?'#f59e0b':'#ef4444'}}>{taux}%</span>
                    </div>
                  </td>
                  <td style={{padding:'0.75rem',textAlign:'center'}}>
                    <button onClick={()=>handleDelete(i._id)}
                      style={{background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:'0.5rem',padding:'0.3rem 0.8rem',cursor:'pointer',fontSize:'0.8rem',fontWeight:'600'}}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0&&<div style={{textAlign:'center',padding:'3rem',color:'#9ca3af'}}>Aucun commercial trouve</div>}
      </div>
    </div>
  );
}