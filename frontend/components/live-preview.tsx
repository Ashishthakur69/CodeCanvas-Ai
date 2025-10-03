// src/components/live-preview.tsx
"use client"

import { useState, useMemo } from "react"
import { Monitor, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReactLivePreview } from "./ReactLivePreview"

type DeviceType = "desktop" | "mobile"
type Framework = 'html' | 'react' | 'vue' | 'nextjs';

interface LivePreviewProps {
  code: string;
  framework: Framework;
}

export function LivePreview({ code, framework }: LivePreviewProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>("desktop")

  const deviceWidths = {
    desktop: "w-full",
    mobile: "w-[375px] max-w-full",
  }

  const iframeContent = useMemo(() => {
    if (framework !== 'html') return '';

    // Convert JSX comments to HTML comments before rendering
    const sanitizedCode = code.replace(/{\s*\/\*\s*(.*?)\s*\*\/\s*}/g, '<!-- $1 -->');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodeCanvas Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { margin: 0; padding: 0; height: 100vh; background-color: white; }
        </style>
      </head>
      <body>
        ${sanitizedCode}
      </body>
      </html>
    `;
  }, [code, framework]);


  const renderPreviewContent = () => {
    if (framework === 'html') {
        return (
             <iframe
                title="Live Code Preview"
                className="w-full h-full border-none rounded-lg"
                srcDoc={iframeContent}
                sandbox="allow-scripts allow-same-origin"
            />
        );
    } else if (framework === 'react' || framework === 'nextjs') {
        return <ReactLivePreview code={code} />;
    } else if (framework === 'vue') {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Vue Live Preview is deferred. Showing generated code in the editor.
            </div>
        );
    }
    return null;
  };


  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <h2 className="text-sm font-medium text-muted-foreground">Live Preview ({framework.toUpperCase()})</h2>
        <div className="flex items-center gap-1">
          <Button
            variant={selectedDevice === "desktop" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSelectedDevice("desktop")}
            className="h-8 w-8 p-0"
          >
            <Monitor className="h-4 w-4" />
            <span className="sr-only">Desktop view</span>
          </Button>
          <Button
            variant={selectedDevice === "mobile" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSelectedDevice("mobile")}
            className="h-8 w-8 p-0"
          >
            <Smartphone className="h-4 w-4" />
            <span className="sr-only">Mobile view</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-auto p-6 bg-muted">
        <div
          className={`${deviceWidths[selectedDevice]} h-full rounded-lg border-2 border-border bg-background transition-all duration-300 shadow-xl`}
        >
          {renderPreviewContent()}
        </div>
      </div>
    </div>
  )
}