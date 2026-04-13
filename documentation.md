# Documentation Technique - GestPro
## Système de Gestion des Ventes et Performances Commerciales
### Togo - 2026

---

## 1. Architecture Technique

### Stack Technologique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Base de données | MongoDB Atlas | 8.0 |
| Backend | Node.js + Express | v24 / v4.18 |
| Frontend | React + Vite | v18 / v5 |
| Visualisations | Recharts | v2 |
| HTTP Client | Axios | v1.6 |
| ODM | Mongoose | v7 |
| IA | Analyse locale MongoDB | - |
| Déploiement Backend | Render.com | - |
| Déploiement Frontend | Vercel | - |

### Architecture Globale

Client (Navigateur)
|
v
Frontend React (Vercel)
|
v
Backend Express (Render)
|
v
MongoDB Atlas (Cloud)

---

## 2. Structure du Projet

mon-projet/
├── backend/
│   ├── models/
│   │   ├── Client.js       # Modele client
│   │   ├── Produit.js      # Modele produit
│   │   ├── Vente.js        # Modele vente
│   │   ├── Commercial.js   # Modele commercial
│   │   ├── Reservation.js  # Modele reservation
│   │   └── Salle.js        # Modele salle
│   ├── routes/
│   │   ├── clients.js      # API CRUD clients
│   │   ├── produits.js     # API CRUD produits
│   │   ├── ventes.js       # API CRUD ventes
│   │   ├── commerciaux.js  # API CRUD commerciaux
│   │   ├── analytics.js    # Analyses et predictions
│   │   └── ia.js           # Assistant IA
│   ├── server.js           # Point dentree backend
│   ├── seed.js             # Script donnees de test
│   └── .env                # Variables environnement
└── frontend/
├── src/
│   ├── pages/
│   │   ├── Accueil.jsx     # Tableau de bord
│   │   ├── Clients.jsx     # Gestion clients
│   │   ├── Produits.jsx    # Gestion produits
│   │   ├── Ventes.jsx      # Gestion ventes
│   │   ├── Commerciaux.jsx # Gestion commerciaux
│   │   ├── Analyse.jsx     # Interface analyse
│   │   ├── Predictions.jsx # Predictions IA
│   │   └── Assistant.jsx   # Assistant IA
│   ├── api/
│   │   └── index.js        # Configuration Axios
│   └── App.jsx             # Navigation principale
└── package.json

---

## 3. Modélisation MongoDB

### Choix : Référence vs Embarqué

Nous avons utilisé le modèle par **référence** pour les relations entre collections car :
- Les données clients et produits sont réutilisées dans plusieurs ventes
- Cela évite la duplication des données
- Facilite les mises à jour

### Modèle Client
```json
{
  "_id": "ObjectId",
  "nom": "String",
  "email": "String",
  "telephone": "String",
  "ville": "String (ville + quartier Togo)",
  "segment": "String (particulier | professionnel)",
  "newsletter": "Boolean",
  "dateInscription": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Modèle Produit
```json
{
  "_id": "ObjectId",
  "nom": "String",
  "categorie": "String",
  "prixUnitaire": "Number (FCFA)",
  "stock": "Number",
  "fournisseur": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Modèle Vente
```json
{
  "_id": "ObjectId",
  "date": "Date",
  "client": "ObjectId (ref: Client)",
  "produit": "ObjectId (ref: Produit)",
  "quantite": "Number",
  "prixUnitaire": "Number (FCFA)",
  "commercialId": "ObjectId (ref: Commercial)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Modèle Commercial
```json
{
  "_id": "ObjectId",
  "nom": "String",
  "region": "String (villes du Togo)",
  "dateEmbauche": "Date",
  "objectifMensuel": "Number (FCFA)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 4. Indexation MongoDB

```javascript
// Index sur date de vente pour les requetes temporelles
VenteSchema.index({ date: 1 });

// Index sur commercial pour les performances
VenteSchema.index({ commercialId: 1 });

// Index TTL pour nettoyage automatique
VenteSchema.index({ createdAt: 1 }, { expireAfterSeconds: 0 });
```

---

## 5. Pipelines d'Agrégation

### Pipeline 1 : Chiffre d'Affaires par Période
```javascript
// Filtrage des ventes par periode, categorie et region
async function getVentesFiltrees(query) {
  const { debut, fin, categorie, region } = query;
  let ventes = await Vente.find()
    .populate('produit')
    .populate('client')
    .populate('commercialId');
  
  // Filtre par date
  if(debut) ventes = ventes.filter(v => 
    new Date(v.date) >= new Date(debut));
  if(fin) ventes = ventes.filter(v => 
    new Date(v.date) <= new Date(fin+'T23:59:59'));
  
  // Filtre par categorie produit
  if(categorie) ventes = ventes.filter(v => 
    v.produit?.categorie === categorie);
  
  // Filtre par region commercial
  if(region) ventes = ventes.filter(v => 
    v.commercialId?.region === region);
  
  return ventes;
}
```

### Pipeline 2 : Top 10 Produits les Plus Vendus
```javascript
// Aggregation des quantites par produit
const prodStats = {};
ventes.forEach(v => {
  const nom = v.produit?.nom || 'Inconnu';
  if(!prodStats[nom]) prodStats[nom] = { 
    nom, quantite: 0, ca: 0 
  };
  prodStats[nom].quantite += v.quantite;
  prodStats[nom].ca += v.quantite * v.prixUnitaire;
});

// Tri par quantite decroissante
const top10 = Object.values(prodStats)
  .sort((a,b) => b.quantite - a.quantite)
  .slice(0, 10);
```

### Pipeline 3 : Panier Moyen par Segment Client
```javascript
// Segmentation par type de client
const segments = {};
ventes.forEach(v => {
  const seg = v.client?.segment || 'inconnu';
  if(!segments[seg]) segments[seg] = { 
    segment: seg, totalCA: 0, nbVentes: 0 
  };
  segments[seg].totalCA += v.quantite * v.prixUnitaire;
  segments[seg].nbVentes++;
});

// Calcul du panier moyen par segment
const result = Object.values(segments).map(s => ({
  ...s,
  panierMoyen: Math.round(s.totalCA / s.nbVentes),
  totalCA: Math.round(s.totalCA)
}));
```

### Pipeline 4 : Taux de Conversion Clients
```javascript
// Clients actifs = achat dans les 3 derniers mois
const actifs = new Set();
ventes.forEach(v => {
  const joursInactif = (now - new Date(v.date)) / 
    (1000 * 60 * 60 * 24 * 30);
  if(joursInactif < 3) {
    actifs.add(v.client?._id?.toString());
  }
});

const tauxConversion = Math.round(
  (actifs.size / clients.length) * 100
);
```

### Pipeline 5 : Evolution Mensuelle sur 12 Mois
```javascript
// Generation des 12 derniers mois
const moisList = Array.from({length:12}, (_,i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - 11 + i);
  return new Date(d.getFullYear(), d.getMonth(), 1);
});

// CA par mois
const result = moisList.map(d => {
  const ca = ventes
    .filter(v => {
      const dv = new Date(v.date);
      return dv.getMonth() === d.getMonth() && 
             dv.getFullYear() === d.getFullYear();
    })
    .reduce((s,v) => s + (v.quantite * v.prixUnitaire), 0);
  return { 
    mois: d.toLocaleString('fr', {month:'short', year:'numeric'}), 
    ca: Math.round(ca) 
  };
});
```

### Pipeline 6 : Prédictions ML par Régression Linéaire
```javascript
// Regression lineaire pour predire les ventes futures
const n = valeurs.length;
const sumX = valeurs.reduce((_,__,i) => _ + i, 0);
const sumY = valeurs.reduce((a,b) => a + b, 0);
const sumXY = valeurs.reduce((a,b,i) => a + b*i, 0);
const sumX2 = valeurs.reduce((a,_,i) => a + i*i, 0);

// Calcul de la pente et intercept
const slope = (n*sumXY - sumX*sumY) / 
              (n*sumX2 - sumX*sumX);
const intercept = (sumY - slope*sumX) / n;

// Prediction pour les 3 prochains mois
const predictions = [1,2,3].map(i => ({
  mois: ...,
  valeur: Math.max(0, Math.round(
    intercept + slope * (n + i - 1)
  ))
}));
```

### Pipeline 7 : Segmentation Clients (RFM simplifié)
```javascript
// Classification VIP / Actifs / A risque / Perdus
Object.values(stats).forEach(c => {
  const joursInactif = Math.round(
    (now - new Date(c.dernierAchat)) / (1000*60*60*24)
  );
  
  if(c.total > 5000)      seg.vip++;      // CA > 5000 FCFA
  else if(j < 30)         seg.actifs++;   // Achat < 30 jours
  else if(j < 90)         seg.risque++;   // Inactif 30-90 jours
  else                    seg.perdus++;   // Inactif > 90 jours
});
```

---

## 6. API REST - Endpoints

### Clients
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/clients | Liste tous les clients |
| POST | /api/clients | Crée un client |
| PUT | /api/clients/:id | Modifie un client |
| DELETE | /api/clients/:id | Supprime un client |

### Produits
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/produits | Liste tous les produits |
| POST | /api/produits | Crée un produit |
| PUT | /api/produits/:id | Modifie un produit |
| DELETE | /api/produits/:id | Supprime un produit |

### Ventes
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/ventes | Liste toutes les ventes |
| POST | /api/ventes | Enregistre une vente |
| PUT | /api/ventes/:id | Modifie une vente |
| DELETE | /api/ventes/:id | Supprime une vente |

### Analytics
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/analytics/ca | CA par periode/categorie/region |
| GET | /api/analytics/top-produits | Top 10 produits |
| GET | /api/analytics/panier-segment | Panier moyen par segment |
| GET | /api/analytics/conversion | Taux de conversion |
| GET | /api/analytics/evolution | Evolution 12 mois |
| GET | /api/analytics/predictions | Predictions ML |
| GET | /api/analytics/segmentation | Segmentation clients |

---

## 7. Données de Test

Le script `seed.js` génère automatiquement :
- **50 clients** avec noms togolais et villes du Togo
- **20 produits** adaptés au marché togolais
- **10 commerciaux** par région du Togo
- **500 ventes** sur 12 mois glissants
- **3 salles** de spectacle au Togo

### Villes et Quartiers du Togo utilisés
- Lomé (Adidogomé, Baguida, Akodessewa, Nyekonakpoe, Tokoin)
- Sokodé, Kara, Atakpamé, Dapaong, Tsévié, Aneho, Bassar

---

## 8. Choix Techniques

### Pourquoi MongoDB ?
- Flexibilité du schéma pour les données commerciales
- Performances sur les requetes d'agregation
- MongoDB Atlas gratuit pour le déploiement cloud

### Pourquoi Node.js/Express ?
- JavaScript côté serveur = même langage que le frontend
- Rapide et léger pour les API REST
- Large ecosystème npm

### Pourquoi React/Vite ?
- Interface réactive et moderne
- Vite = compilation ultra-rapide
- Recharts pour les visualisations

### Pourquoi Render + Vercel ?
- Plans gratuits disponibles
- Déploiement automatique via GitHub
- Accessible partout dans le monde

---

## 9. Liens du Projet

- **Application web** : https://gestpro-five.vercel.app
- **Backend API** : https://gestpro-backend.onrender.com
- **Code source** : https://github.com/holikou08-debug/gestpro

---

## 10. Installation Locale

```bash
# Cloner le projet
git clone https://github.com/holikou08-debug/gestpro.git

# Backend
cd backend
npm install
npm run dev

# Frontend (nouveau terminal)
cd frontend
npm install
npm run dev
```

Variables d'environnement (.env) :