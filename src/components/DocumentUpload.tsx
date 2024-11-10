'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from 'lucide-react'

interface Document {
  id: string;
  name: string;
}

export default function DocumentUpload() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      // Simulate file upload
      setTimeout(() => {
        setDocuments(prev => [...prev, { id: Date.now().toString(), name: file.name }])
        setIsUploading(false)
      }, 1000)
    }
  }

  const removeDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id))
  }

  return (
    <div className="space-y-4">
      <div>
        <Input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        <label htmlFor="file-upload">
          <Button variant="outline" className="cursor-pointer" disabled={isUploading} asChild>
            <span>+ Add Document To Proposal</span>
          </Button>
        </label>
      </div>
      {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
      {documents.length > 0 && (
        <ul className="space-y-2">
          {documents.map(doc => (
            <li key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
              <span className="text-sm">{doc.name}</span>
              <Button variant="ghost" size="sm" onClick={() => removeDocument(doc.id)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Remove {doc.name}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}