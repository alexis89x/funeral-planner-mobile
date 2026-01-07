1. Accedi ad EAS (se non l'hai già fatto):

npx eas login

2. Configura il progetto (se è la prima volta):

npx eas build:configure

3. Genera l'APK:

npx eas build --platform android --profile preview

Questo comando:
- Crea un APK (non AAB) che puoi installare direttamente
- Usa il profilo "preview" per distribuzione interna
- Il build viene fatto sui server di Expo (non serve Android Studio locale)

4. Scarica e installa:

Dopo che il build è completato:
- Riceverai un link per scaricare l'APK
- Puoi installarlo direttamente su dispositivi Android
- Oppure usa il comando per scaricare:

npx eas build:list

Alternativa più veloce (build locale):

Se vuoi generare l'APK localmente senza usare i server EAS:

npx expo run:android --variant release

Ma questo richiede Android Studio installato localmente.

Note importanti:

- Il primo build può richiedere 10-20 minuti
- L'APK sarà firmato automaticamente da EAS
- Puoi condividere l'APK con altri per testing
- Per installare su Android, devi abilitare "Installa app sconosciute"

Vuoi procedere con il build?
