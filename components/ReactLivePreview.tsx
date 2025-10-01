// src/components/ReactLivePreview.tsx
"use client";

import React from 'react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';
import { Button } from '@/components/ui/button'; 

// The scope exposes components and variables that the AI-generated code might use.
// This is crucial for React code execution.
const scope = { 
  React,
  Button,
  // Add other common components or hooks here if needed (e.g., useState)
};

interface ReactLivePreviewProps {
  code: string;
}

export function ReactLivePreview({ code }: ReactLivePreviewProps) {
  
  // This is the CRITICAL FIX: We wrap the AI-generated 'code' into a function
  // and explicitly call render() at the end of the execution block.
  const executableCode = `
// Assume the AI generates a functional component or raw JSX
const GeneratedComponent = () => {
    // Return the AI-generated code
    return (
        <React.Fragment>
          ${code}
        </React.Fragment>
    );
}

// Render the component explicitly for the non-inline environment
render(<GeneratedComponent />);
`;

  return (
    <LiveProvider 
      // Pass the fully wrapped code block to the LiveProvider
      code={executableCode} 
      scope={scope}
      noInline={true} 
    >
      <div className="h-full w-full flex flex-col">
        
        {/* The LivePreview area (takes up most of the space) */}
        <div className="flex-1 bg-white dark:bg-gray-950 p-4 overflow-auto">
          <LivePreview className="p-4" /> 
        </div>
        
        {/* Error Boundary and Console (bottom 16 units) */}
        <div className="h-16 bg-red-700 dark:bg-red-900 text-white p-2 text-xs overflow-auto border-t border-red-500 flex items-start">
          <span className="font-bold mr-2 whitespace-nowrap">Console Error:</span>
          <LiveError />
        </div>
      </div>
    </LiveProvider>
  );
}