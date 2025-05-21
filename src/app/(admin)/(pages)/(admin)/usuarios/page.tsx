

import UsuariosRegistrados from "@/components/admin/users/Register";
import { Metadata } from "next";

export const metadata: Metadata = {
    title:
      "Uscategui What-Panel",
    description: "Gestiona, organiza y parametriza actividades",
  };
  
  export default function usuarioscrear() {
    return <UsuariosRegistrados />;
  }
  