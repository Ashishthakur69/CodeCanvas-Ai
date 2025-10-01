// src/components/live-preview.tsx

"use client"

import { useState, useMemo } from "react"
import { Monitor, Tablet, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReactLivePreview } from "./ReactLivePreview" // IMPORT NEW COMPONENT

type DeviceType = "desktop" | "tablet" | "mobile"
type Framework = 'html' | 'react' | 'vue' | 'nextjs'; // Re-define type for safety

interface LivePreviewProps {
  code: string; 
  framework: Framework; // ADD FRAMEWORK PROP
}

export function LivePreview({ code, framework }: LivePreviewProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>("desktop")

  const deviceWidths = {
    desktop: "w-full",
    tablet: "w-[768px] max-w-full",
    mobile: "w-[375px] max-w-full",
  }

  // --- HTML IFRAME RENDER LOGIC ---
  const iframeContent = useMemo(() => {
    // Only compile this content if the framework is HTML
    if (framework !== 'html') return '';

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
        ${code} 
      </body>
      </html>
    `;
  }, [code, framework]);


  // --- CONDITIONAL PREVIEW RENDER ---
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
        // Use the dedicated React execution environment
        return <ReactLivePreview code={code} />;
    } else if (framework === 'vue') {
        // Placeholder for Vue: requires @vue/repl or similar complex setup
        return (
            <div className="p-8 text-center text-muted-foreground">
                Vue Live Preview is a complex future feature. Showing generated code in the editor.
            </div>
        );
    }
    return null; // Fallback
  };


  return (
    <div className="flex h-full flex-col">
      {/* Toolbar (UNCHANGED) */}
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
            variant={selectedDevice === "tablet" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSelectedDevice("tablet")}
            className="h-8 w-8 p-0"
          >
            <Tablet className="h-4 w-4" />
            <span className="sr-only">Tablet view</span>
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

      {/* Preview container with dynamic width and content */}
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