import { NextRequest } from "next/server";

export const safeBodyParse = async (req: NextRequest): Promise<any> => {
  try {
    return await req.json();
  } catch (err) {
    console.log(err);
    return null;
  }
};
