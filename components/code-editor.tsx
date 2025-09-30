"use client"

import { Copy, Code } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileTab {
  id: string
  name: string
}

interface CodeEditorProps {
  files: FileTab[]
  activeFileId: string
  onTabChange: (fileId: string) => void
  onCopyCode: () => void
  onFormatCode: () => void
}

export function CodeEditor({ files, activeFileId, onTabChange, onCopyCode, onFormatCode }: CodeEditorProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Tab bar and action buttons */}
      <div className="flex items-center justify-between border-b border-border bg-background px-2">
        {/* File tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => onTabChange(file.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeFileId === file.id
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onFormatCode} className="h-8 gap-2">
            <Code className="h-4 w-4" />
            Format
          </Button>
          <Button variant="ghost" size="sm" onClick={onCopyCode} className="h-8 gap-2">
            <Copy className="h-4 w-4" />
            Copy Code
          </Button>
        </div>
      </div>

      {/* Editor container */}
      <div className="flex-1 bg-[var(--color-panel-editor)] p-4">
        <div className="h-full w-full rounded-md border border-border bg-black/20 p-4 font-mono text-sm text-foreground">
          {/* Code editor will be mounted here */}
          <div className="text-muted-foreground">Editor instance will be mounted here...</div>
        </div>
      </div>
    </div>
  )
}
