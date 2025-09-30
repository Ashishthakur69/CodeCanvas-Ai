"use client"

import { useState } from "react"
import { Monitor, Tablet, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

type DeviceType = "desktop" | "tablet" | "mobile"

export function LivePreview() {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>("desktop")

  // Define container widths based on device type
  const deviceWidths = {
    desktop: "w-full",
    tablet: "w-[768px]",
    mobile: "w-[375px]",
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar with device toggles */}
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <h2 className="text-sm font-medium text-muted-foreground">Preview</h2>
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

      {/* Preview container with dynamic width */}
      <div className="flex flex-1 items-start justify-center overflow-auto p-6">
        <div
          className={`${deviceWidths[selectedDevice]} h-full rounded-lg border border-border bg-background transition-all duration-300`}
        >
          <div className="flex h-full items-center justify-center p-8">
            <p className="text-center text-sm text-muted-foreground">Live preview will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
