PORRALAB ZIKU ZAKU

ESTRUCTURA DE LA CARPETA

PORRALAB-ZIKU-ZAKU/
├── index.html
├── style.css
├── script.js
└── img/
    ├── alba.png
    ├── xabier.png
    ├── leire.png
    ├── itoitz.png
    ├── ane.png
    └── aitor.png

CÓMO SUBIRLO A CLOUDFLARE

1. En Cloudflare entra en Workers & Pages.
2. Pulsa Create application.
3. Pulsa Upload your static files.
4. Sube la carpeta PORRALAB-ZIKU-ZAKU completa.
5. Cloudflare buscará automáticamente index.html.
6. Pulsa Deploy.
7. Abre la URL pública que termine en .workers.dev o .pages.dev.

IMPORTANTE

- El archivo principal debe llamarse index.html.
- No cambies los nombres de las carpetas ni de las imágenes.
- Si la página no carga las imágenes, revisa que la carpeta img esté subida junto al index.html.
- Ahora es una maqueta estática.
- Después se conectará la API para actualizar puntos automáticamente.


NUEVA VERSIÓN CON MÚSICA

Se ha añadido:
- audio/ziku-zaku-gol.mp3
- pantalla inicial con botón "Entrar en la porra"
- botón fijo para activar/silenciar el himno

IMPORTANTE:
Los navegadores no suelen permitir música automática sin interacción.
Por eso la canción empieza cuando el usuario pulsa "Entrar en la porra".
