# Archivos de configuración compartibles

Esta carpeta contiene configuraciones útiles que puedes copiar dentro de `.vscode/` si quieres usarlas en VS Code, sin que los archivos de `.vscode/` estén versionados por defecto.

Archivos:

- `tasks.json` — tarea para instalar dependencias y arrancar el servidor (`web-server`).
- `launch.json` — configuración para depurar `web-server/server.js` desde VS Code.
- `extensions.json` — recomendaciones de extensiones (Prettier, ESLint).

Cómo usar:

1. Copia los archivos deseados a la carpeta `.vscode/` en la raíz del proyecto:

```powershell
mkdir .vscode      # si no existe
cp dev\tasks.json .vscode\tasks.json
cp dev\launch.json .vscode\launch.json
cp dev\extensions.json .vscode\extensions.json
```

2. Abre el proyecto en VS Code y revisa la sección "Run Task" o la configuración de ejecución/depuración.

Nota: `.vscode/` está en `.gitignore` por ser configuraciones locales; mover solo los archivos que quieras compartir a `dev/` evita subir datos sensibles.
