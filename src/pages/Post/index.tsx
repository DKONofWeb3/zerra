// src/pages/Post/index.tsx  (or render as a modal from wherever makes sense)
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Image, Video, Instagram, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePageTitle } from "@/hooks/usePageTitle";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { apiPost } from "@/lib/api/client";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";

type Step = "upload" | "caption" | "posting" | "done" | "error";
type MediaType = "IMAGE" | "VIDEO" | "REELS";

interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

function FileDrop({
  onFile, accept, maxSizeMB,
}: {
  onFile: (file: File) => void;
  accept: string;
  maxSizeMB: number;
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max ${maxSizeMB}MB.`);
      return;
    }
    onFile(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all p-12",
          dragging
            ? "border-brand bg-brand/5 scale-[1.01]"
            : "border-white/[0.12] hover:border-white/[0.25] hover:bg-white/[0.02]"
        )}
      >
        <div className="w-14 h-14 rounded-2xl bg-bg-elevated border border-white/[0.08] flex items-center justify-center">
          <Upload className="w-6 h-6 text-fg-tertiary" />
        </div>
        <div className="text-center">
          <p className="text-[15px] font-medium text-fg-primary">Drop your file here</p>
          <p className="text-[13px] text-fg-tertiary mt-1">or click to browse</p>
          <p className="text-[12px] text-fg-muted mt-2">
            Images: JPG, PNG, WEBP up to 8MB · Videos: MP4, MOV up to 100MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {error && <p className="mt-2 text-[12.5px] text-danger">{error}</p>}
    </div>
  );
}

function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isVideo = file.type.startsWith("video/");
  const url = URL.createObjectURL(file);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-bg-elevated">
      {isVideo ? (
        <video src={url} className="w-full max-h-[300px] object-contain" controls />
      ) : (
        <img src={url} alt="Preview" className="w-full max-h-[300px] object-contain" />
      )}
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 text-[11px] text-white">
        {isVideo ? <Video className="w-3 h-3" /> : <Image className="w-3 h-3" />}
        {isVideo ? "Video" : "Image"} · {(file.size / 1024 / 1024).toFixed(1)}MB
      </div>
    </div>
  );
}

export default function PostContentPage() {
  usePageTitle("Zerra · Post Content");
  const navigate = useNavigate();
  const { accounts } = useSocialAccounts();

  const igAccount = accounts.find((a) => a.platform === "instagram");

  const [step,        setStep]        = useState<Step>("upload");
  const [file,        setFile]        = useState<File | null>(null);
  const [caption,     setCaption]     = useState("");
  const [uploading,   setUploading]   = useState(false);
  const [uploadPct,   setUploadPct]   = useState(0);
  const [errorMsg,    setErrorMsg]    = useState<string | null>(null);

  const isVideo    = file?.type.startsWith("video/") ?? false;
  const mediaType: MediaType = isVideo ? "REELS" : "IMAGE";
  const charLimit  = 2200;

  const handleFileSelected = (f: File) => {
    setFile(f);
    setStep("caption");
  };

  const handleUploadAndPost = async () => {
    if (!file || !igAccount) return;
    setUploading(true);
    setUploadPct(0);
    setErrorMsg(null);

    try {
      // Step 1 — get presigned URL from backend
      const { uploadUrl, publicUrl: pub, key } = await apiPost<PresignResponse>("/upload/presign", {
        filename:    file.name,
        contentType: file.type,
        fileSize:    file.size,
      });

      // Step 2 — upload directly to R2 using XHR for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadPct(Math.round((e.loaded / e.total) * 80));
        };
        xhr.onload = () => xhr.status === 200 ? resolve() : reject(new Error("Upload failed"));
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      setUploadPct(85);
      setStep("posting");

      // Step 3 — tell backend to publish to Instagram
      await apiPost("/auth/instagram/publish", {
        ...(isVideo ? { video_url: pub } : { image_url: pub }),
        caption,
        media_type: mediaType,
        r2Key: key,
      });

      setUploadPct(100);
      setStep("done");
    } catch (err: any) {
      setErrorMsg(err.message ?? "Something went wrong. Please try again.");
      setStep("error");
    } finally {
      setUploading(false);
    }
  };

  // ── No Instagram connected ──────────────────────────────────────────────
  if (!igAccount) {
    return (
      <div className="pb-12 space-y-6">
        <div className="pt-2">
          <div className="flex items-center gap-2.5 text-fg-tertiary">
            <DiamondIcon size={14} />
            <span className="text-[12.5px]">Share your content</span>
          </div>
          <h2 className={cn(
            "mt-4 font-display font-medium tracking-[-0.03em] leading-[0.95]",
            "text-[36px] md:text-[52px]",
            "bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-[#7d8aa8]"
          )}>
            Post Content
          </h2>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-10 text-center"
          style={{ background: "rgb(var(--bg-card))" }}>
          <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
          <div className="w-14 h-14 rounded-2xl bg-bg-elevated border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <Instagram className="w-6 h-6 text-fg-muted" />
          </div>
          <p className="text-[15px] font-medium text-fg-primary mb-1">Instagram not connected</p>
          <p className="text-[13px] text-fg-tertiary mb-5 max-w-sm mx-auto">
            Connect your Instagram account in Settings to start posting directly from Zerra.
          </p>
          <a href="/settings?tab=connected"
            className="inline-flex px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
            style={{ background: "rgb(74 125 255)" }}>
            Connect Instagram
          </a>
        </div>
      </div>
    );
  }

  // ── Done ────────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="pb-12 flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[rgb(var(--success)/0.1)] border border-[rgb(var(--success)/0.2)] flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <div>
          <p className="text-[22px] font-display font-medium text-fg-primary">Posted successfully!</p>
          <p className="text-[13px] text-fg-tertiary mt-1">
            Your content has been published to @{igAccount.username}.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setStep("upload"); setFile(null); setCaption(""); }}
            className="px-5 py-2.5 rounded-xl text-[13px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors">
            Post another
          </button>
          <button onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
            style={{ background: "rgb(74 125 255)" }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12 space-y-6 max-w-2xl">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">Posting as @{igAccount.username}</span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em] leading-[0.95]",
          "text-[36px] md:text-[52px]",
          "bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          Post Content
        </h2>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {[
          { key: "upload",  label: "Upload" },
          { key: "caption", label: "Caption" },
          { key: "posting", label: "Publishing" },
        ].map((s, i) => {
          const steps = ["upload", "caption", "posting"];
          const current = steps.indexOf(step);
          const idx     = steps.indexOf(s.key);
          const done    = current > idx;
          const active  = current === idx;
          return (
            <div key={s.key} className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors",
                done   ? "bg-success text-white" :
                active ? "bg-brand text-white" :
                         "bg-bg-elevated border border-white/[0.08] text-fg-muted"
              )}>
                {done ? "✓" : i + 1}
              </div>
              <span className={cn("text-[12.5px]", active ? "text-fg-primary font-medium" : "text-fg-tertiary")}>
                {s.label}
              </span>
              {i < 2 && <div className="w-8 h-px bg-white/[0.08]" />}
            </div>
          );
        })}
      </div>

      {/* Upload step */}
      {step === "upload" && (
        <FileDrop
          onFile={handleFileSelected}
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
          maxSizeMB={100}
        />
      )}

      {/* Caption step */}
      {(step === "caption" || step === "posting" || step === "error") && file && (
        <div className="space-y-4">
          <FilePreview file={file} onRemove={() => { setFile(null); setStep("upload"); }} />

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5"
            style={{ background: "rgb(var(--bg-card))" }}>
            <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
            <div className="relative">
              <label className="block text-[12.5px] text-fg-tertiary mb-2">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, charLimit))}
                placeholder="Write a caption for your post..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-white/[0.06] bg-bg-base/60 text-[14px] text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-white/[0.15] transition-colors resize-none"
              />
              <div className="flex justify-between mt-1.5">
                <p className="text-[11.5px] text-fg-muted">
                  {isVideo ? "Will post as a Reel" : "Will post as a photo"}
                </p>
                <p className={cn("text-[11.5px]", caption.length > charLimit * 0.9 ? "text-warning" : "text-fg-muted")}>
                  {caption.length}/{charLimit}
                </p>
              </div>
            </div>
          </div>

          {/* Upload progress */}
          {(step === "posting") && (
            <div className="rounded-2xl border border-white/[0.06] p-4"
              style={{ background: "rgb(var(--bg-card))" }}>
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="w-4 h-4 text-brand animate-spin shrink-0" />
                <p className="text-[13px] text-fg-primary">
                  {uploadPct < 80 ? "Uploading..." : uploadPct < 100 ? "Publishing to Instagram..." : "Done!"}
                </p>
                <span className="ml-auto text-[12px] text-fg-tertiary tabular-nums">{uploadPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${uploadPct}%` }} />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl p-4 bg-[rgb(var(--danger)/0.08)] border border-[rgb(var(--danger)/0.2)]">
              <p className="text-[13px] text-danger">{errorMsg}</p>
              <button onClick={() => setStep("caption")} className="mt-2 text-[12px] text-danger underline">
                Try again
              </button>
            </div>
          )}

          {step !== "posting" && (
            <div className="flex gap-3">
              <button
                onClick={() => { setFile(null); setStep("upload"); }}
                className="px-5 py-2.5 rounded-xl text-[13px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleUploadAndPost}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13.5px] font-semibold text-white disabled:opacity-50 transition-opacity"
                style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}
              >
                <Instagram className="w-4 h-4" />
                Post Content
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}