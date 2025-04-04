"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Label from "@/components/form/Label";

export default function GuiaUsoPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="Guía de Uso" />
      <div className="min-h-screen rounded-2xl border flex flex-col gap-6 border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="prose dark:prose-invert max-w-full">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Cómo usar el panel de difusión</h2>

          <ol className="list-decimal pl-5 space-y-3 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Vincula tu dispositivo:</strong> Ingresa tu número de teléfono en el panel derecho y solicita tu token de vinculación. Luego, cópialo y pégalo en tu dispositivo autorizado.
            </li>
            <li>
              <strong>Redacta tu mensaje:</strong> Escribe el texto que deseas enviar a los contactos. Puedes acompañarlo con un archivo multimedia.
            </li>
            <li>
              <strong>Selecciona el evento:</strong> Elige el nombre del evento y define su tipo (Informativo o Importante).
            </li>
            <li>
              <strong>Carga el archivo CSV:</strong> Adjunta tu listado de contactos en formato CSV. Este debe contener una columna de números válidos.
            </li>
            <li>
              <strong>Inicia la difusión:</strong> Presiona "Enviar Difusión". El sistema enviará los mensajes uno a uno. Puedes monitorear el total enviado en tiempo real.
            </li>
            <li>
              <strong>Cancelar o Reiniciar:</strong> Puedes cancelar la difusión en cualquier momento o reiniciar el proveedor si necesitas volver a vincular.
            </li>
            <li>
              <strong>Estadísticas:</strong> Al finalizar, se guardan automáticamente las estadísticas del evento, incluyendo la cantidad de mensajes enviados y quién lo realizó.
            </li>
          </ol>

          <p className="mt-6 text-gray-600 dark:text-gray-400">
            Si tienes dudas adicionales, contacta con el soporte o revisa el manual completo.
          </p>
        </div>
      </div>
    </>
  );
}
