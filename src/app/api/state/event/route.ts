// app/api/state/event/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { message }: { message: string } = await req.json();
  const evt = await prisma.event.create({
    data: { message },
  });
  return NextResponse.json(evt);
}
