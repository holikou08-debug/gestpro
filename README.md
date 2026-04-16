README - Guide d'Installation
Prérequis
•	Node.js v18 ou supérieur
•	Git
•	Compte MongoDB Atlas (gratuit)

Installation Locale
Etape 1 : Cloner le projet
git clone https://github.com/holikou08-debug/gestpro.git
cd gestpro
Etape 2 : Configurer le backend
cd backend
npm install
Créer le fichier .env :
MONGO_URI=mongodb+srv://admin:motdepasse@cluster.mongodb.net/gestion_app
PORT=5000
GEMINI_API_KEY=votre_cle_api
Lancer le backend :
npm run dev
Le serveur démarre sur http://localhost:5000
Etape 3 : Configurer le frontend
cd ../frontend
npm install
npm run dev
L'application démarre sur http://localhost:5173
Etape 4 : Charger les données de test
cd ../backend
node seed.js
Génère : 50 clients, 20 produits, 10 commerciaux, 500 ventes
