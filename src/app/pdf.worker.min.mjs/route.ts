import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { createRequire } from 'module'

// Serves the real pdf.js worker from the installed pdfjs-dist package
export async function GET() {
  try {
    const require = createRequire(import.meta.url)
    const workerPath = require.resolve('pdfjs-dist/build/pdf.worker.min.mjs')
    const content = await readFile(workerPath)

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    console.error('Failed to serve pdf.worker.min.mjs:', err)
    return NextResponse.json({ error: 'Worker not found' }, { status: 500 })
  }
}
