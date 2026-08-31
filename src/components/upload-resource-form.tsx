"use client";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CloudUpload,
  ArrowLeft,
  FileText,
  CheckCircle2,
  Image as ImageIcon,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BOOK_TYPES, CONTENT_TYPES, type ContentType } from "@/lib/enums";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { ADMIN_BOOKS_KEY } from "@/hooks/useAdminBooks";
import { validateCoverImage } from "@/services/upload.service";

interface UploadResourceFormProps {
  onDone: () => void;
  onCancel?: () => void;
  isInline?: boolean;
}

export function UploadResourceForm({
  onDone,
  onCancel,
  isInline = false,
}: UploadResourceFormProps) {
  const [drag, setDrag] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<ContentType>("pdf");
  const [bookType, setBookType] = useState<string>(BOOK_TYPES[0].value);
  const [dept, setDept] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { file, uploading, error, setFile, upload, saveAsDraft, reset } =
    useFileUpload();
  const queryClient = useQueryClient();
  const {
    departments,
    levels,
    audienceTags,
    wildcard,
    isLoading: taxonomyLoading,
    isError: taxonomyError,
    refetch: refetchTaxonomy,
  } = useTaxonomy();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedCover = e.target.files?.[0];
    if (!selectedCover) return;

    // Instant client-side pre-flight size & format check (5MB limit)
    const validation = validateCoverImage(selectedCover);
    if (!validation.valid) {
      const errorMsg = validation.error || "Cover image must be 5MB or smaller";
      setCoverError(errorMsg);
      toast.error(errorMsg);
      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
      return;
    }

    setCoverError(null);
    setCoverImage(selectedCover);
    setCoverPreview(URL.createObjectURL(selectedCover));
    toast.success("Cover image selected");
  };

  const handleRemoveCover = () => {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }
    setCoverImage(null);
    setCoverPreview(null);
    setCoverError(null);
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDrag(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      toast.success("File added — analyzing…");
    }
  };

  const handlePublish = async () => {
    if (!file || !title || !author || !dept || !level) {
      toast.error("Please fill in all required fields");
      return;
    }

    const result = await upload({
      file,
      coverImage: coverImage ?? undefined,
      title,
      author,
      contentType,
      bookType,
      department: dept,
      level,
      tags,
      description,
    });

    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ADMIN_BOOKS_KEY });
      toast.success("Resource published successfully");
      handleRemoveCover();
      reset();
      onDone();
    } else {
      toast.error(result.message);
    }
  };

  const handleSaveDraft = async () => {
    if (!file) {
      toast.error("Please select a file before saving a draft");
      return;
    }

    const result = await saveAsDraft({
      title,
      author,
      contentType,
      bookType,
      department: dept,
      level,
      tags,
      description,
      file,
      coverImage: coverImage ?? undefined,
    });

    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ADMIN_BOOKS_KEY });
      toast.success("Draft saved successfully");
      handleRemoveCover();
      onDone();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div
      className={`space-y-6 ${
        isInline
          ? "bg-card border border-border/40 rounded-3xl p-6 sm:p-8 shadow-elegant"
          : ""
      }`}
    >
      {/* Apple-style Page/Section Header */}
      {isInline && (
        <div className="flex flex-col gap-1.5 border-b border-border/40 pb-5">
          {onCancel && (
            <button
              onClick={onCancel}
              className="group flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to Overview
            </button>
          )}
          <h2 className="text-2xl font-bold font-display tracking-tight text-primary">
            Upload Resource
          </h2>
          <p className="text-sm text-muted-foreground">
            Publish a new book, PDF document, or reading pack directly to the
            digital library.
          </p>
        </div>
      )}

      {taxonomyError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" />
            Couldn't load levels, departments and tags.
          </div>
          <button
            type="button"
            onClick={() => refetchTaxonomy()}
            className="text-xs font-semibold text-destructive underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Drag & Drop Zone + Cover Image + Stats */}
        <div className="lg:col-span-5 space-y-6">
          {/* Source Document File */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              Source File <span className="text-destructive">*</span>
            </Label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
                drag
                  ? "border-primary bg-primary/5 shadow-inner scale-[1.01]"
                  : file
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-border/80 bg-muted/20 hover:border-primary/40 hover:bg-muted/30"
              }`}
            >
              <div
                className={`grid h-12 w-12 place-items-center rounded-2xl shadow-sm text-primary-foreground mb-3 transition-all duration-200 ${
                  file ? "bg-emerald-600" : "bg-primary"
                }`}
              >
                {file ? (
                  <FileText className="h-5 w-5" />
                ) : (
                  <CloudUpload className="h-5 w-5" />
                )}
              </div>

              <p className="text-sm font-semibold text-foreground max-w-xs truncate px-2">
                {file ? file.name : "Drop your PDF or EPUB here"}
              </p>

              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                {file ? "File loaded successfully" : "PDF, EPUB up to 200MB"}
              </p>

              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full shadow-xs text-xs font-medium pointer-events-none"
                >
                  {file ? "Replace file" : "Browse files"}
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.epub"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Upload file"
              />

              {file && (
                <div className="absolute right-3 top-3 text-emerald-600">
                  <CheckCircle2 className="h-4.5 w-4.5 fill-emerald-50/10" />
                </div>
              )}
            </div>
            {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
          </div>

          {/* Cover Image Selector (Optional - Option A & B) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                Cover Image{" "}
                <span className="text-muted-foreground/60 font-normal lowercase">
                  (optional)
                </span>
              </Label>
              {coverImage && (
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="text-xs text-destructive hover:underline cursor-pointer flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Remove
                </button>
              )}
            </div>

            {coverPreview ? (
              <div className="relative flex items-center gap-4 rounded-2xl border border-border/80 bg-muted/20 p-3">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {coverImage?.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {coverImage
                      ? `${(coverImage.size / 1024).toFixed(0)} KB · Ready to upload`
                      : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="text-xs font-medium text-primary hover:underline cursor-pointer inline-block mt-1"
                  >
                    Change image
                  </button>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={handleCoverChange}
                    className="hidden"
                    aria-label="Change cover image"
                  />
                </div>
              </div>
            ) : (
              <div
                onClick={() => coverInputRef.current?.click()}
                className="flex items-center justify-between rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4 transition-all duration-200 hover:border-primary/40 hover:bg-muted/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <ImageIcon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Add Book Cover
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      JPEG, PNG, WebP up to 5MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full shadow-xs text-xs font-medium pointer-events-none"
                >
                  Browse
                </Button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleCoverChange}
                  className="hidden"
                  aria-label="Upload cover image"
                />
              </div>
            )}
            {coverError && (
              <p className="text-xs text-destructive mt-1.5">{coverError}</p>
            )}
          </div>

        </div>

        {/* Right Column: Metadata form fields */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2 space-y-2">
              <Label
                htmlFor="title"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                className="h-10.5 rounded-xl border-border/80 focus-visible:ring-primary/20 placeholder:text-muted-foreground/60"
                placeholder="Introduction to Machine Learning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="author"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Author / Publisher <span className="text-destructive">*</span>
              </Label>
              <Input
                id="author"
                className="h-10.5 rounded-xl border-border/80 focus-visible:ring-primary/20 placeholder:text-muted-foreground/60"
                placeholder="Prof. Adeyemi"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={uploading}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Content type
              </Label>
              <Select
                value={contentType}
                onValueChange={(v) => v && setContentType(v as ContentType)}
              >
                <SelectTrigger className="h-10.5 rounded-xl border-border/80 cursor-pointer transition-all hover:border-primary/40 hover:shadow-xs active:scale-[0.98]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {CONTENT_TYPES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="cursor-pointer">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Book format
              </Label>
              <Select
                value={bookType}
                onValueChange={(v) => v && setBookType(v)}
              >
                <SelectTrigger className="h-10.5 rounded-xl border-border/80 cursor-pointer transition-all hover:border-primary/40 hover:shadow-xs active:scale-[0.98]">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {BOOK_TYPES.map((b) => (
                    <SelectItem key={b.value} value={b.value} className="cursor-pointer">
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Department <span className="text-destructive">*</span>
              </Label>
              <Select
                value={dept}
                onValueChange={(v) => v && setDept(v)}
                disabled={taxonomyLoading}
              >
                <SelectTrigger className="h-10.5 rounded-xl border-border/80 cursor-pointer transition-all hover:border-primary/40 hover:shadow-xs active:scale-[0.98] disabled:cursor-not-allowed">
                  <SelectValue
                    placeholder={taxonomyLoading ? "Loading…" : "Select department"}
                  />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value={wildcard} className="cursor-pointer">All departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d} className="cursor-pointer">
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Target Level <span className="text-destructive">*</span>
              </Label>
              <Select
                value={level}
                onValueChange={(v) => v && setLevel(v)}
                disabled={taxonomyLoading}
              >
                <SelectTrigger className="h-10.5 rounded-xl border-border/80 cursor-pointer transition-all hover:border-primary/40 hover:shadow-xs active:scale-[0.98] disabled:cursor-not-allowed">
                  <SelectValue
                    placeholder={taxonomyLoading ? "Loading…" : "Select level"}
                  />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value={wildcard} className="cursor-pointer">All levels</SelectItem>
                  {levels.map((l) => (
                    <SelectItem key={l} value={l} className="cursor-pointer">
                      Level {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Audience tags
              </Label>
              <div className="flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-muted/10 p-3">
                {audienceTags.map((t) => {
                  const on = tags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setTags((prev) =>
                          on ? prev.filter((x) => x !== t) : [...prev, t],
                        )
                      }
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 shadow-xs border cursor-pointer hover:scale-105 active:scale-95 ${
                        on
                          ? "border-transparent bg-primary text-primary-foreground font-semibold"
                          : "border-border/80 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      }`}
                      aria-pressed={on}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal px-0.5">
                Tags are informational only — visibility is controlled by
                department + level above. Keep empty by default.
              </p>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <Label
                htmlFor="desc"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Description
              </Label>
              <Textarea
                id="desc"
                className="rounded-xl border-border/80 focus-visible:ring-primary/20 placeholder:text-muted-foreground/60 resize-none"
                placeholder="Provide a brief description of the material, scope, and key topics covered..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-5">
        {onCancel && (
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={uploading}
            className="rounded-full px-5 cursor-pointer text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
        )}
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          disabled={uploading || !file}
          className="rounded-full px-5 cursor-pointer"
          title={!file ? "Select a file to save a draft" : undefined}
        >
          Save as draft
        </Button>
        <Button
          onClick={handlePublish}
          disabled={uploading || !file || taxonomyLoading}
          className="rounded-full px-6 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-xs"
        >
          {uploading ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </div>
  );
}
