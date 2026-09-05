"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  ExternalLink,
  Download,
  Maximize2,
  RefreshCw,
  AlertCircle,
  BookOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { fetchResourcePreviewUrl } from "@/services/student-resource.service";

interface DocumentPreviewerProps {
  resourceId: string;
  title: string;
  fileUrl?: string | null;
  fileFormat?: string | null;
  coverImageUrl?: string | null;
  className?: string;
}

export function DocumentPreviewer({
  resourceId,
  title,
  fileUrl,
  fileFormat = "PDF",
  coverImageUrl,
  className = "",
}: DocumentPreviewerProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    async function loadUrl() {
      try {
        const { url } = await fetchResourcePreviewUrl(resourceId, fileUrl);
        if (isMounted) {
          if (url) {
            setResolvedUrl(url);
          } else {
            setHasError(true);
          }
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    }

    loadUrl();
    return () => {
      isMounted = false;
    };
  }, [resourceId, fileUrl]);

  const isPdf =
    fileFormat?.toUpperCase() === "PDF" ||
    resolvedUrl?.toLowerCase().endsWith(".pdf") ||
    resolvedUrl?.includes(".pdf?");

  const handleOpenExternal = () => {
    if (resolvedUrl) {
      window.open(resolvedUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(150, z + 15));
  const handleZoomOut = () => setZoom((z) => Math.max(70, z - 15));
  const handleResetZoom = () => setZoom(100);

  return (
    <div
      className={`flex flex-col h-full min-h-[460px] rounded-3xl border border-border/60 bg-muted/20 overflow-hidden shadow-inner ${className}`}
    >
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 bg-card/80 px-4 py-2.5 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="font-mono text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-primary/20"
          >
            {fileFormat || "PDF"} Document
          </Badge>
          <span className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs font-medium">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zoom controls for PDF */}
          {isPdf && resolvedUrl && (
            <div className="hidden sm:flex items-center gap-1 border-r border-border/40 pr-2 mr-1">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleZoomOut}
                disabled={zoom <= 70}
                title="Zoom Out"
                className="rounded-lg h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-[11px] font-mono text-muted-foreground w-9 text-center">
                {zoom}%
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleZoomIn}
                disabled={zoom >= 150}
                title="Zoom In"
                className="rounded-lg h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              {zoom !== 100 && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleResetZoom}
                  title="Reset Zoom"
                  className="rounded-lg h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {resolvedUrl && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenExternal}
                className="h-7 rounded-xl text-xs gap-1.5 cursor-pointer shadow-xs"
              >
                <Maximize2 className="h-3 w-3" />
                Full Window
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handleOpenExternal}
                className="h-7 rounded-xl text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
              >
                <Download className="h-3 w-3" />
                Download
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Preview Workspace */}
      <div className="relative flex-1 w-full bg-muted/40 min-h-[420px] flex items-center justify-center overflow-auto p-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-xs font-medium text-muted-foreground animate-pulse">
              Resolving document stream for preview…
            </p>
          </div>
        ) : hasError || !resolvedUrl ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center max-w-md">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Document stream unavailable
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                The file could not be rendered directly in the embedded viewport.
              </p>
            </div>
            {fileUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(fileUrl, "_blank")}
                className="rounded-full text-xs gap-1.5 mt-2"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Try opening file link directly
              </Button>
            )}
          </div>
        ) : isPdf ? (
          <div
            className="w-full h-full min-h-[500px] flex items-center justify-center transition-transform duration-200"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
            <iframe
              src={`${resolvedUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              title={title}
              className="w-full h-full min-h-[500px] rounded-2xl border border-border/40 shadow-sm bg-white"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        ) : (
          /* Non-PDF Document Fallback (e.g. EPUB, DOCX, Images) */
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center max-w-sm">
            {coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImageUrl}
                alt={title}
                className="max-h-48 rounded-2xl object-cover shadow-sm border border-border/60"
              />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary shadow-xs">
                <BookOpen className="h-8 w-8" />
              </div>
            )}
            <div>
              <span className="inline-block rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary uppercase mb-1">
                {fileFormat || "EPUB"} FILE
              </span>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                This document format is ready for download and external review.
              </p>
            </div>
            <Button
              onClick={handleOpenExternal}
              size="sm"
              className="rounded-full text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs cursor-pointer px-5"
            >
              <Download className="h-3.5 w-3.5" />
              Download & Inspect File
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
