# Documentación — Endpoint y plataforma (Petagram Push)

Este documento describe los endpoints implementados en el servidor, la forma de probarlos y la plataforma usada. Está pensado para exportar a PDF como evidencia de la actividad.

## Resumen
- Plataforma del servidor: Node.js (Express)
- Base de datos: SQLite (better-sqlite3)
- Notificaciones push: Firebase Cloud Messaging (Firebase Admin SDK)
- Archivos clave: `web-server/server.js`, `web-server/database.js`

## Endpoints

1) POST /api/devices/register
- Propósito: registrar o actualizar el token FCM de un usuario Instagram.
- Payload (JSON):
  {
    "id_usuario_instagram": "usuario_destino",
    "id_dispositivo": "TOKEN_FCM"
  }
- Respuesta: { ok: true, message: 'Dispositivo registrado' } o error 400/500
- Efecto: guarda/actualiza la tabla `devices` (campos: id_usuario_instagram, id_dispositivo)

2) POST /api/likes
- Propósito: endpoint genérico para registrar un like desde la app y notificar al propietario.
- Payload (JSON):
  {
    "id_foto_instagram": "12345",
    "id_usuario_instagram": "usuario_destino",
    "id_dispositivo": "TOKEN_FCM" // opcional
  }
- Comportamiento:
  - Inserta un registro en `likes` (id_foto_instagram, id_usuario_instagram, device_token)
  - Si hay token FCM y Firebase Admin inicializado, envía notificación con `data: { screen: 'profile', id_usuario_instagram }`.

3) POST /api/instagram/like
- Propósito: intentar dar like en Instagram (si se cuenta con token de Graph API) y además registrar/localizar el like en la BD y notificar.
- Payload (JSON):
  {
    "id_foto_instagram": "12345",
    "id_usuario_instagram": "usuario_destino"
  }
- Comportamiento:
  - Si existe `INSTAGRAM_ACCESS_TOKEN` en el `.env` se hace la llamada al endpoint de Graph API (configurable por `IG_MEDIA_LIKES_ENDPOINT`).
  - Si no hay token (caso típico por permisos), el servidor simula el like: igualmente guarda el like en la BD y envía notificación si hay token FCM.
  - Responde con el resultado de la llamada a Instagram si se realizó, o con `{ simulated: true }` si se simuló.

## Base de datos
- Archivo: `web-server/db.sqlite` (ubicación por defecto en `web-server`)
- Tablas principales:
  - `devices` (id, id_usuario_instagram UNIQUE, id_dispositivo, created_at)
  - `likes` (id, id_foto_instagram, id_usuario_instagram, device_token, created_at)

## Variables de entorno importantes
- `GOOGLE_APPLICATION_CREDENTIALS` => ruta al JSON del service account de Firebase (necesario para enviar FCM desde el servidor). Si no está configurado, el servidor seguirá funcionando pero no enviará notificaciones.
- `INSTAGRAM_ACCESS_TOKEN` => token para Instagram Graph API con permisos necesarios para dar likes (raro en entornos de práctica).
- `IG_MEDIA_LIKES_ENDPOINT` => plantilla del endpoint IG, por defecto: `https://graph.facebook.com/v19.0/%s/likes`
- `PORT` => puerto del servidor (por defecto 3000)

## Cómo ejecutar el servidor (Windows / PowerShell)
1. Abrir PowerShell y navegar al directorio del servidor:

```powershell
cd c:\Users\JUAN\Desktop\PetagramPushNotifications\web-server
npm install
# (opcional) setear variables de entorno temporales en PowerShell:
# $env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\ruta\a\service-account.json'
# $env:INSTAGRAM_ACCESS_TOKEN = '...'
npm start
```

2. El servidor escuchará en `http://localhost:3000` (o el puerto definido por `PORT`).

## Probar el flujo: registro + like + notificación (PowerShell)
1) Registrar dispositivo (desde la app o por PowerShell si tienes el token):
```powershell
$body = @{ id_usuario_instagram='usuario_destino'; id_dispositivo='TOKEN_FCM' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/devices/register -Method Post -Body $body -ContentType 'application/json'
```
2) Simular un like (endpoint Instagram que también guarda y notifica):
```powershell
$body = @{ id_foto_instagram='12345'; id_usuario_instagram='usuario_destino' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/instagram/like -Method Post -Body $body -ContentType 'application/json'
```
3) Verificaciones:
- Revisar tabla `likes` en `web-server/db.sqlite` (usando un viewer SQLite) para ver el nuevo registro.
- En el dispositivo del `usuario_destino` debería llegar la notificación. Al tocarla, la app abre `ProfileActivity` con `id_usuario_instagram` en el extra.

## Recomendaciones para la entrega (PDF + video)
- PDF: incluye las rutas de los endpoints, ejemplos de payloads (como arriba), captura de la BD mostrando el registro `likes`, y captura del servidor registrando el envío de FCM.
- Video: muéstralo en este orden:
  1. Abre la app del compañero y registra el token (mostrar `tokenView` y pulsar registrar).
  2. Desde tu máquina haz POST a `/api/instagram/like` (mostrar PowerShell o Postman).
  3. Mostrar la notificación que llega al dispositivo y pulsarla para abrir el perfil en la app.
  4. Mostrar la tabla `likes` en la DB con el nuevo registro.

## Enlace al repositorio
- Subir el proyecto a GitHub y compartir el enlace en la entrega.

## Notas finales
- Si no puedes enviar FCM desde el servidor (porque no tienes `GOOGLE_APPLICATION_CREDENTIALS`), la app sigue recibiendo notificaciones cuando se realicen pruebas con `admin.messaging()` desde entornos que sí tengan credenciales (por ejemplo, desplegando a un servidor con la variable de entorno puesta).
- Si necesitas, puedo generar un PDF a partir de este archivo Markdown y prepararte el guion del video.
