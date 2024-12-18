"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GeneratedImage {
  id: string;
  url: string;
}

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [imageLoading, setImageLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:10000/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageLoading(true);
      const id = inputText.replace(/\s/g, "-").toLowerCase() + "-" + Date.now();
      setImages(prevImages => [...prevImages, { id: id, url: imageUrl }]);
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

  const handleImageLoad = () => {
    setImageLoading(false);
  };

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
              key={image.id}
              className={`${gridClasses[index % gridClasses.length]} bg-gray-800 rounded-lg overflow-hidden`}
            >
              <img
                src={image.url}
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
