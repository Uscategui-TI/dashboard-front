import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DefaultModal from "@/components/shared/ui/modal/DefaultModal";
import FormInModal from "@/components/shared/ui/modal/FormInModal";
import FullScreenModal from "@/components/shared/ui/modal/FullScreenModal";
import ModalBasedAlerts from "@/components/shared/ui/modal/ModalBasedAlerts";
import VerticallyCenteredModal from "@/components/shared/ui/modal/VerticallyCenteredModal";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title:
    "Uscategui Panel",
  description: "Gestiona, organiza y parametriza actividades",
};

export default function Modals() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Modals" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
        <DefaultModal />
        <VerticallyCenteredModal />
        <FormInModal />
        <FullScreenModal />
        <ModalBasedAlerts />
      </div>
    </div>
  );
}
