# 🐇 CuniGestion

> Application web complète de gestion de ferme cuniculture — suivi des lapins, reproduction, santé, alimentation et finances.

**🌐 Production :** [https://cunigestion-alpha.vercel.app](https://cunigestion-alpha.vercel.app)

---

## Aperçu

CuniGestion est une application web moderne destinée aux éleveurs de lapins. Elle centralise toutes les données de l'élevage : inventaire du cheptel, suivi de la reproduction, journal de santé, gestion des stocks alimentaires, comptabilité et rapports de performance.

---

## Fonctionnalités

### 📊 Tableau de bord
- KPIs en temps réel : total lapins, mâles, femelles, lapereaux en croissance
- Suivi des gestations en cours et des sevrages à venir
- Alertes de mises-bas imminentes
- Rappels de soins sanitaires
- Liste des derniers lapins enregistrés

### 🐰 Inventaire
- Fiche complète par lapin : nom, identifiant, race, sexe, poids, couleur, cage, statut
- Vues grille et liste
- Filtres dynamiques : race (extraite de la BDD), sexe, statut, recherche texte
- **Ajout**, **modification** et **suppression** de chaque lapin
- Catalogue de 50+ races regroupées par catégorie (Géants, Nains, Rex, Angora, etc.)

### 🔄 Cycle de Vie
- Enregistrement des accouplements (père × mère)
- Calcul automatique de la date de mise-bas (J+31)
- Barre de progression de gestation en temps réel
- Alerte "mise-bas imminente" à J-3
- **Enregistrement de la mise-bas** : nombre de nés, nombre de vivants
- **Marquer un échec** de gestation
- Suppression d'un accouplement

### 🏥 Santé
- Journal des soins : vaccins, traitements, observations, visites vétérinaires
- Filtres par type de soin
- Rappels automatiques avec indicateur de retard
- Affichage des coûts par soin
- **Suppression** de chaque entrée

### 🌿 Alimentation
- Gestion des stocks d'aliments avec seuils d'alerte
- Catalogue prédéfini de 22 aliments courants pour lapins (foin, granulés, légumes, suppléments)
- Sélection rapide depuis le catalogue pour pré-remplir les formulaires
- Enregistrement des distributions par cage
- Suivi du stock par type (foin, granulés, légumes, suppléments)

### 💶 Finances
- Enregistrement des dépenses et recettes
- Graphique d'évolution mensuelle sur 12 mois (barres cliquables)
- Répartition par catégorie (alimentation, vétérinaire, vente, équipement, etc.)
- Solde global avec indicateur bénéfice/déficit
- Filtre par mois et par type
- **Suppression** de chaque transaction

### 📈 Rapports
- Courbes de croissance de référence par âge
- KPIs de production : taux de mise-bas, sevrage, mortalité
- Graphiques de répartition du cheptel

### 🤖 Diagnostic IA
- Analyse des symptômes par photo ou description textuelle
- Moteur IA double : **Groq (Llama 4 Scout)** en priorité, **Gemini** en fallback
- Renvoie un diagnostic structuré : maladie probable, niveau d'urgence, traitements recommandés

### 🔔 Notifications
- Centre de notifications en temps réel
- Alertes automatiques : rappels de soins, mises-bas imminentes, stocks bas
- Badge compteur dans la sidebar

---

## Stack Technique

| Couche | Technologie |
|--------|------------|
| Framework | Next.js 14 (App Router) |
| Langage | TypeScript |
| UI | React 18 + Tailwind CSS |
| Composants | Shadcn/UI + Radix UI |
| Icônes | Lucide React |
| Graphiques | Recharts |
| ORM | Prisma 5 |
| Base de données | PostgreSQL (Neon) |
| Déploiement | Vercel |
| IA | Groq API (Llama 4) + Google Gemini |

---

## Architecture API

Toutes les routes sont des **Next.js API Routes** (`/src/app/api/`) :

| Méthode | Route | Description |
|---------|-------|-------------|
| GET / POST | `/api/rabbits` | Lister / Créer un lapin |
| PUT / DELETE | `/api/rabbits/[id]` | Modifier / Supprimer un lapin |
| GET / POST | `/api/accouplements` | Lister / Créer un accouplement |
| PATCH / DELETE | `/api/accouplements/[id]` | Mettre à jour (mise-bas, échec) / Supprimer |
| GET / POST | `/api/sante` | Lister / Créer un log de soin |
| DELETE | `/api/sante/[id]` | Supprimer un log |
| GET / POST | `/api/aliments` | Lister / Créer un aliment |
| PATCH / DELETE | `/api/aliments/[id]` | Mettre à jour le stock / Supprimer |
| GET / POST | `/api/transactions` | Lister / Créer une transaction |
| DELETE | `/api/transactions/[id]` | Supprimer une transaction |
| GET | `/api/notifications` | Alertes automatiques temps réel |
| POST | `/api/diagnostic` | Analyse IA des symptômes |

---

## Structure du Projet

```
cuniculture-app/
├── prisma/
│   └── schema.prisma          # Schéma BDD (Rabbit, Accouplement, SanteLog, Aliment, Transaction...)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Tableau de bord
│   │   ├── inventaire/        # Gestion du cheptel
│   │   ├── cycle-de-vie/      # Reproduction & gestation
│   │   ├── sante/             # Journal de santé
│   │   ├── alimentation/      # Stocks & distributions
│   │   ├── finances/          # Comptabilité
│   │   ├── rapports/          # Statistiques & graphiques
│   │   ├── diagnostic/        # Diagnostic IA
│   │   ├── notifications/     # Centre de notifications
│   │   ├── parametres/        # Paramètres
│   │   ├── api/               # Routes API REST
│   │   ├── layout.tsx         # Layout global
│   │   ├── globals.css        # Styles globaux
│   │   └── icon.svg           # Favicon lapin
│   ├── components/
│   │   ├── layout/            # Sidebar de navigation
│   │   ├── rabbits/           # RabbitCard (grille & liste)
│   │   ├── forms/             # Formulaires (add/edit rabbit, aliment, soin, etc.)
│   │   └── ui/                # Composants Shadcn/UI
│   └── lib/
│       ├── prisma.ts          # Client Prisma singleton
│       └── utils.ts           # Utilitaires (formatDate, cn, etc.)
├── .env.example               # Variables d'environnement (modèle)
└── package.json
```

---

## Installation & Développement Local

### Prérequis
- Node.js 18+
- npm ou yarn
- Un compte [Neon](https://neon.tech) (PostgreSQL gratuit) ou une base PostgreSQL locale

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/darelhikmamd-eng/MyHomeWork.git
cd MyHomeWork

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env et renseigner DATABASE_URL
```

### Variables d'environnement (`.env`)

```env
# Base de données PostgreSQL (Neon ou locale)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# API Diagnostic IA (optionnel)
GROQ_API_KEY="votre_clé_groq"       # Gratuit sur console.groq.com
GEMINI_API_KEY="votre_clé_gemini"   # Gratuit sur aistudio.google.com
```

### Lancement

```bash
# Créer les tables dans la base de données
npm run db:push

# Lancer le serveur de développement
npm run dev
```

Application disponible sur **http://localhost:3000**

### Commandes utiles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run db:push      # Synchroniser le schéma Prisma avec la BDD
npm run db:studio    # Interface graphique Prisma Studio
```

---

## Déploiement sur Vercel

1. Connecter le dépôt GitHub à [Vercel](https://vercel.com)
2. Ajouter la variable `DATABASE_URL` dans **Settings → Environment Variables**
3. Vercel exécute automatiquement `prisma generate && next build`
4. Chaque `git push` sur `main` déclenche un redéploiement automatique

---

## Modèle de Données

```prisma
Rabbit            # Lapin (nom, race, sexe, statut, poids, cage...)
Accouplement      # Reproduction (père, mère, dates, mise-bas, lapereaux)
Lapereau          # Lapereau issu d'une mise-bas
SanteLog          # Soin vétérinaire (vaccin, traitement, observation)
PoidsLog          # Historique de pesée
Aliment           # Stock alimentaire (type, unité, seuil d'alerte)
DistributionAliment # Distribution d'aliment par cage
Transaction       # Dépense ou recette financière
```

---

## Licence

Projet privé — Tous droits réservés © 2026
