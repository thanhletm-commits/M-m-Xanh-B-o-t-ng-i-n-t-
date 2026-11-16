import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { INITIAL_SEED_DATA } from './src/data/seedData';
import {
  getApprovedWishes,
  MAX_UPLOAD_BYTES,
  sanitizeText,
  validateUploadFile,
  validateWishSubmission,
} from './src/lib/mamxanh';
import type {
  DatabaseState,
  MemoryPhoto,
  Product,
  PublicDataPayload,
  Student,
  Teacher,
  WishMessage,
  WishStatus,
} from './src/types/mamxanh';

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mamxanh2011';
const SESSION_SECRET = process.env.SESSION_SECRET || 'mamxanh-local-session-secret';
const SESSION_COOKIE_NAME = 'mamxanh_teacher_session';

function ensureStorage(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_SEED_DATA, null, 2), 'utf8');
  }
}

function readDb(): DatabaseState {
  ensureStorage();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw) as DatabaseState;
    let dirty = false;

    const s = parsed.settings;
    if (s) {
      if (s.musicUrl === null || s.musicUrl === undefined) {
        s.musicUrl = INITIAL_SEED_DATA.settings.musicUrl;
        dirty = true;
      }
      if (s.musicTitle === 'Người gieo mầm xanh (Nhạc không lời Piano)') {
        s.musicTitle = INITIAL_SEED_DATA.settings.musicTitle;
        dirty = true;
      }
      if (s.fallingPetalsEnabled === undefined) {
        s.fallingPetalsEnabled = true;
        dirty = true;
      }
      if (s.coverImageUrl === undefined) {
        s.coverImageUrl = null;
        dirty = true;
      }
      if (!s.dialogues.stage6) {
        // Old 5-stage db: preserve custom stage5 if teacher edited it, otherwise migrate stage5 -> quiz & stage6 -> sunlight
        const oldStage5Sunlight =
          'Cảm ơn thầy cô đã gieo những hạt mầm yêu thương và giúp chúng mình lớn lên mỗi ngày!';
        s.dialogues.stage6 =
          s.dialogues.stage5 === oldStage5Sunlight
            ? INITIAL_SEED_DATA.settings.dialogues.stage6
            : s.dialogues.stage5 || INITIAL_SEED_DATA.settings.dialogues.stage6;
        s.dialogues.stage5 = INITIAL_SEED_DATA.settings.dialogues.stage5;
        dirty = true;
      }
      if (s.introContent.includes('được gieo vào tâm hồn bằng tình yêu thương')) {
        s.introContent = INITIAL_SEED_DATA.settings.introContent;
        dirty = true;
      }
      if (s.outroQuote.includes('Rồi sẽ có một ngày chúng em rời khỏi lớp học này')) {
        s.outroQuote = INITIAL_SEED_DATA.settings.outroQuote;
        s.outroClosing = INITIAL_SEED_DATA.settings.outroClosing;
        dirty = true;
      }
    }

    if (Array.isArray(parsed.teachers)) {
      for (const teacher of parsed.teachers) {
        if (teacher.audioUrl === undefined) {
          teacher.audioUrl = null;
          dirty = true;
        }
      }
    }

    if (dirty) {
      fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), 'utf8');
    }
    return parsed;
  } catch {
    fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_SEED_DATA, null, 2), 'utf8');
    return structuredClone(INITIAL_SEED_DATA);
  }
}

function writeDb(state: DatabaseState): void {
  ensureStorage();
  fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), 'utf8');
}

function cleanupUnusedUpload(db: DatabaseState, oldUrl: string | null | undefined): void {
  if (!oldUrl || !oldUrl.startsWith('/uploads/')) return;
  const isReferenced =
    db.students.some((st) => st.avatarUrl === oldUrl) ||
    db.products.some((p) => p.mediaUrl === oldUrl) ||
    db.teachers.some((t) => t.avatarUrl === oldUrl || t.audioUrl === oldUrl) ||
    db.memories.some((m) => m.imageUrl === oldUrl) ||
    db.messages.some((m) => m.cardImageUrl === oldUrl || m.audioUrl === oldUrl) ||
    db.settings.musicUrl === oldUrl ||
    db.settings.coverImageUrl === oldUrl;

  if (!isReferenced) {
    const filename = path.basename(oldUrl);
    const fullPath = path.join(UPLOADS_DIR, filename);
    if (fullPath.startsWith(UPLOADS_DIR) && fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch {
        // Non-fatal cleanup error
      }
    }
  }
}

function signToken(username: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      username,
      exp: Date.now() + 1000 * 60 * 60 * 12,
    })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token: string | undefined): { username: string } | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  if (sig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      username: string;
      exp: number;
    };
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return { username: parsed.username };
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k) result[k] = decodeURIComponent(v.join('='));
  }
  return result;
}

function requireTeacherAuth(req: Request, res: Response, next: NextFunction): void {
  const cookies = parseCookies(req.headers.cookie);
  const authHeader = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const token = cookies[SESSION_COOKIE_NAME] || authHeader;
  const session = verifyToken(token);
  if (!session) {
    res.status(401).json({ error: 'Vui lòng đăng nhập tài khoản giáo viên.' });
    return;
  }
  next();
}

// Simple per-IP anti-spam rate limiter for wish submissions
const wishRateLimit = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const recent = (wishRateLimit.get(ip) || []).filter((ts) => now - ts < windowMs);
  if (recent.length >= 12) {
    wishRateLimit.set(ip, recent);
    return true;
  }
  recent.push(now);
  wishRateLimit.set(ip, recent);
  return false;
}

const MIME_EXT_MAP: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/wave': 'wav',
  'audio/x-wav': 'wav',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/m4a': 'm4a',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

async function startServer() {
  ensureStorage();
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '12mb' }));

  // Serve uploaded media files
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Public read-only state (never leaks pending/hidden wishes)
  app.get('/api/public', (_req, res) => {
    const db = readDb();
    const payload: PublicDataPayload = {
      students: [...db.students].sort((a, b) => a.orderNumber - b.orderNumber),
      products: db.products,
      teachers: [...db.teachers].sort((a, b) => a.orderNumber - b.orderNumber),
      approvedMessages: getApprovedWishes(db.messages),
      memories: [...db.memories].sort((a, b) => a.orderIndex - b.orderIndex),
      settings: db.settings,
    };
    res.json(payload);
  });

  // Public file upload for student wish cards / audio recordings (and reused by admin)
  app.post('/api/upload', (req, res) => {
    const { mimeType, dataBase64 } = req.body as {
      filename?: string;
      mimeType?: string;
      dataBase64?: string;
    };
    if (!mimeType || !dataBase64) {
      res.status(400).json({ error: 'Thiếu dữ liệu tệp tải lên.' });
      return;
    }
    const cleanMime = mimeType.toLowerCase().split(';')[0].trim();
    const rawBase64 = dataBase64.includes(',') ? dataBase64.split(',')[1] : dataBase64;
    const buffer = Buffer.from(rawBase64, 'base64');

    const check = validateUploadFile(cleanMime, buffer.byteLength);
    if (!check.valid) {
      res.status(400).json({ error: check.error });
      return;
    }
    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      res.status(400).json({ error: 'Tệp vượt quá 8MB.' });
      return;
    }

    const ext = MIME_EXT_MAP[cleanMime] || 'bin';
    const fileId = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const destPath = path.join(UPLOADS_DIR, fileId);
    fs.writeFileSync(destPath, buffer);
    res.status(201).json({ url: `/uploads/${fileId}` });
  });

  // Public wish submission -> always saved with status: 'pending'
  app.post('/api/wishes', (req, res) => {
    const ip = req.ip || 'unknown';
    if (isRateLimited(ip)) {
      res.status(429).json({
        error: 'Bạn gửi hơi nhanh, vui lòng đợi một lát rồi thử lại nhé!',
      });
      return;
    }

    const { teacherName, studentName, teacherId, studentId, content, cardImageUrl } =
      req.body as {
        teacherName?: string;
        studentName?: string;
        teacherId?: string | null;
        studentId?: string | null;
        content?: string;
        cardImageUrl?: string | null;
      };

    const validation = validateWishSubmission({
      teacherName: teacherName || '',
      studentName: studentName || '',
      teacherId: teacherId ?? null,
      studentId: studentId ?? null,
      content: content || '',
      cardImageUrl,
    });
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const db = readDb();
    const cleanTeacherName = sanitizeText(teacherName || '');
    const cleanStudentName = sanitizeText(studentName || '');

    // Optionally link to a known teacher/student if name or ID matches, otherwise keep free-text names
    const matchedTeacher =
      (teacherId ? db.teachers.find((t) => t.id === teacherId) : undefined) ||
      db.teachers.find((t) => t.name.toLowerCase() === cleanTeacherName.toLowerCase());
    const matchedStudent =
      (studentId ? db.students.find((s) => s.id === studentId) : undefined) ||
      db.students.find((s) => s.name.toLowerCase() === cleanStudentName.toLowerCase());

    const newWish: WishMessage = {
      id: `msg-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      teacherId: matchedTeacher ? matchedTeacher.id : null,
      studentId: matchedStudent ? matchedStudent.id : null,
      studentName: cleanStudentName,
      teacherName: cleanTeacherName,
      content: sanitizeText(content || ''),
      cardImageUrl: cardImageUrl || null,
      audioUrl: null,
      status: 'pending',
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    db.messages.unshift(newWish);
    writeDb(db);

    res.status(201).json({
      id: newWish.id,
      status: newWish.status,
      message: 'Đã nhận được lời chúc! Lời chúc đang chờ giáo viên duyệt trước khi hiển thị.',
    });
  });

  // Teacher Admin Authentication
  function buildSessionCookie(req: Request, value: string, maxAgeSeconds: number): string {
    const isHttps =
      req.secure ||
      String(req.headers['x-forwarded-proto'] || '')
        .toLowerCase()
        .includes('https');
    const securityFlags = isHttps
      ? '; SameSite=None; Secure; Partitioned'
      : '; SameSite=Lax';
    return `${SESSION_COOKIE_NAME}=${encodeURIComponent(
      value
    )}; Path=/; HttpOnly; Max-Age=${maxAgeSeconds}${securityFlags}`;
  }

  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body as { username?: string; password?: string };
    const cleanUser = (username || '').trim();
    if (!cleanUser || !password) {
      res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu giáo viên.' });
      return;
    }
    if (password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: 'Mật khẩu giáo viên chưa chính xác.' });
      return;
    }
    const token = signToken(cleanUser);
    res.setHeader('Set-Cookie', buildSessionCookie(req, token, 43200));
    res.json({ ok: true, username: cleanUser, token });
  });

  app.post('/api/admin/logout', (req, res) => {
    res.setHeader('Set-Cookie', buildSessionCookie(req, '', 0));
    res.json({ ok: true });
  });

  app.get('/api/admin/me', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const authHeader = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const token = cookies[SESSION_COOKIE_NAME] || authHeader;
    const session = verifyToken(token);
    if (!session) {
      res.status(200).json({ authenticated: false });
      return;
    }
    res.json({ authenticated: true, username: session.username });
  });

  // Protected Admin Read All Data
  app.get('/api/admin/data', requireTeacherAuth, (_req, res) => {
    const db = readDb();
    res.json({
      students: [...db.students].sort((a, b) => a.orderNumber - b.orderNumber),
      products: db.products,
      teachers: [...db.teachers].sort((a, b) => a.orderNumber - b.orderNumber),
      messages: [...db.messages].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      memories: [...db.memories].sort((a, b) => a.orderIndex - b.orderIndex),
      settings: db.settings,
    });
  });

  // Admin: Students CRUD
  app.post('/api/admin/students', requireTeacherAuth, (req, res) => {
    const db = readDb();
    const body = req.body as Partial<Student>;
    if (!body.name?.trim()) {
      res.status(400).json({ error: 'Tên học sinh không được để trống.' });
      return;
    }
    const maxOrder = db.students.reduce((m, s) => Math.max(m, s.orderNumber), 0);
    const orderNumber = body.orderNumber ?? maxOrder + 1;
    if (db.students.some((student) => student.orderNumber === orderNumber)) {
      res.status(409).json({ error: 'Số thứ tự này đã có học sinh sử dụng. Hãy chọn STT khác.' });
      return;
    }
    const created: Student = {
      id: `stu-${Date.now()}`,
      orderNumber,
      name: body.name.trim(),
      avatarUrl: body.avatarUrl ?? null,
      sproutVariant: body.sproutVariant || 'flower_sunny',
      shortIntro: body.shortIntro?.trim() || 'Món quà tri ân thầy cô',
      isDemo: Boolean(body.isDemo),
    };
    db.students.push(created);
    writeDb(db);
    res.status(201).json(created);
  });

  app.put('/api/admin/students/:id', requireTeacherAuth, (req, res) => {
    const db = readDb();
    const idx = db.students.findIndex((s) => s.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Không tìm thấy học sinh.' });
      return;
    }
    const prevAvatarUrl = db.students[idx].avatarUrl;
    const patch = req.body as Partial<Student>;
    if (patch.orderNumber !== undefined && db.students.some(
      (student) => student.id !== req.params.id && student.orderNumber === patch.orderNumber
    )) {
      res.status(409).json({ error: 'Số thứ tự này đã có học sinh sử dụng. Hãy chọn STT khác.' });
      return;
    }
    const updated: Student = {
      ...db.students[idx],
      ...patch,
      name: patch.name !== undefined ? patch.name.trim() : db.students[idx].name,
      shortIntro:
        patch.shortIntro !== undefined ? patch.shortIntro.trim() : db.students[idx].shortIntro,
      isDemo: patch.avatarUrl ? false : patch.isDemo ?? db.students[idx].isDemo,
    };
    db.students[idx] = updated;
    writeDb(db);
    if (patch.avatarUrl !== undefined && prevAvatarUrl !== updated.avatarUrl) {
      cleanupUnusedUpload(db, prevAvatarUrl);
    }
    res.json(updated);
  });

  app.delete('/api/admin/students/:id', requireTeacherAuth, (req, res) => {
    const db = readDb();
    const removed = db.students.find((s) => s.id === req.params.id);
    db.students = db.students.filter((s) => s.id !== req.params.id);
    db.products = db.products.filter((p) => p.studentId !== req.params.id);
    writeDb(db);
    if (removed?.avatarUrl) {
      cleanupUnusedUpload(db, removed.avatarUrl);
    }
    res.json({ ok: true });
  });

  // Admin: Products CRUD
  app.post('/api/admin/products', requireTeacherAuth, (req, res) => {
    const db = readDb();
    const body = req.body as Partial<Product>;
    if (!body.studentId || !body.title?.trim()) {
      res.status(400).json({ error: 'Vui lòng chọn học sinh và nhập tiêu đề sản phẩm.' });
      return;
    }
    const created: Product = {
      id: `prd-${Date.now()}`,
      studentId: body.studentId,
      type: body.type || 'thiep',
      title: body.title.trim(),
      description: body.description?.trim() || '',
      mediaUrl: body.mediaUrl ?? null,
      isDemo: false,
      createdAt: new Date().toISOString(),
    };
    db.products.unshift(created);
    writeDb(db);
    res.status(201).json(created);
  });

  app.put('/api/admin/products/:id', requireTeacherAuth, (req, res) => {
    const db = readDb();
    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
      return;
    }
    const patch = req.body as Partial<Product>;
    db.products[idx] = {
      ...db.products[idx],
      ...patch,
      isDemo: patch.isDemo ?? false,
    };
    writeDb(db);
    res.json(db.products[idx]);
  });

  app.delete('/api/admin/products/:id', requireTeacherAuth, (req, res) => {
    const db = readDb();
    db.products = db.products.filter((p) => p.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin: Memories CRUD & ordering
  app.post('/api/admin/memories', requireTeacherAuth, (req, res) => {
    const db = readDb();
    const body = req.body as Partial<MemoryPhoto>;
    if (!body.caption?.trim() || !body.category) {
      res.status(400).json({ error: 'Vui lòng chọn nhóm ảnh và nhập chú thích.' });
      return;
    }
    const maxIdx = db.memories.reduce((m, item) => Math.max(m, item.orderIndex), 0);
    const created: MemoryPhoto = {
      id: `mem-${Date.now()}`,
      category: body.category,
      caption: body.caption.trim(),
      imageUrl: body.imageUrl ?? null,
      orderIndex: maxIdx + 1,
      isDemo: !body.imageUrl,
    };
    db.memories.push(created);
    writeDb(db);
    res.status(201).json(created);
  });

  app.put('/api/admin/memories/:id', requireTeacherAuth, (req, res) => {
    const db = readDb();
    const idx = db.memories.findIndex((m) => m.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Không tìm thấy ảnh kỷ niệm.' });
      return;
    }
    const patch = req.body as Partial<MemoryPhoto>;
    db.memories[idx] = {
      ...db.memories[idx],
      ...patch,
      isDemo: patch.imageUrl ? false : db.memories[idx].isDemo,
    };
    writeDb(db);
    res.json(db.memories[idx]);
  });

  app.delete('/api/admin/memories/:id', requireTeacherAuth, (req, res) => {
    const db = readDb();
    db.memories = db.memories.filter((m) => m.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin: Teachers Update (supports letter text, avatarUrl and letter audioUrl)
  app.put('/api/admin/teachers/:id', requireTeacherAuth, (req, res) => {
    const db = readDb();
    const idx = db.teachers.findIndex((t) => t.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Không tìm thấy hồ sơ giáo viên.' });
      return;
    }
    const prevAvatarUrl = db.teachers[idx].avatarUrl;
    const prevAudioUrl = db.teachers[idx].audioUrl;
    const patch = req.body as Partial<Teacher>;
    const updated: Teacher = {
      ...db.teachers[idx],
      ...patch,
    };
    db.teachers[idx] = updated;
    writeDb(db);
    if (patch.avatarUrl !== undefined && prevAvatarUrl !== updated.avatarUrl) {
      cleanupUnusedUpload(db, prevAvatarUrl);
    }
    if (patch.audioUrl !== undefined && prevAudioUrl !== updated.audioUrl) {
      cleanupUnusedUpload(db, prevAudioUrl);
    }
    res.json(updated);
  });

  // Admin: Wishes Moderation (approve / hide / delete)
  app.put('/api/admin/wishes/:id', requireTeacherAuth, (req, res) => {
    const db = readDb();
    const idx = db.messages.findIndex((m) => m.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Không tìm thấy lời chúc.' });
      return;
    }
    const { status } = req.body as { status?: WishStatus };
    if (status !== 'pending' && status !== 'approved' && status !== 'hidden') {
      res.status(400).json({ error: 'Trạng thái duyệt không hợp lệ.' });
      return;
    }
    db.messages[idx] = { ...db.messages[idx], status };
    writeDb(db);
    res.json(db.messages[idx]);
  });

  app.delete('/api/admin/wishes/:id', requireTeacherAuth, (req, res) => {
    const db = readDb();
    db.messages = db.messages.filter((m) => m.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin: Site Settings & Content
  app.put('/api/admin/settings', requireTeacherAuth, (req, res) => {
    const db = readDb();
    const patch = req.body as Partial<DatabaseState['settings']>;
    db.settings = {
      ...db.settings,
      ...patch,
      dialogues: {
        ...db.settings.dialogues,
        ...(patch.dialogues || {}),
      },
    };
    writeDb(db);
    res.json(db.settings);
  });

  // Mount Vite dev middleware or serve static build
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mam Xanh server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
