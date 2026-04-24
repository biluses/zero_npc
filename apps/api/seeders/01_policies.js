'use strict';

const PRIVACY = `# Política de Privacidad

**Última actualización:** 24 de abril de 2026

ZERO NPC, S.L. (en adelante, "Zero NPC", "nosotros") respeta tu privacidad y se compromete a proteger tus datos personales conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPD-GDD).

## 1. Responsable del tratamiento
- **Razón social:** ZERO NPC, S.L.
- **NIF:** B12345678
- **Domicilio social:** Calle Ejemplo 123, 28001 Madrid
- **Email de contacto:** privacidad@zero-npc.com

## 2. Datos que recogemos
- Datos de registro: email, nombre, contraseña (cifrada con bcrypt).
- Datos de envío: dirección, código postal, provincia.
- Datos de uso: tokens generados, intercambios, mensajes.
- Datos técnicos: IP, dispositivo, navegador.

## 3. Finalidad
- Crear y gestionar tu cuenta.
- Procesar intercambios de tokens NFC/QR.
- Enviar emails transaccionales (verificación, restablecimiento).
- Mejorar la plataforma.

## 4. Base legal
- **Ejecución de contrato:** alta y prestación del servicio.
- **Consentimiento:** comunicaciones comerciales (opt-in).
- **Interés legítimo:** seguridad, antifraude.

## 5. Conservación
Tus datos se conservan mientras tu cuenta esté activa y hasta 5 años tras la baja por obligaciones contables y legales.

## 6. Tus derechos
Acceso, rectificación, supresión, oposición, portabilidad y limitación. Escribe a privacidad@zero-npc.com.

## 7. Reclamaciones
Puedes presentar reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).
`;

const COOKIES = `# Política de Cookies

**Última actualización:** 24 de abril de 2026

## 1. ¿Qué son las cookies?
Las cookies son pequeños archivos que se almacenan en tu dispositivo cuando visitas un sitio web.

## 2. Tipos de cookies que utilizamos
- **Técnicas (estrictamente necesarias):** mantienen tu sesión iniciada y el carrito de compra.
- **Analíticas:** estadísticas anónimas de uso (solo si aceptas).
- **Personalización:** recordamos tus preferencias.

## 3. Cookies de terceros
- Stripe (procesamiento de pagos seguros).
- Resend (entrega de emails transaccionales).

## 4. Gestión de cookies
Puedes configurar o rechazar las cookies en los ajustes de tu navegador. La configuración se aplica de forma inmediata.

## 5. Más información
Si deseas más detalle, escribe a privacidad@zero-npc.com.
`;

const TERMS = `# Aviso Legal y Términos de Uso

**Última actualización:** 24 de abril de 2026

## 1. Información de la Empresa
- **Razón social:** ZERO NPC, S.L.
- **NIF:** B12345678
- **Inscrita en el Registro Mercantil de Madrid**, Tomo XXXXX, Folio XXX, Hoja M-XXXXXX
- **Domicilio social:** Calle Ejemplo 123, 28001 Madrid
- **Email:** legal@zero-npc.com

## 2. Condiciones de Uso
El acceso y uso de este sitio web implica la aceptación de:
- Términos y condiciones establecidos en este documento.
- Política de privacidad y cookies.
- Normativa de uso de la plataforma.
- Condiciones específicas de cada servicio.

## 3. Propiedad Intelectual
Todos los derechos reservados. El contenido, diseño y código fuente están protegidos por:
- Derechos de autor.
- Marcas registradas.
- Patentes y modelos de utilidad.
- Secretos comerciales.

## 4. Responsabilidades
ZERO NPC no se hace responsable de:
- Interrupciones del servicio por causas técnicas.
- Contenido generado por usuarios.
- Enlaces a sitios de terceros.
- Uso indebido de la plataforma.

## 5. Legislación Aplicable
Este aviso legal se rige por la legislación española, incluyendo:
- Ley 34/2002 de Servicios de la Sociedad de la Información.
- Reglamento General de Protección de Datos (RGPD).
- Ley Orgánica 3/2018 de Protección de Datos (LOPD).
- Real Decreto-ley 13/2012 (Cookies).

## 6. Jurisdicción
Para cualquier controversia que pudiera derivarse del acceso o uso de la plataforma, las partes se someten a los Juzgados y Tribunales de Madrid capital.
`;

exports.seed = async function seed(knex) {
  // Limpia y reinserta (idempotente)
  await knex('policies').del();
  await knex('policies').insert([
    {
      type: 'privacy',
      title: 'Política de Privacidad',
      content: PRIVACY,
      updated_at: new Date(),
    },
    {
      type: 'cookies',
      title: 'Política de Cookies',
      content: COOKIES,
      updated_at: new Date(),
    },
    {
      type: 'terms',
      title: 'Aviso Legal',
      content: TERMS,
      updated_at: new Date(),
    },
  ]);
};
