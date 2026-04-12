// PAGE CLIENTS - Gestion CRUD des clients avec recherche en temps reel
// Permet d'ajouter, modifier, supprimer et rechercher des clients
import React, { useEffect, useState } from 'react';
import { getClients, createClient, deleteClient } from '../api';

export default function Clients() {
  // Etat des clients et du formulaire
  const [items, setItems] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [tri, setTri] = useState('recent');
  const [form, setForm] = useState({ nom:'', email:'', telephone:'', ville:'', segment:'particulier' });

  // Chargement des clients au demarrage
  useEffect(() => { getClients().then(r => setItems(r.data)); }, []);

  // Filtrage par recherche en temps reel
  const filtered = items
  .filter(i =>
    i.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
    i.email?.toLowerCase().includes(recherche.toLowerCase()) ||
    i.ville?.toLowerCase().includes(recherche.toLowerCase())
  )
  .sort((a,b) => {
    if(tri==='nom') return (a.nom||'').localeCompare(b.nom||'');
    if(tri==='nom-desc') return (b.nom||'').localeCompare(a.nom||'');
    if(tri==='ville') return (a.ville||'').localeCompare(b.ville||'');
    if(tri==='segment') return (a.segment||'').localeCompare(b.segment||'');
    if(tri==='ancien') return new Date(a.createdAt) - new Date(b.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Ajout d'un client
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createClient(form);
    const r = await getClients();
    setItems(r.data);
    setForm({ nom:'', email:'', telephone:'', ville:'', segment:'particulier' });
  };

  // Suppression d'un client
  const handleDelete = async (id) => {
    if(window.confirm('Supprimer ce client ?')) {
      await deleteClient(id);
      setItems(items.filter(i => i._id !== id));
    }
  };

  return (
    <div style={{padding:'2rem',background:'#f8fafc',minHeight:'100vh'}}>
      <div style={{marginBottom:'2rem'}}>
        <h1 style={{fontSize:'1.8rem',fontWeight:'800',color:'#1e1b4b'}}>👥 Gestion des Clients</h1>
        <p style={{color:'#9ca3af'}}>{items.length} clients inscrits</p>
      </div>

      {/* Formulaire ajout client */}
      <div style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)',marginBottom:'1.5rem'}}>
        <h3 style={{color:'#1e1b4b',fontWeight:'700',marginBottom:'1rem'}}>➕ Ajouter un client</h3>
        <form onSubmit={handleSubmit} style={{display:'flex',flexWrap:'wrap',gap:'0.75rem'}}>
          <input placeholder="Nom complet" value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',minWidth:'150px'}} required/>
          <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',minWidth:'150px'}}/>
          <input placeholder="Telephone" value={form.telephone} onChange={e=>setForm({...form,telephone:e.target.value})}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',minWidth:'130px'}}/>
          <input placeholder="Ville - Quartier" value={form.ville} onChange={e=>setForm({...form,ville:e.target.value})}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',minWidth:'150px'}}/>
          <select value={form.segment} onChange={e=>setForm({...form,segment:e.target.value})}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem'}}>
            <option value="particulier">Particulier</option>
            <option value="professionnel">Professionnel</option>
          </select>
          <button type="submit" style={{padding:'0.7rem 1.5rem',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',border:'none',borderRadius:'0.75rem',cursor:'pointer',fontWeight:'600'}}>
            Ajouter
          </button>
        </form>
      </div>

      {/* Barre de recherche */}
      <div style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <h3 style={{color:'#1e1b4b',fontWeight:'700'}}>Liste des clients ({filtered.length})</h3>
          <select value={tri} onChange={e=>setTri(e.target.value)}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem'}}>
            <option value="recent">Plus recent</option>
            <option value="ancien">Plus ancien</option>
            <option value="nom">Nom A-Z</option>
            <option value="nom-desc">Nom Z-A</option>
            <option value="ville">Ville</option>
            <option value="segment">Segment</option>
          </select>
          <input placeholder="🔍 Rechercher par nom, email, ville..." value={recherche}
            onChange={e=>setRecherche(e.target.value)}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',width:'300px'}}/>
        </div>

        {/* Tableau des clients */}
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'linear-gradient(135deg,#1e1b4b,#4f46e5)',color:'white'}}>
              <th style={{padding:'0.75rem',textAlign:'left',fontSize:'0.85rem'}}>Nom</th>
              <th style={{padding:'0.75rem',textAlign:'left',fontSize:'0.85rem'}}>Email</th>
              <th style={{padding:'0.75rem',textAlign:'left',fontSize:'0.85rem'}}>Telephone</th>
              <th style={{padding:'0.75rem',textAlign:'left',fontSize:'0.85rem'}}>Ville</th>
              <th style={{padding:'0.75rem',textAlign:'left',fontSize:'0.85rem'}}>Segment</th>
              <th style={{padding:'0.75rem',textAlign:'center',fontSize:'0.85rem'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i,idx)=>(
              <tr key={i._id} style={{borderBottom:'1px solid #e5e7eb',background:idx%2===0?'white':'#f8fafc'}}>
                <td style={{padding:'0.75rem',fontWeight:'600',color:'#1e1b4b'}}>{i.nom}</td>
                <td style={{padding:'0.75rem',color:'#6b7280'}}>{i.email}</td>
                <td style={{padding:'0.75rem',color:'#6b7280'}}>{i.telephone}</td>
                <td style={{padding:'0.75rem',color:'#6b7280'}}>{i.ville}</td>
                <td style={{padding:'0.75rem'}}>
                  <span style={{background:i.segment==='professionnel'?'#ede9fe':'#e0f2fe',color:i.segment==='professionnel'?'#7c3aed':'#0369a1',padding:'0.2rem 0.7rem',borderRadius:'1rem',fontSize:'0.75rem',fontWeight:'600'}}>
                    {i.segment}
                  </span>
                </td>
                <td style={{padding:'0.75rem',textAlign:'center'}}>
                  <button onClick={()=>handleDelete(i._id)}
                    style={{background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:'0.5rem',padding:'0.3rem 0.8rem',cursor:'pointer',fontSize:'0.8rem',fontWeight:'600'}}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0&&<div style={{textAlign:'center',padding:'3rem',color:'#9ca3af'}}>Aucun client trouve</div>}
      </div>
    </div>
  );
}