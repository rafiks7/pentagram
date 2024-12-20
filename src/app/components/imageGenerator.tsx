"use client";

import { use, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateImage } from "@/app/actions/generate-image";
import { listImages, deleteImage } from "@/app/actions/s3-actions";
import { useUser } from "@clerk/nextjs";

export default function ImageGenerator() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editText, setEditText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    // fetch images from s3
    if (!user) return;
    listImages(user.id).then(images => {
      console.log("Images from s3:", images);
      if (!images) return;
      setImages(images);
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (user) {
        const result = await generateImage(inputText, user.id);

        console.log("Result:", result);

        if (result.success && result.imageUrl) {
          setImages([...images, result.imageUrl]);
        } else {
          alert("Failed to generate image");
        }
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

  const handleDelete = (index: number) => {
    // delete image
    const imageUrl = images[index];
    if (!imageUrl) return;

    if (user) {
      deleteImage(imageUrl, user.id).then(() => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
      });
    }
  };

  const handleEdit = (index: any) => {
    setEditingIndex(index);
  };
  const handleSaveEdit = () => {
    // Logic to save the edit
    const imageUrl = images[editingIndex];
    if (!imageUrl) return;

    setIsEditing(true);

    if (user) {
      generateImage(editText, user.id, imageUrl)
        .then(result => {
          if (result.success && result.imageUrl) {
            console.log("Image updated successfully:", result.imageUrl);
            const newImages = [...images];
            newImages[editingIndex] = result.imageUrl;
            console.log("New images:", newImages);
            setImages(newImages);
          } else {
            alert("Failed to update image");
          }

          setEditingIndex(-1);
          setIsEditing(false);
          setEditText("");
        })
        .catch(err => {
          console.error("Error updating image:", err);
          setIsEditing(false);
        });
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(-1);
    setEditText("");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-8 bg-gray-900 text-gray-100">
      <header className="w-full max-w-5xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-center text-blue-400 mb-2">
          Frame Forger
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
              className={`${gridClasses[index % gridClasses.length]} bg-gray-800 rounded-lg overflow-hidden relative`}
            >
              {isEditing && editingIndex === index ? (
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
              ) : (
                <>
                  <img
                    src={image}
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Edit Button */}
                  {user?.id === images[index].split("/")[3] && (
                    <button
                      onClick={() => handleEdit(index)} // Your edit function goes here
                      className="absolute top-2 left-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 4l4 4M4 16l4 4M4 4l16 16"
                        />
                      </svg>
                    </button>
                  )}

                  {/* Delete Button */}
                  {user?.id === images[index].split("/")[3] && (
                    <button
                      onClick={() => handleDelete(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}

                  {/* Conditionally render the text input if editing */}
                  {editingIndex === index && (
                    <div className="absolute bottom-2 left-2 right-2 bg-gray-900 p-2 rounded-lg shadow-lg">
                      <input
                        type="text"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-800 text-gray-100"
                        placeholder="Enter a description..."
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
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
