# Curso de Impuestos en Mercado Libre para Contadores — Landing

Landing page estática de alta conversión para **Contadora Meli**, en español rioplatense. Sin frameworks: HTML + CSS vanilla + JS vanilla.

## Archivos

- `index.html` — estructura completa (12 bloques) + SEO + JSON-LD (Course, Product/Offer ARS, FAQPage).
- `styles.css` — diseño mobile-first, responsive, accesible.
- `app.js` — countdown 48 h persistente, smooth scroll, acordeón, menú móvil, animaciones por intersección, form de lead magnet, tracking.
- `README.md` — este archivo.

## Cómo abrirla

Con Python (desde esta carpeta):

```bash
python3 -m http.server 8000
```

Después abrí en el navegador:

- http://localhost:8000/

O directamente abriendo `index.html` con doble clic (recomendado el servidor para que funcione todo igual que en producción).

## Estructura (12 bloques en orden)

1. Sticky-bar superior con promo 15% OFF + countdown real de 48 h + anchor a `#precio`.
2. Hero con badge, H1 único, propuesta de valor, bullets, CTA primario/secundario y card con prueba (★ 4.9/5, +300 contadores).
3. Dolores "¿Te pasa alguna de estas?" (4 cards chequeables con feedback en JS).
4. Cinco cosas concretas (5 cards con íconos).
5. Programa: acordeón `<details>` con los 9 módulos (2 líneas + tag PDF + duración).
6. Cómo funciona (4 pasos).
7. Es / no es para vos (contadores sí / vendedores no).
8. Prueba social: 3 testimonios + métricas + caso "Recuperé $184.000".
9. Precio `#precio`: stack tachado $417.800, Transferencia $193.600 (-15%, ahorrás $34.200) y Mercado Pago $227.800 (3 x $75.933), botones al checkout, garantía 7 días, Factura C.
10. Garantía + FAQ (8 preguntas en `<details>`) + JSON-LD FAQPage.
11. Bio Contadora Meli + Instagram / web / WhatsApp +54 9 11 3772-0952.
12. CTA final + lead magnet "Checklist gratis" (form nombre+email+whatsapp → `localStorage`, mensaje de éxito, sin backend).

Más: header sticky con menú móvil, footer y sticky CTA móvil con mini-countdown.

## JS (`app.js`)

- Countdown 48 h persistente (`localStorage` clave `meli_promo_deadline_v1`), espejado en sticky-bar y sticky CTA móvil.
- Smooth scroll con respeto a `prefers-reduced-motion`.
- Acordeón del programa: un solo módulo abierto a la vez.
- Menú móvil con `aria-expanded`.
- `IntersectionObserver` para animar `.reveal` (con fallback).
- Form validado (nombre ≥ 2, email regex, WhatsApp ≥ 6 dígitos/símbolos); guarda en `meli_leads` y muestra éxito.
- Tracking: `ViewContent` al cargar, `Lead` en el form, `InitiateCheckout` en CTAs → `console.log` + `dataLayer.push`.

## SEO / Accesibilidad

- `lang="es-AR"`, un solo `<h1>`, labels en form, `alt`/`aria-label` en visuales emoji, skip-link, foco visible, contraste (hero `#2D3277` sobre blanco, highlight `#FFE600`, CTA `#00A650`).
- Title, meta description, canonical `https://www.contadorameli.com.ar/venta-curso-online`, OG/Twitter, JSON-LD Course + Product/Offer (ARS) + FAQPage.

## Precios / links

- Checkout: `https://www.contadorameli.com.ar/challenge-payment/curso-impuestos-mercado-libre-contadores`
- WhatsApp: `https://wa.me/5491137720952`
- Instagram: `https://www.instagram.com/contadorameli`
