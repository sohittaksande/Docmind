    "use client";

    import dynamic from "next/dynamic";

    const PDFViewerInner = dynamic(() => import("./PDFViewerInner"), {
      ssr: false,
    });

    interface PdfRendererProps {
      url: string;
    }

    export default function PdfRenderer({ url }: PdfRendererProps) {
      return <PDFViewerInner url={url} />;
    }