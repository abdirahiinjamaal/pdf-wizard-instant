import { useState, useCallback } from "react"
import { Upload, X, AlertCircle, FileText, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { SortableContainer, SortableElement } from "react-sortable-hoc"
import { cn } from "@/lib/utils"
import { ConversionFeature } from "./FeatureSelector"

interface UploadedFile {
  id: string
  file: File
  preview?: string
  name: string
  size: string
  type: string
}

interface FileUploaderProps {
  feature: ConversionFeature
  onConvert: (files: UploadedFile[]) => Promise<void>
  isConverting: boolean
  progress: number
  onBack: () => void
}

const SortableFile = SortableElement<{ file: UploadedFile; onRemove: (id: string) => void; isImage: boolean }>(
  ({ file, onRemove, isImage }) => (
    <div className="relative group bg-card border-2 border-border rounded-lg p-3 transition-all duration-200 hover:border-primary/50 hover:shadow-md">
      <div className="aspect-square bg-muted rounded-md overflow-hidden mb-2">
        {isImage && file.preview ? (
          <img
            src={file.preview}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
      <p className="text-xs text-muted-foreground">{file.size}</p>
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(file.id)}
      >
        <X className="h-3 w-3" />
      </Button>
      <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1">
        {isImage ? (
          <ImageIcon className="h-3 w-3 text-primary" />
        ) : (
          <FileText className="h-3 w-3 text-primary" />
        )}
      </div>
    </div>
  )
)

const SortableFileList = SortableContainer<{ files: UploadedFile[]; onRemove: (id: string) => void; isImageConversion: boolean }>(
  ({ files, onRemove, isImageConversion }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {files.map((file, index) => (
        <SortableFile
          key={file.id}
          index={index}
          file={file}
          onRemove={onRemove}
          isImage={isImageConversion}
        />
      ))}
    </div>
  )
)

export function FileUploader({ feature, onConvert, isConverting, progress, onBack }: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const { toast } = useToast()

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getAcceptedTypes = (inputTypes: string[]): string => {
    const typeMap: Record<string, string> = {
      "JPG": "image/jpeg",
      "PNG": "image/png", 
      "WebP": "image/webp",
      "HEIC": "image/heic",
      "PPT": "application/vnd.ms-powerpoint",
      "PPTX": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "DOC": "application/msword",
      "DOCX": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "XLS": "application/vnd.ms-excel",
      "XLSX": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "TXT": "text/plain",
      "MD": "text/markdown",
      "PDF": "application/pdf"
    }
    return inputTypes.map(type => typeMap[type]).filter(Boolean).join(",")
  }

  const processFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadedFile[] = []
    const acceptedExtensions = feature.inputTypes.map(type => type.toLowerCase())

    Array.from(fileList).forEach((file) => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || ""
      
      if (!acceptedExtensions.includes(fileExtension)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not supported. Please use ${feature.inputTypes.join(", ")} files.`,
          variant: "destructive",
        })
        return
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 50MB. Please use a smaller file.`,
          variant: "destructive",
        })
        return
      }

      const id = Math.random().toString(36).substr(2, 9)
      let preview: string | undefined

      // Create preview for images
      if (feature.id === "images-to-pdf" && file.type.startsWith("image/")) {
        preview = URL.createObjectURL(file)
      }
      
      newFiles.push({
        id,
        file,
        preview,
        name: file.name,
        size: formatFileSize(file.size),
        type: fileExtension,
      })
    })

    setFiles((prev) => [...prev, ...newFiles])
    
    if (newFiles.length > 0) {
      toast({
        title: "Files uploaded",
        description: `${newFiles.length} file(s) ready for conversion.`,
      })
    }
  }, [feature, toast])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    processFiles(e.dataTransfer.files)
  }, [processFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
    }
  }, [processFiles])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const onSortEnd = ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      const [removed] = newFiles.splice(oldIndex, 1)
      newFiles.splice(newIndex, 0, removed)
      return newFiles
    })
  }

  const clearAll = () => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    setFiles([])
  }

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload at least one file to convert.",
        variant: "destructive",
      })
      return
    }
    
    await onConvert(files)
  }

  const isImageConversion = feature.id === "images-to-pdf"

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          ← Back to Features
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{feature.title}</h2>
          <p className="text-muted-foreground">{feature.description}</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300",
          "bg-upload-bg hover:bg-upload-hover",
          isDragOver
            ? "border-primary bg-upload-hover scale-[1.02]"
            : "border-upload-border",
          isConverting && "pointer-events-none opacity-50"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={cn(
              "p-4 rounded-full bg-primary/10 transition-all duration-300",
              isDragOver && "scale-110 bg-primary/20"
            )}>
              <Upload className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Drop your {feature.inputTypes.join("/")} files here or click to browse
            </h3>
            <p className="text-sm text-muted-foreground">
              Supports {feature.inputTypes.join(", ")} • Max 50MB per file
            </p>
          </div>

          <input
            type="file"
            multiple={feature.id !== "split-pdf"}
            accept={getAcceptedTypes(feature.inputTypes)}
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isConverting}
          />
        </div>
      </div>

      {/* File Preview Grid */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-foreground">
              {files.length} file{files.length !== 1 ? 's' : ''} ready
            </h4>
            <Button variant="outline" onClick={clearAll} disabled={isConverting}>
              Clear All
            </Button>
          </div>

          <div className="bg-card rounded-xl p-6 border shadow-card">
            <SortableFileList
              files={files}
              onRemove={removeFile}
              onSortEnd={onSortEnd}
              axis="xy"
              distance={10}
              isImageConversion={isImageConversion}
            />
          </div>
        </div>
      )}

      {/* Convert Button and Progress */}
      {files.length > 0 && (
        <div className="space-y-4">
          <Button
            onClick={handleConvert}
            disabled={isConverting || files.length === 0}
            size="lg"
            className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow"
          >
            {isConverting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Converting to {feature.outputType}...
              </>
            ) : (
              <>
                <feature.icon className="h-4 w-4 mr-2" />
                Convert to {feature.outputType} ({files.length} file{files.length !== 1 ? 's' : ''})
              </>
            )}
          </Button>

          {isConverting && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                Processing your files... {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border">
        <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Privacy-first conversion</p>
          <p className="text-xs text-muted-foreground">
            Your files are processed locally in your browser. No files are uploaded to our servers.
          </p>
        </div>
      </div>
    </div>
  )
}