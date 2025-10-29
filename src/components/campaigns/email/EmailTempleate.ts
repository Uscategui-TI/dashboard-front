export function EmailTemplate({
  name = "Usuario",
  content,
  imageUrl,
  buttonUrl,
  buttonUrl1
}: {
  name?: string;
  content: string;
  imageUrl?: string;
  buttonUrl?: string;
  buttonUrl1?: string;
}) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Correo para las personas del cambio</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, sans-serif; }
    table { border-collapse: collapse; }
    a { color: #ffffff; text-decoration: none; }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
  <!-- Preheader -->
  <div style="display:none; font-size:1px; color:#f4f6f8; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
     Información relevante sobre las iniciativas legislativas del representante José Jaime Uscátegui.
  </div>

  <table width="100%" bgcolor="#f4f6f8" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 20px;">
        <table width="600" bgcolor="#ffffff" style="border-radius:8px; box-shadow:0 0 10px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td align="center" bgcolor="#002147" style="padding: 20px 40px; color: #ffffff; font-size: 24px; font-weight: bold; border-radius: 8px 8px 0 0;">
             Hola
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 30px 40px; font-size: 16px; color: #333; line-height: 1.6;">
              ${content}
            </td>
          </tr>

          <!-- Image (optional) -->
          ${
            imageUrl
              ? `
          <tr>
            <td align="center" style="padding: 0 40px 30px 40px;">
              <img src="${imageUrl}" alt="Imagen ilustrativa" style="max-width: 100%; border-radius: 4px;">
            </td>
          </tr>`
              : ""
          }

          <!-- CTA button -->
          <tr>
            <td align="center" style="padding: 0 40px 40px 40px;">
              <a href="${buttonUrl || 'https://wa.me/573102782407'}" target="_blank" rel="noopener noreferrer"
                style="background-color: #25D366; color: #ffffff; padding: 12px 24px; border-radius: 5px; font-weight: bold; display: inline-block; text-decoration: none;">
                <img src="https://img.icons8.com/fluency/48/whatsapp.png"
                    alt="WhatsApp" width="16" height="16"
                    style="vertical-align: middle; margin-right: 8px;">
                Escríbenos
              </a>
             <a href="${buttonUrl1 }" target="_blank" rel="noopener noreferrer"
                 style="background-color: #002147; color: #ffffff; padding: 12px 24px; border-radius: 5px; font-weight: bold; display: inline-block;">
                Inscríbete
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="font-size: 12px; color: #888888; padding: 20px 40px 30px 40px; border-top: 1px solid #e0e0e0;">
              Este correo fue enviado por el equipo de la seguridad (Comunicaciones Uscátegui)· Bogotá, Colombia<br />
              <a href="#" style="color:#888; text-decoration:underline;">Darse de baja</a> | <a href="#" style="color:#888; text-decoration:underline;">Política de privacidad</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
