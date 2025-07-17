import jsPDF from 'jspdf'
import { PDFDocument, rgb } from 'pdf-lib'

interface UploadedFile {
  id: string
  file: File
  preview?: string
  name: string
  size: string
  type: string
}

export async function convertImagesToPDF(
  files: UploadedFile[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10

  let isFirstPage = true

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    try {
      if (onProgress) {
        onProgress((i / files.length) * 90)
      }

      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = file.preview || URL.createObjectURL(file.file)
      })

      const imgAspectRatio = img.width / img.height
      const pageAspectRatio = (pageWidth - 2 * margin) / (pageHeight - 2 * margin)

      let finalWidth, finalHeight

      if (imgAspectRatio > pageAspectRatio) {
        finalWidth = pageWidth - 2 * margin
        finalHeight = finalWidth / imgAspectRatio
      } else {
        finalHeight = pageHeight - 2 * margin
        finalWidth = finalHeight * imgAspectRatio
      }

      const x = (pageWidth - finalWidth) / 2
      const y = (pageHeight - finalHeight) / 2

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95)

      if (isFirstPage) {
        isFirstPage = false
      } else {
        pdf.addPage()
      }

      pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight)
      pdf.setFontSize(8)
      pdf.setTextColor(128, 128, 128)
      pdf.text(file.name, margin, pageHeight - 5)

    } catch (error) {
      console.error(`Error processing image ${file.name}:`, error)
    }
  }

  if (onProgress) {
    onProgress(100)
  }

  return pdf.output('blob')
}

export async function convertTextToPDF(
  files: UploadedFile[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const lineHeight = 6
  const maxLineWidth = pageWidth - 2 * margin

  let isFirstPage = true

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    try {
      if (onProgress) {
        onProgress((i / files.length) * 90)
      }

      const text = await file.file.text()
      
      if (!isFirstPage) {
        pdf.addPage()
      } else {
        isFirstPage = false
      }

      // Add title
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text(file.name, margin, margin + 10)
      
      // Add separator line
      pdf.setLineWidth(0.5)
      pdf.line(margin, margin + 15, pageWidth - margin, margin + 15)
      
      // Add content
      pdf.setFontSize(10)
      const lines = pdf.splitTextToSize(text, maxLineWidth)
      let y = margin + 25
      
      for (const line of lines) {
        if (y + lineHeight > pageHeight - margin) {
          pdf.addPage()
          y = margin
        }
        pdf.text(line, margin, y)
        y += lineHeight
      }

    } catch (error) {
      console.error(`Error processing text file ${file.name}:`, error)
    }
  }

  if (onProgress) {
    onProgress(100)
  }

  return pdf.output('blob')
}

export async function mergePDFs(
  files: UploadedFile[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const mergedPdf = await PDFDocument.create()
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    try {
      if (onProgress) {
        onProgress((i / files.length) * 90)
      }

      const arrayBuffer = await file.file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      
      copiedPages.forEach((page) => mergedPdf.addPage(page))
    } catch (error) {
      console.error(`Error processing PDF ${file.name}:`, error)
    }
  }

  if (onProgress) {
    onProgress(100)
  }

  const pdfBytes = await mergedPdf.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}

export async function splitPDF(
  files: UploadedFile[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  if (files.length === 0) {
    throw new Error('No PDF file provided')
  }

  const file = files[0] // Only process the first PDF file
  const arrayBuffer = await file.file.arrayBuffer()
  const pdf = await PDFDocument.load(arrayBuffer)
  const pageCount = pdf.getPageCount()

  // Create a new PDF with each page as a separate document
  // For simplicity, we'll create one PDF with page numbers added
  const resultPdf = await PDFDocument.create()
  
  for (let i = 0; i < pageCount; i++) {
    if (onProgress) {
      onProgress((i / pageCount) * 90)
    }

    const [copiedPage] = await resultPdf.copyPages(pdf, [i])
    const page = resultPdf.addPage(copiedPage)
    
    // Add page number
    const { width, height } = page.getSize()
    page.drawText(`Page ${i + 1} of ${pageCount}`, {
      x: 50,
      y: height - 50,
      size: 12,
      color: rgb(0.5, 0.5, 0.5)
    })
  }

  if (onProgress) {
    onProgress(100)
  }

  const pdfBytes = await resultPdf.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}

export async function convertWordToPDF(
  files: UploadedFile[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const lineHeight = 6
  const maxLineWidth = pageWidth - 2 * margin

  let isFirstPage = true

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    try {
      if (onProgress) {
        onProgress((i / files.length) * 90)
      }

      // Try to extract text from .docx files (basic extraction)
      let text = ''
      if (file.file.type.includes('word') || file.name.endsWith('.docx')) {
        // For .docx files, we'll extract as much text as possible
        const arrayBuffer = await file.file.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        const textDecoder = new TextDecoder('utf-8', { fatal: false })
        const rawText = textDecoder.decode(uint8Array)
        
        // Extract readable text (basic approach)
        text = rawText.replace(/[^\x20-\x7E\n\r]/g, ' ').replace(/\s+/g, ' ').trim()
      } else {
        text = await file.file.text()
      }
      
      if (!isFirstPage) {
        pdf.addPage()
      } else {
        isFirstPage = false
      }

      // Add title
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text(file.name, margin, margin + 10)
      
      // Add separator line
      pdf.setLineWidth(0.5)
      pdf.line(margin, margin + 15, pageWidth - margin, margin + 15)
      
      // Add content
      pdf.setFontSize(10)
      const lines = pdf.splitTextToSize(text.substring(0, 5000), maxLineWidth) // Limit text length
      let y = margin + 25
      
      for (const line of lines) {
        if (y + lineHeight > pageHeight - margin) {
          pdf.addPage()
          y = margin
        }
        pdf.text(line, margin, y)
        y += lineHeight
      }

    } catch (error) {
      console.error(`Error processing document ${file.name}:`, error)
    }
  }

  if (onProgress) {
    onProgress(100)
  }

  return pdf.output('blob')
}

export function downloadPDF(blob: Blob, filename: string = 'converted.pdf') {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export async function convertByFeature(
  featureId: string,
  files: UploadedFile[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  switch (featureId) {
    case 'images-to-pdf':
      return convertImagesToPDF(files, onProgress)
    case 'text-to-pdf':
      return convertTextToPDF(files, onProgress)
    case 'merge-pdfs':
      return mergePDFs(files, onProgress)
    case 'split-pdf':
      return splitPDF(files, onProgress)
    case 'word-to-pdf':
      return convertWordToPDF(files, onProgress)
    case 'powerpoint-to-pdf':
    case 'excel-to-pdf':
    case 'pdf-to-images':
    default:
      // Placeholder for unsupported features
      const pdf = new jsPDF()
      pdf.setFontSize(16)
      pdf.text('Feature Coming Soon!', 20, 30)
      pdf.setFontSize(12)
      pdf.text('This conversion feature is under development.', 20, 50)
      pdf.text('Stay tuned for updates!', 20, 70)
      
      if (onProgress) {
        onProgress(100)
      }
      
      return pdf.output('blob')
  }
}