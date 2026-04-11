const router = require('express').Router();
const Vente = require('../models/Vente');
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
    const sumX = valeurs.reduce((_,__,i) => _+i, 0);
    const sumY = valeurs.reduce((a,b) => a+b, 0);
    const sumXY = valeurs.reduce((a,b,i) => a+b*i, 0);
    const sumX2 = valeurs.reduce((a,_,i) => a+i*i, 0);
    const slope = (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX);
    const intercept = (sumY - slope*sumX) / n;
    const predictions = [1,2,3].map(i => {
      const d = new Date(); d.setMonth(d.getMonth()+i);
      const mois = d.toLocaleString('fr',{month:'long',year:'numeric'});
      const valeur = Math.max(0, Math.round(intercept + slope*(n+i-1)));
      return {mois, valeur};
    });
    const tendance = slope > 0 ? 'hausse' : 'baisse';
    res.json({historique:moisData.map(([mois,valeur])=>({mois,valeur:Math.round(valeur)})),predictions,tendance});
  } catch(err) { res.status(500).json({error:err.message}); }
});
router.get('/segmentation', async (req, res) => {
  try {
    const ventes = await Vente.find().populate('client');
    const stats = {};
    ventes.forEach(v => {
      const id = v.client?._id?.toString();
      if(!id) return;
      if(!stats[id]) stats[id] = {nom:v.client.nom,total:0,count:0,dernierAchat:v.date};
      stats[id].total += v.quantite * v.prixUnitaire;
      stats[id].count++;
    });
    const now = new Date();
    const seg = {vip:0,actifs:0,risque:0,perdus:0};
    Object.values(stats).forEach(c => {
      const j = Math.round((now-new Date(c.dernierAchat))/(1000*60*60*24));
      if(c.total>5000) seg.vip++;
      else if(j<30) seg.actifs++;
      else if(j<90) seg.risque++;
      else seg.perdus++;
    });
    res.json(seg);
  } catch(err) { res.status(500).json({error:err.message}); }
});
module.exports = router;
