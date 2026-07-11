"use client";

import { useState, type ReactElement } from "react";
import { CloudUpload, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  AUDIENCE_TAGS,
  BOOK_TYPES,
  CONTENT_TYPES,
  DEPARTMENTS,
  LEVELS,
  type AudienceTag,
  type ContentType,
} from "@/lib/enums";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useAudienceEstimate } from "@/hooks/useAudienceEstimate";

type Props = {
  trigger: ReactElement;
};

/**
 * Upload flow for PDFs and books. Owns its own dialog open state so it can be
 * dropped anywhere in the app (Overview hero, Library header, empty states…).
 */
export function UploadResourceDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <UploadDialogBody onDone={() => setOpen(false)} />
    </Dialog>
  );
}

function UploadDialogBody({ onDone }: { onDone: () => void }) {
  const [drag, setDrag] = useState(false);
  const [contentType, setContentType] = useState<ContentType>("pdf");
  const [bookType, setBookType] = useState<string>("textbook");
  const [dept, setDept] = useState<string>("computer-science");
  const [level, setLevel] = useState<string>("300");
  const [tags, setTags] = useState<AudienceTag[]>(["AI Track"]);
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const { file, uploading, error, setFile, upload, saveAsDraft, reset } =
    useFileUpload();
  const audience = useAudienceEstimate(dept, level, tags);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
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
    if (!file || !title || !author) {
      toast.error("Please fill in all required fields");
      return;
    }

    const result = await upload({
      file,
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
      toast.success("Resource published successfully");
      reset();
      onDone();
    } else {
      toast.error(result.message);
    }
  };

  const handleSaveDraft = async () => {
    const result = await saveAsDraft({
      title,
      author,
      contentType,
      bookType,
      department: dept,
      level,
      tags,
      description,
      file: file ?? undefined,
    });

    if (result.success) {
      toast.success("Draft saved successfully");
      onDone();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="font-display text-xl">
          Upload resource
        </DialogTitle>
        <DialogDescription>
          Drop a PDF or eBook — we&apos;ll autodetect metadata and reading time.
        </DialogDescription>
      </DialogHeader>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        className={`relative grid place-items-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          drag
            ? "border-primary bg-primary/10 shadow-md"
            : "border-border bg-muted/30"
        }`}
      >
        <div
          className="grid h-14 w-14 place-items-center rounded-lg text-primary-foreground shadow-md bg-primary"
        >
          <CloudUpload className="h-6 w-6" />
        </div>
        <p className="mt-3 text-base font-semibold text-foreground">
          {file ? file.name : "Drop your file here"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          PDF, EPUB up to 200MB · duplicates auto-detected
        </p>
        <label>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            render={<span />}
          >
            Browse files
          </Button>
          <input
            type="file"
            accept=".pdf,.epub"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload file"
          />
        </label>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Introduction to Machine Learning"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            placeholder="Prof. Adeyemi"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            disabled={uploading}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Content type</Label>
          <Select
            value={contentType}
            onValueChange={(v) => {
              if (v) {
                setContentType(v as ContentType);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_TYPES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Book type</Label>
          <Select
            value={bookType}
            onValueChange={(v) => {
              if (v) {
                setBookType(v);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {BOOK_TYPES.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Department</Label>
          <Select
            value={dept}
            onValueChange={(v) => {
              if (v) {
                setDept(v);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Level</Label>
          <Select
            value={level}
            onValueChange={(v) => {
              if (v) {
                setLevel(v);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label>Audience tags</Label>
          <div className="flex flex-wrap gap-1.5 rounded-lg border bg-muted/30 p-2">
            {AUDIENCE_TAGS.map((t) => {
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
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    on
                      ? "border-transparent bg-gradient-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                  aria-pressed={on}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Tags narrow who sees this resource. Leave empty to reach the whole
            department + level.
          </p>
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            placeholder="Short summary shown on the resource card…"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={uploading}
          />
        </div>
      </div>

      <div
        className="rounded-lg border border-primary/20 p-4 bg-primary/10"
      >
        <p className="flex items-center gap-2 font-semibold text-sm text-primary">
          <Sparkles className="h-4 w-4" /> Estimated audience:{" "}
          {audience.count.toLocaleString()} students
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">{audience.label}</p>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={handleSaveDraft} disabled={uploading}>
          Save as draft
        </Button>
        <Button onClick={handlePublish} disabled={uploading || !file}>
          {uploading ? "Publishing..." : "Publish"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
