'use strict';

/**
 * Templates HTML transaccionales de Zero NPC.
 *
 * Cada función recibe un objeto con los datos variables y devuelve `{ subject, html, text }`.
 * El HTML usa inline styles (los clientes de email no entienden <style> externo ni Tailwind).
 *
 * Guía de branding:
 *   - Fondo oscuro #0a0a0a
 *   - Superficie #171717
 *   - Texto principal #f5f5f5
 *   - Acento Zero NPC   #22d3ee (cyan-400)
 *   - Fuente sistema (evitar web-fonts: mejor compatibilidad en clientes)
 */

const BRAND = {
  name: 'Zero NPC',
  bg: '#0a0a0a',
  surface: '#171717',
  text: '#f5f5f5',
  muted: '#a3a3a3',
  accent: '#22d3ee',
  border: '#262626',
};

function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function layout({ preheader, title, bodyHtml, ctaLabel, ctaUrl, footerNote }) {
  const pre = esc(preheader || '');
  const ttl = esc(title);
  const ctaBlock = ctaLabel && ctaUrl
    ? `
      <tr>
        <td align="center" style="padding: 8px 0 24px;">
          <a href="${esc(ctaUrl)}"
             style="display:inline-block;background:${BRAND.accent};color:${BRAND.bg};
                    font-weight:600;padding:14px 28px;border-radius:10px;
                    text-decoration:none;font-size:15px;">${esc(ctaLabel)}</a>
        </td>
      </tr>`
    : '';

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${ttl}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <!-- preheader oculto -->
    <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${pre}</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                 style="max-width:560px;background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 0;">
                <div style="color:${BRAND.accent};font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
                  ${esc(BRAND.name)}
                </div>
                <h1 style="color:${BRAND.text};font-size:22px;line-height:1.3;margin:12px 0 0;font-weight:600;">
                  ${ttl}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 8px;color:${BRAND.text};font-size:15px;line-height:1.55;">
                ${bodyHtml}
              </td>
            </tr>
            ${ctaBlock}
            <tr>
              <td style="padding:16px 28px 28px;color:${BRAND.muted};font-size:12px;line-height:1.5;border-top:1px solid ${BRAND.border};">
                ${footerNote || `Si no solicitaste este correo, puedes ignorarlo. &mdash; Equipo ${esc(BRAND.name)}`}
              </td>
            </tr>
          </table>

          <div style="color:${BRAND.muted};font-size:11px;margin-top:18px;">
            &copy; ${new Date().getFullYear()} ${esc(BRAND.name)}. Todos los derechos reservados.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function otpCodeBlock(otp) {
  return `
    <div style="margin:16px 0 4px;">
      <div style="color:${BRAND.muted};font-size:12px;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">
        Tu código
      </div>
      <div style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:10px;
                  padding:18px 22px;font-family:'SFMono-Regular',Consolas,monospace;
                  font-size:32px;letter-spacing:8px;color:${BRAND.accent};font-weight:700;text-align:center;">
        ${esc(otp)}
      </div>
      <div style="color:${BRAND.muted};font-size:12px;margin-top:10px;">
        Este código expira en 10 minutos.
      </div>
    </div>`;
}

function verificationEmail({ otp }) {
  const subject = 'Verifica tu cuenta en Zero NPC';
  const bodyHtml = `
    <p style="margin:0 0 12px;">Bienvenido a Zero NPC.</p>
    <p style="margin:0 0 8px;">Introduce este código en la app para activar tu cuenta:</p>
    ${otpCodeBlock(otp)}`;
  const html = layout({
    preheader: `Tu código de verificación es ${otp}`,
    title: 'Verifica tu cuenta',
    bodyHtml,
    footerNote: `¿No te registraste? Puedes ignorar este correo. &mdash; Equipo ${BRAND.name}`,
  });
  const text = `Zero NPC\n\nTu código de verificación es: ${otp}\nEste código expira en 10 minutos.`;
  return { subject, html, text };
}

function passwordResetEmail({ otp }) {
  const subject = 'Restablece tu contraseña de Zero NPC';
  const bodyHtml = `
    <p style="margin:0 0 12px;">Hemos recibido una solicitud para restablecer tu contraseña.</p>
    <p style="margin:0 0 8px;">Usa este código en la app para continuar:</p>
    ${otpCodeBlock(otp)}
    <p style="margin:16px 0 0;color:${BRAND.muted};font-size:13px;">
      Si no has sido tú, ignora este correo y tu contraseña seguirá intacta.
    </p>`;
  const html = layout({
    preheader: `Tu código de restablecimiento es ${otp}`,
    title: 'Restablece tu contraseña',
    bodyHtml,
    footerNote: `Por seguridad, el código expira en 10 minutos. &mdash; Equipo ${BRAND.name}`,
  });
  const text = `Zero NPC\n\nCódigo de restablecimiento: ${otp}\nExpira en 10 minutos.`;
  return { subject, html, text };
}

module.exports = {
  verificationEmail,
  passwordResetEmail,
};
