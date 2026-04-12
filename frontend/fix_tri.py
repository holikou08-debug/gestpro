# Ajout tri clients
f=open('src/pages/Clients.jsx','r',encoding='utf-8')
c=f.read()
f.close()

c=c.replace(
"  const [recherche, setRecherche] = useState('');",
"  const [recherche, setRecherche] = useState('');\n  const [tri, setTri] = useState('recent');"
)

c=c.replace(
"  const filtered = items.filter(i =>",
"""  const filtered = items.filter(i =>"""
)

c=c.replace(
"""  const filtered = items.filter(i =>
    i.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
    i.email?.toLowerCase().includes(recherche.toLowerCase()) ||
    i.ville?.toLowerCase().includes(recherche.toLowerCase())
  );""",
"""  const filtered = items
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
  });"""
)

c=c.replace(
'<input placeholder="🔍 Rechercher par nom, email, ville..." value={recherche}',
"""<select value={tri} onChange={e=>setTri(e.target.value)}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem'}}>
            <option value="recent">Plus recent</option>
            <option value="ancien">Plus ancien</option>
            <option value="nom">Nom A-Z</option>
            <option value="nom-desc">Nom Z-A</option>
            <option value="ville">Ville</option>
            <option value="segment">Segment</option>
          </select>
          <input placeholder="🔍 Rechercher par nom, email, ville..." value={recherche}"""
)

f=open('src/pages/Clients.jsx','w',encoding='utf-8')
f.write(c)
f.close()
print('Clients tri ok!')

# Ajout tri produits
f=open('src/pages/Produits.jsx','r',encoding='utf-8')
c=f.read()
f.close()

c=c.replace(
"  const [filtreCategorie, setFiltreCategorie] = useState('');",
"  const [filtreCategorie, setFiltreCategorie] = useState('');\n  const [tri, setTri] = useState('recent');"
)

c=c.replace(
"""  const filtered = items.filter(i =>
    (i.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
    i.fournisseur?.toLowerCase().includes(recherche.toLowerCase())) &&
    (filtreCategorie==='' || i.categorie===filtreCategorie)
  );""",
"""  const filtered = items
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
  });"""
)

c=c.replace(
'<input placeholder="🔍 Rechercher..." value={recherche}',
"""<select value={tri} onChange={e=>setTri(e.target.value)}
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
            <input placeholder="🔍 Rechercher..." value={recherche}"""
)

f=open('src/pages/Produits.jsx','w',encoding='utf-8')
f.write(c)
f.close()
print('Produits tri ok!')

# Ajout tri ventes
f=open('src/pages/Ventes.jsx','r',encoding='utf-8')
c=f.read()
f.close()

c=c.replace(
"  const [recherche, setRecherche] = useState('');",
"  const [recherche, setRecherche] = useState('');\n  const [tri, setTri] = useState('recent');"
)

c=c.replace(
"""  const filtered = items.filter(i =>
    i.client?.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
    i.produit?.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
    i.commercialId?.nom?.toLowerCase().includes(recherche.toLowerCase())
  );""",
"""  const filtered = items
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
  });"""
)

c=c.replace(
'<input placeholder="🔍 Rechercher par client, produit, commercial..." value={recherche}',
"""<select value={tri} onChange={e=>setTri(e.target.value)}
            style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem'}}>
            <option value="recent">Plus recent</option>
            <option value="ancien">Plus ancien</option>
            <option value="client">Client A-Z</option>
            <option value="produit">Produit A-Z</option>
            <option value="montant-desc">Montant decroissant</option>
            <option value="montant-asc">Montant croissant</option>
          </select>
          <input placeholder="🔍 Rechercher par client, produit, commercial..." value={recherche}"""
)

f=open('src/pages/Ventes.jsx','w',encoding='utf-8')
f.write(c)
f.close()
print('Ventes tri ok!')

# Ajout tri commerciaux
f=open('src/pages/Commerciaux.jsx','r',encoding='utf-8')
c=f.read()
f.close()

c=c.replace(
"  const [filtreRegion, setFiltreRegion] = useState('');",
"  const [filtreRegion, setFiltreRegion] = useState('');\n  const [tri, setTri] = useState('recent');"
)

c=c.replace(
"""  const filtered = items.filter(i =>
    i.nom?.toLowerCase().includes(recherche.toLowerCase()) &&
    (filtreRegion==='' || i.region===filtreRegion)
  );""",
"""  const filtered = items
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
  });"""
)

c=c.replace(
'<input placeholder="🔍 Rechercher..." value={recherche}',
"""<select value={tri} onChange={e=>setTri(e.target.value)}
              style={{padding:'0.7rem 1rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem'}}>
              <option value="recent">Plus recent</option>
              <option value="ancien">Plus ancien</option>
              <option value="nom">Nom A-Z</option>
              <option value="nom-desc">Nom Z-A</option>
              <option value="region">Region</option>
              <option value="objectif-desc">Objectif decroissant</option>
              <option value="objectif-asc">Objectif croissant</option>
            </select>
            <input placeholder="🔍 Rechercher..." value={recherche}"""
)

f=open('src/pages/Commerciaux.jsx','w',encoding='utf-8')
f.write(c)
f.close()
print('Commerciaux tri ok!')