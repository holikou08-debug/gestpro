// MODELE COMMERCIAL - Agents de vente avec objectifs mensuels
// Permet de suivre les performances par region
﻿const mongoose = require("mongoose"); const CommercialSchema = new mongoose.Schema({ nom: String, region: String, dateEmbauche: Date, objectifMensuel: Number }, { timestamps: true }); module.exports = mongoose.model("Commercial", CommercialSchema);