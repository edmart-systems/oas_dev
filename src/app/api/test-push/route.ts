import { NextRequest, NextResponse } from "next/server";
import { pushPendingTasksJob } from "@/services/scheduler-service/jobs/tasks.jobs";

export async function POST(req: NextRequest) {
  try {
    const result = await pushPendingTasksJob();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ 
      status: false, 
      message: "Error: " + (error instanceof Error ? error.message : "Unknown error")
    }, { status: 500 });
  }
}