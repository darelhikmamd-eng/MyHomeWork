# 📋 Guide de Test Utilisateur — CuniGestion

**Site à tester :** https://cunigestion-alpha.vercel.app  
**Durée estimée :** 45 à 60 minutes  
**Niveau requis :** Aucune connaissance informatique particulière

---

## 📌 Instructions générales

Merci de tester ce site comme si vous l'utilisiez dans votre ferme au quotidien.  
Pour chaque étape :
- ✅ Notez ce qui **fonctionne bien**
- ❌ Notez ce qui **ne fonctionne pas** ou vous semble **bizarre**
- 💬 Notez vos **remarques et suggestions**

Utilisez la **fiche de retour** à la fin de ce document pour consigner vos observations.

---

## 🧪 MODULE 1 — Tableau de bord

> **Accès :** Cliquez sur "Tableau de bord" dans le menu à gauche

### Tests à effectuer
1. La page s'affiche-t-elle correctement sans erreur ?
2. Les chiffres (Total lapins, Mâles, Femelles...) sont-ils tous à **zéro** au départ ? C'est normal.
3. Le bouton **"Actualiser"** en haut à droite fonctionne-t-il ?
4. Les sections "Mises-bas à venir" et "Rappels santé" affichent-elles un message d'absence si rien n'est enregistré ?

### À signaler si
- La page reste blanche ou affiche une erreur
- Les chiffres ne changent pas après avoir ajouté des données (testez après le module 2)

---

## 🧪 MODULE 2 — Inventaire des lapins

> **Accès :** Cliquez sur "Inventaire" dans le menu

### Test 2.1 — Ajouter un lapin mâle
1. Cliquez sur le bouton **"+ Ajouter un lapin"**
2. Remplissez le formulaire avec ces données de test :
   - **Nom :** Sultan
   - **Identifiant :** LAP-001
   - **Race :** Choisissez une race dans la liste déroulante
   - **Sexe :** Mâle
   - **Date de naissance :** 01/01/2024
   - **Poids :** 3.5
   - **Couleur :** Blanc
   - **Numéro de cage :** A1
   - **Statut :** Reproducteur
3. Cliquez sur **"Enregistrer"**
4. Le lapin apparaît-il dans la liste ?

### Test 2.2 — Ajouter une lapine femelle
Répétez l'opération avec :
- **Nom :** Bella
- **Identifiant :** LAP-002
- **Race :** Même race ou différente
- **Sexe :** Femelle
- **Date de naissance :** 15/03/2024
- **Poids :** 3.2
- **Cage :** B1
- **Statut :** Reproductrice

### Test 2.3 — Ajouter un 3ème lapin (quelconque)
Ajoutez un lapin de votre choix avec des données réalistes.

### Test 2.4 — Vues et filtres
1. Basculez entre la vue **Grille** et la vue **Liste** (boutons en haut à droite)
2. Utilisez la **barre de recherche** : tapez "Sultan" → apparaît-il seul ?
3. Filtrez par **Sexe : Femelle** → seule Bella apparaît-elle ?
4. Filtrez par **Statut : Reproducteur** → le résultat est-il correct ?
5. Filtrez par **Race** → les races affichées sont-elles celles de vos lapins ?

### Test 2.5 — Modifier un lapin
1. Cliquez sur le bouton **✏️ (crayon)** sur la fiche de Sultan
2. Changez son poids à **3.8**
3. Cliquez sur **"Mettre à jour"**
4. La modification est-elle bien enregistrée ?

### Test 2.6 — Supprimer un lapin
1. Ajoutez un lapin temporaire (ex: "Test", LAP-999)
2. Ouvrez sa fiche de modification
3. Cliquez sur **"Supprimer"** → confirmez
4. Le lapin a-t-il bien disparu de la liste ?

### À signaler si
- Le formulaire d'ajout ne s'ouvre pas
- Les données ne s'enregistrent pas
- La liste ne se met pas à jour après ajout/modification
- Les filtres ne fonctionnent pas
- La liste des races dans le filtre est vide

---

## 🧪 MODULE 3 — Cycle de Vie (Reproduction)

> **Accès :** Cliquez sur "Cycle de Vie" dans le menu  
> ⚠️ *Vous devez avoir au moins 1 mâle et 1 femelle dans l'inventaire*

### Test 3.1 — Enregistrer un accouplement
1. Cliquez sur **"+ Enregistrer un accouplement"**
2. Sélectionnez **Sultan** comme père
3. Sélectionnez **Bella** comme mère
4. Choisissez la date d'aujourd'hui
5. Cliquez sur **"Enregistrer"**
6. La carte d'accouplement apparaît-elle avec la barre de progression ?
7. La **date de mise-bas prévue** (dans 31 jours) est-elle correctement calculée ?

### Test 3.2 — Vérifier la progression
1. La barre de progression de gestation affiche-t-elle **0%** (début) ?
2. Le statut indique-t-il **"En cours"** ?
3. Les boutons **"Enregistrer la mise-bas"**, **"Marquer échec"** et **"Supprimer"** sont-ils visibles ?

### Test 3.3 — Enregistrer une mise-bas
1. Cliquez sur **"Enregistrer la mise-bas"**
2. Saisissez : **8 nés**, **7 vivants**
3. Cliquez sur **"Enregistrer"**
4. Le statut passe-t-il à **"Mise-bas effectuée"** ?
5. Le nombre de vivants s'affiche-t-il (7/8) ?

### Test 3.4 — Tester "Marquer échec"
1. Ajoutez un 2ème accouplement (avec d'autres lapins ou les mêmes)
2. Cliquez sur **"Marquer échec"**
3. Le statut passe-t-il à **"Échec"** ?

### À signaler si
- La liste des lapins (père/mère) est vide dans le formulaire
- La date de mise-bas n'est pas calculée
- Les boutons d'action ne répondent pas
- Le statut ne change pas après action

---

## 🧪 MODULE 4 — Santé

> **Accès :** Cliquez sur "Santé" dans le menu

### Test 4.1 — Ajouter un soin
1. Cliquez sur **"+ Ajouter un soin"**
2. Remplissez :
   - **Lapin :** Sultan
   - **Type :** Vaccin
   - **Description :** Vaccin myxomatose
   - **Date :** Aujourd'hui
   - **Prochain rappel :** Dans 6 mois
   - **Coût :** 15
3. Enregistrez et vérifiez que le soin apparaît dans la liste

### Test 4.2 — Ajouter un traitement
1. Ajoutez un soin de type **"Traitement"** pour Bella
2. Description : "Traitement antiparasitaire"
3. Vérifiez l'apparition dans la liste

### Test 4.3 — Filtres par type
1. Cliquez sur les boutons filtres : **"Vaccins"**, **"Traitements"**, **"Observations"**, **"Tous les soins"**
2. Le filtre fonctionne-t-il correctement ?

### Test 4.4 — Rappels à venir
1. La section "Rappels à venir" affiche-t-elle le rappel du vaccin saisi ?
2. La date de rappel est-elle correcte ?

### Test 4.5 — Supprimer un soin
1. Cliquez sur l'icône 🗑️ à droite d'un soin
2. Confirmez avec **"Oui"**
3. Le soin disparaît-il ?

### À signaler si
- Le sélecteur de lapin est vide
- Les rappels n'apparaissent pas
- Le filtrage par type ne fonctionne pas

---

## 🧪 MODULE 5 — Alimentation

> **Accès :** Cliquez sur "Alimentation" dans le menu

### Test 5.1 — Ajouter un aliment depuis le catalogue
1. Cliquez sur **"+ Ajouter un aliment"**
2. En haut du formulaire, cherchez le menu **"Choisir depuis le catalogue"**
3. Sélectionnez **"Foin de prairie"**
4. Les champs (nom, type, unité) sont-ils pré-remplis automatiquement ?
5. Renseignez le **Stock actuel : 50** et le **Prix unitaire : 0.80**
6. Enregistrez

### Test 5.2 — Ajouter un aliment manuellement
1. Ajoutez un 2ème aliment manuellement :
   - **Nom :** Granulés lapin adulte
   - **Type :** Granulés
   - **Unité :** kg
   - **Stock actuel :** 25
   - **Stock minimum :** 5
2. Enregistrez et vérifiez l'affichage

### Test 5.3 — Vérifier les alertes de stock
1. Ajoutez un aliment avec un stock **inférieur au minimum** (ex: stock 2, minimum 5)
2. Une alerte rouge ou orange apparaît-elle sur la fiche ?

### Test 5.4 — Enregistrer une distribution
1. Cliquez sur **"Distribuer"** sur un aliment
2. Renseignez une quantité et un numéro de cage
3. La distribution est-elle enregistrée ?
4. Le stock diminue-t-il en conséquence ?

### À signaler si
- Le catalogue ne pré-remplit pas les champs
- Les alertes de stock minimum ne s'affichent pas
- Le stock ne se met pas à jour après distribution

---

## 🧪 MODULE 6 — Finances

> **Accès :** Cliquez sur "Finances" dans le menu

### Test 6.1 — Ajouter une dépense
1. Cliquez sur **"+ Ajouter une transaction"**
2. Remplissez :
   - **Type :** Dépense
   - **Catégorie :** Alimentation
   - **Montant :** 45
   - **Date :** Aujourd'hui
   - **Description :** Achat foin mensuel
3. Enregistrez

### Test 6.2 — Ajouter une recette
1. Ajoutez une recette :
   - **Type :** Recette
   - **Catégorie :** Vente lapin
   - **Montant :** 120
   - **Description :** Vente de 3 lapins

### Test 6.3 — Vérifier les statistiques
1. Le **solde** affiché est-il correct ? (120 - 45 = +75€)
2. Le graphique mensuel affiche-t-il les deux barres (recettes/dépenses) ?
3. Les sections "Top dépenses" et "Top recettes" sont-elles remplies ?

### Test 6.4 — Filtres
1. Filtrez par **"Dépenses"** → seule la dépense s'affiche ?
2. Filtrez par **"Recettes"** → seule la recette s'affiche ?
3. Le filtre par mois fonctionne-t-il ?

### Test 6.5 — Supprimer une transaction
1. Cliquez sur l'icône 🗑️ à droite d'une transaction
2. Confirmez avec **"Oui"**
3. Le solde se recalcule-t-il automatiquement ?

### À signaler si
- Le solde est incorrect
- Le graphique reste vide
- Les filtres ne fonctionnent pas

---

## 🧪 MODULE 7 — Rapports

> **Accès :** Cliquez sur "Rapports" dans le menu

### Tests à effectuer
1. La page se charge-t-elle sans erreur ?
2. Les graphiques sont-ils visibles ?
3. Les KPIs (taux de mise-bas, sevrage, mortalité) correspondent-ils aux données saisies ?
4. La répartition par race est-elle correcte ?

### À signaler si
- Les graphiques restent vides malgré des données saisies
- Les KPIs affichent des valeurs incohérentes (ex: 200%)

---

## 🧪 MODULE 8 — Diagnostic IA

> **Accès :** Cliquez sur "Diagnostic IA" dans le menu  
> ⚠️ *Fonctionnalité optionnelle — nécessite une clé API configurée*

### Tests à effectuer
1. Décrivez un symptôme fictif dans la zone de texte, par exemple :
   > "Mon lapin a le nez qui coule, il est apathique depuis 2 jours et mange moins"
2. Cliquez sur **"Analyser"**
3. Un diagnostic s'affiche-t-il ?
4. Les informations sont-elles pertinentes (maladie probable, urgence, traitement) ?

### À signaler si
- Un message d'erreur "Aucune clé API" s'affiche (c'est normal si non configuré)
- Le résultat est incohérent ou vide sans message d'erreur

---

## 🧪 MODULE 9 — Notifications

> **Accès :** Cliquez sur "Notifications" dans le menu (ou la cloche 🔔 en haut)

### Tests à effectuer
1. Des notifications apparaissent-elles après avoir saisi des données ?
   - Rappels de soins programmés
   - Mise-bas à venir
   - Stock d'aliment en dessous du minimum
2. Le badge (chiffre rouge) sur la cloche s'actualise-t-il ?
3. Les notifications ont-elles un niveau d'urgence (rouge = urgent, orange = attention) ?

---

## 🧪 MODULE 10 — Navigation générale

### Tests à effectuer
1. **Menu latéral** : tous les liens du menu fonctionnent-ils ?
2. **Responsive mobile** : si vous avez un smartphone, ouvrez le site dessus — est-ce lisible ?
3. **Retour au tableau de bord** : après avoir navigué partout, le tableau de bord affiche-t-il les nouveaux chiffres (ex: 3 lapins au lieu de 0) ?
4. **Chargement** : les pages s'affichent-elles rapidement (moins de 3 secondes) ?
5. **Favicon** : un petit icône lapin 🐇 apparaît-il dans l'onglet du navigateur ?

---

## 📝 Fiche de Retour — À Remplir

> Copiez ce tableau et renseignez-le après vos tests

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FICHE DE TEST — CuniGestion
Date du test : _______________
Navigateur utilisé : _______________  (Chrome / Firefox / Safari / Edge)
Appareil : _______________  (PC / Tablette / Smartphone)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODULE 1 — Tableau de bord
  Résultat : ✅ OK / ❌ Problème
  Remarques : _______________________________________________

MODULE 2 — Inventaire
  Résultat : ✅ OK / ❌ Problème
  Remarques : _______________________________________________

MODULE 3 — Cycle de Vie
  Résultat : ✅ OK / ❌ Problème
  Remarques : _______________________________________________

MODULE 4 — Santé
  Résultat : ✅ OK / ❌ Problème
  Remarques : _______________________________________________

MODULE 5 — Alimentation
  Résultat : ✅ OK / ❌ Problème
  Remarques : _______________________________________________

MODULE 6 — Finances
  Résultat : ✅ OK / ❌ Problème
  Remarques : _______________________________________________

MODULE 7 — Rapports
  Résultat : ✅ OK / ❌ Problème
  Remarques : _______________________________________________

MODULE 8 — Diagnostic IA
  Résultat : ✅ OK / ❌ N/A / ❌ Problème
  Remarques : _______________________________________________

MODULE 9 — Notifications
  Résultat : ✅ OK / ❌ Problème
  Remarques : _______________________________________________

MODULE 10 — Navigation générale
  Résultat : ✅ OK / ❌ Problème
  Remarques : _______________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÉVALUATION GLOBALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Note générale (de 1 à 10) : _____ / 10

Ce que j'ai trouvé le plus utile :
_______________________________________________
_______________________________________________

Ce qui manque ou devrait être amélioré :
_______________________________________________
_______________________________________________

Bugs / anomalies rencontrées (décrivez précisément) :
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

Les termes utilisés dans l'application sont-ils clairs
pour un éleveur de lapins ? _______________________________________________

Utiliseriez-vous cette application au quotidien ? OUI / NON
Pourquoi ? _______________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Merci pour votre retour !
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📞 En cas de problème technique

Si le site affiche une erreur blanche ou un message d'erreur :
1. **Notez exactement** ce qui est écrit à l'écran
2. **Prenez une capture d'écran** (touche `Impr Écran` ou `Win + Shift + S`)
3. **Notez l'heure exacte** du problème
4. Envoyez ces informations avec votre fiche de retour

---

*Guide préparé pour l'évaluation de CuniGestion v1.0 — Mai 2026*
