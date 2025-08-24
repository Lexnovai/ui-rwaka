import { NextResponse } from 'next/server'
import pdf from 'pdf-parse'

// Force dynamic rendering to prevent static generation issues with pdf-parse
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

    // Robust PDF text extraction with pdf-parse
    const result = await pdf(buffer)
    const text = result.text || ''

    return NextResponse.json({ text })
  } catch (err) {
    console.error('PDF parse error:', err)
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 })
  }
}
