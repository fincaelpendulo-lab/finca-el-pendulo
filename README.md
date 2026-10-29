# Finca El Péndulo

Sitio web de [fincaelpendulo.com.mx](https://fincaelpendulo.com.mx). Astro estático, bilingüe (español en `/`, inglés en `/en`).

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/
npm run links    # revisa enlaces rotos en dist/
```

Qué editar y dónde: ver la tabla en [CLAUDE.md](CLAUDE.md).

## Despliegue
- **Producción:** Hostinger, Git deploy desde `main`. Node 22, build `npm run build`, salida `dist`, variable `BASE_PATH=/`.
- **Vista previa:** GitHub Pages (`fincaelpendulo-lab.github.io/finca-el-pendulo`), con `noindex`.
- **Formularios:** `worker/` (Cloudflare Worker → GoHighLevel). Secretos solo en Cloudflare:
  `npx wrangler secret put TURNSTILE_SECRET` y `npx wrangler secret put GHL_TOKEN`.
- **Lanzamiento:** `"launched": true` en `src/data/site.json` (abre `robots.txt` y quita `noindex`).
