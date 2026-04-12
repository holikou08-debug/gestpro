/**
 * SERVER.JS - Point d entree principal du backend GestPro
 * 
 * Architecture :
 * - Express.js : framework web Node.js
 * - Mongoose : connexion et gestion MongoDB Atlas
 * - CORS : autorise les requetes du frontend React
 * - dotenv : charge les variables d environnement (.env)
 * 
 * Routes disponibles :
 * /api/evenements  - Gestion des evenements culturels
 * /api/salles      - Gestion des salles de spectacle
 * /api/clients     - Gestion des clients
 * /api/reservations- Gestion des reservations
 * /api/produits    - Gestion des produits
 * /api/ventes      - Gestion des ventes
 * /api/commerciaux - Gestion des commerciaux
 * /api/analytics   - Analyses et predictions ML
 * /api/ia          - Assistant IA intelligent
 */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());
mongoose.connect(process.env.MONGO_URI).then(()=>console.log('MongoDB connecte !')).catch(err=>console.log(err));
app.use('/api/evenements',require('./routes/evenements'));
app.use('/api/salles',require('./routes/salles'));
app.use('/api/clients',require('./routes/clients'));
app.use('/api/reservations',require('./routes/reservations'));
app.use('/api/produits',require('./routes/produits'));
app.use('/api/ventes',require('./routes/ventes'));
app.use('/api/commerciaux',require('./routes/commerciaux'));
app.use('/api/analytics',require('./routes/analytics'));
app.use('/api/ia',require('./routes/ia'));
app.get('/',(req,res)=>res.json({message:'Backend fonctionne !'}));
const PORT=process.env.PORT||5000;
app.listen(PORT,()=>console.log('Serveur lance sur le port '+PORT));
