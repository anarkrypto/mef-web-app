'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const from = searchParams?.get('from') || '/';
  const message = searchParams?.get('message');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      if (message) {
        setError(message);
      } else {
        setError("No authentication token provided");
      }
      return;
    }

    async function authenticate() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/auth/exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initialToken: token }),
          credentials: 'include',
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Authentication failed');
        }

        setSuccess(true);
        // Small delay to show success message
        setTimeout(() => {
          router.push(from);
        }, 1000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
        setIsLoading(false);
      }
    }

    authenticate();
  }, [token, from, router, message]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>
          {isLoading ? "Please wait while we authenticate your session..." : 
           success ? "Authentication successful!" :
           "Secure authentication required"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center space-x-2 p-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p>Authenticating...</p>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert 
            variant="default" 
            className="border-green-200 bg-green-50 text-green-800"
          >
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription className="text-green-700">
              Redirecting you to your destination...
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default function AuthPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      }>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthContent />
        </Suspense>
      </Suspense>
    </div>
  );
} 