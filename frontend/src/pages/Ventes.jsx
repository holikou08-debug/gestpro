// PAGE VENTES - Gestion CRUD des ventes avec recherche en temps reel
// Permet d'ajouter, supprimer et rechercher des ventes
import React, { useEffect, useState } from 'react';
import { getVentes, createVente, deleteVente, getClients, getProduits, getCommerciaux } from '../api';

export default function Ventes() {
  // Etats principaux
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [commerciaux, setCommerciaux] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [tri, setTri] = useState('recent');
  const [form, setForm] = useState({ client:'', produit:'', quantite:'', prixUnitaire:'', commercialId:'' });

  // Chargement des donnees au demarrage
  useEffect(() => {
    getVentes().then(r=>setItems(r.data));
    getClients().then(r=>setClients(r.data));
    getProduits().then(r=>setProduits(r.data));
    getCommerciaux().then(r=>setCommerciaux(r.data));
  }, []);

  // Filtrage par recherche
  const filtered = items
  .filter(i =>
    i.client?.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
    i.produit?.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
    i.commercialId?.nom?.toLowerCase().includes(recherche.toLowerCase())
  )
  .sort((a,b) => {
    if(tri==='client') return (a.client?.nom||'').localeCompare(b.client?.nom||'');
    if(tri==='produit') return (a.produit?.nom||'').localeCompare(b.produit?.nom||'');
    if(tri==='montant-desc') return (b.quantite*b.prixUnitaire) - (a.quantite*a.prixUnitaire);
    if(tri==='montant-asc') return (a.quantite*a.prixUnitaire) - (b.quantite*b.prixUnitaire);
    if(tri==='ancien') return new Date(a.date) - new Date(b.date);
    return new Date(b.date) - new Date(a.date);
  });

  // Calcul du CA total filtre
  const caTotal = filtered.reduce((s,v)=>s+(v.quantite*v.prixUnitaire),0);

  // Ajout d'une vente
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createVente(form);
    const r = await getVentes();
    setItems(r.data);
    setForm({ client:'', produit:'', quantite:'', prixUnitaire:'', commercialId:'' });
  };

  // Suppression d'une vente
  const handleDelete = async (id) => {
    if(window.confirm('Supprimer cette vente ?')) {
      await deleteVente(id);
      setItems(items.filter(i=>i._id!==id));
    }
  };

  return (
    <div style={{padding:'2rem',background:'#f8fafc',minHeight:'100vh'}}>
      <div style={{marginBottom:'2rem'}}>
        <h1 style={{fontSize:'1.8rem',fontWeight:'800',color:'#1e1b4b'}}>💰 Gestion des Ventes</h1>
        <p style={{color:'#9ca3af'}}>{items.length} transactions enregistrees</p>
      </div>

      {/* Formulaire ajout vente */}
      <div style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)',marginBottom:'1.5rem'}}>
        <h3 style={{color:'#1e1b4b',fontWeight:'700',marginBottom:'1rem'}}>➕ Enregistrer une vente</h3>
        <form onSubmit={handleSubmit} style={{display:'flex',flexWrap:'wrap',gap:'0.75rem'}}>
          <select value={form.client} onChange={e=>setForm({...form,client:e.target.value})}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',minWidth:'150px'}} required>
            <option value="">Choisir client</option>
            {clients.map(c=><option key={c._id} value={c._id}>{c.nom}</option>)}
          </select>
          <select value={form.produit} onChange={e=>{
            const p=produits.find(p=>p._id===e.target.value);
            setForm({...form,produit:e.target.value,prixUnitaire:p?.prixUnitaire||''});
          }} style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',minWidth:'150px'}} required>
            <option value="">Choisir produit</option>
            {produits.map(p=><option key={p._id} value={p._id}>{p.nom}</option>)}
          </select>
          <input placeholder="Quantite" type="number" value={form.quantite} onChange={e=>setForm({...form,quantite:e.target.value})}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',width:'100px'}} required/>
          <input placeholder="Prix unitaire FCFA" type="number" value={form.prixUnitaire} onChange={e=>setForm({...form,prixUnitaire:e.target.value})}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',width:'160px'}}/>
          <select value={form.commercialId} onChange={e=>setForm({...form,commercialId:e.target.value})}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',minWidth:'150px'}}>
            <option value="">Choisir commercial</option>
            {commerciaux.map(c=><option key={c._id} value={c._id}>{c.nom}</option>)}
          </select>
          <button type="submit" style={{padding:'0.7rem 1.5rem',background:'linear-gradient(135deg,#10b981,#059669)',color:'white',border:'none',borderRadius:'0.75rem',cursor:'pointer',fontWeight:'600'}}>
            Enregistrer
          </button>
        </form>
      </div>

      {/* Liste ventes */}
      <div style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'0.75rem'}}>
          <div>
            <h3 style={{color:'#1e1b4b',fontWeight:'700'}}>Liste des ventes ({filtered.length})</h3>
            <p style={{color:'#10b981',fontWeight:'700',fontSize:'0.9rem'}}>CA : {Math.round(caTotal).toLocaleString('fr')} FCFA</p>
          </div>
          <select value={tri} onChange={e=>setTri(e.target.value)}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem'}}>
            <option value="recent">Plus recent</option>
            <option value="ancien">Plus ancien</option>
            <option value="client">Client A-Z</option>
            <option value="produit">Produit A-Z</option>
            <option value="montant-desc">Montant decroissant</option>
            <option value="montant-asc">Montant croissant</option>
          </select>
          <input placeholder="🔍 Rechercher par client, produit, commercial..." value={recherche}
            onChange={e=>setRecherche(e.target.value)}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',width:'320px'}}/>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'linear-gradient(135deg,#1e1b4b,#4f46e5)',color:'white'}}>
              <th style={{padding:'0.75rem',textAlign:'left',fontSize:'0.85rem'}}>Client</th>
              <th style={{padding:'0.75rem',textAlign:'left',fontSize:'0.85rem'}}>Produit</th>
              <th style={{padding:'0.75rem',textAlign:'center',fontSize:'0.85rem'}}>Qte</th>
              <th style={{padding:'0.75rem',textAlign:'right',fontSize:'0.85rem'}}>Prix unit.</th>
              <th style={{padding:'0.75rem',textAlign:'right',fontSize:'0.85rem'}}>Total</th>
              <th style={{padding:'0.75rem',textAlign:'left',fontSize:'0.85rem'}}>Commercial</th>
              <th style={{padding:'0.75rem',textAlign:'left',fontSize:'0.85rem'}}>Date</th>
              <th style={{padding:'0.75rem',textAlign:'center',fontSize:'0.85rem'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i,idx)=>(
              <tr key={i._id} style={{borderBottom:'1px solid #e5e7eb',background:idx%2===0?'white':'#f8fafc'}}>
                <td style={{padding:'0.75rem',fontWeight:'600',color:'#1e1b4b'}}>{i.client?.nom}</td>
                <td style={{padding:'0.75rem',color:'#6b7280'}}>{i.produit?.nom}</td>
                <td style={{padding:'0.75rem',textAlign:'center',fontWeight:'600'}}>{i.quantite}</td>
                <td style={{padding:'0.75rem',textAlign:'right',color:'#6b7280'}}>{Number(i.prixUnitaire).toLocaleString('fr')} FCFA</td>
                <td style={{padding:'0.75rem',textAlign:'right',fontWeight:'700',color:'#10b981'}}>{Math.round(i.quantite*i.prixUnitaire).toLocaleString('fr')} FCFA</td>
                <td style={{padding:'0.75rem',color:'#6b7280'}}>{i.commercialId?.nom||'-'}</td>
                <td style={{padding:'0.75rem',color:'#6b7280',fontSize:'0.85rem'}}>{new Date(i.date).toLocaleDateString('fr')}</td>
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
        {filtered.length===0&&<div style={{textAlign:'center',padding:'3rem',color:'#9ca3af'}}>Aucune vente trouvee</div>}
      </div>
    </div>
  );
}