declare module "react-pdf" {
  import * as React from "react";

  export interface DocumentProps {
    file?: string | File | Uint8Array | null;
    onLoadSuccess?: (pdf: import("pdfjs-dist").PDFDocumentProxy) => void;
    onLoadError?: (error: any) => void;
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
    onRenderSuccess?: () => void;
  }

  export const Document: React.FC<DocumentProps>;
  export const Page: React.FC<PageProps>;
  export const pdfjs: any;
}
