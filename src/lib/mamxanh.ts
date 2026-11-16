import type {
  MemoryCategory,
  MemoryPhoto,
  Product,
  SproutVariantId,
  Teacher,
  WishMessage,
} from '../types/mamxanh';

export const SPROUT_VARIANTS: {
  id: SproutVariantId;
  label: string;
  accessoryLabel: string;
}[] = [
  { id: 'flower_sunny', label: 'Mầm Hoa Nắng', accessoryLabel: 'Hoa vàng cài tóc' },
  { id: 'book_buddy', label: 'Mầm Đọc Sách', accessoryLabel: 'Quyển sách nhỏ' },
  { id: 'artist_brush', label: 'Mầm Họa Sĩ', accessoryLabel: 'Cọ vẽ sắc màu' },
  { id: 'music_note', label: 'Mầm Âm Nhạc', accessoryLabel: 'Nốt nhạc vui' },
  { id: 'sport_ball', label: 'Mầm Năng Động', accessoryLabel: 'Quả bóng tròn' },
  { id: 'star_origami', label: 'Mầm Ngôi Sao', accessoryLabel: 'Ngôi sao giấy' },
  { id: 'watering_can', label: 'Mầm Chăm Chỉ', accessoryLabel: 'Bình tưới cây' },
  { id: 'peach_ribbon', label: 'Mầm Nơ Đào', accessoryLabel: 'Chiếc nơ hồng đào' },
  { id: 'backpack_explorer', label: 'Mầm Ba Lô Vàng', accessoryLabel: 'Cặp sách vàng cam' },
  { id: 'dew_leaf', label: 'Mầm Giọt Sương', accessoryLabel: 'Giọt sương ban mai' },
];

export const MEMORY_CATEGORIES: MemoryCategory[] = [
  'Khoảnh khắc bên thầy cô',
  'Những giờ học',
  'Hoạt động tập thể',
  'Sân trường và lớp học',
  'Những kỷ niệm đáng nhớ',
];

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB

export const ALLOWED_UPLOAD_MIME_PREFIXES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'video/mp4',
  'video/webm',
];

export interface WishInput {
  teacherName: string;
  studentName: string;
  teacherId?: string | null;
  studentId?: string | null;
  content: string;
  cardImageUrl?: string | null;
  audioUrl?: string | null;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const BANNED_SPAM_PATTERNS = [/https?:\/\//i, /<script/i, /javascript:/i];

export function sanitizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function validateWishSubmission(input: WishInput): ValidationResult {
  const cleanTeacher = input.teacherName ? input.teacherName.trim() : '';
  const cleanStudent = input.studentName ? input.studentName.trim() : '';

  if (cleanTeacher.length < 2) {
    return { valid: false, error: 'Vui lòng nhập tên thầy cô nhận lời chúc.' };
  }
  if (cleanTeacher.length > 100) {
    return { valid: false, error: 'Tên thầy cô không được dài quá 100 ký tự.' };
  }
  if (cleanStudent.length < 2) {
    return { valid: false, error: 'Vui lòng nhập tên của em để gửi lời chúc.' };
  }
  if (cleanStudent.length > 100) {
    return { valid: false, error: 'Tên người gửi không được dài quá 100 ký tự.' };
  }

  const cleanContent = input.content ? input.content.trim() : '';
  if (cleanContent.length < 5) {
    return {
      valid: false,
      error: 'Lời chúc cần có ít nhất 5 ký tự để gửi gắm tình cảm đến thầy cô.',
    };
  }
  if (cleanContent.length > 600) {
    return {
      valid: false,
      error: 'Lời chúc không được dài quá 600 ký tự.',
    };
  }
  for (const pattern of BANNED_SPAM_PATTERNS) {
    if (
      pattern.test(cleanContent) ||
      pattern.test(cleanTeacher) ||
      pattern.test(cleanStudent)
    ) {
      return {
        valid: false,
        error: 'Nội dung lời chúc không được chứa đường dẫn hoặc mã không hợp lệ.',
      };
    }
  }
  return { valid: true };
}

export function validateUploadFile(mimeType: string, byteSize: number): ValidationResult {
  if (!mimeType) {
    return { valid: false, error: 'Không xác định được định dạng tệp.' };
  }
  const normalized = mimeType.toLowerCase().split(';')[0].trim();
  if (!ALLOWED_UPLOAD_MIME_PREFIXES.includes(normalized)) {
    return {
      valid: false,
      error: 'Định dạng tệp chưa được hỗ trợ. Vui lòng chọn ảnh, âm thanh hoặc video hợp lệ.',
    };
  }
  if (byteSize <= 0 || byteSize > MAX_UPLOAD_BYTES) {
    return {
      valid: false,
      error: 'Dung lượng tệp vượt quá giới hạn 8MB.',
    };
  }
  return { valid: true };
}

export function getApprovedWishes(messages: WishMessage[]): WishMessage[] {
  return messages
    .filter((m) => m.status === 'approved')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getWishesByTeacher(
  messages: WishMessage[],
  teacherId: string | 'all',
  onlyApproved = false
): WishMessage[] {
  return messages
    .filter((m) => (onlyApproved ? m.status === 'approved' : true))
    .filter((m) => (teacherId === 'all' ? true : m.teacherId === teacherId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getStudentProducts(products: Product[], studentId: string): Product[] {
  return products.filter((p) => p.studentId === studentId);
}

export function getMemoriesByCategory(
  memories: MemoryPhoto[],
  category: MemoryCategory | 'Tất cả'
): MemoryPhoto[] {
  const ordered = [...memories].sort((a, b) => a.orderIndex - b.orderIndex);
  if (category === 'Tất cả') return ordered;
  return ordered.filter((m) => m.category === category);
}

export interface TreeLeafNode {
  message: WishMessage;
  teacherIndex: number;
  xPercent: number;
  yPercent: number;
  rotationDeg: number;
  color: string;
}

const HEART_PALETTE = [
  '#FB7185',
  '#F472B6',
  '#FDA4AF',
  '#F9A8D4',
  '#FB923C',
  '#F43F5E',
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Computes deterministic, non-overlapping canopy leaf coordinates on the
 * "Cây yêu thương" SVG tree grouped subtly around teacher branches.
 */
export function computeTreeLeaves(
  approvedMessages: WishMessage[],
  teachers: Teacher[]
): TreeLeafNode[] {
  const teacherIdxMap = new Map<string, number>();
  teachers.forEach((t, idx) => teacherIdxMap.set(t.id, idx));

  // Branch anchor centers across the lush 3D Cây Tri Ân canopy (strictly above the wooden sign)
  const branchAnchors = [
    { cx: 50, cy: 17 },
    { cx: 29, cy: 25 },
    { cx: 71, cy: 25 },
    { cx: 19, cy: 38 },
    { cx: 40, cy: 31 },
    { cx: 60, cy: 31 },
    { cx: 81, cy: 38 },
    { cx: 28, cy: 44 },
    { cx: 72, cy: 44 },
  ];

  const countPerBranch = new Map<number, number>();

  return approvedMessages.map((msg, i) => {
    const mappedIdx = msg.teacherId ? teacherIdxMap.get(msg.teacherId) : undefined;
    const tIdx =
      mappedIdx ?? hashString(msg.teacherName.toLowerCase()) % branchAnchors.length;
    const anchor = branchAnchors[tIdx % branchAnchors.length];
    const localSlot = countPerBranch.get(tIdx) ?? 0;
    countPerBranch.set(tIdx, localSlot + 1);

    // Golden-angle spiral offset around the teacher branch center
    const angle = localSlot * 2.39996 + tIdx * 0.7;
    const radius = Math.min(10, 2.8 + Math.sqrt(localSlot) * 3.1);
    const xPercent = Math.max(14, Math.min(86, anchor.cx + Math.cos(angle) * radius * 1.15));
    const yPercent = Math.max(11, Math.min(49, anchor.cy + Math.sin(angle) * radius * 0.75));
    const rotationDeg = ((i * 37) % 50) - 25;

    return {
      message: msg,
      teacherIndex: tIdx,
      xPercent: Number(xPercent.toFixed(2)),
      yPercent: Number(yPercent.toFixed(2)),
      rotationDeg,
      color: HEART_PALETTE[(tIdx + localSlot) % HEART_PALETTE.length],
    };
  });
}

export const TEACHER_AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
];

export const TEACHER_AUDIO_EXTENSIONS = ['mp3', 'm4a', 'wav'];

export function validateTeacherAudioUpload(
  mimeType: string,
  filename: string,
  byteSize: number
): ValidationResult {
  const normalized = (mimeType || '').toLowerCase().split(';')[0].trim();
  const ext = (filename || '').split('.').pop()?.toLowerCase() || '';
  const mimeOk = normalized ? TEACHER_AUDIO_MIME_TYPES.includes(normalized) : false;
  const extOk = TEACHER_AUDIO_EXTENSIONS.includes(ext);

  if (!mimeOk && !extOk) {
    return {
      valid: false,
      error: 'Âm thanh phong thư chỉ hỗ trợ định dạng MP3, M4A hoặc WAV.',
    };
  }
  if (normalized && !normalized.startsWith('audio/')) {
    return {
      valid: false,
      error: 'Tệp tải lên phải là tệp âm thanh MP3, M4A hoặc WAV.',
    };
  }
  if (byteSize <= 0 || byteSize > MAX_UPLOAD_BYTES) {
    return {
      valid: false,
      error: 'Dung lượng tệp âm thanh vượt quá giới hạn 8MB.',
    };
  }
  return { valid: true };
}

export function isProductVideo(url: string, type: Product['type']): boolean {
  const path = url.split(/[?#]/, 1)[0];
  if (/\.(mp4|webm|mov|m4v|ogv)$/i.test(path)) return true;
  if (/\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|webp)$/i.test(path)) return false;
  return type === 'video';
}

export function getProductTypeLabel(type: Product['type']): string {
  switch (type) {
    case 'thiep':
      return 'Thiệp tri ân';
    case 'tranh':
      return 'Tranh vẽ';
    case 'loi_chuc':
      return 'Lời chúc';
    case 'video':
      return 'Video ngắn';
    case 'anh_san_pham':
      return 'Ảnh sản phẩm';
    case 'bai_viet':
      return 'Bài viết';
  }
}

export const STUDENT_AVATAR_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export function validateStudentAvatarUpload(mimeType: string, byteSize: number): ValidationResult {
  if (!mimeType) {
    return { valid: false, error: 'Vui lòng chọn ảnh định dạng PNG, JPG hoặc JPEG.' };
  }
  const normalized = mimeType.toLowerCase().split(';')[0].trim();
  if (!STUDENT_AVATAR_MIME_TYPES.includes(normalized)) {
    return {
      valid: false,
      error: 'Ảnh đại diện học sinh chỉ hỗ trợ định dạng PNG, JPG hoặc JPEG.',
    };
  }
  if (byteSize <= 0 || byteSize > MAX_UPLOAD_BYTES) {
    return {
      valid: false,
      error: 'Dung lượng ảnh đại diện vượt quá giới hạn 8MB.',
    };
  }
  return { valid: true };
}

export function getFallingPetalCount(isMobile: boolean): number {
  return isMobile ? 10 : 24;
}

export const QUIZ_BADGE_TITLE = 'BÉ YÊU THẦY CÔ – NHÀ THÔNG THÁI NHÍ';

export const QUIZ_QUESTIONS: import('../types/mamxanh').QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Ngày 20/11 là ngày gì?',
    options: {
      A: 'Ngày Quốc tế Thiếu nhi.',
      B: 'Ngày Nhà giáo Việt Nam.',
      C: 'Ngày Quốc tế Phụ nữ.',
    },
    correctOption: 'B',
    praiseFeedback: 'Tuyệt vời quá! Ngày 20/11 chính là Ngày Nhà giáo Việt Nam để tri ân thầy cô.',
    encourageFeedback:
      'Gần đúng rồi! Đáp án đúng là B – Ngày Nhà giáo Việt Nam nhé bé ơi!',
  },
  {
    id: 'q2',
    question: 'Ngày 20/11, chúng mình thường gửi lời chúc đến ai?',
    options: {
      A: 'Thầy cô giáo.',
      B: 'Các bác tài xế.',
      C: 'Các chú bộ đội.',
    },
    correctOption: 'A',
    praiseFeedback: 'Hoan hô! Chúng mình gửi những lời chúc yêu thương nhất đến thầy cô giáo.',
    encourageFeedback:
      'Cố lên nhé! Đáp án đúng là A – Thầy cô giáo, những người gieo mầm tri thức cho chúng mình.',
  },
  {
    id: 'q3',
    question: 'Món quà nào phù hợp để tặng thầy cô?',
    options: {
      A: 'Một chiếc lá rụng.',
      B: 'Một món đồ chơi bất kỳ.',
      C: 'Một tấm thiệp do em làm.',
    },
    correctOption: 'C',
    praiseFeedback: 'Đúng rồi! Tấm thiệp tự tay em làm chứa đựng biết bao tình cảm dành cho thầy cô.',
    encourageFeedback:
      'Chưa chính xác rồi! Đáp án đúng là C – Một tấm thiệp do em làm sẽ làm thầy cô rất cảm động đấy!',
  },
  {
    id: 'q4',
    question: 'Việc làm nào thể hiện lòng biết ơn thầy cô?',
    options: {
      A: 'Chăm ngoan, học tốt.',
      B: 'Nói chuyện trong giờ học.',
      C: 'Không làm bài tập.',
    },
    correctOption: 'A',
    praiseFeedback: 'Quá giỏi! Chăm ngoan, học tốt mỗi ngày là món quà quý giá nhất tặng thầy cô.',
    encourageFeedback:
      'Nhớ nhé bé ơi! Đáp án đúng là A – Chăm ngoan, học tốt là cách thể hiện lòng biết ơn thầy cô.',
  },
  {
    id: 'q5',
    question: 'Khi gặp thầy cô, em nên làm gì?',
    options: {
      A: 'Quay đi chỗ khác.',
      B: 'Lễ phép chào thầy cô.',
      C: 'Chạy thật nhanh.',
    },
    correctOption: 'B',
    praiseFeedback: 'Xuất sắc! Học sinh lớp 1/8 luôn khoanh tay lễ phép chào thầy cô mỗi khi gặp mặt.',
    encourageFeedback:
      'Đừng ngại nhé! Đáp án đúng là B – Lễ phép chào thầy cô là nét đẹp của học trò ngoan.',
  },
];

export function evaluateQuizAnswer(
  question: import('../types/mamxanh').QuizQuestion,
  chosen: import('../types/mamxanh').QuizOptionKey
): { isCorrect: boolean; feedback: string } {
  const isCorrect = question.correctOption === chosen;
  return {
    isCorrect,
    feedback: isCorrect ? question.praiseFeedback : question.encourageFeedback,
  };
}

export function computeQuizResult(
  answers: Partial<Record<string, import('../types/mamxanh').QuizOptionKey>>,
  questions: import('../types/mamxanh').QuizQuestion[] = QUIZ_QUESTIONS
): {
  correctCount: number;
  totalQuestions: number;
  badgeTitle: string;
  earnedBadge: boolean;
} {
  let correctCount = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correctOption) {
      correctCount += 1;
    }
  }
  return {
    correctCount,
    totalQuestions: questions.length,
    badgeTitle: QUIZ_BADGE_TITLE,
    earnedBadge: questions.length > 0 && correctCount >= Math.ceil(questions.length * 0.6),
  };
}
