"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

type CoverPickerProps = {
  value: string;
  onChange: (url: string) => void;
};

export function CoverPicker({ value, onChange }: CoverPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Arquivo precisa ser uma imagem.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Imagem muito grande (máx 8 MB).");
      return;
    }

    setUploading(true);
    setError("");

    const supabase = getBrowserSupabase();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `human/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("article-covers")
      .upload(path, file, { contentType: file.type, upsert: false, cacheControl: "604800" });

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("article-covers").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="composer-cover">
      <label className="composer-label">Capa</label>
      {value ? (
        <div className="composer-cover-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview da capa" />
          <button type="button" onClick={() => onChange("")} className="composer-cover-remove">Remover</button>
        </div>
      ) : (
        <div className="composer-cover-empty">Sem capa. Suba uma imagem ou cole uma URL.</div>
      )}
      <div className="composer-cover-controls">
        <label className="composer-cover-upload">
          {uploading ? "Enviando..." : "Subir imagem"}
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
        </label>
        <input
          type="url"
          placeholder="ou cole uma URL https://..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="composer-cover-url"
        />
      </div>
      {error ? <span className="composer-error">{error}</span> : null}
    </div>
  );
}
