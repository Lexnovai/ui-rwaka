import { NextResponse } from 'next/server'

// Force dynamic rendering to prevent static generation issues with PDF parsing

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      return NextResponse.json(
        { error: 'Unsupported file type for server extraction' },
        { status: 400 }
      )
    }

    // Use pdf2json for server-side PDF text extraction (Node.js compatible)
    const PDFParser = (await import('pdf2json')).default

    const pdfParser = new (PDFParser as any)()

    const text = await new Promise<string>((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(new Error(errData?.parserError || 'PDF parse error'))
      })

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        let extractedText = ''
        if (pdfData?.Pages) {
          for (const page of pdfData.Pages) {
            if (page?.Texts) {
              for (const textItem of page.Texts) {
                if (textItem?.R) {
                  for (const run of textItem.R) {
                    if (run?.T) extractedText += decodeURIComponent(run.T) + ' '
                  }
                }
              }
            }
            extractedText += '\n'
          }
        }
        resolve(extractedText.trim())
      })

      // Start parsing from buffer
      pdfParser.parseBuffer(buffer)
    })

    return NextResponse.json({ text })
  } catch (err) {
    console.error('PDF parse error:', err)
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 })
  }
}
