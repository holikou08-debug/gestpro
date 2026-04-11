const mongoose = require('mongoose');
require('dotenv').config();
const Client = require('./models/Client');
const Produit = require('./models/Produit');
const Commercial = require('./models/Commercial');
const Vente = require('./models/Vente');
const Evenement = require('./models/Evenement');
const Salle = require('./models/Salle');
const villes = ['Lome','Sokode','Kara','Atakpame','Dapaong','Tsevie','Aneho','Bassar'];
const quartiers = ['Adidogome','Baguida','Akodessewa','Nyekonakpoe','Tokoin','Agoenyive','Kodjoviakope','Hedzranawoe','Agoe','Be'];
const prenoms = ['Kofi','Ama','Koffi','Akosua','Yao','Abla','Edem','Afua','Kwame','Akua'];
const noms = ['Agbeko','Amegbo','Atsou','Dossou','Gbenou','Kponton','Mensah','Sossou','Tchao','Yovo'];
const categories = ['Electronique','Tissus','Alimentation','Sport','Maison','Beaute','Agriculture','Artisanat'];
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connecte !');
  await Client.deleteMany({});
  await Produit.deleteMany({});
  await Commercial.deleteMany({});
  await Vente.deleteMany({});
  await Evenement.deleteMany({});
  await Salle.deleteMany({});
  const salles = await Salle.insertMany([
    {nom:'Palais des Congres',adresse:'Boulevard du 13 Janvier, Lome',capaciteTotale:1000},
    {nom:'Salle de Fetes de Lome',adresse:'Rue de la Paix, Lome',capaciteTotale:500},
    {nom:'Centre Culturel de Kara',adresse:'Avenue Nationale, Kara',capaciteTotale:300},
  ]);
  const clients = [];
  for(let i=0;i<50;i++) {
    clients.push({
      nom: prenoms[i%10]+' '+noms[i%10],
      email: prenoms[i%10].toLowerCase()+i+'@gmail.com',
      telephone: '9'+Math.floor(Math.random()*9000000+1000000),
      ville: villes[i%8]+' - '+quartiers[i%10],
      segment: i%3===0?'professionnel':'particulier',
      newsletter: i%2===0,
      dateInscription: new Date(Date.now()-Math.random()*365*24*60*60*1000)
    });
  }
  const savedClients = await Client.insertMany(clients);
  const produits = [];
  const nomsP = ['Smartphone Samsung','Tissu Kente','Riz local 25kg','Ballon de foot','Ventilateur','Creme Karite','Semences mais','Poterie artisanale','Telephone Tecno','Pagne wax','Huile de palme','Chaussures sport','Casserole inox','Savon local','Engrais NPK','Panier osier','Tablette','Boubou traditionnel','Farine manioc','Ballon basket'];
  for(let i=0;i<20;i++) {
    produits.push({
      nom: nomsP[i],
      categorie: categories[i%8],
      prixUnitaire: Math.round((Math.random()*200000+5000)/500)*500,
      stock: Math.round(Math.random()*500+50),
      fournisseur: 'Fournisseur '+(i%5+1)+' Lome'
    });
  }
  const savedProduits = await Produit.insertMany(produits);
  const commerciaux = [];
  const nomsC = ['Kodjo Mensah','Ama Sossou','Edem Agbeko','Akua Dossou','Yao Tchao','Abla Gbenou','Koffi Atsou','Afua Kponton','Kwame Amegbo','Akosua Yovo'];
  for(let i=0;i<10;i++) {
    commerciaux.push({
      nom: nomsC[i],
      region: villes[i%8],
      dateEmbauche: new Date(Date.now()-Math.random()*3*365*24*60*60*1000),
      objectifMensuel: Math.round((Math.random()*5000000+1000000)/50000)*50000
    });
  }
  const savedCommerciaux = await Commercial.insertMany(commerciaux);
  const ventes = [];
  for(let i=0;i<500;i++) {
    ventes.push({
      date: new Date(Date.now()-Math.random()*365*24*60*60*1000),
      client: savedClients[Math.floor(Math.random()*savedClients.length)]._id,
      produit: savedProduits[Math.floor(Math.random()*savedProduits.length)]._id,
      quantite: Math.round(Math.random()*10+1),
      prixUnitaire: Math.round((Math.random()*200000+5000)/500)*500,
      commercialId: savedCommerciaux[Math.floor(Math.random()*savedCommerciaux.length)]._id
    });
  }
  await Vente.insertMany(ventes);
  const evenements = [];
  const nomsE = ['Festival Akpema','Concert AUBE','Soiree Afrobeat','Nuit Culturelle','Gala de Lome','Festival du Kpalime','Soiree Jazz','Concert Gospel','Fete de la Musique','Spectacle Danse'];
  for(let i=0;i<20;i++) {
    evenements.push({
      titre: nomsE[i%10]+' '+(i+1),
      description: 'Grand evenement culturel au Togo',
      artistes: ['Artiste '+(i+1)],
      date: new Date(Date.now()+(Math.random()*90-30)*24*60*60*1000),
      heure: '20:00',
      salle: salles[i%3]._id,
      capacite: Math.round(Math.random()*500+100),
      prix: [{categorie:'Standard',montant:Math.round((Math.random()*10000+2000)/500)*500},{categorie:'VIP',montant:Math.round((Math.random()*30000+10000)/500)*500}]
    });
  }
  await Evenement.insertMany(evenements);
  console.log('Seed Togo termine ! 50 clients, 20 produits, 10 commerciaux, 500 ventes, 20 evenements');
  process.exit(0);
}
seed().catch(err => { console.error(err); process.exit(1); });
