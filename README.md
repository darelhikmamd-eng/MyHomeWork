# CuniGestion — Application de gestion de ferme cuniculture

Application web moderne pour la gestion d'une ferme de lapins, construite avec **Next.js 14**, **Tailwind CSS**, **Shadcn/UI** et **Prisma (SQLite)**.

## Stack Technique

- **Framework** : Next.js 14 (App Router)
- **UI** : React 18 + Tailwind CSS + Shadcn/UI
- **Icônes** : Lucide React
- **Charts** : Recharts
- **Base de données** : SQLite via Prisma ORM

## Fonctionnalités

| Page | Description |
|------|-------------|
| `/` | **Tableau de bord** — KPIs, mises-bas à venir, rappels santé, performance |
| `/inventaire` | **Inventaire** — Liste/grille de lapins avec filtres par race, sexe, statut |
| `/cycle-de-vie` | **Cycle de vie** — Suivi accouplement → gestation (J+31) → mise-bas → sevrage |
| `/sante` | **Santé** — Journal des soins, vaccins, traitements et rappels |
| `/rapports` | **Rapports** — Graphiques de croissance, reproduction, répartition |

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Initialiser la base de données
npm run db:push

# 3. Lancer en développement
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## Structure du projet

```
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── inventaire/page.tsx   # Inventaire
│   ├── cycle-de-vie/page.tsx # Cycle de vie
│   ├── sante/page.tsx        # Santé
│   ├── rapports/page.tsx     # Rapports
│   └── globals.css
├── components/
│   ├── layout/sidebar.tsx    # Navigation sidebar
│   ├── dashboard/stat-card.tsx
│   ├── rabbits/rabbit-card.tsx
│   └── ui/                   # Composants Shadcn/UI
├── lib/
│   ├── utils.ts              # Utilitaires
│   └── mock-data.ts          # Données statiques de démonstration
prisma/
└── schema.prisma             # Schéma BDD SQLite
```

## Prochaines étapes

- [ ] Connexion réelle à la base de données (remplacer mock-data)
- [ ] Formulaires d'ajout/modification (lapins, accouplements, soins)
- [ ] API Routes Next.js pour les opérations CRUD
- [ ] Authentification (NextAuth.js)
- [ ] Export PDF/CSV des rapports
- [ ] Notifications push pour les rappels
