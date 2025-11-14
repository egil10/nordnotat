"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

interface PDFPreviewProps {
  fileUrl: string
  title?: string
}

export function PDFPreview({ fileUrl, title }: PDFPreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setIsLoading(true)
    if (iframeRef.current) {
      iframeRef.current.onload = () => {
        setIsLoading(false)
      }
    }
  }, [fileUrl])

  return (
    <Card>
      <CardContent className="p-0">
        {isLoading && (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={fileUrl}
          className="w-full h-[600px] border-0"
          title={title || "PDF Preview"}
          onLoad={() => setIsLoading(false)}
          style={{ display: isLoading ? "none" : "block" }}
        />
      </CardContent>
    </Card>
  )
}

