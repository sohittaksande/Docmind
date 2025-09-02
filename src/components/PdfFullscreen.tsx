import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Expand } from "lucide-react";
import SimpleBar from "simplebar-react";
import { PDFDocumentProxy } from "pdfjs-dist";
import { Document, Page } from "react-pdf";
import { useResizeDetector } from "react-resize-detector";

interface PdfFullscreenProps {
  fileurl: string;
}

const PdfFullscreen = ({ fileurl }: PdfFullscreenProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [numPages, setNumPages] = useState<number>();
  const { width, ref } = useResizeDetector();
  

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button 
        onClick={()=> setIsOpen(true)}
        className="gap-1.5" variant="ghost" aria-label="fullscreen">
          <Expand className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-screen h-screen p-0 overflow-hidden">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)] mt-6">
          <div ref={ref} >
            <Document
              onLoadSuccess={({ numPages }: PDFDocumentProxy) =>
                setNumPages(numPages)
              }
              file={fileurl}
              className="max-h-full"
            >
              {new Array(numPages).fill(0).map((_, i) => (
                <Page key={i} width={width ? width : 1} pageNumber={i + 1} />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
};

export default PdfFullscreen;
