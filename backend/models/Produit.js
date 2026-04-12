// MODELE PRODUIT - Catalogue des produits en vente
// Contient prix, stock et fournisseur
﻿const mongoose = require("mongoose"); const ProduitSchema = new mongoose.Schema({ nom: String, categorie: String, prixUnitaire: Number, stock: Number, fournisseur: String }, { timestamps: true }); module.exports = mongoose.model("Produit", ProduitSchema);