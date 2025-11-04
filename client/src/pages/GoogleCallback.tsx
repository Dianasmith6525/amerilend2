import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function GoogleCallback() {
  const [, setLocation] = useLocation();
  const [processing, setProcessing] = useState(true);

  const googleCallbackMutation = trpc.googleAuth.callback.useMutation({
    onSuccess: () => {
      toast.success("Successfully logged in with Google!");
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      console.error("Google callback error:", error);
      toast.error(error.message || "Google authentication failed");
      setLocation("/login");
    },
  });

  useEffect(() => {
    // Get the authorization code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (error) {
      toast.error(`Google authentication cancelled: ${error}`);
      setLocation("/login");
      return;
    }

    if (code) {
      // Exchange code for user session
      googleCallbackMutation.mutate({ code });
    } else {
      toast.error("No authorization code received from Google");
      setLocation("/login");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#0033A0] mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Completing Google Sign-In
        </h2>
        <p className="text-gray-600">
          Please wait while we authenticate your account...
        </p>
      </div>
    </div>
  );
}
