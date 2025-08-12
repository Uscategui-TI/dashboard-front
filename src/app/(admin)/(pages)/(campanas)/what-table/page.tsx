import TableEventsAllPage from "@/components/dashboard/TableEventsAll";
import { Metadata } from "next";

export const metadata: Metadata = {
    title:
      "Uscategui Table-Events",
    description: "Gestiona, organiza y parametriza actividades",
  };
  
  export default function WhatPanel() {
    return <TableEventsAllPage />;
  }
  