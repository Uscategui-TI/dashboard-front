"use client";


export default function GuiaUsoModal() {
  return (
    <div className="prose dark:prose-invert max-w-full px-4 py-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Cómo usar el panel de difusión</h2>
      <ol className="list-decimal pl-5 space-y-3 text-gray-700 dark:text-gray-300">
        <img src="/images/vincular-dispositivo.png" alt="Paso 1: Vincular dispositivo" className="rounded-lg my-4" />
        <li><strong>Vincula tu dispositivo:</strong> Ingresa tu número de teléfono en el panel derecho y solicita tu token de vinculación. Luego, cópialo y pégalo en tu dispositivo autorizado.</li>
        <li><strong>Actualiza la conexión:</strong> Luego de vincular correctamente, presiona el botón de actualizar para continuar con la difusión.</li>
        <li><strong>Redacta tu mensaje:</strong> Escribe el mensaje que deseas enviar y añade multimedia si lo necesitas.</li>
        <li><strong>Selecciona el evento:</strong> Elige nombre y tipo del evento.</li>
        <li><strong>Carga tu CSV:</strong> Adjunta un archivo con los números de contacto.</li>
        <li><strong>Envia la difusión:</strong> Monitorea los mensajes enviados en tiempo real.</li>
        <li><strong>Cancelar o Reiniciar:</strong> Cancela o reinicia el proveedor si es necesario.</li>
        <li><strong>Estadísticas:</strong> Se guardan automáticamente al finalizar la difusión.</li>
      </ol>
      <p className="mt-6 text-gray-600 dark:text-gray-400">
        Si tienes dudas adicionales, contacta soporte o revisa el manual completo.
      </p>
    </div>
  );
}
