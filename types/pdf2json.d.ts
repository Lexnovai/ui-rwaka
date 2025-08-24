declare module 'pdf2json' {
  interface PDFRun {
    T: string
  }

  interface PDFText {
    R: PDFRun[]
  }

  interface PDFPage {
    Texts: PDFText[]
  }

  interface PDFData {
    Pages: PDFPage[]
  }

  class PDFParser {
    constructor()
    on(event: 'pdfParser_dataError', callback: (errData: any) => void): void
    on(event: 'pdfParser_dataReady', callback: (pdfData: PDFData) => void): void
    parseBuffer(buffer: Buffer): void
  }

  export default PDFParser
}
