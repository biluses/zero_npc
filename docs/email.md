# Email — Guía operativa

Zero NPC usa un proveedor de email abstracto en `apps/api/src/utils/email.js` con
esta prioridad:

1. **Resend** (HTTPS API) si `RESEND_API_KEY` está definida.
2. **SMTP** (nodemailer) si `SMTP_HOST` + `SMTP_PORT` están definidos.
3. **Noop** (solo loggea) si no hay ningún proveedor.

Los templates viven en `apps/api/src/utils/email-templates.js` (HTML inline-styled
+ versión texto plano).

---

## Desarrollo local — Resend sandbox

Mientras no tengas dominio propio verificado puedes usar Resend en **modo test**:

1. Crea una cuenta en [resend.com](https://resend.com).
2. Genera una API key en [resend.com/api-keys](https://resend.com/api-keys)
   (formato `re_...`).
3. Añádela a `apps/api/.env`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxx
   EMAIL_FROM="Zero NPC <onboarding@resend.dev>"
   ```
4. Reinicia el contenedor API:
   ```bash
   docker compose -f infra/docker/docker-compose.yml up -d api
   ```

> **Limitación del sandbox**: Resend solo permite enviar al email con el que
> registraste la cuenta. Para enviar a usuarios reales necesitas verificar un
> dominio (siguiente sección).

---

## Producción — Verificar dominio en Resend

Cuando tengas el dominio (ej. `zero-npc.com`):

### 1. Añadir dominio en Resend
1. Entra en [resend.com/domains](https://resend.com/domains) → **Add Domain**.
2. Escribe `zero-npc.com` (o el dominio que uses).
3. Elige la región más cercana a tu tráfico principal (EU recomendado si la
   mayoría de usuarios está en Europa; US si es América).

Resend te mostrará ~4 registros DNS para añadir:

| Tipo  | Nombre                       | Valor                                 | Para                 |
|-------|------------------------------|---------------------------------------|----------------------|
| MX    | `send.zero-npc.com`          | `feedback-smtp.<region>.amazonses.com`| Bounce tracking      |
| TXT   | `send.zero-npc.com`          | `v=spf1 include:amazonses.com ~all`   | SPF                  |
| TXT   | `resend._domainkey.zero-npc.com` | `p=MIGfMA0GCSqGSIb3...` (largo)   | DKIM (autenticación) |
| TXT   | `_dmarc.zero-npc.com`        | `v=DMARC1; p=none;`                   | DMARC (política)     |

### 2. Añadir los registros en tu proveedor DNS
En Cloudflare / Namecheap / Google Domains / donde gestiones el DNS:

- **Cloudflare**: DNS → Records → Add record (copia literal los nombres y
  valores). **Desactiva el proxy naranja** para los registros TXT y MX (debe
  estar en DNS only / gris).
- **Namecheap / GoDaddy**: Advanced DNS → Add New Record.

> Para el TXT de DKIM, asegúrate de copiar el valor **completo** sin saltos de
> línea; es una cadena larga.

### 3. Verificar en Resend
Vuelve a [resend.com/domains](https://resend.com/domains) → **Verify DNS Records**.
Puede tardar unos minutos en propagar. Cuando esté todo en verde, el dominio
está listo.

### 4. Actualizar `EMAIL_FROM`
En `apps/api/.env` (o en las variables de entorno de Railway/Vercel según el
entorno):

```env
EMAIL_FROM="Zero NPC <no-reply@zero-npc.com>"
```

Reinicia la API y verifica que los emails llegan desde ese dominio con DKIM
válido (Gmail muestra un candado en el asunto del email).

---

## Verificar deliverability

Después de verificar el dominio, comprueba que todo está bien:

1. Manda un email a una cuenta de Gmail.
2. En Gmail, abre el email → botón "..." → **Mostrar original**.
3. Busca estas tres cabeceras:
   - `SPF: PASS`
   - `DKIM: PASS` (con `d=zero-npc.com`)
   - `DMARC: PASS`

Si alguna falla, revisa los registros DNS con `dig TXT _dmarc.zero-npc.com` o
en [mxtoolbox.com](https://mxtoolbox.com/SuperTool.aspx).

---

## Cambiar a otro proveedor

Si en el futuro prefieres Mailgun, SES, Postmark, etc., solo necesitas:

1. Eliminar `RESEND_API_KEY` del `.env`.
2. Rellenar `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`,
   `SMTP_FROM`.
3. Reiniciar la API.

El fallback SMTP de `email.js` funcionará automáticamente. **No hace falta
tocar código** salvo que quieras usar features específicas de otro SDK.

---

## Rotar la API key de Resend

Buena práctica cada 90 días o ante cualquier sospecha:

1. [resend.com/api-keys](https://resend.com/api-keys) → **Create API Key** → copia la nueva.
2. Actualiza `RESEND_API_KEY` en `.env` (dev) y en Railway variables (prod).
3. Reinicia los servicios (`docker compose up -d api` / redeploy en Railway).
4. Borra la key antigua en el panel de Resend.

---

## Troubleshooting

| Síntoma                                  | Causa probable                           | Solución                                 |
|------------------------------------------|------------------------------------------|------------------------------------------|
| `Email provider: Resend` y el email no llega | Sandbox sin dominio verificado y email destino ≠ owner | Verifica dominio o envía al email del owner |
| `Failed to send email` con `401`         | API key inválida o revocada              | Regenera API key en Resend              |
| Email llega a spam                       | DKIM/SPF/DMARC no pasan                  | Revisa registros DNS (sección 3)         |
| `No email provider configured` en logs   | `RESEND_API_KEY` y `SMTP_HOST` vacíos    | Rellena al menos uno en `.env`           |
