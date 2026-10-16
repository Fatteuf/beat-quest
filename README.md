
## Structure

Le code source est dans `src/`. Les fichiers sont assemblés dans l'ordre de leur nom pour former `beat-quest.html`.

| Fichier | Contenu |
|---|---|
| `00-head.html` | Style (CSS) et structure des écrans |
| `10-core.js` | Moteur : sauvegarde, XP, mondes et étapes, compétences, outils, sons de batterie |
| `15-audio2.js` | Synthé, chanson de démo, mesure LUFS, export WAV, décors et monstres |
| `20-learn.js` | Questions du monde 1, quiz, Ear Gym |
| `30-screens.js` | Écrans : accueil, carte, régions, studio, Beat Forest, combats |
| `40-rigs.js` | Plugins : synthé, EQ, compresseur, reverb, delay, mixeur, automation, limiteur |
| `45-questions2.js` | Questions des mondes 2 à 7 |
| `48-worldkit.js` | Briques communes aux mondes 2 à 7 (manches de combat, Master Trials) |
| `50-caves.js` à `55-sky.js` | Un fichier par monde : leçons, boss, Master Trial |
| `60-final.js` | Le Final Track et le certificat |
| `90-boot.js` | Démarrage |

`beta0/` et `beta1/` sont les anciennes versions du jeu.

## Modifier le jeu

1. Modifie un fichier dans `src/`, jamais `beat-quest.html` directement : il est recréé à chaque build.
2. Reconstruis le jeu :
   ```
   cd src
   python build_web.py
   ```
3. Ouvre `beat-quest.html` dans le navigateur pour tester.

## Construire l'APK Android

L'appli est une WebView qui sert le jeu depuis les assets de l'APK (`android/java/…/MainActivity.java`).

Les outils de build ne sont pas dans le dépôt. Place-les dans `android/tools/` :

- `tools/bin/` : `aapt2.exe`, `zipalign.exe`, `libwinpthread-1.dll`, `dx.jar`, `apksigner.jar` (Android SDK build-tools 30.0.3) et `ecj-4.6.1.jar` (compilateur Java Eclipse) ;
- `tools/sdk/android.jar` : plateforme Android 34.

Il faut aussi Java 8 ou plus récent. Ensuite :

```
cd android
python build.py
```

Pour publier une mise à jour, augmente `VERSION_CODE` dans `build.py`.

La clé de signature (`android/beatquest.jks` et `android/signing.properties`) n'est pas dans le dépôt, volontairement. Garde-la en lieu sûr : Android refuse d'installer une mise à jour signée avec une autre clé.
