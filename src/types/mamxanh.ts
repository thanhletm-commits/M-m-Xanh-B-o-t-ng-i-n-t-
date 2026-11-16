export type StageId =
  | 'home'
  | 'stage1'
  | 'stage2'
  | 'stage3'
  | 'stage4'
  | 'stage5'
  | 'stage6';

export type SproutVariantId =
  | 'flower_sunny'
  | 'book_buddy'
  | 'artist_brush'
  | 'music_note'
  | 'sport_ball'
  | 'star_origami'
  | 'watering_can'
  | 'peach_ribbon'
  | 'backpack_explorer'
  | 'dew_leaf';

export type ProductType =
  | 'thiep'
  | 'tranh'
  | 'loi_chuc'
  | 'video'
  | 'anh_san_pham'
  | 'bai_viet';

export interface Student {
  id: string;
  orderNumber: number;
  name: string;
  nickname?: string;
  avatarUrl: string | null;
  sproutVariant: SproutVariantId;
  shortIntro: string;
  isDemo: boolean;
}

export interface Product {
  id: string;
  studentId: string;
  type: ProductType;
  title: string;
  description: string;
  mediaUrl: string | null;
  isDemo: boolean;
  createdAt: string;
}

export interface Teacher {
  id: string;
  orderNumber: number;
  name: string;
  role: string;
  subjectKey:
    | 'homeroom'
    | 'reading'
    | 'ethics'
    | 'english'
    | 'science'
    | 'math'
    | 'music'
    | 'art'
    | 'pe';
  avatarUrl: string | null;
  audioUrl?: string | null;
  letterTitle: string;
  letterContent: string;
  accentColor: string;
}

export type WishStatus = 'pending' | 'approved' | 'hidden';

export interface WishMessage {
  id: string;
  teacherId?: string | null;
  studentId?: string | null;
  studentName: string;
  teacherName: string;
  content: string;
  cardImageUrl: string | null;
  audioUrl: string | null;
  status: WishStatus;
  isDemo: boolean;
  createdAt: string;
}

export type MemoryCategory =
  | 'Khoảnh khắc bên thầy cô'
  | 'Những giờ học'
  | 'Hoạt động tập thể'
  | 'Sân trường và lớp học'
  | 'Những kỷ niệm đáng nhớ';

export interface MemoryPhoto {
  id: string;
  category: MemoryCategory;
  caption: string;
  imageUrl: string | null;
  orderIndex: number;
  isDemo: boolean;
}

export interface MascotDialogues {
  home: string;
  stage1: string;
  stage2: string;
  stage3: string;
  stage4: string;
  stage5: string;
  stage6: string;
}

export interface SiteSettings {
  introTitle: string;
  introContent: string;
  introSignature: string;
  outroQuote: string;
  outroClosing: string;
  musicTitle: string;
  musicUrl: string | null;
  coverImageUrl?: string | null;
  fallingPetalsEnabled?: boolean;
  dialogues: MascotDialogues;
}

export type QuizOptionKey = 'A' | 'B' | 'C';

export interface QuizQuestion {
  id: string;
  question: string;
  options: Record<QuizOptionKey, string>;
  correctOption: QuizOptionKey;
  praiseFeedback: string;
  encourageFeedback: string;
}

export interface DatabaseState {
  students: Student[];
  products: Product[];
  teachers: Teacher[];
  messages: WishMessage[];
  memories: MemoryPhoto[];
  settings: SiteSettings;
}

export interface PublicDataPayload {
  isPreview?: boolean;
  students: Student[];
  products: Product[];
  teachers: Teacher[];
  approvedMessages: WishMessage[];
  memories: MemoryPhoto[];
  settings: SiteSettings;
}
