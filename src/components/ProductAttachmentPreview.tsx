import { useState } from 'react';
import { X } from 'lucide-react';

interface ProductAttachmentPreviewProps {
  url: string;
  name: string;
  isVideo: boolean;
  disabled: boolean;
  onRemove: () => void;
}

export function ProductAttachmentPreview({
  url, name, isVideo, disabled, onRemove,
}: ProductAttachmentPreviewProps) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className="w-full max-w-xs overflow-hidden rounded-xl border border-[#DCEAD8] bg-[#FAFDF8]">
      {failed ? (
        <p role="status" className="p-4 text-sm text-[#765422]">Không thể tải bản xem trước.</p>
      ) : isVideo ? (
        <video
          src={url}
          aria-label={name}
          controls
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
          className="max-h-40 w-full bg-black object-contain"
        />
      ) : (
        <img
          src={url}
          alt={name}
          onError={() => setFailed(true)}
          className="max-h-40 w-full object-contain"
        />
      )}
      <figcaption className="flex items-center justify-between gap-2 px-2.5 py-1.5">
        <span className="min-w-0 truncate text-xs font-semibold text-[#355835]" title={name}>{name}</span>
        <button
          type="button"
          aria-label={"Gỡ tệp đính kèm: " + name}
          title="Gỡ tệp đính kèm"
          disabled={disabled}
          onClick={onRemove}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[#AE3232] hover:bg-red-100 disabled:opacity-50"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </figcaption>
    </figure>
  );
}
