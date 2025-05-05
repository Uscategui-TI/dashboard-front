import { NextResponse } from "next/server";

let isConnectedDifusion = false;

export async function POST() {
  isConnectedDifusion = true;
  return NextResponse.json({ message: "Bot Difusión conectado" });
}

export async function GET() {
  return NextResponse.json({ connected: isConnectedDifusion });
}