import { useState } from "react"
import { 
  FileImage, 
  FileText, 
  Presentation, 
  Table, 
  Code, 
  Merge, 
  Scissors,
  RotateCcw,
  Download,
  ChevronRight,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface ConversionFeature {
  id: string
  title: string
  description: string
  icon: React.ElementType
  inputTypes: string[]
  outputType: string
  isPopular?: boolean
  isNew?: boolean
  comingSoon?: boolean
}

const conversionFeatures: ConversionFeature[] = [
  {
    id: "images-to-pdf",
    title: "Images to PDF",
    description: "Convert JPG, PNG, WebP, HEIC images into a single PDF",
    icon: FileImage,
    inputTypes: ["JPG", "PNG", "WebP", "HEIC"],
    outputType: "PDF",
    isPopular: true,
  },
  {
    id: "powerpoint-to-pdf",
    title: "PowerPoint to PDF",
    description: "Convert PPT and PPTX presentations to PDF format",
    icon: Presentation,
    inputTypes: ["PPT", "PPTX"],
    outputType: "PDF",
    comingSoon: true,
  },
  {
    id: "word-to-pdf",
    title: "Word to PDF",
    description: "Convert DOC and DOCX documents to PDF format",
    icon: FileText,
    inputTypes: ["DOC", "DOCX"],
    outputType: "PDF",
    comingSoon: true,
  },
  {
    id: "excel-to-pdf",
    title: "Excel to PDF",
    description: "Convert XLS and XLSX spreadsheets to PDF format",
    icon: Table,
    inputTypes: ["XLS", "XLSX"],
    outputType: "PDF",
    comingSoon: true,
  },
  {
    id: "text-to-pdf",
    title: "Text to PDF",
    description: "Convert plain text files into formatted PDF documents",
    icon: Code,
    inputTypes: ["TXT", "MD"],
    outputType: "PDF",
    isNew: true,
    comingSoon: true,
  },
  {
    id: "merge-pdfs",
    title: "Merge PDFs",
    description: "Combine multiple PDF files into a single document",
    icon: Merge,
    inputTypes: ["PDF"],
    outputType: "PDF",
    isNew: true,
    comingSoon: true,
  },
  {
    id: "split-pdf",
    title: "Split PDF",
    description: "Split a PDF into multiple files or extract specific pages",
    icon: Scissors,
    inputTypes: ["PDF"],
    outputType: "PDF",
    comingSoon: true,
  },
  {
    id: "pdf-to-images",
    title: "PDF to Images",
    description: "Convert PDF pages to individual image files",
    icon: RotateCcw,
    inputTypes: ["PDF"],
    outputType: "JPG/PNG",
    comingSoon: true,
  },
]

interface FeatureSelectorProps {
  onFeatureSelect: (feature: ConversionFeature) => void
}

export function FeatureSelector({ onFeatureSelect }: FeatureSelectorProps) {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)

  const handleFeatureClick = (feature: ConversionFeature) => {
    if (feature.comingSoon) return
    setSelectedFeature(feature.id)
    onFeatureSelect(feature)
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">
          Choose Your Conversion Tool
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select from our collection of powerful, privacy-first conversion tools. 
          All processing happens locally in your browser.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {conversionFeatures.map((feature) => (
          <Card
            key={feature.id}
            className={`relative cursor-pointer transition-all duration-300 hover:shadow-glow group ${
              feature.comingSoon
                ? "opacity-60 cursor-not-allowed"
                : "hover:scale-[1.02] hover:border-primary/50"
            } ${
              selectedFeature === feature.id
                ? "border-primary shadow-glow bg-primary/5"
                : ""
            }`}
            onClick={() => handleFeatureClick(feature)}
          >
            {/* Badges */}
            <div className="absolute top-3 right-3 flex gap-1 z-10">
              {feature.isPopular && (
                <Badge variant="default" className="text-xs bg-gradient-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
              {feature.isNew && (
                <Badge variant="secondary" className="text-xs">
                  New
                </Badge>
              )}
              {feature.comingSoon && (
                <Badge variant="outline" className="text-xs">
                  Soon
                </Badge>
              )}
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    feature.comingSoon
                      ? "bg-muted/50"
                      : "bg-primary/10 group-hover:bg-primary/20"
                  }`}
                >
                  <feature.icon
                    className={`h-6 w-6 ${
                      feature.comingSoon ? "text-muted-foreground" : "text-primary"
                    }`}
                  />
                </div>
                {!feature.comingSoon && (
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                )}
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription className="text-sm">
                {feature.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Input:</span>
                  <div className="flex gap-1">
                    {feature.inputTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Output:</span>
                  <Badge variant="secondary" className="text-xs">
                    {feature.outputType}
                  </Badge>
                </div>
              </div>
            </CardContent>

            {/* Coming Soon Overlay */}
            {feature.comingSoon && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="p-2 bg-muted rounded-lg">
                    <Download className="h-6 w-6 text-muted-foreground mx-auto" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Coming Soon
                  </p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Info Section */}
      <div className="text-center space-y-4 pt-8 border-t">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            100% Privacy-First
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            No File Uploads
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Unlimited Usage
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Instant Processing
          </div>
        </div>
        <p className="text-xs text-muted-foreground max-w-3xl mx-auto">
          All conversions are processed locally in your browser using cutting-edge web technologies. 
          Your files never leave your device, ensuring complete privacy and security.
        </p>
      </div>
    </div>
  )
}