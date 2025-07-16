import { useState } from "react"
import { FileImage, Github, Heart, Download, Clock } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { FeatureSelector, ConversionFeature } from "@/components/FeatureSelector"
import { FileUploader } from "@/components/FileUploader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { convertByFeature, downloadPDF, formatFileSize } from "@/utils/conversionUtils"

interface UploadedFile {
  id: string
  file: File
  preview?: string
  name: string
  size: string
  type: string
}

const Index = () => {
  const [selectedFeature, setSelectedFeature] = useState<ConversionFeature | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [lastConversion, setLastConversion] = useState<{
    filename: string
    size: string
    feature: string
  } | null>(null)
  const { toast } = useToast()

  const handleFeatureSelect = (feature: ConversionFeature) => {
    setSelectedFeature(feature)
  }

  const handleBackToFeatures = () => {
    setSelectedFeature(null)
  }

  const handleConvert = async (files: UploadedFile[]) => {
    if (!selectedFeature) return
    try {
      setIsConverting(true)
      setProgress(0)

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const resultBlob = await convertByFeature(selectedFeature.id, files, (progress) => {
        setProgress(progress)
      })

      clearInterval(progressInterval)
      setProgress(100)

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10)
      const featureName = selectedFeature.title.toLowerCase().replace(/\s+/g, '-')
      const filename = `${featureName}-${timestamp}.pdf`

      // Download the file
      downloadPDF(resultBlob, filename)

      // Update last conversion info
      setLastConversion({
        filename,
        size: formatFileSize(resultBlob.size),
        feature: selectedFeature.title,
      })

      toast({
        title: "Conversion completed successfully!",
        description: `Your ${selectedFeature.outputType} with ${files.length} file(s) is ready for download.`,
      })

      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0)
        setIsConverting(false)
      }, 1000)

    } catch (error) {
      console.error("Conversion error:", error)
      toast({
        title: "Conversion failed",
        description: "Something went wrong while creating your PDF. Please try again.",
        variant: "destructive",
      })
      setIsConverting(false)
      setProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg shadow-glow">
                <FileImage className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  img2pdf
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Turn images into PDF in seconds
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Privacy-First
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 animate-slide-up">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
              {selectedFeature ? (
                <>Convert {selectedFeature.inputTypes.join("/")} to {selectedFeature.outputType}</>
              ) : (
                <>
                  Universal File Converter in{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    5 seconds
                  </span>
                </>
              )}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {selectedFeature ? (
                selectedFeature.description
              ) : (
                "Fast, secure, and completely private. Convert images, documents, presentations, and more without uploading to any server."
              )}
            </p>
          </div>

          {!selectedFeature && (
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                No file uploads
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Processed locally
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Unlimited conversions
              </div>
            </div>
          )}
        </div>

        {/* Feature Selection or File Upload */}
        <div className="animate-scale-in">
          {selectedFeature ? (
            <FileUploader
              feature={selectedFeature}
              onConvert={handleConvert}
              isConverting={isConverting}
              progress={progress}
              onBack={handleBackToFeatures}
            />
          ) : (
            <FeatureSelector onFeatureSelect={handleFeatureSelect} />
          )}
        </div>

        {/* Last Conversion Info */}
        {lastConversion && (
          <div className="max-w-md mx-auto bg-card border rounded-xl p-6 shadow-card animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Last conversion</h3>
                <p className="text-sm text-muted-foreground">{lastConversion.feature} • Successfully created</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Filename:</span>
                <span className="font-medium text-foreground">{lastConversion.filename}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium text-foreground">{lastConversion.size}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Your file was processed locally and never left your device
              </p>
            </div>
          </div>
        )}

        {/* Features Grid - Only show when no feature is selected */}
        {!selectedFeature && (
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card border rounded-xl p-6 text-center shadow-card hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileImage className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Multiple Formats</h3>
              <p className="text-sm text-muted-foreground">
                Support for images, documents, presentations, and more
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 text-center shadow-card hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Privacy First</h3>
              <p className="text-sm text-muted-foreground">
                All processing happens in your browser. Zero server uploads.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 text-center shadow-card hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Instant Download</h3>
              <p className="text-sm text-muted-foreground">
                Get your converted files immediately with one click
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-primary rounded-lg">
                  <FileImage className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-foreground">File Converter</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Made with <Heart className="h-4 w-4 text-red-500 inline mx-1" /> by{" "}
                <span className="font-medium">Lovable AI</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Privacy-first • Images never stored permanently</span>
              <Button variant="ghost" size="sm" asChild>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  Source
                </a>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
