'use client'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface Props {
  onFiles: (files: File[]) => void
  previews: string[]
  onRemove: (index: number) => void
}

export default function ImageUpload({ onFiles, previews, onRemove }: Props) {
  const onDrop = useCallback((files: File[]) => {
    if (files.length > 0) onFiles(files)
  }, [onFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 5, multiple: true
  })

  return (
    <div className="flex flex-col gap-3">
      <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
        ${isDragActive ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-400 hover:bg-gray-50'}`}>
        <input {...getInputProps()} />
        <div className="text-gray-500">
          <div className="text-5xl mb-3">📷</div>
          <p className="font-semibold text-lg">Drop photos of your fridge or pantry</p>
          <p className="text-sm mt-1 text-gray-400">Up to 5 photos — or click to browse</p>
        </div>
      </div>

      {/* photo previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-100">
              <img src={src} alt={`Photo ${i + 1}`} className="w-full h-24 object-cover" />
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(i) }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* AI disclaimer */}
      <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
        <span className="text-base leading-none">🤖</span>
        <p><span className="font-semibold">AI-powered analysis:</span> Ingredient detection is powered by AI and may not be 100% accurate. Please review and edit the detected ingredients before generating recipes.</p>
      </div>
    </div>
  )
}