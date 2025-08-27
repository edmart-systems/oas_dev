import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
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

    // Get current profile picture to delete old file
    const currentUser = await prisma.user.findUnique({
      where: { userId: session.user.userId },
      select: { profile_picture: true }
    });

    // Delete old profile picture file if exists
    if (currentUser?.profile_picture) {
      try {
        const oldFilePath = join(process.cwd(), "public", currentUser.profile_picture);
        if (existsSync(oldFilePath)) {
          await unlink(oldFilePath);
        }
      } catch (error) {
        console.log("Could not delete old profile picture:", error);
      }
    }

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

    // Get current profile picture to delete file
    const currentUser = await prisma.user.findUnique({
      where: { userId: session.user.userId },
      select: { profile_picture: true }
    });

    // Delete profile picture file if exists
    if (currentUser?.profile_picture) {
      try {
        const filePath = join(process.cwd(), "public", currentUser.profile_picture);
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (error) {
        console.log("Could not delete profile picture file:", error);
      }
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