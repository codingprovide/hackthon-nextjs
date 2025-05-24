// app/api/state/step/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { step }: { step: string } = await req.json();
  const state = await prisma.processState.update({
    where: { id: 1 },
    data: { currentStep: step },
  });

  // 同步在事件表也新增一筆
  await prisma.event.create({
    data: { message: `步驟改為：${step}` },
  });

  return NextResponse.json(state);
}
