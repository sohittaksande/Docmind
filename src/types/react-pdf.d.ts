declare module "react-pdf" {
  import * as React from "react";
  import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

  export interface DocumentProps {
    file?: string | File | Uint8Array | null;
    onLoadSuccess?: (pdf: PDFDocumentProxy) => void;
    onLoadError?: (error: Error) => void;
    children?: React.ReactNode;
    className?: string;
  }

  export interface PageProps {
    pageNumber: number;
    width?: number;
    height?: number;
    scale?: number;
    rotate?: number;
    renderAnnotationLayer?: boolean;
    renderTextLayer?: boolean;
    className?: string;
    loading?: React.ReactNode;
    onRenderSuccess?: (page?: PDFPageProxy) => void;
  }

  export const Document: React.FC<DocumentProps>;
  export const Page: React.FC<PageProps>;

  // pdfjs object with worker options etc.
  export const pdfjs: {
    version: string;
    GlobalWorkerOptions: {
      workerSrc: string;
    };
  };
}
