declare module 'pdf2json' {
  // More specific types for PDF data structure
  interface PDFRun {
    T: string // The actual text content, often URI-encoded
  }

  interface PDFText {
    R: PDFRun[] // An array of text runs
  }

  interface PDFPage {
    Texts: PDFText[] // All text objects on the page
  }

  interface PDFData {
    Pages: PDFPage[] // An array of all pages in the document
  }

  // Type for the error object from pdfParser_dataError event
  interface PDFError {
    parserError: string | Error
  }

  // The main parser class
  class PDFParser {
    constructor()

    // Event listener for data errors
    on(event: 'pdfParser_dataError', callback: (errData: PDFError) => void): void

    // Event listener for when parsing is complete
    on(event: 'pdfParser_dataReady', callback: (pdfData: PDFData) => void): void

    // Method to start parsing from a buffer
    parseBuffer(buffer: Buffer): void
  }

  export default PDFParser
}
