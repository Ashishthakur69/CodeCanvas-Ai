// src/components/ReactLivePreview.tsx
"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';
import { Button } from '@/components/ui/button'; 

// The scope exposes components and variables that the AI-generated code might use.
const scope = { 
  React,
  Button,
  useState,         
  useEffect,        
  useRef,           
  useMemo,          
  useCallback,      
  // Add other common components or hooks here if needed
};

interface ReactLivePreviewProps {
  code: string;
}

export function ReactLivePreview({ code }: ReactLivePreviewProps) {
  
  // CRITICAL FIX: Wrap the AI's output in a component and call render()
  const executableCode = `
  // The scope provides React, Button, and hooks automatically.


// Assume the AI generates a functional component or raw JSX
const GeneratedComponent = () => {
    // Return the AI-generated code, ensuring safety with React.Fragment
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
      code={executableCode} 
      scope={scope}
      noInline={true} 
    >
      <div className="h-full w-full flex flex-col">
        
        <div className="flex-1 bg-white dark:bg-gray-950 p-4 overflow-auto">
          <LivePreview className="p-4" /> 
        </div>
        
        {/* Error Boundary and Console */}
        <div className="h-16 bg-red-700 dark:bg-red-900 text-white p-2 text-xs overflow-auto border-t border-red-500 flex items-start">
          <span className="font-bold mr-2 whitespace-nowrap">Console Error:</span>
          <LiveError />
        </div>
      </div>
    </LiveProvider>
  );
}