// ROUTES ANALYTICS - Analyses et predictions ML
// Toutes les routes supportent les filtres : debut, fin, categorie, region
const router = require('express').Router();
const Vente = require('../models/Vente');
const Client = require('../models/Client');

// Fonction helper pour filtrer les ventes selon les parametres
async function getVentesFiltrees(query) {
  const { debut, fin, categorie, region } = query;
  let ventes = await Vente.find().populate('produit').populate('client').populate('commercialId');
  if(debut) ventes = ventes.filter(v => new Date(v.date) >= new Date(debut));
  if(fin) ventes = ventes.filter(v => new Date(v.date) <= new Date(fin+'T23:59:59'));
  if(categorie) ventes = ventes.filter(v => v.produit?.categorie === categorie);
  if(region) ventes = ventes.filter(v => v.commercialId?.region === region);
  return ventes;
}

// CA par periode, categorie, commercial, region
router.get('/ca', async (req, res) => {
  try {
    const ventes = await getVentesFiltrees(req.query);
    const ca = ventes.reduce((s,v)=>s+(v.quantite*v.prixUnitaire),0);
    const nbVentes = ventes.length;
    const panierMoyen = nbVentes>0 ? Math.round(ca/nbVentes) : 0;
    res.json({ ca: Math.round(ca), nbVentes, panierMoyen });
  } catch(err) { res.status(500).json({error:err.message}); }
});

// Top 10 produits les plus vendus
router.get('/top-produits', async (req, res) => {
  try {
    const ventes = await getVentesFiltrees(req.query);
    const prodStats = {};
    ventes.forEach(v => {
      const nom = v.produit?.nom || 'Inconnu';
      const cat = v.produit?.categorie || 'Inconnu';
      if(!prodStats[nom]) prodStats[nom] = { nom, categorie: cat, quantite: 0, ca: 0 };
      prodStats[nom].quantite += v.quantite;
      prodStats[nom].ca += v.quantite * v.prixUnitaire;
    });
    const top = Object.values(prodStats).sort((a,b)=>b.quantite-a.quantite).slice(0,10);
    res.json(top);
  } catch(err) { res.status(500).json({error:err.message}); }
});

// Panier moyen par segment client
router.get('/panier-segment', async (req, res) => {
  try {
    const ventes = await getVentesFiltrees(req.query);
    const segments = {};
    ventes.forEach(v => {
      const seg = v.client?.segment || 'inconnu';
      if(!segments[seg]) segments[seg] = { segment: seg, totalCA: 0, nbVentes: 0 };
      segments[seg].totalCA += v.quantite * v.prixUnitaire;
      segments[seg].nbVentes++;
    });
    const result = Object.values(segments).map(s => ({
      ...s,
      panierMoyen: Math.round(s.totalCA/s.nbVentes),
      totalCA: Math.round(s.totalCA)
    }));
    res.json(result);
  } catch(err) { res.status(500).json({error:err.message}); }
});

// Taux de conversion clients actifs vs inactifs
router.get('/conversion', async (req, res) => {
  try {
    const ventes = await getVentesFiltrees(req.query);
    const clients = await Client.find();
    const now = new Date();
    const actifs = new Set();
    ventes.forEach(v => {
      if((now - new Date(v.date))/(1000*60*60*24*30) < 3) {
        actifs.add(v.client?._id?.toString());
      }
    });
    const nbActifs = actifs.size;
    const nbInactifs = Math.max(0, clients.length - nbActifs);
    const tauxConversion = clients.length>0 ? Math.round((nbActifs/clients.length)*100) : 0;
    res.json({ nbActifs, nbInactifs, total: clients.length, tauxConversion });
  } catch(err) { res.status(500).json({error:err.message}); }
});

// Evolution mensuelle avec filtres dynamiques
router.get('/evolution', async (req, res) => {
  try {
    const { debut, fin } = req.query;
    const ventes = await getVentesFiltrees(req.query);

    let moisList = [];
    if(debut && fin) {
      const start = new Date(debut);
      const end = new Date(fin);
      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      while(current <= end) {
        moisList.push(new Date(current));
        current = new Date(current.getFullYear(), current.getMonth()+1, 1);
      }
    } else {
      moisList = Array.from({length:12}, (_,i) => {
        const d = new Date();
        d.setMonth(d.getMonth()-11+i);
        return new Date(d.getFullYear(), d.getMonth(), 1);
      });
    }

    const result = moisList.map(d => {
      const label = d.toLocaleString('fr', {month:'short', year:'numeric'});
      const ca = ventes.filter(v => {
        const dv = new Date(v.date);
        return dv.getMonth()===d.getMonth() && dv.getFullYear()===d.getFullYear();
      }).reduce((s,v)=>s+(v.quantite*v.prixUnitaire), 0);
      return { mois: label, ca: Math.round(ca) };
    });
    res.json(result);
  } catch(err) { res.status(500).json({error:err.message}); }
});

// Predictions ML par regression lineaire
router.get('/predictions', async (req, res) => {
  try {
    const ventes = await Vente.find().sort({date:1});
    const parMois = {};
    ventes.forEach(v => {
      const key = new Date(v.date).toISOString().slice(0,7);
      if(!parMois[key]) parMois[key] = 0;
      parMois[key] += v.quantite * v.prixUnitaire;
    });
    const moisData = Object.entries(parMois).sort().slice(-6);
    const valeurs = moisData.map(([,v]) => v);
    const n = valeurs.length;
    const sumX = valeurs.reduce((_,__,i)=>_+i, 0);
    const sumY = valeurs.reduce((a,b)=>a+b, 0);
    const sumXY = valeurs.reduce((a,b,i)=>a+b*i, 0);
    const sumX2 = valeurs.reduce((a,_,i)=>a+i*i, 0);
    const slope = (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX);
    const intercept = (sumY - slope*sumX) / n;
    const predictions = [1,2,3].map(i => {
      const d = new Date();
      d.setMonth(d.getMonth()+i);
      const mois = d.toLocaleString('fr', {month:'long', year:'numeric'});
      const valeur = Math.max(0, Math.round(intercept + slope*(n+i-1)));
      return { mois, valeur };
    });
    const tendance = slope > 0 ? 'hausse' : 'baisse';
    res.json({ historique: moisData.map(([mois,valeur])=>({mois,valeur:Math.round(valeur)})), predictions, tendance });
  } catch(err) { res.status(500).json({error:err.message}); }
});

// Segmentation clients VIP / Actifs / A risque / Perdus
router.get('/segmentation', async (req, res) => {
  try {
    const ventes = await Vente.find().populate('client');
    const stats = {};
    ventes.forEach(v => {
      const id = v.client?._id?.toString();
      if(!id) return;
      if(!stats[id]) stats[id] = { nom: v.client.nom, total: 0, count: 0, dernierAchat: v.date };
      stats[id].total += v.quantite * v.prixUnitaire;
      stats[id].count++;
    });
    const now = new Date();
    const seg = { vip: 0, actifs: 0, risque: 0, perdus: 0 };
    Object.values(stats).forEach(c => {
      const j = Math.round((now - new Date(c.dernierAchat))/(1000*60*60*24));
      if(c.total > 5000) seg.vip++;
      else if(j < 30) seg.actifs++;
      else if(j < 90) seg.risque++;
      else seg.perdus++;
    });
    res.json(seg);
  } catch(err) { res.status(500).json({error:err.message}); }
});

module.exports = router;