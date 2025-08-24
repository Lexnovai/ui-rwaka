import { NextResponse } from 'next/server'
// Force dynamic rendering to prevent static generation issues with PDF parsing

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // If not a PDF, reject early (client handles text types directly)
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      return NextResponse.json({ error: 'Unsupported file type for server extraction' }, { status: 400 })
    }

    // Dynamically import pdfjs-dist for server-side text extraction (avoid pdf-parse ENOENT issue)
    const pdfjsLib: any = await import('pdfjs-dist/legacy/build/pdf.js')
    // Disable worker in Node context (no worker needed server-side)
    pdfjsLib.GlobalWorkerOptions.workerSrc = ''

    const loadingTask = pdfjsLib.getDocument({ data: buffer })
    const pdfDocument = await loadingTask.promise

    let text = ''
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum)
      const content = await page.getTextContent()
      text += content.items.map((item: any) => (item as any).str).join(' ') + '\n'
    }

    return NextResponse.json({ text })
  } catch (err) {
    console.error('PDF parse error:', err)
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 })
  }
}
