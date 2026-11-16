import { useEffect, useState } from 'react';
import { CheckCircle2, Heart, ImagePlus, Send, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { validateWishSubmission } from '../lib/mamxanh';
import { submitWish, uploadMediaFile } from '../services/api';

interface WishFormFieldsProps {
  idPrefix: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

/**
 * Shared student-to-teacher supplemental wish submission form.
 * Strictly uses free-text inputs for studentName and teacherName
 * and allows optional card image attachment only (no audio recording or playback).
 */
export function WishFormFields({
  idPrefix,
  onClose,
  showCloseButton = false,
}: WishFormFieldsProps) {
  const [studentName, setStudentName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [content, setContent] = useState('');
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleCardImageUpload = async (file: File | undefined) => {
    if (!file) return;
    setFormError(null);
    setUploadingImage(true);
    try {
      const url = await uploadMediaFile(file, file.name, file.type, 'wishes');
      setCardImageUrl(url);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Không thể tải ảnh thiệp.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitSuccess(null);

    const check = validateWishSubmission({
      teacherName,
      studentName,
      content,
      cardImageUrl,
    });
    if (!check.valid) {
      setFormError(check.error || 'Vui lòng kiểm tra lại lời chúc.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitWish({
        teacherName,
        studentName,
        content,
        cardImageUrl,
      });
      setSubmitSuccess(res.message);
      setStudentName('');
      setTeacherName('');
      setContent('');
      setCardImageUrl(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Không thể gửi lời chúc.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmitWish} className="p-5 sm:p-7 space-y-4">
      {submitSuccess && (
        <div
          role="status"
          className="rounded-2xl bg-[#ECFDF5] border border-[#86EFAC] p-4 flex items-start gap-3 text-[#14532D]"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#16A34A]" />
          <div className="text-sm font-semibold space-y-1">
            <p>{submitSuccess}</p>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#B45309]">
              Trạng thái: CHỜ DUYỆT
            </p>
          </div>
        </div>
      )}

      {formError && (
        <div
          role="alert"
          className="rounded-2xl bg-[#FEF2F2] border border-[#FECACA] p-3.5 text-sm font-semibold text-[#991B1B]"
        >
          {formError}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={`${idPrefix}-student-name`}
            className="block text-xs font-bold uppercase tracking-wider text-[#3F5C3F] mb-1.5"
          >
            Tên học sinh
          </label>
          <input
            id={`${idPrefix}-student-name`}
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            maxLength={100}
            required
            autoComplete="off"
            placeholder="Em hãy nhập họ và tên của mình..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBE4C7] text-sm font-semibold text-[#233F24] focus:outline-none focus:ring-2 focus:ring-[#65B741]"
          />
        </div>

        <div>
          <label
            htmlFor={`${idPrefix}-teacher-name`}
            className="block text-xs font-bold uppercase tracking-wider text-[#3F5C3F] mb-1.5"
          >
            Tên thầy/cô muốn gửi lời tri ân
          </label>
          <input
            id={`${idPrefix}-teacher-name`}
            type="text"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            maxLength={100}
            required
            autoComplete="off"
            placeholder="Nhập tên thầy hoặc cô em yêu mến..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBE4C7] text-sm font-semibold text-[#233F24] focus:outline-none focus:ring-2 focus:ring-[#65B741]"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor={`${idPrefix}-content`}
            className="text-xs font-bold uppercase tracking-wider text-[#3F5C3F]"
          >
            Nội dung lời tri ân
          </label>
          <span className="text-xs text-[#6B826B] tabular-nums">{content.length}/600</span>
        </div>
        <textarea
          id={`${idPrefix}-content`}
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Em hãy viết những lời yêu thương muốn gửi đến thầy cô nhé!"
          className="w-full px-3.5 py-3 rounded-xl bg-white border border-[#CBE4C7] text-sm text-[#233F24] focus:outline-none focus:ring-2 focus:ring-[#65B741]"
        />
      </div>

      <div className="rounded-2xl bg-white border border-[#DCEFD6] p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-[#385738]">Ảnh thiệp đính kèm (tùy chọn)</p>
          <p className="text-[11px] text-[#5F775F] mt-0.5">
            Hỗ trợ ảnh PNG, JPG, WEBP tối đa 8MB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#EEF9EA] text-[#286323] text-xs font-bold cursor-pointer hover:bg-[#E1F4DA]">
            <ImagePlus className="w-4 h-4" />
            <span>{uploadingImage ? 'Đang tải...' : 'Chọn ảnh thiệp'}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => void handleCardImageUpload(e.target.files?.[0])}
            />
          </label>

          {cardImageUrl && (
            <div className="flex items-center gap-2 text-xs text-[#2E7D32] font-semibold">
              <span>Đã đính kèm</span>
              <button
                type="button"
                onClick={() => setCardImageUrl(null)}
                className="text-red-600 hover:underline cursor-pointer"
              >
                Xóa
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-white border border-[#CFE6CB] text-[#2F5D2A] font-bold text-sm hover:bg-[#F2FAF0] cursor-pointer"
          >
            ĐÓNG
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || uploadingImage}
          className="garden-btn-sunny inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-[#4A2C00] font-display font-extrabold text-sm sm:text-base cursor-pointer disabled:opacity-60 w-full sm:w-auto"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          <span>{submitting ? 'Đang gửi...' : 'GỬI LỜI TRI ÂN'}</span>
        </button>
      </div>
    </form>
  );
}

interface WishModalProps {
  open: boolean;
  onClose: () => void;
}

export function WishModal({ open, onClose }: WishModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#193319]/50 backdrop-blur-xs overflow-y-auto"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="global-wish-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-[30px] bg-[#FFFDF8] border-2 border-[#D2ECCB] shadow-2xl overflow-hidden my-auto"
          >
            <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 bg-gradient-to-r from-[#E5F7E1] via-[#FEF3C7]/75 to-[#FCE7F3]/60 border-b border-[#DCEFD6]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#FB7185] to-[#E11D48] text-white flex items-center justify-center shadow-sm shrink-0">
                  <Heart className="w-5 h-5 fill-current" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2
                    id="global-wish-modal-title"
                    className="font-display font-black text-lg sm:text-xl text-[#1F581B] truncate"
                  >
                    GỬI LỜI TRI ÂN ĐẾN THẦY CÔ
                  </h2>
                  <p className="text-xs text-[#4A654B]">
                    Lời chúc sẽ được giáo viên duyệt trước khi nở trái tim trên Cây tri ân
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng biểu mẫu gửi lời chúc"
                className="p-2 rounded-xl bg-white border border-[#CFE6CB] text-[#2F5D2A] hover:bg-[#F2FAF0] cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <WishFormFields idPrefix="modal-wish" onClose={onClose} showCloseButton />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
