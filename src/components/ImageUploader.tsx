import { useState, useCallback } from "react"
import { FileImage, Upload, X, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { SortableContainer, SortableElement } from "react-sortable-hoc"
import { cn } from "@/lib/utils"

interface ImageFile {
  id: string
  file: File
  preview: string
  name: string
  size: string
}

interface ImageUploaderProps {
  onConvert: (files: ImageFile[]) => Promise<void>
  isConverting: boolean
  progress: number
}

const SortableImage = SortableElement<{ image: ImageFile; onRemove: (id: string) => void }>(
  ({ image, onRemove }) => (
    <div className="relative group bg-card border-2 border-border rounded-lg p-3 transition-all duration-200 hover:border-primary/50 hover:shadow-md">
      <div className="aspect-square bg-muted rounded-md overflow-hidden mb-2">
        <img
          src={image.preview}
          alt={image.name}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="text-sm font-medium text-foreground truncate">{image.name}</p>
      <p className="text-xs text-muted-foreground">{image.size}</p>
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(image.id)}
      >
        <X className="h-3 w-3" />
      </Button>
      <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1">
        <FileImage className="h-3 w-3 text-primary" />
      </div>
    </div>
  )
)

const SortableImageList = SortableContainer<{ images: ImageFile[]; onRemove: (id: string) => void }>(
  ({ images, onRemove }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((image, index) => (
        <SortableImage
          key={image.id}
          index={index}
          image={image}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
)

export function ImageUploader({ onConvert, isConverting, progress }: ImageUploaderProps) {
  const [images, setImages] = useState<ImageFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const { toast } = useToast()

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const processFiles = useCallback((files: FileList) => {
    const supportedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"]
    const newImages: ImageFile[] = []

    Array.from(files).forEach((file) => {
      if (!supportedTypes.includes(file.type)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not supported. Please use JPG, PNG, WebP, or HEIC.`,
          variant: "destructive",
        })
        return
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB. Please compress the image.`,
          variant: "destructive",
        })
        return
      }

      const id = Math.random().toString(36).substr(2, 9)
      const preview = URL.createObjectURL(file)
      
      newImages.push({
        id,
        file,
        preview,
        name: file.name,
        size: formatFileSize(file.size),
      })
    })

    setImages((prev) => [...prev, ...newImages])
    
    if (newImages.length > 0) {
      toast({
        title: "Images uploaded",
        description: `${newImages.length} image(s) ready for conversion.`,
      })
    }
  }, [toast])

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

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter((img) => img.id !== id)
    })
  }, [])

  const onSortEnd = ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
    setImages((prev) => {
      const newImages = [...prev]
      const [removed] = newImages.splice(oldIndex, 1)
      newImages.splice(newIndex, 0, removed)
      return newImages
    })
  }

  const clearAll = () => {
    images.forEach((image) => URL.revokeObjectURL(image.preview))
    setImages([])
  }

  const handleConvert = async () => {
    if (images.length === 0) {
      toast({
        title: "No images selected",
        description: "Please upload at least one image to convert.",
        variant: "destructive",
      })
      return
    }
    
    await onConvert(images)
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
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
              Drop your images here or click to browse
            </h3>
            <p className="text-sm text-muted-foreground">
              Supports JPG, PNG, WebP, HEIC • Max 10MB per file
            </p>
          </div>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isConverting}
          />
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-foreground">
              {images.length} image{images.length !== 1 ? 's' : ''} ready
            </h4>
            <Button variant="outline" onClick={clearAll} disabled={isConverting}>
              Clear All
            </Button>
          </div>

          <div className="bg-card rounded-xl p-6 border shadow-card">
            <SortableImageList
              images={images}
              onRemove={removeImage}
              onSortEnd={onSortEnd}
              axis="xy"
              distance={10}
            />
          </div>
        </div>
      )}

      {/* Convert Button and Progress */}
      {images.length > 0 && (
        <div className="space-y-4">
          <Button
            onClick={handleConvert}
            disabled={isConverting || images.length === 0}
            size="lg"
            className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow"
          >
            {isConverting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Converting to PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Convert to PDF ({images.length} image{images.length !== 1 ? 's' : ''})
              </>
            )}
          </Button>

          {isConverting && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                Processing your images... {Math.round(progress)}%
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
            Your images are processed locally in your browser. No files are uploaded to our servers.
          </p>
        </div>
      </div>
    </div>
  )
}