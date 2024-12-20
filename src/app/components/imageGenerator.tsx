"use client";

import { use, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateImage } from "@/app/actions/generate-image";
import { listImages } from "@/app/actions/s3-actions";

export default function ImageGenerator() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await generateImage(inputText);

      console.log("Result:", result);

      if (result.success && result.imageUrl) {
        setImages([...images, result.imageUrl]);
      }
      else {
        alert("Failed to generate image");
      }

      setInputText("");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const gridClasses = [
    "col-span-2 row-span-2",
    "col-span-1 row-span-1",
    "col-span-1 row-span-2",
    "col-span-2 row-span-1",
    "col-span-1 row-span-1",
    "col-span-1 row-span-1",
  ];

  useEffect(() => {
    // fetch images from s3
    listImages().then(images => {
      console.log("Images from s3:", images);
      if (!images) return;
      setImages(images);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between p-8 bg-gray-900 text-gray-100">
      <header className="w-full max-w-5xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-center text-blue-400 mb-2">
          Pentagram
        </h1>
        <p className="text-center text-gray-400">
          Generate and share images from text
        </p>
      </header>{" "}
      <ScrollArea className="flex-1 w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-3 gap-4 p-4">
          {images.map((image, index) => (
            <div
              key={index}
              className={`${gridClasses[index % gridClasses.length]} bg-gray-800 rounded-lg overflow-hidden`}
            >
              <img
                src={image}
                alt={`Generated image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {isLoading && (
            <div
              className={`${gridClasses[images.length % gridClasses.length]} flex justify-center items-center bg-gray-800 rounded-lg`}
            >
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            </div>
          )}
        </div>
      </ScrollArea>
      <footer className="w-full max-w-3xl mx-auto mt-8">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400"
              placeholder="Describe the image you want to generate..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}