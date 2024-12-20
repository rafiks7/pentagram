"use server";

export async function generateImage(text: string, userID: string) {
  try {
    const response = await fetch(`${process.env.API_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.API_KEY || "",
      },
      body: JSON.stringify({ text, userID }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();

    console.log("Data:", data);

    return data;
  } catch (error: any) {
    console.error("Error while fetching image:", error);
    return { success: false, error: error.message };
  }
}
