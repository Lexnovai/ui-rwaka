/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import PDFParser from 'pdf2json'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // PDF parsing with pdf2json
    const text = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser()

      pdfParser.on('pdfParser_dataError', (err: any) => reject(err.parserError))
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          const text = pdfData.FormImage.Pages.map((page: any) =>
            page.Texts.map((t: any) =>
              decodeURIComponent(t.R.map((r: any) => r.T).join(''))
            ).join(' ')
          ).join('\n')
          resolve(text)
        } catch (e) {
          reject(e)
        }
      })

      pdfParser.parseBuffer(buffer)
    })

    return NextResponse.json({ text })
  } catch (err) {
    console.error('PDF parse error:', err)
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 })
  }
}
