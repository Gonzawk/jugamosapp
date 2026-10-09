# Jugamos? Web v1

Web pública + onboarding de complejos, React 19 + Vite + TypeScript.

## Ejecutar

```bash
npm install
cp .env.example .env
npm run dev
```

En Windows PowerShell:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Configure `VITE_API_URL` con la API. Ejemplo local:

```env
VITE_API_URL=http://localhost:5088
```

Si prueba la web desde otra PC/dispositivo, use la IP LAN de la API y asegure CORS.

## Integración real existente

- `GET /api/solicitudes-complejos/servicios`
- `POST /api/solicitudes-complejos`
- `GET /api/solicitudes-complejos/{id}/estado`

El formulario respeta el contrato actual del backend: titular, contacto, complejo, ubicación, prestaciones y una colección dinámica de canchas.

## Producción

```bash
npm run build
```

La salida estática queda en `dist/`.
