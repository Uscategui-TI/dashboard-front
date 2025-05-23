import SmsBroadcastPage from "@/components/campaigns/sms/What-Sms";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: "Uscategui What-Sms",
    description: "Gestiona, organiza y parametriza actividades",
};

export default function whatsms() {
    return <SmsBroadcastPage/>;
}