import WhatEmailPage from "@/components/campaigns/email/What-Email";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: "Uscategui What-email",
    description: "Gestiona, organiza y parametriza actividades",
};

export default function whatemail() {
    return <WhatEmailPage/>;
}