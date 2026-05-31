# Come aggiornare le icone

- Usare https://www.appicon.co/ per generare le icone

Lui genera
- playstore.png 512x512
- appstore.png 1024x1024

## Proporzioni per ogni file

### icon.png (1024x1024)
Icona app per **iOS**. iOS applica la maschera arrotondata da solo, quindi il logo va a pieno formato senza padding.

### android-icon-foreground.png (1024x1024)
Layer foreground dell'**adaptive icon Android**. Il logo deve stare nella safe zone (66% centrale = ~660px), quindi va ridimensionato e centrato su canvas 1024x1024 con ~182px di padding su ogni lato. Samsung e altri launcher applicano una maschera che taglia tutto ciò che esce dalla safe zone.

### android-icon-background.png (1024x1024)
Layer background dell'adaptive icon. Colore solido (bianco). Non serve aggiornarlo.

### android-icon-monochrome.png (1024x1024)
Versione monocromatica per i temi Android 13+. Stesso formato del foreground (safe zone al 66%).

### splash-icon.png (1024x1024)
Schermata di avvio dell'app. Viene mostrata su sfondo a pieno schermo, proporzionate diverse dalle icone — logo a pieno formato senza padding.
NON è vero. Deve avere 75% perché è arrotondata 

### favicon.png (96x96)
Usata per il web/PWA. Logo ben visibile senza padding.

### logo.png (750x750)
Usato internamente nell'app.

## Comando per generare il foreground Android con safe zone

```bash
magick logo-sorgente.png \
  -resize 660x660 \
  -gravity center \
  -background transparent \
  -extent 1024x1024 \
  assets/images/android-icon-foreground.png
```
