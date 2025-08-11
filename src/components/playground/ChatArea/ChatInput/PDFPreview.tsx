'use client'

import { useState, useEffect } from 'react'

const PDFPreview = ({
    file,
    onRemove,
}: {
    file: File
    onRemove: () => void
}) => {
    const [pdfUrl, setPdfUrl] = useState<string>('')

    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file)
            setPdfUrl(url)

            return () => URL.revokeObjectURL(url)
        }
    }, [file])

    return (
        <div className="mb-4 max-w-3xl mx-auto">
            <div className="inline-block border rounded-lg p-2 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">
                        {file.name}
                    </span>
                    <button
                        onClick={onRemove}
                        className="h-4 w-4 p-0 ml-2 text-xs text-gray-500 hover:text-gray-900"
                    >
                        ✕
                    </button>
                </div>
                <div className="w-32 h-32 overflow-hidden border rounded flex items-center justify-center bg-gray-50">
                    {pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full"
                            style={{ transform: 'scale(0.3)', transformOrigin: 'top left' }}
                            title="PDF Preview"
                        />
                    ) : (
                        <div className="text-xs text-gray-500">PDF Preview</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PDFPreview