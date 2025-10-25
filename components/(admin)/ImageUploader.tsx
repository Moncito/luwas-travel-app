'use client'

import { useState } from 'react'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { toast } from 'sonner'
import { UploadCloud } from 'lucide-react'

interface Props {
  onUploadComplete: (url: string) => void
}

export default function ImageUploader({ onUploadComplete }: Props) {
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    if (!file) return
    setPreview(URL.createObjectURL(file))

    const storage = getStorage()
    const storageRef = ref(storage, `uploads/${Date.now()}-${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setProgress(percent)
      },
      (error) => {
        console.error(error)
        toast.error('Upload failed')
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref)
        onUploadComplete(url)
        toast.success('Image uploaded!')
      }
    )
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition"
    >
      <UploadCloud className="mx-auto text-blue-500 w-10 h-10 mb-2" />
      <p className="text-sm text-gray-600">Drag & Drop or Click to Upload</p>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="file-upload"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
      />
      <label
        htmlFor="file-upload"
        className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 cursor-pointer"
      >
        Choose File
      </label>

      {progress > 0 && progress < 100 && (
        <div className="mt-3 w-full bg-gray-200 rounded-full">
          <div
            className="bg-blue-600 text-white text-xs font-medium text-center p-0.5 leading-none rounded-full"
            style={{ width: `${progress}%` }}
          >
            {Math.round(progress)}%
          </div>
        </div>
      )}

      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="mt-4 h-48 w-full object-cover rounded-lg shadow-md"
        />
      )}
    </div>
  )
}
