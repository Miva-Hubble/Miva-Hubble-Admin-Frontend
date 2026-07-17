"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { CloudUpload, Users, XIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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

type Step = 1 | 2 | 3;

const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: "Resource file" },
  { id: 2, label: "Classification" },
  { id: 3, label: "Audience" },
];

// Floor for the resize handles — below this the step indicator + footer
// start fighting the scroll area for space.
const MIN_WIDTH = 500;
const MIN_HEIGHT = 400;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Upload flow for PDFs and books. Owns its own dialog open state so it can be
 * dropped anywhere in the app (Overview hero, Library header, empty states…).
 */
export function UploadResourceDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <UploadDialogBody open={open} onDone={() => setOpen(false)} />
    </Dialog>
  );
}

function UploadDialogBody({
  open,
  onDone,
}: {
  open: boolean;
  onDone: () => void;
}) {
  const [drag, setDrag] = useState(false);
  const [step, setStep] = useState<Step>(1);
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

  // The visible "card" is a plain <div> we render and own outright —
  // NOT base-ui's Popup element. Earlier versions of this tried to reach
  // into the Popup's own DOM node (via ref-forwarding through the shared
  // dialog.tsx wrapper) and resize/reposition IT directly. That depended
  // on assumptions about base-ui's internal positioning (whether it's
  // pure CSS centering vs. something floating-ui-derived) that couldn't
  // be verified without actually running the app — and the bug report
  // ("not moving", "stuck on one side") is exactly the failure mode you'd
  // see if one of those assumptions was wrong.
  //
  // Now: Popup is stretched to fill the viewport, made fully transparent
  // and non-interactive (`pointer-events-none`, so backdrop clicks still
  // pass through it to close the dialog), and just centers our card
  // inside itself via flexbox. The card is a normal div with normal
  // React-owned sizing — no more guessing about a third party's box model.
  const cardRef = useRef<HTMLDivElement | null>(null);

  const resizeState = useRef<{
    axis: "width" | "height";
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    const state = resizeState.current;
    const el = cardRef.current;
    if (!state || !el) return;

    if (state.axis === "width") {
      const dx = (e.clientX - state.startX) * 2;
      const maxWidth = window.innerWidth - 32;
      const nextWidth = clamp(state.startWidth + dx, MIN_WIDTH, maxWidth);
      el.style.width = `${nextWidth}px`;
    } else {
      const dy = (e.clientY - state.startY) * 2;
      const maxHeight = window.innerHeight - 32;
      const nextHeight = clamp(state.startHeight + dy, MIN_HEIGHT, maxHeight);
      el.style.height = `${nextHeight}px`;
    }
  }, []);

  const handleResizeEnd = useCallback(() => {
    resizeState.current = null;
    window.removeEventListener("mousemove", handleResizeMove);
    window.removeEventListener("mouseup", handleResizeEnd);
  }, [handleResizeMove]);

  /** Bound per-axis so the width and height handles just do `onMouseDown={startResize("width")}`. */
  const startResize = useCallback(
    (axis: "width" | "height") =>
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return; // left button only
        e.preventDefault();
        const el = cardRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        resizeState.current = {
          axis,
          startX: e.clientX,
          startY: e.clientY,
          startWidth: rect.width,
          startHeight: rect.height,
        };
        window.addEventListener("mousemove", handleResizeMove);
        window.addEventListener("mouseup", handleResizeEnd);
      },
    [handleResizeMove, handleResizeEnd],
  );

  // Always start a fresh upload flow at step 1 whenever the dialog opens —
  // and reset any resize from a previous open back to the default 80%
  // size. Without this, re-opening the dialog would resume whatever size
  // you last left it at, which reads as a bug rather than a feature.
  useEffect(() => {
    if (open) {
      setStep(1);
      const el = cardRef.current;
      if (el) {
        el.style.width = "";
        el.style.height = "";
      }
    }
  }, [open]);

  // Belt-and-suspenders: if the dialog unmounts mid-resize (e.g. the user
  // hits Escape while still holding the mouse down), don't leave orphaned
  // listeners on `window`.
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [handleResizeMove, handleResizeEnd]);

  const goNext = () => {
    if (step === 1 && (!file || !title || !author)) {
      toast.error("Add a file, title, and author to continue");
      return;
    }
    setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  };

  const goBack = () => {
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  };

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
    <DialogContent
      showCloseButton={false}
      className="flex h-screen w-screen max-w-none items-center justify-center gap-0 rounded-none bg-transparent p-0 pointer-events-none ring-0 sm:max-w-none"
    >
      <div
        ref={cardRef}
        className="relative flex h-[80vh] max-h-[95vh] w-[80vw] max-w-[95vw] pointer-events-auto flex-col overflow-hidden rounded-2xl bg-popover text-popover-foreground shadow-2xl ring-1 ring-foreground/10"
      >
        <DialogClose
          className="absolute top-2 right-2 z-20"
          render={<Button variant="ghost" size="icon-sm" />}
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogClose>

        <DialogHeader className="shrink-0 gap-1.5 border-b p-8 pb-6 sm:p-10 sm:pb-6">
        <DialogTitle className="font-display text-2xl">
          Upload resource
        </DialogTitle>
        <DialogDescription className="text-sm">
          Drop a PDF or eBook — we&apos;ll autodetect metadata and reading
          time.
        </DialogDescription>
      </DialogHeader>

      {/* Step indicator */}
      <div className="shrink-0 flex items-center justify-center border-b bg-muted/20 px-8 py-6 sm:px-10">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "grid size-8 place-items-center rounded-full text-xs font-semibold transition-colors",
                  step === s.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : step > s.id
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {s.id}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-[11px] font-medium",
                  step === s.id ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-3 h-px flex-1 -translate-y-2.5",
                  step > s.id ? "bg-primary/40" : "bg-border",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-8 sm:p-10">
        {step === 1 && (
          <div className="space-y-8">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              className={`relative grid place-items-center rounded-2xl border-2 border-dashed px-10 py-16 text-center transition-all ${
                drag
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-muted/30"
              }`}
            >
              <div className="grid h-16 w-16 place-items-center rounded-xl text-primary-foreground shadow-md bg-primary">
                <CloudUpload className="h-7 w-7" />
              </div>
              <p className="mt-4 text-base font-semibold text-foreground">
                {file ? file.name : "Drop your file here"}
              </p>
              <p className="text-sm text-muted-foreground mt-1.5">
                PDF, EPUB up to 200MB · duplicates auto-detected
              </p>
              <label>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
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
              {error && (
                <p className="mt-3 text-xs text-destructive">{error}</p>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Introduction to Machine Learning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={uploading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="Prof. Adeyemi"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  disabled={uploading}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <Label>Audience tags</Label>
              <div className="flex flex-wrap gap-2 rounded-xl border bg-muted/30 p-4">
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
                      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
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
                Tags narrow who sees this resource. Leave empty to reach the
                whole department + level.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                placeholder="Short summary shown on the resource card…"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
              />
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/10 p-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Users className="h-4 w-4" /> Estimated audience:{" "}
                {audience.count.toLocaleString()} students
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {audience.label}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Resize handles — thin invisible strips along the right and bottom
          edges, matching a sidebar-splitter feel: no visible chrome until
          hovered, native directional resize cursor, subtle highlight line
          on hover/drag. The card above has `relative` positioning, which
          is what these absolutely-position against. */}
      <div
        onMouseDown={startResize("width")}
        role="separator"
        aria-label="Resize dialog width"
        aria-orientation="vertical"
        className="group absolute right-0 top-0 z-10 h-full w-2 cursor-ew-resize touch-none"
      >
        <div className="mx-auto h-full w-px bg-transparent transition-colors group-hover:bg-primary/40 group-active:bg-primary/70" />
      </div>
      <div
        onMouseDown={startResize("height")}
        role="separator"
        aria-label="Resize dialog height"
        aria-orientation="horizontal"
        className="group absolute bottom-0 left-0 z-10 h-2 w-full cursor-ns-resize touch-none"
      >
        <div className="my-auto h-px w-full bg-transparent transition-colors group-hover:bg-primary/40 group-active:bg-primary/70" />
      </div>

      <DialogFooter className="shrink-0 mx-0 mb-0 rounded-b-2xl p-8 sm:justify-between sm:p-10 sm:pt-7">
        {step > 1 ? (
          <Button variant="outline" onClick={goBack} disabled={uploading}>
            Back
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleSaveDraft} disabled={uploading}>
            Save as draft
          </Button>
          {step < 3 ? (
            <Button onClick={goNext} disabled={uploading}>
              Continue
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={uploading || !file}>
              {uploading ? "Publishing..." : "Publish"}
            </Button>
          )}
        </div>
      </DialogFooter>
      </div>
    </DialogContent>
  );
}
