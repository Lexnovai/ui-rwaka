declare module 'pdf-parse' {
  interface PDFInfo {
    PDFFormatVersion: string
    IsAcroFormPresent: boolean
    IsXFAPresent: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }

  interface PDFMetadata {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }

  interface PDFData {
    numpages: number
    numrender: number
    info: PDFInfo
    metadata: PDFMetadata
    version: string
    text: string
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function pdf(dataBuffer: Buffer, options?: any): Promise<PDFData>
  export = pdf
}
