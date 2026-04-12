// PAGE PRODUITS - Gestion CRUD des produits avec recherche en temps reel
// Permet d'ajouter, modifier, supprimer et rechercher des produits
import React, { useEffect, useState } from 'react';
import { getProduits, createProduit, deleteProduit } from '../api';

export default function Produits() {
  // Etat des produits et du formulaire
  const [items, setItems] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtreCategorie, setFiltreCategorie] = useState('');
  const [tri, setTri] = useState('recent');
  const [form, setForm] = useState({ nom:'', categorie:'', prixUnitaire:'', stock:'', fournisseur:'' });

  // Chargement des produits au demarrage
  useEffect(() => { getProduits().then(r => setItems(r.data)); }, []);

  // Filtrage par recherche et categorie
  const filtered = items
  .filter(i =>
    (i.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
    i.fournisseur?.toLowerCase().includes(recherche.toLowerCase())) &&
    (filtreCategorie==='' || i.categorie===filtreCategorie)
  )
  .sort((a,b) => {
    if(tri==='nom') return (a.nom||'').localeCompare(b.nom||'');
    if(tri==='nom-desc') return (b.nom||'').localeCompare(a.nom||'');
    if(tri==='prix-asc') return a.prixUnitaire - b.prixUnitaire;
    if(tri==='prix-desc') return b.prixUnitaire - a.prixUnitaire;
    if(tri==='stock') return b.stock - a.stock;
    if(tri==='categorie') return (a.categorie||'').localeCompare(b.categorie||'');
    if(tri==='ancien') return new Date(a.createdAt) - new Date(b.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Categories uniques pour le filtre
  const categories = [...new Set(items.map(i=>i.categorie).filter(Boolean))];

  // Ajout d'un produit
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createProduit(form);
    const r = await getProduits();
    setItems(r.data);
    setForm({ nom:'', categorie:'', prixUnitaire:'', stock:'', fournisseur:'' });
  };

  // Suppression d'un produit
  const handleDelete = async (id) => {
    if(window.confirm('Supprimer ce produit ?')) {
      await deleteProduit(id);
      setItems(items.filter(i => i._id !== id));
    }
  };

  return (
    <div style={{padding:'2rem',background:'#f8fafc',minHeight:'100vh'}}>
      <div style={{marginBottom:'2rem'}}>
        <h1 style={{fontSize:'1.8rem',fontWeight:'800',color:'#1e1b4b'}}>📦 Gestion des Produits</h1>
        <p style={{color:'#9ca3af'}}>{items.length} produits en catalogue</p>
      </div>

      {/* Formulaire ajout produit */}
      <div style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)',marginBottom:'1.5rem'}}>
        <h3 style={{color:'#1e1b4b',fontWeight:'700',marginBottom:'1rem'}}>➕ Ajouter un produit</h3>
        <form onSubmit={handleSubmit} style={{display:'flex',flexWrap:'wrap',gap:'0.75rem'}}>
          <input placeholder="Nom du produit" value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',minWidth:'150px'}} required/>
          <input placeholder="Categorie" value={form.categorie} onChange={e=>setForm({...form,categorie:e.target.value})}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',minWidth:'130px'}}/>
          <input placeholder="Prix unitaire (FCFA)" value={form.prixUnitaire} onChange={e=>setForm({...form,prixUnitaire:e.target.value})}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',minWidth:'150px'}}/>
          <input placeholder="Stock" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',minWidth:'100px'}}/>
          <input placeholder="Fournisseur" value={form.fournisseur} onChange={e=>setForm({...form,fournisseur:e.target.value})}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',minWidth:'130px'}}/>
          <button type="submit" style={{padding:'0.7rem 1.5rem',background:'linear-gradient(135deg,#06b6d4,#0891b2)',color:'white',border:'none',borderRadius:'0.75rem',cursor:'pointer',fontWeight:'600'}}>
            Ajouter
          </button>
        </form>
      </div>

      {/* Liste produits */}
      <div style={{background:'white',borderRadius:'1.2rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'0.75rem'}}>
          <h3 style={{color:'#1e1b4b',fontWeight:'700'}}>Liste des produits ({filtered.length})</h3>
          <div style={{display:'flex',gap:'0.75rem'}}>
            <select value={filtreCategorie} onChange={e=>setFiltreCategorie(e.target.value)}
              style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem'}}>
              <option value="">Toutes categories</option>
              {categories.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <select value={tri} onChange={e=>setTri(e.target.value)}
              style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem'}}>
              <option value="recent">Plus recent</option>
              <option value="ancien">Plus ancien</option>
              <option value="nom">Nom A-Z</option>
              <option value="nom-desc">Nom Z-A</option>
              <option value="prix-asc">Prix croissant</option>
              <option value="prix-desc">Prix decroissant</option>
              <option value="stock">Stock</option>
              <option value="categorie">Categorie</option>
            </select>
            <input placeholder="🔍 Rechercher..." value={recherche} onChange={e=>setRecherche(e.target.value)}
              style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',width:'220px'}}/>
          </div>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'linear-gradient(135deg,#1e1b4b,#4f46e5)',color:'white'}}>
              <th style={{padding:'0.75rem',textAlign:'left',fontSize:'0.85rem'}}>Nom</th>
              <th style={{padding:'0.75rem',textAlign:'left',fontSize:'0.85rem'}}>Categorie</th>
              <th style={{padding:'0.75rem',textAlign:'right',fontSize:'0.85rem'}}>Prix</th>
              <th style={{padding:'0.75rem',textAlign:'center',fontSize:'0.85rem'}}>Stock</th>
              <th style={{padding:'0.75rem',textAlign:'left',fontSize:'0.85rem'}}>Fournisseur</th>
              <th style={{padding:'0.75rem',textAlign:'center',fontSize:'0.85rem'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i,idx)=>(
              <tr key={i._id} style={{borderBottom:'1px solid #e5e7eb',background:idx%2===0?'white':'#f8fafc'}}>
                <td style={{padding:'0.75rem',fontWeight:'600',color:'#1e1b4b'}}>{i.nom}</td>
                <td style={{padding:'0.75rem'}}>
                  <span style={{background:'#ede9fe',color:'#7c3aed',padding:'0.2rem 0.7rem',borderRadius:'1rem',fontSize:'0.75rem',fontWeight:'600'}}>{i.categorie}</span>
                </td>
                <td style={{padding:'0.75rem',textAlign:'right',fontWeight:'700',color:'#10b981'}}>{Number(i.prixUnitaire).toLocaleString('fr')} FCFA</td>
                <td style={{padding:'0.75rem',textAlign:'center'}}>
                  <span style={{background:i.stock<50?'#fee2e2':'#dcfce7',color:i.stock<50?'#dc2626':'#16a34a',padding:'0.2rem 0.7rem',borderRadius:'1rem',fontSize:'0.75rem',fontWeight:'600'}}>
                    {i.stock}
                  </span>
                </td>
                <td style={{padding:'0.75rem',color:'#6b7280'}}>{i.fournisseur}</td>
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
        {filtered.length===0&&<div style={{textAlign:'center',padding:'3rem',color:'#9ca3af'}}>Aucun produit trouve</div>}
      </div>
    </div>
  );
}