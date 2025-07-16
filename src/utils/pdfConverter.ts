import jsPDF from 'jspdf'

interface ImageFile {
  id: string
  file: File
  preview: string
  name: string
  size: string
}

export async function convertImagesToPDF(
  images: ImageFile[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10

  // Remove the first page since we'll add pages as we go
  let isFirstPage = true

  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    
    try {
      // Update progress
      if (onProgress) {
        onProgress((i / images.length) * 90) // Leave 10% for final processing
      }

      // Create image element to get dimensions
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = image.preview
      })

      // Calculate dimensions to fit page while maintaining aspect ratio
      const imgAspectRatio = img.width / img.height
      const pageAspectRatio = (pageWidth - 2 * margin) / (pageHeight - 2 * margin)

      let finalWidth, finalHeight

      if (imgAspectRatio > pageAspectRatio) {
        // Image is wider, fit to page width
        finalWidth = pageWidth - 2 * margin
        finalHeight = finalWidth / imgAspectRatio
      } else {
        // Image is taller, fit to page height
        finalHeight = pageHeight - 2 * margin
        finalWidth = finalHeight * imgAspectRatio
      }

      // Center the image on the page
      const x = (pageWidth - finalWidth) / 2
      const y = (pageHeight - finalHeight) / 2

      // Convert image to base64 for jsPDF
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95)

      // Add new page for each image (except the first)
      if (isFirstPage) {
        isFirstPage = false
      } else {
        pdf.addPage()
      }

      // Add image to PDF
      pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight)

      // Add filename as small text at bottom
      pdf.setFontSize(8)
      pdf.setTextColor(128, 128, 128)
      pdf.text(image.name, margin, pageHeight - 5)

    } catch (error) {
      console.error(`Error processing image ${image.name}:`, error)
      // Continue with other images even if one fails
    }
  }

  // Final progress update
  if (onProgress) {
    onProgress(100)
  }

  // Return PDF as blob
  return pdf.output('blob')
}

export function downloadPDF(blob: Blob, filename: string = 'converted-images.pdf') {
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