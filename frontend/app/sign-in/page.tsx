// src/app/sign-in/page.tsx
'use client'; 

import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <h1 className="text-3xl font-bold mb-4">Sign In (MVP Placeholder)</h1>
      <p className="text-muted-foreground mb-6">
        Authentication is deferred for post-launch speed.
      </p>
      <Button onClick={() => window.location.href = '/'}> 
        Go Back to Canvas
      </Button>
    </div>
  );
}