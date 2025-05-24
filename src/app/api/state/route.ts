// app/api/state/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest) {
  // 若無，建立初始 row（id = 1）
  const state = await prisma.processState.upsert({
    where: { id: 1 },
    update: {},
    create: { currentStep: "ship_arrival" },
  });
  const events = await prisma.event.findMany({
    orderBy: { timestamp: "desc" },
    take: 100,
  });
  return NextResponse.json({ currentStep: state.currentStep, events });
}
