import startScheduler from "@/services/scheduler-service/scheduler";
import { logger } from "@/logger/default-logger";
import { ActionResponse } from "@/types/actions-response.types";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  try {
    const dev = process.env.NODE_ENV !== "production";
    const url = req.url;
    const host = req.headers.get("host");

    console.log(host);

    const validHost = (host: string | null) =>
      host === "oas.edmartsystems.com" || host === "dev.oas.edmartsystems.com";

    if (dev || !validHost(host)) {
      logger.info("Scheduler is only available in production");
      !validHost(host) && logger.info("Scheduler invalid host: " + host);

      const res: ActionResponse = {
        status: false,
        message: "Scheduler is only available in production",
      };

      return Promise.resolve(
        new NextResponse(JSON.stringify(res), {
          status: 400,
        })
      );
    }

    startScheduler();

    const res: ActionResponse = {
      status: true,
      message: "Scheduler Is Successfully started",
    };

    return Promise.resolve(
      new NextResponse(JSON.stringify(res), {
        status: 200,
      })
    );
  } catch (err) {
    logger.error(err);
    const res: ActionResponse = {
      status: false,
      message: "Something went wrong",
    };
    return Promise.resolve(
      new NextResponse(JSON.stringify(res), {
        status: 500,
      })
    );
  }
};
