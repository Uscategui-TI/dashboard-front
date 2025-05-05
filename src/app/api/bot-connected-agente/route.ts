import { NextResponse } from "next/server";

let isConnected = false;

export async function POST() {
  isConnected = true;
  return NextResponse.json({ message: "Bot conectado" });
}

export async function GET() {
  return NextResponse.json({ connected: isConnected });
}
