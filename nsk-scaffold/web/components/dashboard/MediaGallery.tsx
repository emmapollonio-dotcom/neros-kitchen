"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Props {
  recipeId: string;
  initialImages: string[];
}

interface PendingUpload {
  localId: string;
  previewUrl: string;
  status: "uploading" | "error";
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

// Galleria foto dei piatti: drag&drop da desktop, scatto diretto da
// smartphone (capture="environment" apre la fotocamera posteriore invece
// della libreria file). Carica su Storage (bucket "recipe-photos", path
// {user_id}/{recipe_id}/...) direttamente dal browser — niente proxy dei
// byte immagine attraverso il server Next — poi registra l'URL su
// recipes.images via /api/v1/recipes/[id]/images.
export function MediaGallery({ recipeId, initialImages }: Props) {
  const [images, setImages] = useState(initialImages);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | File[]) {
    setError(null);
    const list = Array.from(files);

    for (const file of list) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`${file.name}: formato non supportato (usa JPEG, PNG, WEBP o HEIC).`);
        continue;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError(`${file.name}: file troppo grande (max 8MB).`);
        continue;
      }

      const localId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const previewUrl = URL.createObjectURL(file);
      setPending((prev) => [...prev, { localId, previewUrl, status: "uploading" }]);

      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Sessione scaduta, ricarica la pagina.");

        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${recipeId}/${localId}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("recipe-photos")
          .upload(path, file, { contentType: file.type });
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("recipe-photos").getPublicUrl(path);

        const res = await fetch(`/api/v1/recipes/${recipeId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: publicUrl }),
        });
        if (!res.ok) throw new Error("Salvataggio non riuscito.");

        setImages((prev) => [...prev, publicUrl]);
      } catch (err) {
        setPending((prev) =>
          prev.map((p) => (p.localId === localId ? { ...p, status: "error" } : p))
        );
        setError(err instanceof Error ? err.message : "Caricamento non riuscito.");
        continue;
      }

      setPending((prev) => prev.filter((p) => p.localId !== localId));
      URL.revokeObjectURL(previewUrl);
    }
  }

  async function removeImage(url: string) {
    setRemovingUrl(url);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const path = url.split("/recipe-photos/")[1];
      if (path) await supabase.storage.from("recipe-photos").remove([path]);

      const res = await fetch(`/api/v1/recipes/${recipeId}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Rimozione non riuscita.");

      setImages((prev) => prev.filter((u) => u !== url));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rimozione non riuscita.");
    } finally {
      setRemovingUrl(null);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-3 rounded-panel border-2 border-dashed p-8 text-center transition sm:flex-row sm:gap-6 ${
          isDraggingOver ? "border-gold bg-gold/5" : "border-line bg-white"
        }`}
      >
        <ImagePlus size={28} className="text-mist" />
        <div>
          <p className="font-body text-sm text-charcoal">
            Trascina qui le foto del piatto, oppure
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-pill border border-line px-4 py-2 font-body text-xs text-charcoal transition hover:border-gold"
            >
              Scegli dal dispositivo
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-pill bg-charcoal px-4 py-2 font-body text-xs text-ivory transition hover:bg-gold hover:text-charcoal"
            >
              <Camera size={14} />
              Scatta una foto
            </button>
          </div>
        </div>
      </div>

      {/* Input "scegli dal dispositivo": libreria foto o file system. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
      />
      {/* Input "scatta una foto": capture="environment" apre la fotocamera
          posteriore direttamente su smartphone invece della libreria. */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
      />

      {error && (
        <p className="mt-3 font-body text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {(images.length > 0 || pending.length > 0) && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-card border border-line bg-cream shadow-soft"
            >
              <Image src={url} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                disabled={removingUrl === url}
                aria-label="Rimuovi foto"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-pill bg-charcoal/70 text-ivory opacity-0 transition hover:bg-red-600 disabled:opacity-100 group-hover:opacity-100"
              >
                {removingUrl === url ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
              </button>
            </div>
          ))}

          {pending.map((p) => (
            <div
              key={p.localId}
              className="relative aspect-square overflow-hidden rounded-card border border-line bg-cream shadow-soft"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- anteprima locale da blob URL, non un asset ottimizzabile da next/image */}
              <img src={p.previewUrl} alt="" className="h-full w-full object-cover opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center bg-charcoal/30">
                {p.status === "uploading" ? (
                  <Loader2 size={20} className="animate-spin text-ivory" />
                ) : (
                  <Trash2 size={18} className="text-ivory" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && pending.length === 0 && (
        <p className="mt-4 font-body text-xs text-mist">Nessuna foto ancora — max 8MB per file.</p>
      )}
    </div>
  );
}
