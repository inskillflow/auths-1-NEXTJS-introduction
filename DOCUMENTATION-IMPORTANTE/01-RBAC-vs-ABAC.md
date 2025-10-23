# Contrôle d'accès : RBAC vs ABAC

Le **contrôle d'accès basé sur les rôles (RBAC)** attribue des autorisations selon le rôle d'un utilisateur au sein d'une organisation, tandis que le **contrôle d'accès basé sur les attributs (ABAC)** utilise un ensemble de caractéristiques dynamiques pour déterminer l'accès.
L’ABAC offre un contrôle plus **granulaire** et **flexible**, mais il est aussi **plus complexe à mettre en œuvre**.

---

## Comparaison entre RBAC et ABAC

| **Caractéristique**             | **RBAC (Contrôle d'accès basé sur les rôles)**                                       | **ABAC (Contrôle d'accès basé sur les attributs)**                              |
| ------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| **Mécanisme de base**           | Attribue des permissions à des rôles prédéfinis (ex. : Administrateur, Rédacteur).   | Accorde ou refuse l'accès en fonction d'une combinaison d'attributs.            |
| **Attributs utilisés**          | Repose sur le rôle de l'utilisateur, caractéristique statique.                       | Utilise divers attributs (rôle, service, lieu, heure, sensibilité des données). |
| **Granularité**                 | Assez grossière : permissions liées aux rôles, non aux individus.                    | Très fine : accès évalué dynamiquement selon plusieurs attributs.               |
| **Flexibilité**                 | Moins flexible : nécessite souvent de créer de nouveaux rôles pour chaque exception. | Très flexible et adaptable à des scénarios complexes et dynamiques.             |
| **Complexité de mise en œuvre** | Simple et rapide : les rôles reflètent la hiérarchie de l'organisation.              | Complexe : requiert la définition de nombreuses règles et attributs.            |
| **Évolutivité**                 | Risque d’« explosion des rôles » dans les grandes structures.                        | Évolue facilement avec de nouvelles conditions sans multiplier les rôles.       |

---

## Quand utiliser le RBAC ou l'ABAC

### Optez pour le RBAC si votre organisation :

* Possède une structure simple et des rôles bien définis ;
* Compte un nombre limité d'utilisateurs et de ressources ;
* Recherche une solution rapide et facile à mettre en œuvre.

### Optez pour l'ABAC si votre organisation :

* A des besoins d'accès complexes et dynamiques ;
* Travaille dans un secteur fortement réglementé (finance, santé, etc.) ;
* Nécessite un contrôle d'accès **granulaire** et **sensible au contexte** (heure, localisation, etc.).

---

## Approche hybride

Il est également possible d’adopter une **approche hybride**, combinant :

* La **simplicité du RBAC** pour les autorisations de base ;
* La **flexibilité de l’ABAC** pour les contrôles plus précis.

**Exemple :**
Le RBAC accorde l’accès général à un service, tandis que l’ABAC affine cet accès selon des attributs spécifiques comme la localisation ou le type de données consultées.

