import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import React from "react";

const ErrorAlert = ({ error }: { error: string }) => {
  return (
    <Alert variant="destructive">
      <Terminal className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
