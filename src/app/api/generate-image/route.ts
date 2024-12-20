import { NextResponse } from "next/server";
import crypto from "crypto";
import { uploadImage } from "@/app/actions/s3-actions";
import { use } from "react";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, userID, imageUrl } = body;

    const apiKey = request.headers.get("X-API-Key");

    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const url = new URL(process.env.Modal_URL || "");

    url.searchParams.set("prompt", text);

    if (imageUrl != "") {
      url.searchParams.set("imageUrl", imageUrl);
    }
    console.log("Sending request to:", url.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": process.env.API_KEY || "",
        Accept: "image/jpeg",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: response.statusText },
        { status: 500 }
      );
    }

    const imageBuffer = await response.arrayBuffer();

    if (imageUrl != "") {
      // Update image
      const filename = imageUrl.split("/").pop();
      const newName = `${crypto.randomUUID()}-${text.slice(0, 10)}.jpeg`;
      const publicUrl = await uploadImage(imageBuffer, filename, userID, newName);
      console.log("Updating image in S3:", publicUrl);
      return NextResponse.json({ success: true, id: filename, imageUrl: publicUrl });
    } else {
      const filename = `${crypto.randomUUID()}-${text.slice(0, 10)}.jpeg`;

      const publicUrl = await uploadImage(imageBuffer, filename, userID);

      console.log("Uploading image to S3:", publicUrl);

      return NextResponse.json({
        success: true,
        id: filename,
        imageUrl: publicUrl,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
