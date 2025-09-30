"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChatInterface, type Message } from "@/components/chat-interface"
import { CodeEditor } from "@/components/code-editor"
import { LivePreview } from "@/components/live-preview"

export default function CodeCanvasPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hello! I'm CodeCanvas AI. How can I help you today?",
      timestamp: new Date(),
    },
  ])

  const [files] = useState([
    { id: "1", name: "app.tsx" },
    { id: "2", name: "styles.css" },
    { id: "3", name: "utils.ts" },
  ])
  const [activeFileId, setActiveFileId] = useState("1")

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "I received your message. This is a placeholder response.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const handleRegenerateMessage = (messageId: string) => {
    console.log("[v0] Regenerating message:", messageId)
    // Placeholder for regenerate functionality
  }

  const handleTabChange = (fileId: string) => {
    setActiveFileId(fileId)
  }

  const handleCopyCode = () => {
    console.log("[v0] Copying code from file:", activeFileId)
    // Placeholder for copy functionality
  }

  const handleFormatCode = () => {
    console.log("[v0] Formatting code in file:", activeFileId)
    // Placeholder for format functionality
  }

  return (
    <div className="flex h-screen flex-col bg-background dark">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
        <h1 className="font-mono text-lg font-semibold text-foreground">CodeCanvas AI</h1>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
          <Button size="sm">Get Started</Button>
        </div>
      </header>

      {/* Main 3-Panel Layout */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Panel - Chat UI */}
        <aside className="flex w-[350px] flex-col border-r border-border bg-[var(--color-panel-chat)]">
          <div className="flex h-12 items-center border-b border-border px-4">
            <h2 className="text-sm font-medium text-muted-foreground">Chat</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              onRegenerateMessage={handleRegenerateMessage}
            />
          </div>
        </aside>

        {/* Middle Panel - Code Editor */}
        <section className="flex flex-1 flex-col border-r border-border bg-[var(--color-panel-editor)]">
          <CodeEditor
            files={files}
            activeFileId={activeFileId}
            onTabChange={handleTabChange}
            onCopyCode={handleCopyCode}
            onFormatCode={handleFormatCode}
          />
        </section>

        {/* Right Panel - Live Preview */}
        <section className="flex flex-1 flex-col bg-[var(--color-panel-preview)]">
          <LivePreview />
        </section>
      </main>
    </div>
  )
}
