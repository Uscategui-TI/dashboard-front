export function EmailTemplate({
  name = "Usuario",
  content,
  imageUrl,
  buttonUrl,
}: {
  name?: string;
  content: string;
  imageUrl?: string;
  buttonUrl?: string;
}) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Correo Personalizado</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
  <!-- Preheader text (oculto, para mejorar entrega) -->
  <div style="display:none; max-height:0px; overflow:hidden; font-size:1px; color:#fff; line-height:1px; max-width:0px; opacity:0;">
    Este es un resumen del contenido del correo para vista previa.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f6f8" style="padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius:8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td align="center" bgcolor="#007BFF" style="padding: 20px; border-radius: 8px 8px 0 0; color: #ffffff; font-size: 24px; font-weight: bold;">
              ¡Hola!
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px; color: #333333; font-size: 16px; line-height: 1.5;">
              ${content}
            </td>
          </tr>

          <!-- Imagen responsive -->
          ${
            imageUrl
              ? `
              <tr>
                <td align="center" style="padding: 0 20px 20px 20px;">
                  <img src="${imageUrl}" alt="Imagen" width="100%" style="max-width: 560px; height: auto; border-radius: 4px; display: block;" />
                </td>
              </tr>
            `
              : ""
          }

          <!-- Botón CTA -->
          <tr>
            <td align="center" style="padding: 0 20px 30px 20px;">
              <a href="${buttonUrl || "#"}" 
                 style="
                   background-color: #007BFF;
                   color: white;
                   padding: 12px 24px;
                   border-radius: 5px;
                   text-decoration: none;
                   font-weight: bold;
                   display: inline-block;
                 "
                 target="_blank" 
                 rel="noopener noreferrer"
              >
                Ver más detalles
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="font-size: 12px; color: #777777; padding: 20px 20px 30px 20px;">
              Gracias por ser parte de nuestra comunidad.<br />
              © 2025 TuEmpresa. Todos los derechos reservados.
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
