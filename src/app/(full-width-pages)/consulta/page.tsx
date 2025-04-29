
import ConsultaSolicitudPage from "@/components/consulta-solicitud/consulta";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Uscategui consulta de solicitud",
  description: "Gestiona, organiza y parametriza actividades",
};

export default function SignIn() {
  return <ConsultaSolicitudPage />;
}
