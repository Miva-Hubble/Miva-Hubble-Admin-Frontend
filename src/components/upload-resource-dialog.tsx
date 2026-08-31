"use client";

import { useState, type ReactElement } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UploadResourceForm } from "./upload-resource-form";

type Props = {
  trigger: ReactElement;
};

/**
 * Upload flow for PDFs and books. Wraps the standalone UploadResourceForm
 * inside a Dialog modal for backward compatibility and clean popup use.
 */
export function UploadResourceDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
        <DialogHeader className="sr-only">
          <DialogTitle>Upload Resource</DialogTitle>
          <DialogDescription>
            Provide details and drop a PDF or EPUB document to add it to the library catalog.
          </DialogDescription>
        </DialogHeader>
        <UploadResourceForm 
          onDone={() => setOpen(false)} 
          onCancel={() => setOpen(false)} 
          isInline={false} 
        />
      </DialogContent>
    </Dialog>
  );
}
