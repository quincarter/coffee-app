'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

type BrewingDevice = {
  id: string;
  name: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  onDeviceAdded: (device: BrewingDevice) => void;
};

export default function BrewingDeviceForm({ onDeviceAdded }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let imageUrl = formData.image;

      // If using file upload, upload the file first
      if (uploadMethod === 'file' && imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }
        
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      // Create the brewing device
      const response = await fetch('/api/brewing-devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          image: imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create brewing device');
      }

      const newDevice = await response.json();
      onDeviceAdded(newDevice);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        image: '',
      });
      setImageFile(null);
    } catch (err) {
      console.error('Error creating brewing device:', err);
      setError(err instanceof Error ? err.message : 'Failed to create brewing device');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="mb-4 text-lg font-medium">Add New Brewing Device</h3>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
          className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>
      
      <div className="mb-4">
        <fieldset className="mb-2">
          <legend className="mb-1 block text-sm font-medium">Image Source</legend>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="uploadMethod"
                checked={uploadMethod === 'url'}
                onChange={() => setUploadMethod('url')}
                className="mr-2"
              />
              URL
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="uploadMethod"
                checked={uploadMethod === 'file'}
                onChange={() => setUploadMethod('file')}
                className="mr-2"
              />
              File Upload
            </label>
          </div>
        </fieldset>
        
        {uploadMethod === 'url' ? (
          <div>
            <label htmlFor="image" className="mb-1 block text-sm font-medium">
              Image URL
            </label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="imageFile" className="mb-1 block text-sm font-medium">
              Upload Image
            </label>
            <input
              type="file"
              id="imageFile"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Device'}
        </button>
      </div>
    </form>
  );
}