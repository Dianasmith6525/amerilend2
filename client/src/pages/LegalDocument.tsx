import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type DocumentType = "terms_of_service" | "privacy_policy" | "loan_agreement" | "esign_consent";

const DOCUMENT_METADATA: Record<DocumentType, { title: string; version: string; file: string }> = {
  terms_of_service: {
    title: "Terms of Service",
    version: "1.0",
    file: "/legal/terms-of-service.md",
  },
  privacy_policy: {
    title: "Privacy Policy",
    version: "1.0",
    file: "/legal/privacy-policy.md",
  },
  loan_agreement: {
    title: "Loan Agreement",
    version: "1.0",
    file: "/legal/loan-agreement.md",
  },
  esign_consent: {
    title: "E-Sign Consent",
    version: "1.0",
    file: "/legal/esign-consent.md",
  },
};

export default function LegalDocument() {
  const params = useParams<{ type: string }>();
  const [, navigate] = useLocation();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  const documentType = params.type as DocumentType;
  const metadata = DOCUMENT_METADATA[documentType];

  const hasAcceptedQuery = trpc.legal.hasAccepted.useQuery(
    { documentType },
    { enabled: !!documentType }
  );

  const acceptMutation = trpc.legal.acceptDocument.useMutation({
    onSuccess: () => {
      toast.success("Document accepted successfully");
      setHasAccepted(true);
      hasAcceptedQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record acceptance");
    },
  });

  useEffect(() => {
    if (!metadata) {
      navigate("/404");
      return;
    }

    // Load markdown content
    fetch(metadata.file)
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading document:", error);
        toast.error("Failed to load document");
        setLoading(false);
      });
  }, [metadata, navigate]);

  useEffect(() => {
    if (hasAcceptedQuery.data) {
      setHasAccepted(true);
    }
  }, [hasAcceptedQuery.data]);

  const handleAccept = () => {
    if (!accepted) {
      toast.error("Please check the box to accept");
      return;
    }

    acceptMutation.mutate({
      documentType,
      documentVersion: metadata.version,
      ipAddress: undefined, // Could be fetched from API
      userAgent: navigator.userAgent,
    });
  };

  if (!metadata) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>{metadata.title}</CardTitle>
          <CardDescription>Version {metadata.version}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="prose prose-sm max-w-none mb-6">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>

              {hasAccepted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    ✓ You have already accepted this document
                  </p>
                </div>
              ) : (
                <div className="border-t pt-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <Checkbox
                      id="accept"
                      checked={accepted}
                      onCheckedChange={(checked) => setAccepted(checked === true)}
                    />
                    <label
                      htmlFor="accept"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I have read and accept the {metadata.title}
                    </label>
                  </div>

                  <Button
                    onClick={handleAccept}
                    disabled={!accepted || acceptMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {acceptMutation.isPending ? "Processing..." : "Accept and Continue"}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
