import { INITIAL_SEED_DATA } from '../data/seedData';
import type {
  DatabaseState,
  MemoryCategory,
  MemoryPhoto,
  Product,
  ProductType,
  PublicDataPayload,
  SiteSettings,
  SproutVariantId,
  Student,
  Teacher,
  WishMessage,
  WishStatus,
} from '../types/mamxanh';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  SUPABASE_MEDIA_BUCKET,
} from './supabaseClient';

const ADMIN_TOKEN_KEY = 'mamxanh_admin_token';
let memoryAdminToken: string | null = null;

function getStoredAdminToken(): string | null {
  if (memoryAdminToken) return memoryAdminToken;
  try {
    return typeof window !== 'undefined' ? window.sessionStorage.getItem(ADMIN_TOKEN_KEY) : null;
  } catch {
    return null;
  }
}

function setStoredAdminToken(token: string | null): void {
  memoryAdminToken = token;
  try {
    if (typeof window === 'undefined') return;
    if (token) {
      window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {
    // Ignore storage access errors in restricted contexts
  }
}

function getAdminHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getStoredAdminToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function handleJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      setStoredAdminToken(null);
    }
    throw new ApiError(res.status, (data as { error?: string }).error || 'Đã có lỗi xảy ra.');
  }
  return data as T;
}

// Row mappers for Supabase tables (snake_case <-> camelCase)
function mapStudentRow(r: Record<string, unknown>): Student {
  return {
    id: String(r.id),
    orderNumber: Number(r.order_number ?? 0),
    name: String(r.name ?? ''),
    nickname: r.nickname ? String(r.nickname) : undefined,
    avatarUrl: r.avatar_url ? String(r.avatar_url) : null,
    sproutVariant: (r.sprout_variant as SproutVariantId) || 'flower_sunny',
    shortIntro: String(r.short_intro ?? ''),
    isDemo: Boolean(r.is_demo),
  };
}

function mapProductRow(r: Record<string, unknown>): Product {
  return {
    id: String(r.id),
    studentId: String(r.student_id),
    type: (r.type as ProductType) || 'thiep',
    title: String(r.title ?? ''),
    description: String(r.description ?? ''),
    mediaUrl: r.media_url ? String(r.media_url) : null,
    isDemo: Boolean(r.is_demo),
    createdAt: String(r.created_at ?? new Date().toISOString()),
  };
}

function mapTeacherRow(r: Record<string, unknown>): Teacher {
  return {
    id: String(r.id),
    orderNumber: Number(r.order_number ?? 0),
    name: String(r.name ?? ''),
    role: String(r.role ?? ''),
    subjectKey: (r.subject_key as Teacher['subjectKey']) || 'homeroom',
    avatarUrl: r.avatar_url ? String(r.avatar_url) : null,
    audioUrl: r.audio_url ? String(r.audio_url) : null,
    letterTitle: String(r.letter_title ?? ''),
    letterContent: String(r.letter_content ?? ''),
    accentColor: String(r.accent_color ?? '#65B741'),
  };
}

function mapMemoryRow(r: Record<string, unknown>): MemoryPhoto {
  return {
    id: String(r.id),
    category: (r.category as MemoryCategory) || 'Khoảnh khắc bên thầy cô',
    caption: String(r.caption ?? ''),
    imageUrl: r.image_url ? String(r.image_url) : null,
    orderIndex: Number(r.order_index ?? 0),
    isDemo: Boolean(r.is_demo),
  };
}

function mapWishRow(r: Record<string, unknown>): WishMessage {
  return {
    id: String(r.id),
    teacherId: r.teacher_id ? String(r.teacher_id) : null,
    studentId: r.student_id ? String(r.student_id) : null,
    studentName: String(r.student_name ?? ''),
    teacherName: String(r.teacher_name ?? ''),
    content: String(r.content ?? ''),
    cardImageUrl: r.card_image_url ? String(r.card_image_url) : null,
    audioUrl: r.audio_url ? String(r.audio_url) : null,
    status: (r.status as WishStatus) || 'pending',
    isDemo: Boolean(r.is_demo),
    createdAt: String(r.created_at ?? new Date().toISOString()),
  };
}

function mapSettingsRow(r: Record<string, unknown> | null): SiteSettings {
  if (!r) return INITIAL_SEED_DATA.settings;
  const rawDialogues = (r.dialogues as Partial<SiteSettings['dialogues']>) || {};
  return {
    introTitle: String(r.intro_title || INITIAL_SEED_DATA.settings.introTitle),
    introContent: String(r.intro_content || INITIAL_SEED_DATA.settings.introContent),
    introSignature: String(r.intro_signature || INITIAL_SEED_DATA.settings.introSignature),
    outroQuote: String(r.outro_quote || INITIAL_SEED_DATA.settings.outroQuote),
    outroClosing: String(r.outro_closing || INITIAL_SEED_DATA.settings.outroClosing),
    musicTitle: String(r.music_title || INITIAL_SEED_DATA.settings.musicTitle),
    musicUrl: r.music_url ? String(r.music_url) : INITIAL_SEED_DATA.settings.musicUrl,
    coverImageUrl: r.cover_image_url ? String(r.cover_image_url) : null,
    fallingPetalsEnabled:
      r.falling_petals_enabled !== undefined ? Boolean(r.falling_petals_enabled) : true,
    dialogues: {
      ...INITIAL_SEED_DATA.settings.dialogues,
      ...rawDialogues,
    },
  };
}

export async function fetchPublicData(): Promise<PublicDataPayload> {
  const sb = getSupabaseClient();
  if (sb) {
    const [stuRes, prdRes, tchRes, msgRes, memRes, setRes] = await Promise.all([
      sb.from('students').select('*').order('order_number', { ascending: true }),
      sb.from('products').select('*').order('created_at', { ascending: false }),
      sb.from('teachers').select('*').order('order_number', { ascending: true }),
      sb
        .from('messages')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false }),
      sb.from('memories').select('*').order('order_index', { ascending: true }),
      sb.from('settings').select('*').eq('id', 'global').maybeSingle(),
    ]);

    if (stuRes.error) throw new ApiError(500, stuRes.error.message);
    if (prdRes.error) throw new ApiError(500, prdRes.error.message);
    if (tchRes.error) throw new ApiError(500, tchRes.error.message);
    if (msgRes.error) throw new ApiError(500, msgRes.error.message);
    if (memRes.error) throw new ApiError(500, memRes.error.message);

    return {
      students: (stuRes.data || []).map(mapStudentRow),
      products: (prdRes.data || []).map(mapProductRow),
      teachers: (tchRes.data || []).map(mapTeacherRow),
      approvedMessages: (msgRes.data || []).map(mapWishRow),
      memories: (memRes.data || []).map(mapMemoryRow),
      settings: mapSettingsRow((setRes.data as Record<string, unknown> | null) || null),
    };
  }

  const res = await fetch('/api/public', { cache: 'no-store' });
  return handleJson<PublicDataPayload>(res);
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Không thể đọc tệp đã chọn.'));
    reader.readAsDataURL(file);
  });
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Không thể xử lý bản ghi âm.'));
    reader.readAsDataURL(blob);
  });
}

export async function uploadMediaFile(
  file: Blob,
  filename: string,
  mimeType: string,
  folder: 'wishes' | 'avatars' | 'products' | 'memories' | 'teachers' | 'settings' = 'wishes'
): Promise<string> {
  const sb = getSupabaseClient();
  if (sb) {
    const ext = filename.split('.').pop()?.toLowerCase() || 'bin';
    const rand = Math.random().toString(36).slice(2, 8);
    const objectPath = `${folder}/${Date.now()}-${rand}.${ext}`;
    const { error: uploadErr } = await sb.storage
      .from(SUPABASE_MEDIA_BUCKET)
      .upload(objectPath, file, { contentType: mimeType, upsert: false });
    if (uploadErr) {
      throw new ApiError(400, uploadErr.message);
    }
    const { data: pubData } = sb.storage.from(SUPABASE_MEDIA_BUCKET).getPublicUrl(objectPath);
    return pubData.publicUrl;
  }

  const dataBase64 = await blobToBase64(file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, mimeType, dataBase64 }),
  });
  const data = await handleJson<{ url: string }>(res);
  return data.url;
}

export async function submitWish(payload: {
  teacherName: string;
  studentName: string;
  teacherId?: string | null;
  studentId?: string | null;
  content: string;
  cardImageUrl?: string | null;
}): Promise<{ id: string; status: WishStatus; message: string }> {
  const sb = getSupabaseClient();
  if (sb) {
    const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const { error } = await sb.from('messages').insert({
      id,
      teacher_id: payload.teacherId ?? null,
      student_id: payload.studentId ?? null,
      student_name: payload.studentName.trim(),
      teacher_name: payload.teacherName.trim(),
      content: payload.content.trim(),
      card_image_url: payload.cardImageUrl ?? null,
      audio_url: null,
      status: 'pending',
      is_demo: false,
    });
    if (error) {
      throw new ApiError(400, error.message);
    }
    return {
      id,
      status: 'pending',
      message: 'Đã nhận được lời chúc! Lời chúc đang chờ giáo viên duyệt trước khi hiển thị.',
    };
  }

  const res = await fetch('/api/wishes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teacherName: payload.teacherName,
      studentName: payload.studentName,
      teacherId: payload.teacherId ?? null,
      studentId: payload.studentId ?? null,
      content: payload.content,
      cardImageUrl: payload.cardImageUrl ?? null,
    }),
  });
  return handleJson<{ id: string; status: WishStatus; message: string }>(res);
}

export async function adminLogin(
  username: string,
  password: string
): Promise<{ username: string; token?: string }> {
  const sb = getSupabaseClient();
  if (sb) {
    const { data, error } = await sb.auth.signInWithPassword({
      email: username.trim(),
      password,
    });
    if (error || !data.user) {
      throw new ApiError(401, error?.message || 'Thông tin đăng nhập giáo viên chưa đúng.');
    }
    return { username: data.user.email || username };
  }

  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ username, password }),
  });
  const data = await handleJson<{ username: string; token?: string }>(res);
  if (data.token) {
    setStoredAdminToken(data.token);
  }
  return data;
}

export async function adminLogout(): Promise<void> {
  const sb = getSupabaseClient();
  if (sb) {
    await sb.auth.signOut();
    return;
  }

  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: getAdminHeaders(),
      credentials: 'same-origin',
    });
  } finally {
    setStoredAdminToken(null);
  }
}

export async function checkAdminSession(): Promise<{
  authenticated: boolean;
  username?: string;
  mode: 'supabase' | 'local';
}> {
  const sb = getSupabaseClient();
  if (sb) {
    const { data } = await sb.auth.getSession();
    if (!data.session?.user) {
      return { authenticated: false, mode: 'supabase' };
    }
    return {
      authenticated: true,
      username: data.session.user.email || 'Giáo viên',
      mode: 'supabase',
    };
  }

  const res = await fetch('/api/admin/me', {
    cache: 'no-store',
    headers: getAdminHeaders(),
    credentials: 'same-origin',
  });
  if (!res.ok) {
    setStoredAdminToken(null);
    return { authenticated: false, mode: 'local' };
  }
  const data = (await res.json()) as { authenticated: boolean; username?: string };
  if (!data.authenticated) {
    setStoredAdminToken(null);
  }
  return { ...data, mode: isSupabaseConfigured() ? 'supabase' : 'local' };
}

export async function fetchAdminData(): Promise<DatabaseState> {
  const sb = getSupabaseClient();
  if (sb) {
    const [stuRes, prdRes, tchRes, msgRes, memRes, setRes] = await Promise.all([
      sb.from('students').select('*').order('order_number', { ascending: true }),
      sb.from('products').select('*').order('created_at', { ascending: false }),
      sb.from('teachers').select('*').order('order_number', { ascending: true }),
      sb.from('messages').select('*').order('created_at', { ascending: false }),
      sb.from('memories').select('*').order('order_index', { ascending: true }),
      sb.from('settings').select('*').eq('id', 'global').maybeSingle(),
    ]);

    if (stuRes.error) throw new ApiError(401, stuRes.error.message);
    if (prdRes.error) throw new ApiError(500, prdRes.error.message);
    if (tchRes.error) throw new ApiError(500, tchRes.error.message);
    if (msgRes.error) throw new ApiError(500, msgRes.error.message);
    if (memRes.error) throw new ApiError(500, memRes.error.message);

    return {
      students: (stuRes.data || []).map(mapStudentRow),
      products: (prdRes.data || []).map(mapProductRow),
      teachers: (tchRes.data || []).map(mapTeacherRow),
      messages: (msgRes.data || []).map(mapWishRow),
      memories: (memRes.data || []).map(mapMemoryRow),
      settings: mapSettingsRow((setRes.data as Record<string, unknown> | null) || null),
    };
  }

  const res = await fetch('/api/admin/data', {
    cache: 'no-store',
    headers: getAdminHeaders(),
    credentials: 'same-origin',
  });
  return handleJson<DatabaseState>(res);
}

export async function adminCreateStudent(payload: Partial<Student>): Promise<Student> {
  const sb = getSupabaseClient();
  if (sb) {
    const id = `stu-${Date.now()}`;
    const row = {
      id,
      order_number: payload.orderNumber ?? 34,
      name: (payload.name || '').trim(),
      avatar_url: payload.avatarUrl ?? null,
      sprout_variant: payload.sproutVariant || 'flower_sunny',
      short_intro: (payload.shortIntro || 'Món quà tri ân thầy cô').trim(),
      is_demo: Boolean(payload.isDemo),
    };
    const { data, error } = await sb.from('students').insert(row).select('*').single();
    if (error) throw new ApiError(400, error.message);
    return mapStudentRow(data as Record<string, unknown>);
  }

  const res = await fetch('/api/admin/students', {
    method: 'POST',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  return handleJson<Student>(res);
}

export async function adminUpdateStudent(
  id: string,
  payload: Partial<Student>
): Promise<Student> {
  const sb = getSupabaseClient();
  if (sb) {
    const updateRow: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.orderNumber !== undefined) updateRow.order_number = payload.orderNumber;
    if (payload.name !== undefined) updateRow.name = payload.name.trim();
    if (payload.avatarUrl !== undefined) updateRow.avatar_url = payload.avatarUrl;
    if (payload.sproutVariant !== undefined) updateRow.sprout_variant = payload.sproutVariant;
    if (payload.shortIntro !== undefined) updateRow.short_intro = payload.shortIntro.trim();
    if (payload.isDemo !== undefined) updateRow.is_demo = payload.isDemo;

    const { data, error } = await sb
      .from('students')
      .update(updateRow)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new ApiError(400, error.message);
    return mapStudentRow(data as Record<string, unknown>);
  }

  const res = await fetch(`/api/admin/students/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  return handleJson<Student>(res);
}

export async function adminDeleteStudent(id: string): Promise<void> {
  const sb = getSupabaseClient();
  if (sb) {
    const { error } = await sb.from('students').delete().eq('id', id);
    if (error) throw new ApiError(400, error.message);
    return;
  }

  const res = await fetch(`/api/admin/students/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
    credentials: 'same-origin',
  });
  await handleJson<{ ok: boolean }>(res);
}

export async function adminCreateProduct(payload: Partial<Product>): Promise<Product> {
  const sb = getSupabaseClient();
  if (sb) {
    const id = `prd-${Date.now()}`;
    const { data, error } = await sb
      .from('products')
      .insert({
        id,
        student_id: payload.studentId,
        type: payload.type || 'thiep',
        title: (payload.title || '').trim(),
        description: (payload.description || '').trim(),
        media_url: payload.mediaUrl ?? null,
        is_demo: false,
      })
      .select('*')
      .single();
    if (error) throw new ApiError(400, error.message);
    return mapProductRow(data as Record<string, unknown>);
  }

  const res = await fetch('/api/admin/products', {
    method: 'POST',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  return handleJson<Product>(res);
}

export async function adminUpdateProduct(
  id: string,
  payload: Partial<Product>
): Promise<Product> {
  const sb = getSupabaseClient();
  if (sb) {
    const updateRow: Record<string, unknown> = {};
    if (payload.type !== undefined) updateRow.type = payload.type;
    if (payload.title !== undefined) updateRow.title = payload.title;
    if (payload.description !== undefined) updateRow.description = payload.description;
    if (payload.mediaUrl !== undefined) updateRow.media_url = payload.mediaUrl;
    if (payload.isDemo !== undefined) updateRow.is_demo = payload.isDemo;
    const { data, error } = await sb
      .from('products')
      .update(updateRow)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new ApiError(400, error.message);
    return mapProductRow(data as Record<string, unknown>);
  }

  const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  return handleJson<Product>(res);
}

export async function adminDeleteProduct(id: string): Promise<void> {
  const sb = getSupabaseClient();
  if (sb) {
    const { error } = await sb.from('products').delete().eq('id', id);
    if (error) throw new ApiError(400, error.message);
    return;
  }

  const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
    credentials: 'same-origin',
  });
  await handleJson<{ ok: boolean }>(res);
}

export async function adminCreateMemory(payload: Partial<MemoryPhoto>): Promise<MemoryPhoto> {
  const sb = getSupabaseClient();
  if (sb) {
    const id = `mem-${Date.now()}`;
    const { data, error } = await sb
      .from('memories')
      .insert({
        id,
        category: payload.category,
        caption: (payload.caption || '').trim(),
        image_url: payload.imageUrl ?? null,
        order_index: payload.orderIndex ?? 99,
        is_demo: !payload.imageUrl,
      })
      .select('*')
      .single();
    if (error) throw new ApiError(400, error.message);
    return mapMemoryRow(data as Record<string, unknown>);
  }

  const res = await fetch('/api/admin/memories', {
    method: 'POST',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  return handleJson<MemoryPhoto>(res);
}

export async function adminUpdateMemory(
  id: string,
  payload: Partial<MemoryPhoto>
): Promise<MemoryPhoto> {
  const sb = getSupabaseClient();
  if (sb) {
    const updateRow: Record<string, unknown> = {};
    if (payload.category !== undefined) updateRow.category = payload.category;
    if (payload.caption !== undefined) updateRow.caption = payload.caption;
    if (payload.imageUrl !== undefined) updateRow.image_url = payload.imageUrl;
    if (payload.orderIndex !== undefined) updateRow.order_index = payload.orderIndex;
    if (payload.isDemo !== undefined) updateRow.is_demo = payload.isDemo;
    const { data, error } = await sb
      .from('memories')
      .update(updateRow)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new ApiError(400, error.message);
    return mapMemoryRow(data as Record<string, unknown>);
  }

  const res = await fetch(`/api/admin/memories/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  return handleJson<MemoryPhoto>(res);
}

export async function adminDeleteMemory(id: string): Promise<void> {
  const sb = getSupabaseClient();
  if (sb) {
    const { error } = await sb.from('memories').delete().eq('id', id);
    if (error) throw new ApiError(400, error.message);
    return;
  }

  const res = await fetch(`/api/admin/memories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
    credentials: 'same-origin',
  });
  await handleJson<{ ok: boolean }>(res);
}

export async function adminUpdateTeacher(
  id: string,
  payload: Partial<Teacher>
): Promise<Teacher> {
  const sb = getSupabaseClient();
  if (sb) {
    const updateRow: Record<string, unknown> = {};
    if (payload.name !== undefined) updateRow.name = payload.name;
    if (payload.role !== undefined) updateRow.role = payload.role;
    if (payload.avatarUrl !== undefined) updateRow.avatar_url = payload.avatarUrl;
    if (payload.audioUrl !== undefined) updateRow.audio_url = payload.audioUrl;
    if (payload.letterTitle !== undefined) updateRow.letter_title = payload.letterTitle;
    if (payload.letterContent !== undefined) updateRow.letter_content = payload.letterContent;
    const { data, error } = await sb
      .from('teachers')
      .update(updateRow)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new ApiError(400, error.message);
    return mapTeacherRow(data as Record<string, unknown>);
  }

  const res = await fetch(`/api/admin/teachers/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  return handleJson<Teacher>(res);
}

export async function adminUpdateWishStatus(
  id: string,
  status: WishStatus
): Promise<WishMessage> {
  const sb = getSupabaseClient();
  if (sb) {
    const { data, error } = await sb
      .from('messages')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new ApiError(400, error.message);
    return mapWishRow(data as Record<string, unknown>);
  }

  const res = await fetch(`/api/admin/wishes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify({ status }),
  });
  return handleJson<WishMessage>(res);
}

export async function adminDeleteWish(id: string): Promise<void> {
  const sb = getSupabaseClient();
  if (sb) {
    const { error } = await sb.from('messages').delete().eq('id', id);
    if (error) throw new ApiError(400, error.message);
    return;
  }

  const res = await fetch(`/api/admin/wishes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
    credentials: 'same-origin',
  });
  await handleJson<{ ok: boolean }>(res);
}

export async function adminUpdateSettings(payload: Partial<SiteSettings>): Promise<SiteSettings> {
  const sb = getSupabaseClient();
  if (sb) {
    const updateRow: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.introTitle !== undefined) updateRow.intro_title = payload.introTitle;
    if (payload.introContent !== undefined) updateRow.intro_content = payload.introContent;
    if (payload.introSignature !== undefined) updateRow.intro_signature = payload.introSignature;
    if (payload.outroQuote !== undefined) updateRow.outro_quote = payload.outroQuote;
    if (payload.outroClosing !== undefined) updateRow.outro_closing = payload.outroClosing;
    if (payload.musicTitle !== undefined) updateRow.music_title = payload.musicTitle;
    if (payload.musicUrl !== undefined) updateRow.music_url = payload.musicUrl;
    if (payload.coverImageUrl !== undefined) updateRow.cover_image_url = payload.coverImageUrl;
    if (payload.fallingPetalsEnabled !== undefined) {
      updateRow.falling_petals_enabled = payload.fallingPetalsEnabled;
    }
    if (payload.dialogues !== undefined) updateRow.dialogues = payload.dialogues;

    const { data, error } = await sb
      .from('settings')
      .upsert({ id: 'global', ...updateRow })
      .select('*')
      .single();
    if (error) throw new ApiError(400, error.message);
    return mapSettingsRow(data as Record<string, unknown>);
  }

  const res = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  return handleJson<SiteSettings>(res);
}
