"use client";

import { useState } from "react";
import { GalleryBlock } from "@/types/blocks";

interface GalleryBlockEditorProps {
  block: GalleryBlock;
  onUpdate: (block: GalleryBlock) => void;
}

export default function GalleryBlockEditor({ block, onUpdate }: GalleryBlockEditorProps) {
  const [uploading, setUploading] = useState<number | null>(null);

  const handleTitleChange = (title: string) => {
    onUpdate({
      ...block,
      config: { ...block.config, title }
    });
  };

  const handleDescriptionChange = (description: string) => {
    onUpdate({
      ...block,
      config: { ...block.config, description }
    });
  };

  const handleGridViewChange = (gridView: 1 | 2 | 3 | 4) => {
    onUpdate({
      ...block,
      config: { ...block.config, gridView }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size exceeds 5MB limit');
      return;
    }

    try {
      setUploading(block.config.images.length);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'gallery-images');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadResponse.json();

      if (uploadData.success) {
        onUpdate({
          ...block,
          config: {
            ...block.config,
            images: [...block.config.images, uploadData.data.url]
          }
        });
      } else {
        alert(uploadData.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = block.config.images[index];
    
    // Delete from storage if it's a Supabase URL
    if (imageUrl && imageUrl.includes('supabase.co/storage')) {
      try {
        const urlParts = imageUrl.split('/cca-assets/');
        if (urlParts.length === 2) {
          const filePath = urlParts[1];
          await fetch(`/api/upload?path=${encodeURIComponent(filePath)}`, {
            method: 'DELETE'
          });
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    // Remove from block config
    onUpdate({
      ...block,
      config: {
        ...block.config,
        images: block.config.images.filter((_, i) => i !== index)
      }
    });
  };

  const gridCols = block.config.gridView || 1;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={block.config.title || ""}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
          placeholder="Enter gallery title..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          value={block.config.description || ""}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
          placeholder="Enter gallery description..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Grid View (Optional, default is 1)
        </label>
        <div className="flex gap-2">
          {([1, 2, 3, 4] as const).map((grid) => (
            <button
              key={grid}
              type="button"
              onClick={() => handleGridViewChange(grid)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                (block.config.gridView || 1) === grid
                  ? "bg-[#F44336] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {grid}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images <span className="text-red-500">*</span>
        </label>
        
        {/* Image Preview Grid */}
        {block.config.images.length > 0 && (
          <div
            className={`grid gap-4 mb-4`}
            style={{
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`
            }}
          >
            {block.config.images.map((image, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Remove image"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6 L14 14 M14 6 L6 14" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <div>
          <input
            type="file"
            id={`gallery-upload-${block.id}`}
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />
          <label
            htmlFor={`gallery-upload-${block.id}`}
            className="inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium cursor-pointer transition-colors"
          >
            {uploading !== null ? 'Uploading...' : '+ Add Image'}
          </label>
        </div>
      </div>
    </div>
  );
}
