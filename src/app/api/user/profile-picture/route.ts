import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { ActionResponse } from "@/types/actions-response.types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import prisma from "../../../../../db/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.userId) {
      return NextResponse.json(
        { status: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("profilePicture") as File;

    if (!file) {
      return NextResponse.json(
        { status: false, message: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { status: false, message: "File must be an image" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { status: false, message: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), "public", "uploads", "profiles");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    const fileExtension = file.name.split(".").pop();
    const fileName = `${session.user.userId}_${Date.now()}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    const profilePictureUrl = `/uploads/profiles/${fileName}`;
    
    await prisma.user.update({
      where: { userId: session.user.userId },
      data: { profile_picture: profilePictureUrl },
    });

    const response: ActionResponse = {
      status: true,
      message: "Profile picture updated successfully",
      data: { profile_picture: profilePictureUrl },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Profile picture upload error:", error);
    const response: ActionResponse = {
      status: false,
      message: "Failed to upload profile picture",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.userId) {
      return NextResponse.json(
        { status: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Update user profile picture to null in database
    await prisma.user.update({
      where: { userId: session.user.userId },
      data: { profile_picture: null },
    });

    const response: ActionResponse = {
      status: true,
      message: "Profile picture deleted successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Profile picture delete error:", error);
    const response: ActionResponse = {
      status: false,
      message: "Failed to delete profile picture",
    };
    return NextResponse.json(response, { status: 500 });
  }
}