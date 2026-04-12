// ROUTES IA - Assistant intelligent base sur les donnees
const router = require('express').Router();
const Vente = require('../models/Vente');
const Client = require('../models/Client');
const Produit = require('../models/Produit');
const Commercial = require('../models/Commercial');

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const msg = message.toLowerCase();
    const [ventes, clients, produits, commerciaux] = await Promise.all([
      Vente.find().populate('produit').populate('client').populate('commercialId'),
      Client.find(), Produit.find(), Commercial.find()
    ]);
    const totalCA = ventes.reduce((s,v)=>s+(v.quantite*v.prixUnitaire),0);
    const panierMoyen = ventes.length>0 ? Math.round(totalCA/ventes.length) : 0;
    const now = new Date();
    const ventesThisMois = ventes.filter(v=>new Date(v.date).getMonth()===now.getMonth());
    const caThisMois = ventesThisMois.reduce((s,v)=>s+(v.quantite*v.prixUnitaire),0);
    const topProduits = Object.entries(ventes.reduce((acc,v)=>{
      const nom=v.produit?.nom||'Inconnu';
      acc[nom]=(acc[nom]||0)+v.quantite;
      return acc;
    },{})).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const topClients = Object.entries(ventes.reduce((acc,v)=>{
      const nom=v.client?.nom||'Inconnu';
      acc[nom]=(acc[nom]||0)+(v.quantite*v.prixUnitaire);
      return acc;
    },{})).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const topCommerciaux = Object.entries(ventes.reduce((acc,v)=>{
      const nom=v.commercialId?.nom||'Inconnu';
      acc[nom]=(acc[nom]||0)+(v.quantite*v.prixUnitaire);
      return acc;
    },{})).sort((a,b)=>b[1]-a[1]).slice(0,3);
    const stockFaible = produits.filter(p=>p.stock<50);
    const profs = clients.filter(c=>c.segment==='professionnel').length;

    let reply = '';

    if(msg.includes('bonjour')||msg.includes('salut')||msg.includes('hello')) {
      reply = "Bonjour ! Je suis votre assistant GestPro.\n\nJe peux analyser :\n- Ventes et CA\n- Clients\n- Produits\n- Commerciaux\n- Conseils\n\nQue souhaitez-vous savoir ?";
    } else if(msg.includes('produit')||msg.includes('vendu')||msg.includes('stock')) {
      reply = "Top 5 produits les plus vendus :\n\n";
      topProduits.forEach(([nom,qty],i)=>{ reply += (i+1)+". "+nom+" : "+qty+" unites\n"; });
      if(stockFaible.length>0) {
        reply += "\nProduits en stock faible (<50) :\n";
        stockFaible.slice(0,3).forEach(p=>{ reply += "- "+p.nom+" : "+p.stock+" unites\n"; });
      }
      reply += "\nTotal catalogue : "+produits.length+" produits";
    } else if(msg.includes('client')||msg.includes('meilleur')) {
      reply = "Top 5 meilleurs clients :\n\n";
      topClients.forEach(([nom,ca],i)=>{ reply += (i+1)+". "+nom+" : "+Math.round(ca).toLocaleString('fr')+" FCFA\n"; });
      reply += "\nTotal : "+clients.length+" clients ("+profs+" professionnels)";
    } else if(msg.includes('ca')||msg.includes('chiffre')||msg.includes('vente')||msg.includes('analyse')) {
      reply = "Analyse des performances :\n\n";
      reply += "CA total : "+Math.round(totalCA).toLocaleString('fr')+" FCFA\n";
      reply += "CA ce mois : "+Math.round(caThisMois).toLocaleString('fr')+" FCFA\n";
      reply += "Panier moyen : "+panierMoyen.toLocaleString('fr')+" FCFA\n";
      reply += "Nombre de ventes : "+ventes.length+" transactions\n";
      reply += "Produit star : "+(topProduits[0]?.[0]||'N/A');
    } else if(msg.includes('commercial')||msg.includes('vendeur')||msg.includes('agent')) {
      reply = "Top commerciaux :\n\n";
      topCommerciaux.forEach(([nom,ca],i)=>{ reply += (i+1)+". "+nom+" : "+Math.round(ca).toLocaleString('fr')+" FCFA\n"; });
      reply += "\nTotal : "+commerciaux.length+" agents actifs";
    } else if(msg.includes('conseil')||msg.includes('amelior')||msg.includes('recommand')) {
      reply = "Conseils pour GestPro Togo :\n\n";
      reply += "1. Produit star : "+(topProduits[0]?.[0]||'N/A')+" - augmentez le stock\n";
      reply += "2. Fidelisez vos "+profs+" clients professionnels\n";
      reply += "3. Panier moyen actuel : "+panierMoyen.toLocaleString('fr')+" FCFA - visez +20%\n";
      reply += "4. Meilleur commercial : "+(topCommerciaux[0]?.[0]||'N/A')+"\n";
      reply += "5. Consultez la page Predictions IA pour anticiper vos ventes";
    } else if(msg.includes('bilan')||msg.includes('rapport')||msg.includes('tout')) {
      reply = "Bilan complet GestPro :\n\n";
      reply += "CA total : "+Math.round(totalCA).toLocaleString('fr')+" FCFA\n";
      reply += "CA ce mois : "+Math.round(caThisMois).toLocaleString('fr')+" FCFA\n";
      reply += "Panier moyen : "+panierMoyen.toLocaleString('fr')+" FCFA\n";
      reply += "Clients : "+clients.length+" ("+profs+" pros)\n";
      reply += "Produits : "+produits.length+" references\n";
      reply += "Commerciaux : "+commerciaux.length+" agents\n\n";
      reply += "Produit star : "+(topProduits[0]?.[0]||'N/A')+"\n";
      reply += "Meilleur client : "+(topClients[0]?.[0]||'N/A');
    } else {
      reply = "Je peux vous aider avec :\n\n";
      reply += "- 'analyse' ou 'ventes' : Analyse du CA\n";
      reply += "- 'clients' : Meilleurs clients\n";
      reply += "- 'produits' : Produits et stocks\n";
      reply += "- 'commerciaux' : Performances\n";
      reply += "- 'conseils' : Recommandations\n";
      reply += "- 'bilan' : Rapport complet";
    }

    res.json({ reply });
  } catch(err) {
    console.error('Erreur IA:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;