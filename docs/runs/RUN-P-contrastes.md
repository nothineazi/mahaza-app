# RUN-P — contrastes WCAG AA (Mahaza Beauty)

Généré par `npm run check:contrast -- --markdown` à partir de `src/brand/theme/tokens.css` (OKLCH → sRGB → luminance relative ; transparences composées sur la surface réelle ; un jeton hors gamme sRGB fait échouer le contrôle). Seuils : texte 4,5:1, éléments d'interface 3:1.

| Groupe | Couple | Seuil | Clair | Sombre |
|---|---|---:|---:|---:|
| Socle | Texte courant sur fond | 4.5 | 14.91 ✅ | 18.86 ✅ |
| Socle | Texte sur carte | 4.5 | 15.57 ✅ | 17.37 ✅ |
| Socle | Texte sur menu / dialogue (popover) | 4.5 | 15.57 ✅ | 17.37 ✅ |
| Socle | Texte sur muted | 4.5 | 13.66 ✅ | 15.37 ✅ |
| Socle | Texte atténué sur fond | 4.5 | 5.78 ✅ | 7.91 ✅ |
| Socle | Texte atténué sur carte | 4.5 | 6.03 ✅ | 7.29 ✅ |
| Socle | Texte atténué sur muted | 4.5 | 5.29 ✅ | 6.45 ✅ |
| Socle | Texte atténué sur secondaire | 4.5 | 5.14 ✅ | 6.45 ✅ |
| Socle | Texte secondaire-foreground sur secondaire | 4.5 | 10.09 ✅ | 11.89 ✅ |
| Socle | Texte accent-foreground sur accent (survol) | 4.5 | 10.09 ✅ | 11.89 ✅ |
| Socle | Bouton primaire (primary-foreground sur primary) | 4.5 | 7.53 ✅ | 10.32 ✅ |
| Socle | Bouton primaire au survol (primary/90) | 4.5 | 5.90 ✅ | 8.44 ✅ |
| Socle | Accent en texte (primary-text) sur carte | 4.5 | 7.53 ✅ | 10.32 ✅ |
| Socle | Accent en texte sur fond | 4.5 | 7.21 ✅ | 11.20 ✅ |
| Socle | Accent en texte sur info-bg (pastille) | 4.5 | 6.31 ✅ | 8.33 ✅ |
| Socle | Accent en texte sur secondaire | 4.5 | 6.42 ✅ | 9.13 ✅ |
| Socle | Destructif en texte sur carte | 4.5 | 6.08 ✅ | 6.85 ✅ |
| Socle | Destructif en texte sur danger-bg | 4.5 | 5.21 ✅ | 5.64 ✅ |
| Socle | Succès en texte sur carte | 4.5 | 6.50 ✅ | 9.58 ✅ |
| Socle | Succès en texte sur fond | 4.5 | 6.22 ✅ | 10.40 ✅ |
| Socle | Avertissement en texte sur carte | 4.5 | 6.98 ✅ | 10.32 ✅ |
| Socle | Bordure de carte sur fond (non-texte) | 3 | 3.11 ✅ | 1.65 ✅ |
| Socle | Bordure de carte sur carte (non-texte) | 3 | 3.24 ✅ | 1.74 ✅ |
| Socle | Bordure de champ (input) sur carte (WCAG 1.4.11) | 3 | 3.24 ✅ | 3.57 ✅ |
| Socle | Bordure de champ (input) sur fond (WCAG 1.4.11) | 3 | 3.11 ✅ | 3.51 ✅ |
| Socle | Anneau de focus (ring) sur fond | 3 | 7.21 ✅ | 11.20 ✅ |
| Socle | Anneau de focus (ring) sur carte | 3 | 7.53 ✅ | 10.32 ✅ |
| Socle | Anneau de focus (ring) sur coque (sidebar) | 3 | 6.90 ✅ | 10.71 ✅ |
| Socle | Icône d'accent (primary) sur carte (non-texte) | 3 | 7.53 ✅ | 10.32 ✅ |
| Coque | Texte de la coque (sidebar-foreground sur sidebar) | 4.5 | 18.13 ✅ | 18.04 ✅ |
| Coque | Texte atténué (élément de navigation inactif) sur sidebar | 4.5 | 5.53 ✅ | 7.57 ✅ |
| Coque | Élément actif (sidebar-accent-foreground sur sidebar-accent) | 4.5 | 9.53 ✅ | 11.89 ✅ |
| Coque | Élément de navigation au survol (texte sur sidebar-accent/60) | 4.5 | 17.18 ✅ | 16.51 ✅ |
| Coque | Accent en texte sur sidebar | 4.5 | 6.90 ✅ | 10.71 ✅ |
| Coque | Filet de la coque (sidebar-border) sur sidebar (décoratif) | 1.05 | 1.24 ✅ | 1.29 ✅ |
| Statuts | Badge « pending » (fg sur bg) | 4.5 | 6.03 ✅ | 8.07 ✅ |
| Statuts | Bloc de planning « pending » : texte courant sur bg | 4.5 | 13.45 ✅ | 13.58 ✅ |
| Statuts | Bloc de planning « pending » : texte atténué sur bg | 4.5 | 5.21 ✅ | 5.70 ✅ |
| Statuts | Liseré de statut « pending » sur carte (non-texte) | 3 | 6.98 ✅ | 10.32 ✅ |
| Statuts | Badge « confirmed » (fg sur bg) | 4.5 | 5.69 ✅ | 7.82 ✅ |
| Statuts | Bloc de planning « confirmed » : texte courant sur bg | 4.5 | 13.65 ✅ | 14.17 ✅ |
| Statuts | Bloc de planning « confirmed » : texte atténué sur bg | 4.5 | 5.29 ✅ | 5.94 ✅ |
| Statuts | Liseré de statut « confirmed » sur carte (non-texte) | 3 | 6.50 ✅ | 9.58 ✅ |
| Statuts | Badge « completed » (fg sur bg) | 4.5 | 6.31 ✅ | 8.33 ✅ |
| Statuts | Bloc de planning « completed » : texte courant sur bg | 4.5 | 13.04 ✅ | 14.02 ✅ |
| Statuts | Bloc de planning « completed » : texte atténué sur bg | 4.5 | 5.06 ✅ | 5.88 ✅ |
| Statuts | Liseré de statut « completed » sur carte (non-texte) | 3 | 7.53 ✅ | 10.32 ✅ |
| Statuts | Badge « cancelled » (fg sur bg) | 4.5 | 5.29 ✅ | 6.45 ✅ |
| Statuts | Bloc de planning « cancelled » : texte courant sur bg | 4.5 | 13.66 ✅ | 15.37 ✅ |
| Statuts | Bloc de planning « cancelled » : texte atténué sur bg | 4.5 | 5.29 ✅ | 6.45 ✅ |
| Statuts | Liseré de statut « cancelled » sur carte (non-texte) | 3 | 6.03 ✅ | 7.29 ✅ |
| Statuts | Badge « noshow » (fg sur bg) | 4.5 | 6.20 ✅ | 7.11 ✅ |
| Statuts | Bloc de planning « noshow » : texte courant sur bg | 4.5 | 13.36 ✅ | 14.30 ✅ |
| Statuts | Bloc de planning « noshow » : texte atténué sur bg | 4.5 | 5.18 ✅ | 6.00 ✅ |
| Statuts | Liseré de statut « noshow » sur carte (non-texte) | 3 | 7.22 ✅ | 8.64 ✅ |
| Public | Texte sur secondaire (compte à rebours, sélection) | 4.5 | 13.27 ✅ | 15.37 ✅ |
| Public | Texte sur secondaire/50 (sélection) | 4.5 | 10.70 ✅ | 13.39 ✅ |
| Public | Texte atténué sur muted/60 | 4.5 | 5.48 ✅ | 7.11 ✅ |
| Public | Texte atténué sur muted/40 | 4.5 | 5.58 ✅ | 7.41 ✅ |
| Public | Bouton or (gold-foreground sur gold) | 4.5 | 8.52 ✅ | 9.88 ✅ |
| Public | Bouton or au survol (gold/90) | 4.5 | 9.05 ✅ | 8.08 ✅ |
| Public | Pastille « en attente » : texte sur gold/25 sur carte | 4.5 | 13.34 ✅ | 9.77 ✅ |
| Public | Bouton WhatsApp (success-foreground sur success) | 4.5 | 6.50 ✅ | 9.47 ✅ |
| Public | Bouton WhatsApp au survol (success/90) | 4.5 | 5.22 ✅ | 7.76 ✅ |
| Public | Succès sur success/10 (notice) | 4.5 | 5.39 ✅ | 9.00 ✅ |
| Public | Destructif sur destructif/10 | 4.5 | 5.16 ✅ | 5.93 ✅ |
| Public | Destructif sur destructif/5 | 4.5 | 5.38 ✅ | 7.07 ✅ |
| Public | Surface inversée : texte | 4.5 | 14.51 ✅ | 12.19 ✅ |
| Public | Surface inversée : texte/90 | 4.5 | 11.97 ✅ | 10.18 ✅ |
| Public | Surface inversée : texte/85 | 4.5 | 10.81 ✅ | 9.26 ✅ |
| Public | Surface inversée : texte/80 | 4.5 | 9.72 ✅ | 8.39 ✅ |
| Public | Surface inversée : texte/75 | 4.5 | 8.71 ✅ | 7.57 ✅ |
| Public | Surface inversée : texte/70 | 4.5 | 7.77 ✅ | 6.81 ✅ |
| Public | Surface inversée : or (liens, kicker) | 4.5 | 8.52 ✅ | 7.79 ✅ |
| Public | Hero : texte/90 sur voile inversé/88, visuel blanc (pire cas) | 4.5 | 8.46 ✅ | 7.13 ✅ |
| Public | Hero : or sur voile inversé/88, visuel blanc (pire cas) | 4.5 | 5.87 ✅ | 5.33 ✅ |
| Public | Piste d'interrupteur éteinte (muted-foreground/70) sur carte | 3 | 3.13 ✅ | 4.19 ✅ |
| Public | Barre de progression (primary) sur piste (line) | 3 | 5.59 ✅ | 7.84 ✅ |
| Public | Anneau de focus (or) sur surface inversée | 3 | 8.52 ✅ | 7.79 ✅ |

Tous les couples respectent le seuil WCAG AA (clair : 79 couples · sombre : 79 couples)
