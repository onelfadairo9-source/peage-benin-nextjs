# Péage Bénin — Plateforme Next.js (sans compte client)

Plateforme de paiement du péage routier béninois, en deux modes :
- **Prédéfini** : on programme un trajet à l'avance (ville de départ/arrivée, date), le prix est calculé automatiquement selon la distance et le type de véhicule.
- **Instantané** : on paie un passage immédiat à un poste de péage précis.

Pas de compte client : chaque trajet/passage reçoit une **référence unique** (ex: `PRE-260628-AB3K`) qui sert de preuve de paiement (avec QR code), à retrouver à tout moment via la page de vérification.

## Stack technique

- **Next.js 16** (App Router) + React 19 + TypeScript
- **PostgreSQL** via Drizzle ORM
- **Paiement réel** via Kkiapay (Mobile Money MTN/Moov/Celtiis + carte bancaire)
- **Tailwind CSS 4**

## Installation locale

```bash
npm install
cp .env.example .env
```

Remplissez `.env` avec :
1. `DATABASE_URL` — connexion à une base PostgreSQL (locale ou hébergée)
2. Vos clés **Kkiapay** (https://app.kkiapay.me/dashboard)
3. `ADMIN_USERNAME` / `ADMIN_PASSWORD` pour l'espace admin

## Créer les tables

Avant le premier démarrage, exécutez le script `schema.sql` sur votre base PostgreSQL :

```bash
psql "$DATABASE_URL" -f schema.sql
```

(Optionnel) Remplir avec des données de démonstration :
```bash
psql "$DATABASE_URL" -f seed.sql
```

## Démarrage

```bash
npm run build
npm start
```

Ou en développement : `npm run dev`

## Paiement Kkiapay — comment ça marche

1. **Côté client** (`ConfirmationClient.tsx`) : un seul bouton "Payer" ouvre le widget Kkiapay (gère Mobile Money et carte automatiquement).
2. **Côté serveur** (`/api/payment/verify`) : dès que le widget renvoie un succès, le serveur **revérifie la transaction auprès de Kkiapay** (montant + statut) avant d'activer le trajet/passage. On ne fait jamais confiance à ce qui vient du navigateur seul.

En mode sandbox (`KKIAPAY_SANDBOX=true`), utilisez les numéros de test fournis dans la documentation Kkiapay.

## Déploiement sur Render

1. **Créer une base PostgreSQL** sur Render (New + → PostgreSQL, plan gratuit possible)
2. Copier l'**Internal Database URL** fournie par Render
3. **Créer un Web Service** pointant sur ce dépôt GitHub :
   - Build Command : `npm install && npm run build`
   - Start Command : `npm start`
4. Dans les **Environment Variables** du Web Service, ajouter :
   - `DATABASE_URL` = l'URL copiée à l'étape 2
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD`
   - `KKIAPAY_PUBLIC_KEY`, `KKIAPAY_PRIVATE_KEY`, `KKIAPAY_SECRET`, `KKIAPAY_SANDBOX`
   - `NODE_ENV` = `production`
5. Une fois déployé, ouvrir le **Shell** de Render (menu de gauche) et exécuter :
   ```bash
   psql "$DATABASE_URL" -f schema.sql
   ```
   pour créer les tables (une seule fois).

## Structure du projet

```
src/
├── app/
│   ├── (public)/            # Pages publiques (accueil, prédéfini, instantané, vérification, confirmation)
│   ├── admin/                # Espace admin (login + tableau de bord)
│   └── api/                   # Routes API (paiement, admin, recherche...)
├── components/                # Composants réutilisables (carte, QR code, graphiques...)
├── db/                         # Connexion PostgreSQL + schéma Drizzle
└── lib/                         # Logique métier (tarification, services, auth, constantes)
```

## Espace admin

Accessible sur `/admin` (redirige vers `/admin/login` si non connecté).
Identifiants : ceux définis dans `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

Affiche : revenus (total, du jour, graphique 7 jours), répartition par véhicule/station/méthode de paiement, liste des abonnements/passages/transactions avec recherche et changement de statut.

## Sécurité — avant la mise en production

- Changez `ADMIN_PASSWORD` (la valeur par défaut dans le code est `peage2026` si la variable n'est pas définie — ne jamais laisser ça en prod).
- Mettez `KKIAPAY_SANDBOX=false` et vos clés de production une fois les tests validés.
- Le fichier `.env` ne doit jamais être commité (`.gitignore` le couvre déjà).
- Sauvegardez régulièrement votre base PostgreSQL.

## Limites connues

- Pas de webhook Kkiapay pour les paiements différés (la vérification se fait au retour du widget uniquement).
- Pas de réinitialisation de mot de passe admin par email/SMS.
