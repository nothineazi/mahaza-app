# RUNBOOK — Mahaza Beauty (déploiement du staging sur Dokploy)

> Version RUN-P (démonstration, sans base de données). Le runbook complet (base, sauvegarde, restauration, incident) arrive au RUN-C.
> Tout ce qui suit se fait **une fois**. Les mises à jour suivantes se résument à « Deploy » dans Dokploy.

**Ce qui est déployé** : l'image `ghcr.io/nothineazi/mahaza-app`, construite par GitHub Actions (jamais sur le serveur). Elle se lance avec `APP_ENV=staging` : bandeau « Version de développement – données fictives » et liens WhatsApp **sans destinataire**. Aucun secret, aucune base.

## 0. Avant de commencer

- L'image est publiée à chaque push sur `main` (workflow **Release**). Vérifier dans GitHub : dépôt `mahaza-app` › **Actions** › **Release** vert, puis **Packages** (colonne de droite de la page du dépôt) : le paquet `mahaza-app` existe avec les tags `latest` et un SHA.
- Le paquet GHCR est **privé** (le dépôt l'est) : Dokploy doit s'authentifier (étapes 1 et 2).

## 1. Créer un token GitHub (classic) en lecture de paquets

1. GitHub › photo de profil › **Settings** › tout en bas **Developer settings** › **Personal access tokens** › **Tokens (classic)**.
2. **Generate new token** › **Generate new token (classic)**.
3. **Note** : `dokploy-ghcr-lecture` · **Expiration** : 90 jours · coche **uniquement** `read:packages`.
4. **Generate token** puis **copie le token tout de suite** (il ne sera plus affiché). Ne le colle nulle part ailleurs que dans Dokploy.

## 2. Ajouter le registre dans Dokploy

1. Dokploy › **Settings** (menu de gauche) › **Registry** › **Add Registry**.
2. **Registry Name** : `ghcr` · **Username** : `nothineazi` · **Password** : le token de l'étape 1 · **Registry URL** : `ghcr.io`.
3. **Test Connection** doit répondre « succès » (si non : token mal copié, ou case `read:packages` oubliée), puis **Create** / **Save**.

(Si le registre `ghcr` existe déjà pour l'autre application, passer à l'étape 3 : il se réutilise.)

## 3. Choisir un port libre sur le serveur

Le serveur est partagé (Koverit, IziiCorp sur le 3001, mahaza-demo…). **Ne jamais deviner** : lister les ports déjà publiés (PowerShell, depuis ton poste ; remplace `IP` par l'adresse du serveur) :

```powershell
ssh root@IP "docker ps --format '{{.Names}}  {{.Ports}}'"
ssh root@IP "ss -ltnH | awk '{print `$4}' | sed 's/.*://' | sort -n | uniq"
```

Le plan prévoit **3101** pour cette application (`3101` pour mahaza-app, `3102` pour stlouis-app). S'il apparaît dans l'une des deux listes, en prendre un autre, libre (ex. 3103, 3104), et le noter ici.

## 4. Créer l'application

1. Dokploy › **Projects** › ouvrir (ou créer) le projet `demos-clients` › **Create Service** › **Application**.
2. **Name** : `mahaza-app` · **Create**.
3. Onglet **General** › **Provider** : **Docker**.
   - **Docker Image** : `ghcr.io/nothineazi/mahaza-app:latest` (pour figer une version : remplacer `latest` par le SHA du commit).
   - **Registry** : sélectionner `ghcr` · **Save**.

## 5. Variable d'environnement

Onglet **Environment** : coller exactement

```
APP_ENV=staging
```

puis **Save**. (Ne rien ajouter d'autre : l'application n'a besoin d'aucun secret. Le conteneur écoute sur le port interne 3000 par défaut.)

## 6. Port publié

Onglet **Advanced** › section **Ports** › **Add Port** :

| Published Port | Target Port | Protocol |
|---|---|---|
| `3101` (ou le port libre choisi à l'étape 3) | `3000` | `tcp` |

**Save**. (Ne pas utiliser l'onglet **Domains** : le staging se consulte en `http://IP:PORT`.)

Si le serveur a un pare-feu : l'ouvrir pour ce port (`ufw allow 3101/tcp` ; Docker contourne ufw pour les ports publiés, mais le pare-feu du fournisseur — Hostinger › VPS › Pare-feu — doit autoriser le port).

## 7. Limites mémoire et CPU (serveur partagé)

Mesures de ce run (image réelle, `APP_ENV=staging`) : **77 Mo au repos**, **146 Mo** après la suite e2e complète (28 scénarios, 2 tailles d'écran). Limites proposées, avec une large marge :

Onglet **Advanced** › **Cluster Settings** / **Resources** :

| Réglage | Valeur |
|---|---|
| Memory Limit | `512` (Mo) |
| Memory Reservation | `256` (Mo) |
| CPU Limit | `0.5` |
| CPU Reservation | `0.25` |

**Save**. (Si la limite était dépassée, Docker redémarrerait le conteneur : le Deploy suivant la prend en compte.)

## 8. Déployer et vérifier

1. Onglet **General** › **Deploy**. Onglet **Deployments** puis **Logs** : on attend `✓ Ready` (quelques secondes ; l'image fait ≈ 326 Mo à télécharger la première fois).
2. Vérifier depuis PowerShell (remplace `IP` et le port) :

```powershell
Invoke-RestMethod http://IP:3101/api/health            # attendu : status = ok
(Invoke-WebRequest http://IP:3101/).StatusCode          # attendu : 200
(Invoke-WebRequest http://IP:3101/).Content -match "données fictives"   # attendu : True
```

3. Ouvrir `http://IP:3101/` dans un navigateur : le bandeau doré / crème « Version de développement – données fictives » est en haut ; `http://IP:3101/admin` ouvre le back-office de démonstration.
4. Dans le tunnel de réservation, à l'écran de confirmation, le lien « Envoyer la confirmation sur WhatsApp » commence par `https://wa.me/?text=` (aucun numéro).

Dokploy affiche l'état **healthy** grâce au `HEALTHCHECK` de l'image (`/api/health`).

## 9. Mettre à jour, revenir en arrière

- **Mise à jour** : après un push sur `main` (workflow Release vert) › Dokploy › **Deploy** (l'image `latest` est retirée de nouveau).
- **Retour arrière** : onglet **General** › remplacer le tag `latest` par le SHA d'un commit précédent (GitHub › Packages › `mahaza-app` › liste des versions) › **Save** › **Deploy**.
- L'état de la démo vit dans le navigateur de chaque visiteur (`sessionStorage`) : redéployer ne perd rien côté serveur, et « Réinitialiser la démo » (menu du back-office) remet les données de départ.

## 10. Dépannage rapide

| Symptôme | Cause probable | Action |
|---|---|---|
| « unauthorized » / « denied » au Deploy | token absent, expiré ou sans `read:packages` | refaire les étapes 1 et 2 |
| « manifest unknown » | workflow Release pas encore passé, ou tag inexistant | GitHub › Actions › Release ; utiliser `latest` |
| Page inaccessible depuis l'extérieur | port non publié (étape 6), pare-feu, ou port déjà pris | vérifier l'étape 3 et 6 |
| Conteneur qui redémarre | limite mémoire trop basse | monter à `768` Mo |
| Bandeau « fictives » absent | `APP_ENV` ≠ `staging`/`development` | vérifier l'étape 5 : pas de `production` sur ce staging |

## Risques acceptés du staging (voir `docs/SECURITY.md`)

HTTP sur IP (pas de HTTPS : cookies `Secure` et PWA impossibles, sans objet à ce stade) ; aucune authentification sur `/admin` avant le RUN-A ; aucune donnée réelle.
