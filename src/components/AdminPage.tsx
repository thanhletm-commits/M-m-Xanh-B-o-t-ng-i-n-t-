import { ProductAttachmentPreview } from './ProductAttachmentPreview';
import { isStaticPages } from '../lib/site';
import { useCallback, useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Check,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Images,
  Lock,
  LogOut,
  Mail,
  Music,
  Package,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  Trees,
  Upload,
  Users,
  Volume2,
  X,
} from 'lucide-react';
import {
  MEMORY_CATEGORIES,
  SPROUT_VARIANTS,
  getProductTypeLabel,
  isProductVideo,
  validateStudentAvatarUpload,
  validateTeacherAudioUpload,
} from '../lib/mamxanh';
import {
  ApiError,
  adminCreateMemory,
  adminCreateProduct,
  adminCreateStudent,
  adminDeleteMemory,
  adminDeleteProduct,
  adminDeleteStudent,
  adminDeleteWish,
  adminLogin,
  adminLogout,
  adminUpdateMemory,
  adminUpdateProduct,
  adminUpdateSettings,
  adminUpdateStudent,
  adminUpdateTeacher,
  adminUpdateWishStatus,
  checkAdminSession,
  fetchAdminData,
  uploadMediaFile,
} from '../services/api';
import { isSupabaseConfigured } from '../services/supabaseClient';
import type {
  DatabaseState,
  MemoryCategory,
  ProductType,
  SproutVariantId,
  Student,
  WishStatus,
} from '../types/mamxanh';

interface AdminPageProps {
  onBackToSite: () => void;
  onDataUpdated: () => void;
}

type AdminTab =
  | 'wishes'
  | 'tree'
  | 'students'
  | 'products'
  | 'memories'
  | 'teachers'
  | 'content';

interface AvatarPreviewState {
  student: Student;
  file: File;
  previewObjectUrl: string;
}

export function AdminPage({ onBackToSite, onDataUpdated }: AdminPageProps) {
  const adminUnavailable = isStaticPages && !isSupabaseConfigured();
  const [checkingAuth, setCheckingAuth] = useState(!adminUnavailable);
  const [authenticated, setAuthenticated] = useState(false);
  const [teacherUsername, setTeacherUsername] = useState('');
  const supabaseMode = isSupabaseConfigured();

  // Login form
  const [usernameInput, setUsernameInput] = useState(supabaseMode ? '' : 'giaovien');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Admin data & feedback
  const [data, setData] = useState<DatabaseState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('wishes');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  // Wishes filters
  const [wishTeacherFilter, setWishTeacherFilter] = useState<string>('all');
  const [wishStatusFilter, setWishStatusFilter] = useState<'all' | WishStatus>('all');

  // Student search, sort & safe avatar modals
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSort, setStudentSort] = useState<'order' | 'name'>('order');
  const [studentPhotoFilter, setStudentPhotoFilter] = useState<'all' | 'has_photo' | 'missing'>(
    'all'
  );
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentIntro, setNewStudentIntro] = useState('');
  const [newStudentVariant, setNewStudentVariant] =
    useState<SproutVariantId>('flower_sunny');
  const [viewAvatarStudent, setViewAvatarStudent] = useState<Student | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<AvatarPreviewState | null>(null);
  const [confirmingAvatarUpload, setConfirmingAvatarUpload] = useState(false);
  const [confirmDeleteAvatarStudent, setConfirmDeleteAvatarStudent] =
    useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentEditError, setStudentEditError] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);

  // Products & Memories creation
  const [selectedStudentForProduct, setSelectedStudentForProduct] = useState<string>('');
  const [newProdType, setNewProdType] = useState<ProductType>('thiep');
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProductAttachment, setNewProductAttachment] = useState<{
    url: string;
    name: string;
    isVideo: boolean;
  } | null>(null);
  const [productMediaBusy, setProductMediaBusy] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);

  const [newMemCategory, setNewMemCategory] = useState<MemoryCategory>(
    'Khoảnh khắc bên thầy cô'
  );
  const [newMemCaption, setNewMemCaption] = useState('');
  const [newMemImageUrl, setNewMemImageUrl] = useState<string | null>(null);

  const loadAdmin = useCallback(async () => {
    setLoadError(null);
    try {
      const full = await fetchAdminData();
      setData(full);
      setSelectedStudentForProduct((prev) => prev || full.students[0]?.id || '');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAuthenticated(false);
        setData(null);
        setLoginError(err.message);
      } else {
        setLoadError(err instanceof Error ? err.message : 'Không thể tải dữ liệu quản trị.');
      }
      throw err;
    }
  }, []);

  useEffect(() => {
    if (adminUnavailable) return;
    let active = true;
    checkAdminSession()
      .then(async (session) => {
        if (!active) return;
        if (session.authenticated) {
          setAuthenticated(true);
          setTeacherUsername(session.username || 'Giáo viên');
          await loadAdmin().catch(() => {
            // Error captured in state
          });
        }
      })
      .finally(() => {
        if (active) setCheckingAuth(false);
      });
    return () => {
      active = false;
    };
  }, [adminUnavailable, loadAdmin]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.previewObjectUrl) {
        URL.revokeObjectURL(avatarPreview.previewObjectUrl);
      }
    };
  }, [avatarPreview]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoadError(null);
    setLoggingIn(true);
    try {
      const res = await adminLogin(usernameInput, passwordInput);
      setTeacherUsername(res.username);
      setPasswordInput('');
      setAuthenticated(true);
      await loadAdmin();
    } catch (err) {
      setAuthenticated(false);
      setLoginError(err instanceof Error ? err.message : 'Đăng nhập thất bại.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setAuthenticated(false);
    setData(null);
    setLoadError(null);
  };

  const handleUpload = async (
    file: File | undefined,
    folder: 'wishes' | 'avatars' | 'products' | 'memories' | 'teachers' | 'settings'
  ): Promise<string | null> => {
    if (!file) return null;
    try {
      return await uploadMediaFile(file, file.name, file.type, folder);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Tải tệp lên thất bại.');
      return null;
    }
  };

  const updateProductAttachment = async (productId: string, file?: File) => {
    if (productMediaBusy) return;
    setProductMediaBusy(true);
    try {
      const url = file ? await handleUpload(file, 'products') : null;
      if (file && !url) return;
      await adminUpdateProduct(productId, { mediaUrl: url, isDemo: false });
      await loadAdmin();
      onDataUpdated();
      showToast('success', file ? 'Đã cập nhật tệp đính kèm sản phẩm.' : 'Đã gỡ tệp đính kèm khỏi sản phẩm.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Không thể cập nhật tệp đính kèm.');
    } finally {
      setProductMediaBusy(false);
    }
  };

  const handleSelectReplacementAvatar = (student: Student, file: File | undefined) => {
    if (!file) return;
    const validation = validateStudentAvatarUpload(file.type, file.size);
    if (!validation.valid) {
      showToast('error', validation.error || 'Định dạng ảnh chưa hợp lệ.');
      return;
    }
    if (avatarPreview?.previewObjectUrl) {
      URL.revokeObjectURL(avatarPreview.previewObjectUrl);
    }
    setAvatarPreview({
      student,
      file,
      previewObjectUrl: URL.createObjectURL(file),
    });
  };

  const handleConfirmAvatarReplacement = async () => {
    if (!avatarPreview) return;
    const { student, file, previewObjectUrl } = avatarPreview;
    setConfirmingAvatarUpload(true);
    try {
      // Step 1: Upload new file first (keeps old avatar intact if upload fails)
      const uploadedUrl = await uploadMediaFile(file, file.name, file.type, 'avatars');
      // Step 2: Update only this student's avatarUrl
      await adminUpdateStudent(student.id, { avatarUrl: uploadedUrl, isDemo: false });
      URL.revokeObjectURL(previewObjectUrl);
      setAvatarPreview(null);
      await loadAdmin();
      onDataUpdated();
      showToast(
        'success',
        `Đã thay ảnh đại diện cho học sinh ${student.name}. Các học sinh khác và sản phẩm vẫn được giữ nguyên.`
      );
    } catch (err) {
      showToast(
        'error',
        `Không thể thay ảnh cho ${student.name}: ${
          err instanceof Error ? err.message : 'Lỗi tải lên'
        }. Ảnh cũ vẫn được giữ nguyên.`
      );
    } finally {
      setConfirmingAvatarUpload(false);
    }
  };

  const handleConfirmDeleteAvatar = async () => {
    if (!confirmDeleteAvatarStudent) return;
    const target = confirmDeleteAvatarStudent;
    setBusyId(target.id);
    try {
      await adminUpdateStudent(target.id, { avatarUrl: null, isDemo: true });
      setConfirmDeleteAvatarStudent(null);
      await loadAdmin();
      onDataUpdated();
      showToast('success', `Đã xóa ảnh đại diện của học sinh ${target.name}.`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Không thể xóa ảnh đại diện.');
    } finally {
      setBusyId(null);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7] p-6">
        <p className="text-base font-bold text-[#2D6228]">
          Đang kiểm tra phiên đăng nhập giáo viên...
        </p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#EAF8E6] to-[#FFFDF7] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-[32px] bg-white border-2 border-[#D2ECCB] shadow-xl p-7 sm:p-9">
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#356330] hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về báo tường</span>
            </button>
            <div className="w-10 h-10 rounded-2xl bg-[#E7F6E3] flex items-center justify-center text-[#2B6E24]">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          <h1 className="font-display font-black text-2xl text-[#1F561C]">
            Trang Quản Trị Giáo Viên
          </h1>
          <p className="mt-1.5 text-sm text-[#576E57]">
            {adminUnavailable
              ? 'Trang quản trị trên GitHub Pages cần kết nối Supabase để giáo viên đăng nhập và lưu thay đổi.'
              : 'Đăng nhập bằng tài khoản giáo viên lớp 1/8 để cập nhật 33 ảnh học sinh, sản phẩm và duyệt lời chúc 20/11.'}
          </p>

          {loginError && (
            <div
              role="alert"
              className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700"
            >
              {loginError}
            </div>
          )}

          {!adminUnavailable && (
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="admin-username"
                  className="block text-xs font-bold uppercase tracking-wider text-[#3F5C3F] mb-1.5"
                >
                  {supabaseMode ? 'Email tài khoản giáo viên' : 'Tên đăng nhập'}
                </label>
                <input
                  id="admin-username"
                  type={supabaseMode ? 'email' : 'text'}
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  required
                  placeholder={supabaseMode ? 'giaovien@truong.edu.vn' : 'giaovien'}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#CBE4C7] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#65B741]"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#3F5C3F] mb-1.5"
                >
                  Mật khẩu giáo viên
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  placeholder="Nhập mật khẩu quản trị..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#CBE4C7] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#65B741]"
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="garden-btn-primary w-full py-3 rounded-xl text-white font-display font-extrabold text-sm cursor-pointer disabled:opacity-60"
              >
                {loggingIn ? 'Đang đăng nhập...' : 'Đăng nhập quản trị'}
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF7] p-6 text-center gap-4">
        {loadError ? (
          <>
            <p className="text-base font-bold text-red-700">{loadError}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => void loadAdmin().catch(() => {})}
                className="garden-btn-primary px-5 py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer"
              >
                Thử tải lại
              </button>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="px-5 py-2.5 rounded-xl border border-[#CBE4C7] bg-white text-[#2D6228] font-bold text-sm cursor-pointer"
              >
                Quay lại đăng nhập
              </button>
            </div>
          </>
        ) : (
          <p className="text-base font-bold text-[#2D6228]">Đang tải dữ liệu quản trị...</p>
        )}
      </div>
    );
  }

  const pendingWishesCount = data.messages.filter((m) => m.status === 'pending').length;
  const approvedWishesCount = data.messages.filter((m) => m.status === 'approved').length;

  const tabs: { id: AdminTab; label: string; icon: typeof Mail; badge?: number }[] = [
    {
      id: 'wishes',
      label: 'Quản lý lời tri ân',
      icon: Mail,
      badge: pendingWishesCount,
    },
    { id: 'tree', label: 'Quản lý cây tri ân', icon: Trees },
    { id: 'students', label: 'Quản lý học sinh', icon: Users },
    { id: 'products', label: 'Quản lý sản phẩm', icon: Package },
    { id: 'memories', label: 'Quản lý album ảnh', icon: Images },
    { id: 'teachers', label: 'Quản lý 9 thầy cô', icon: BookOpen },
    { id: 'content', label: 'Cài đặt & nội dung', icon: FileText },
  ];

  const filteredWishes = data.messages.filter((m) => {
    if (wishTeacherFilter !== 'all' && m.teacherId !== wishTeacherFilter) return false;
    if (wishStatusFilter !== 'all' && m.status !== wishStatusFilter) return false;
    return true;
  });

  const treeLeavesMessages = data.messages.filter(
    (m) => m.status === 'approved' || m.status === 'hidden'
  );

  const filteredStudents = [...data.students]
    .filter((s) => s.name.toLowerCase().includes(studentSearch.trim().toLowerCase()))
    .filter((s) => {
      if (studentPhotoFilter === 'has_photo') return Boolean(s.avatarUrl);
      if (studentPhotoFilter === 'missing') return !s.avatarUrl;
      return true;
    })
    .sort((a, b) =>
      studentSort === 'name'
        ? a.name.localeCompare(b.name, 'vi')
        : a.orderNumber - b.orderNumber
    );

  const studentProducts = data.products.filter(
    (p) => p.studentId === selectedStudentForProduct
  );

  const dialogueEntries: { key: keyof DatabaseState['settings']['dialogues']; label: string }[] = [
    { key: 'home', label: 'Lời thoại Trang bìa' },
    { key: 'stage1', label: 'Lời thoại Chặng 1 (Hạt mầm đầu tiên)' },
    { key: 'stage2', label: 'Lời thoại Chặng 2 (Vườn yêu thương)' },
    { key: 'stage3', label: 'Lời thoại Chặng 3 (Dưới tán xanh)' },
    { key: 'stage4', label: 'Lời thoại Chặng 4 (Người gieo mầm)' },
    { key: 'stage5', label: 'Lời thoại Chặng 5 (Đố vui 20/11)' },
    { key: 'stage6', label: 'Lời thoại Chặng 6 (Vươn mình đón nắng)' },
  ];

  return (
    <div className="min-h-screen bg-[#F6FAF4] text-[#233824]">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#D8EBD3] px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToSite}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF8EA] text-[#235F1E] text-xs sm:text-sm font-bold hover:bg-[#DFF3D9] cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Xem báo tường</span>
          </button>
          <h1 className="font-display font-extrabold text-base sm:text-lg text-[#1F561C] truncate">
            Quản trị Mầm Xanh · {teacherUsername}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D4E6D0] text-xs sm:text-sm font-bold text-[#4B614C] hover:bg-red-50 hover:text-red-700 cursor-pointer whitespace-nowrap"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* 1. Dashboard Summary (6 KPI Cards) */}
        <section aria-label="Bảng thống kê tổng quan" className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-2xl border border-[#DCEAD8] p-4 shadow-xs">
              <p className="text-xs font-bold text-[#5E765E]">Tổng số học sinh</p>
              <p className="mt-1 font-display font-black text-2xl text-[#1F561C] tabular-nums">
                {data.students.length}
              </p>
              <p className="text-[11px] font-semibold text-[#557455] mt-0.5 tabular-nums">
                {data.students.filter((s) => s.avatarUrl).length}/{data.students.length} đã có ảnh PNG
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#DCEAD8] p-4 shadow-xs">
              <p className="text-xs font-bold text-[#5E765E]">Tổng số sản phẩm</p>
              <p className="mt-1 font-display font-black text-2xl text-[#256D1B] tabular-nums">
                {data.products.length}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#DCEAD8] p-4 shadow-xs">
              <p className="text-xs font-bold text-[#5E765E]">Ảnh kỷ niệm</p>
              <p className="mt-1 font-display font-black text-2xl text-[#0284C7] tabular-nums">
                {data.memories.length}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#DCEAD8] p-4 shadow-xs">
              <p className="text-xs font-bold text-[#5E765E]">Tổng lời tri ân</p>
              <p className="mt-1 font-display font-black text-2xl text-[#6D471B] tabular-nums">
                {data.messages.length}
              </p>
            </div>
            <div className="bg-[#FFFBEB] rounded-2xl border border-[#FDE68A] p-4 shadow-xs">
              <p className="text-xs font-bold text-[#9A5B13]">Chờ duyệt</p>
              <p className="mt-1 font-display font-black text-2xl text-[#D97706] tabular-nums">
                {pendingWishesCount}
              </p>
            </div>
            <div className="bg-[#ECFDF5] rounded-2xl border border-[#A7F3D0] p-4 shadow-xs">
              <p className="text-xs font-bold text-[#155E3A]">Đã duyệt</p>
              <p className="mt-1 font-display font-black text-2xl text-[#16A34A] tabular-nums">
                {approvedWishesCount}
              </p>
            </div>
          </div>
        </section>

        {notice && (
          <div
            role="status"
            className={`mb-5 rounded-2xl px-4 py-3 text-sm font-bold flex items-center justify-between gap-3 ${
              notice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span>{notice.text}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-xs underline cursor-pointer shrink-0"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#4E9F3D] text-white shadow-sm'
                    : 'bg-white text-[#3B553C] border border-[#D6E8D2] hover:bg-[#EEF8EA]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-300 text-amber-950 text-[11px] font-extrabold tabular-nums">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: WISHES MODERATION */}
        {activeTab === 'wishes' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-[#DCEAD8] p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  aria-label="Lọc lời chúc theo thầy cô"
                  value={wishTeacherFilter}
                  onChange={(e) => setWishTeacherFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#CFE4CB] text-sm font-semibold"
                >
                  <option value="all">Tất cả thầy cô</option>
                  {data.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Lọc lời chúc theo trạng thái"
                  value={wishStatusFilter}
                  onChange={(e) => setWishStatusFilter(e.target.value as 'all' | WishStatus)}
                  className="px-3 py-2 rounded-xl border border-[#CFE4CB] text-sm font-semibold"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="hidden">Đã ẩn</option>
                </select>
              </div>
              <p className="text-xs font-bold text-[#557154] tabular-nums">
                Hiển thị {filteredWishes.length} / {data.messages.length} lời tri ân
              </p>
            </div>

            <div className="space-y-3">
              {filteredWishes.map((wish) => (
                <div
                  key={wish.id}
                  className="bg-white rounded-2xl border border-[#DCEAD8] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg ${
                          wish.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : wish.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {wish.status === 'approved'
                          ? 'ĐÃ DUYỆT'
                          : wish.status === 'pending'
                          ? 'CHỜ DUYỆT'
                          : 'ĐÃ ẨN'}
                      </span>
                      <span className="text-[#265D21]">Học sinh: {wish.studentName}</span>
                      <span className="text-[#7B8E7B]">→</span>
                      <span className="text-[#9A5B13]">Thầy/Cô: {wish.teacherName}</span>
                    </div>

                    <p className="text-sm sm:text-base text-[#233824]">{wish.content}</p>

                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      {wish.cardImageUrl && (
                        <a
                          href={wish.cardImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[#0284C7] underline"
                        >
                          Xem ảnh thiệp đính kèm
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {wish.status !== 'approved' && (
                      <button
                        type="button"
                        disabled={busyId === wish.id}
                        onClick={async () => {
                          setBusyId(wish.id);
                          try {
                            await adminUpdateWishStatus(wish.id, 'approved');
                            await loadAdmin();
                            onDataUpdated();
                            showToast('success', 'Đã duyệt lời chúc lên Cây tri ân.');
                          } catch (err) {
                            showToast('error', (err as Error).message);
                          } finally {
                            setBusyId(null);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Duyệt</span>
                      </button>
                    )}

                    {wish.status !== 'hidden' && (
                      <button
                        type="button"
                        disabled={busyId === wish.id}
                        onClick={async () => {
                          setBusyId(wish.id);
                          try {
                            await adminUpdateWishStatus(wish.id, 'hidden');
                            await loadAdmin();
                            onDataUpdated();
                            showToast('success', 'Đã từ chối / ẩn lời chúc khỏi trang công khai.');
                          } catch (err) {
                            showToast('error', (err as Error).message);
                          } finally {
                            setBusyId(null);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold hover:bg-amber-200 cursor-pointer"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Từ chối / Ẩn</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={busyId === wish.id}
                      onClick={async () => {
                        setBusyId(wish.id);
                        try {
                          await adminDeleteWish(wish.id);
                          await loadAdmin();
                          onDataUpdated();
                          showToast('success', 'Đã xóa lời chúc.');
                        } catch (err) {
                          showToast('error', (err as Error).message);
                        } finally {
                          setBusyId(null);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TREE OF GRATITUDE MANAGEMENT */}
        {activeTab === 'tree' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#DCEAD8] p-5">
              <h2 className="font-display font-extrabold text-lg text-[#1F561C]">
                Quản lý trái tim trên Cây tri ân ({approvedWishesCount} trái tim đang hiển thị công khai)
              </h2>
              <p className="text-sm text-[#576E57] mt-1">
                Mỗi lời tri ân đã duyệt tự động nở thành một trái tim trên Cây tri ân ở Chặng 4. Giáo viên có thể ẩn hoặc hiện lại từng trái tim bất cứ lúc nào.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {treeLeavesMessages.map((heart) => {
                const isVisible = heart.status === 'approved';
                return (
                  <div
                    key={heart.id}
                    className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 ${
                      isVisible
                        ? 'bg-white border-[#FBCFE8]'
                        : 'bg-slate-50 border-slate-200 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                            isVisible
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isVisible ? 'Đang nở trái tim trên cây' : 'Đang ẩn khỏi cây'}
                        </span>
                        <span className="text-xs font-bold text-[#8B5E34]">
                          {heart.teacherName}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-[#1F561C]">
                        Học sinh: {heart.studentName}
                      </p>
                      <p className="mt-1 text-sm text-[#2F4430]">“{heart.content}”</p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={busyId === heart.id}
                        onClick={async () => {
                          setBusyId(heart.id);
                          try {
                            await adminUpdateWishStatus(
                              heart.id,
                              isVisible ? 'hidden' : 'approved'
                            );
                            await loadAdmin();
                            onDataUpdated();
                            showToast(
                              'success',
                              isVisible
                                ? 'Đã ẩn trái tim khỏi Cây tri ân.'
                                : 'Đã hiện lại trái tim trên Cây tri ân.'
                            );
                          } catch (err) {
                            showToast('error', (err as Error).message);
                          } finally {
                            setBusyId(null);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                          isVisible
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{isVisible ? 'Ẩn khỏi cây' : 'Hiện lại trên cây'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: STUDENTS MANAGEMENT & SAFE 1-BY-1 AVATAR REPLACEMENT */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Search, Sort & Photo Filter Toolbar */}
            <div className="bg-white rounded-2xl border border-[#DCEAD8] p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-[#5D7B5D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Tìm học sinh theo tên..."
                  aria-label="Tìm học sinh theo tên"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#CFE4CB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#65B741]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  aria-label="Lọc trạng thái ảnh học sinh"
                  value={studentPhotoFilter}
                  onChange={(e) =>
                    setStudentPhotoFilter(e.target.value as 'all' | 'has_photo' | 'missing')
                  }
                  className="px-3 py-2 rounded-xl border border-[#CFE4CB] text-xs sm:text-sm font-semibold"
                >
                  <option value="all">Tất cả học sinh ({data.students.length})</option>
                  <option value="has_photo">
                    Đã có ảnh PNG ({data.students.filter((s) => s.avatarUrl).length})
                  </option>
                  <option value="missing">
                    Chưa tải ảnh ({data.students.filter((s) => !s.avatarUrl).length})
                  </option>
                </select>

                <select
                  aria-label="Sắp xếp danh sách học sinh"
                  value={studentSort}
                  onChange={(e) => setStudentSort(e.target.value as 'order' | 'name')}
                  className="px-3 py-2 rounded-xl border border-[#CFE4CB] text-xs sm:text-sm font-semibold"
                >
                  <option value="order">Sắp xếp theo STT tăng dần</option>
                  <option value="name">Sắp xếp theo tên (A → Z)</option>
                </select>
              </div>
            </div>

            {/* Add student card */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newStudentName.trim() || addingStudent) return;
                setAddingStudent(true);
                try {
                  await adminCreateStudent({
                    name: newStudentName,
                    shortIntro: newStudentIntro,
                    sproutVariant: newStudentVariant,
                  });
                  setNewStudentName('');
                  setNewStudentIntro('');
                  await loadAdmin();
                  onDataUpdated();
                  showToast('success', 'Đã thêm hồ sơ học sinh mới.');
                } catch (err) {
                  showToast('error', (err as Error).message);
                } finally {
                  setAddingStudent(false);
                }
              }}
              className="bg-white rounded-2xl border border-[#DCEAD8] p-5 grid sm:grid-cols-4 gap-3 items-end"
            >
              <div>
                <label className="block text-xs font-bold text-[#496449] mb-1">
                  Họ và tên học sinh mới
                </label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                  className="w-full px-3 py-2 rounded-xl border border-[#CFE4CB] text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#496449] mb-1">
                  Giới thiệu ngắn sản phẩm
                </label>
                <input
                  type="text"
                  value={newStudentIntro}
                  onChange={(e) => setNewStudentIntro(e.target.value)}
                  placeholder="Thiệp chúc mừng 20/11"
                  className="w-full px-3 py-2 rounded-xl border border-[#CFE4CB] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#496449] mb-1">
                  Mẫu chờ trước khi tải PNG
                </label>
                <select
                  value={newStudentVariant}
                  onChange={(e) => setNewStudentVariant(e.target.value as SproutVariantId)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CFE4CB] text-sm"
                >
                  {SPROUT_VARIANTS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} ({v.accessoryLabel})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                  disabled={addingStudent}
                className="garden-btn-primary inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-bold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm học sinh</span>
              </button>
            </form>

            {/* Student Management Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((stu) => {
                const productCount = data.products.filter((p) => p.studentId === stu.id).length;
                return (
                  <div
                    key={stu.id}
                    className="bg-white rounded-2xl border border-[#DCEAD8] p-4 flex flex-col justify-between gap-3.5 shadow-xs"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Preserved aspect-ratio PNG preview */}
                      <div className="w-20 h-24 rounded-2xl bg-[#F2F9EF] border border-[#CFE4CB] overflow-hidden flex items-center justify-center p-1 shrink-0">
                        {stu.avatarUrl ? (
                          <img
                            src={stu.avatarUrl}
                            alt={`Ảnh đại diện ${stu.name}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center px-1">
                            <span className="block font-display font-black text-sm text-[#2B6E24] tabular-nums">
                              #{stu.orderNumber}
                            </span>
                            <span className="block text-[10px] font-semibold text-[#647D64]">
                              Chưa tải ảnh
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-extrabold text-[#4E9F3D] tabular-nums">
                            STT {stu.orderNumber} · {productCount} sản phẩm
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              stu.avatarUrl
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {stu.avatarUrl ? 'Ảnh PNG thật' : 'Chờ ảnh PNG'}
                          </span>
                        </div>
                        <h3 className="mt-1 font-display font-extrabold text-base text-[#1E4F1B] leading-snug">
                          {stu.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#546E55] line-clamp-2">
                          {stu.shortIntro}
                        </p>
                      </div>
                    </div>

                    {/* Explicit Required Action Buttons: XEM ẢNH, THAY ẢNH, XÓA ẢNH, SỬA THÔNG TIN */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#ECF4E9]">
                      <button
                        type="button"
                        onClick={() => setViewAvatarStudent(stu)}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-[#F4F9F2] border border-[#D4E8CE] text-[#295725] text-xs font-bold hover:bg-[#E7F4E3] cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>XEM ẢNH</span>
                      </button>

                      <label className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-[#4E9F3D] text-white text-xs font-bold hover:bg-[#3F8930] cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>THAY ẢNH</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            handleSelectReplacementAvatar(stu, e.target.files?.[0]);
                            e.currentTarget.value = '';
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        disabled={!stu.avatarUrl}
                        onClick={() => setConfirmDeleteAvatarStudent(stu)}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold hover:bg-red-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>XÓA ẢNH</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStudentEditError('');
                          setEditingStudent(stu);
                        }}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#854D0E] text-xs font-bold hover:bg-[#FEF3C7] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>SỬA THÔNG TIN</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#DCEAD8] p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <label
                  htmlFor="admin-product-student"
                  className="text-sm font-bold text-[#2D5829]"
                >
                  Chọn học sinh:
                </label>
                <select
                  id="admin-product-student"
                  value={selectedStudentForProduct}
                  onChange={(e) => setSelectedStudentForProduct(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-[#CFE4CB] text-sm font-bold"
                >
                  {data.students.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.orderNumber} · {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedStudentForProduct || !newProdTitle.trim() || productMediaBusy || creatingProduct) return;
                  setCreatingProduct(true);
                  try {
                    await adminCreateProduct({
                      studentId: selectedStudentForProduct,
                      type: newProdType,
                      title: newProdTitle,
                      description: newProdDesc,
                      mediaUrl: newProductAttachment?.url ?? null,
                    });
                    setNewProdTitle('');
                    setNewProdDesc('');
                    setNewProductAttachment(null);
                    await loadAdmin();
                    onDataUpdated();
                    showToast('success', 'Đã thêm sản phẩm mới cho học sinh.');
                  } catch (err) {
                    showToast('error', err instanceof Error ? err.message : 'Không thể thêm sản phẩm.');
                  } finally {
                    setCreatingProduct(false);
                  }
                }}
                className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-[#EAF2E8]"
              >
                <div>
                  <label className="block text-xs font-bold text-[#496449] mb-1">
                    Loại sản phẩm
                  </label>
                  <select
                    value={newProdType}
                    onChange={(e) => setNewProdType(e.target.value as ProductType)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CFE4CB] text-sm"
                  >
                    <option value="thiep">Thiệp tri ân</option>
                    <option value="tranh">Tranh vẽ</option>
                    <option value="loi_chuc">Lời chúc</option>
                    <option value="video">Video ngắn</option>
                    <option value="anh_san_pham">Ảnh sản phẩm</option>
                    <option value="bai_viet">Bài viết</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#496449] mb-1">
                    Tiêu đề sản phẩm
                  </label>
                  <input
                    type="text"
                    value={newProdTitle}
                    onChange={(e) => setNewProdTitle(e.target.value)}
                    required
                    placeholder="Ví dụ: Bức tranh vườn hoa tặng cô"
                    className="w-full px-3 py-2 rounded-xl border border-[#CFE4CB] text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#496449] mb-1">
                    Mô tả / nội dung sản phẩm
                  </label>
                  <textarea
                    rows={2}
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CFE4CB] text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EEF8EA] text-[#286323] text-xs font-bold cursor-pointer has-[:disabled]:opacity-60">
                    <Upload className="w-4 h-4" />
                    <span>{newProductAttachment ? 'Đổi ảnh hoặc video' : 'Tải ảnh hoặc video'}</span>
                    <input
                      type="file"
                      accept="image/*,video/mp4,video/webm"
                      className="sr-only"
                      disabled={productMediaBusy || creatingProduct}
                      onChange={async (e) => {
                        const file = e.currentTarget.files?.[0];
                        e.currentTarget.value = '';
                        if (!file || productMediaBusy || creatingProduct) return;
                        setProductMediaBusy(true);
                        try {
                          const url = await handleUpload(file, 'products');
                          if (url) {
                            setNewProductAttachment({
                              url,
                              name: file.name,
                              isVideo: file.type.startsWith('video/') || isProductVideo(url, 'anh_san_pham'),
                            });
                          }
                        } finally {
                          setProductMediaBusy(false);
                        }
                      }}
                    />
                  </label>
                  {newProductAttachment && (
                    <ProductAttachmentPreview
                      key={newProductAttachment.url}
                      {...newProductAttachment}
                      disabled={productMediaBusy || creatingProduct}
                      onRemove={() => setNewProductAttachment(null)}
                    />
                  )}
                </div>
                <div className="flex justify-end self-start">
                  <button
                    type="submit"
                    disabled={productMediaBusy || creatingProduct}
                    className="garden-btn-primary inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-sm font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm sản phẩm</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-3">
              {studentProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-[#DCEAD8] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#D97706]">
                        {getProductTypeLabel(prod.type)}
                      </span>
                      <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EEF8EA] text-[#286323] text-[11px] font-bold cursor-pointer">
                        <Upload className="w-3 h-3" />
                        <span>{prod.mediaUrl ? 'Đổi ảnh/video' : 'Tải ảnh/video'}</span>
                        <input
                          type="file"
                          accept="image/*,video/mp4,video/webm"
                          className="sr-only"
                          disabled={productMediaBusy}
                          onChange={(e) => {
                            const file = e.currentTarget.files?.[0];
                            e.currentTarget.value = '';
                            if (file) void updateProductAttachment(prod.id, file);
                          }}
                        />
                      </label>
                    </div>
                    {prod.mediaUrl && (
                      <ProductAttachmentPreview
                        key={prod.mediaUrl}
                        url={prod.mediaUrl}
                        name={getProductTypeLabel(prod.type) + ' · ' + prod.title}
                        isVideo={isProductVideo(prod.mediaUrl, prod.type)}
                        disabled={productMediaBusy}
                        onRemove={() => void updateProductAttachment(prod.id)}
                      />
                    )}
                    <input
                      type="text"
                      defaultValue={prod.title}
                      onBlur={async (e) => {
                        if (e.target.value !== prod.title) {
                          await adminUpdateProduct(prod.id, { title: e.target.value });
                          await loadAdmin();
                          onDataUpdated();
                          showToast('success', 'Đã cập nhật tiêu đề sản phẩm.');
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#CFE4CB] text-sm font-bold"
                    />
                    <textarea
                      rows={2}
                      defaultValue={prod.description}
                      onBlur={async (e) => {
                        if (e.target.value !== prod.description) {
                          await adminUpdateProduct(prod.id, { description: e.target.value });
                          await loadAdmin();
                          onDataUpdated();
                          showToast('success', 'Đã cập nhật mô tả sản phẩm.');
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#CFE4CB] text-xs sm:text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await adminDeleteProduct(prod.id);
                      await loadAdmin();
                      onDataUpdated();
                      showToast('success', 'Đã xóa sản phẩm.');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 cursor-pointer shrink-0"
                  >
                    Xóa sản phẩm
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MEMORIES ALBUM MANAGEMENT */}
        {activeTab === 'memories' && (
          <div className="space-y-6">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newMemCaption.trim()) return;
                await adminCreateMemory({
                  category: newMemCategory,
                  caption: newMemCaption,
                  imageUrl: newMemImageUrl,
                });
                setNewMemCaption('');
                setNewMemImageUrl(null);
                await loadAdmin();
                onDataUpdated();
                showToast('success', 'Đã thêm ảnh kỷ niệm mới.');
              }}
              className="bg-white rounded-2xl border border-[#DCEAD8] p-5 grid sm:grid-cols-4 gap-3 items-end"
            >
              <div>
                <label className="block text-xs font-bold text-[#496449] mb-1">
                  Nhóm ảnh kỷ niệm
                </label>
                <select
                  value={newMemCategory}
                  onChange={(e) => setNewMemCategory(e.target.value as MemoryCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CFE4CB] text-sm"
                >
                  {MEMORY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#496449] mb-1">
                  Chú thích ảnh
                </label>
                <input
                  type="text"
                  value={newMemCaption}
                  onChange={(e) => setNewMemCaption(e.target.value)}
                  required
                  placeholder="Mô tả khoảnh khắc đáng nhớ..."
                  className="w-full px-3 py-2 rounded-xl border border-[#CFE4CB] text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl bg-[#EEF8EA] text-[#286323] text-xs font-bold cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>{newMemImageUrl ? 'Đã chọn' : 'Tải ảnh'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const url = await handleUpload(e.target.files?.[0], 'memories');
                      if (url) setNewMemImageUrl(url);
                    }}
                  />
                </label>
                <button
                  type="submit"
                  className="garden-btn-primary px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold cursor-pointer"
                >
                  Thêm ảnh
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {data.memories.map((mem, idx) => (
                <div
                  key={mem.id}
                  className="bg-white rounded-2xl border border-[#DCEAD8] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-16 h-12 rounded-xl bg-[#F2F7F0] border border-[#DCEAD8] overflow-hidden flex items-center justify-center text-[10px] font-bold text-[#5F755F] shrink-0">
                      {mem.imageUrl ? (
                        <img
                          src={mem.imageUrl}
                          alt={mem.caption}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        'DEMO'
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <span className="text-xs font-bold text-[#8B5E34]">{mem.category}</span>
                      <input
                        type="text"
                        defaultValue={mem.caption}
                        onBlur={async (e) => {
                          if (e.target.value !== mem.caption) {
                            await adminUpdateMemory(mem.id, { caption: e.target.value });
                            await loadAdmin();
                            onDataUpdated();
                            showToast('success', 'Đã cập nhật chú thích ảnh.');
                          }
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#CFE4CB] text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label className="px-3 py-1.5 rounded-xl bg-[#EEF8EA] text-[#286323] text-xs font-bold cursor-pointer">
                      Đổi ảnh
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const url = await handleUpload(e.target.files?.[0], 'memories');
                          if (!url) return;
                          await adminUpdateMemory(mem.id, { imageUrl: url, isDemo: false });
                          await loadAdmin();
                          onDataUpdated();
                          showToast('success', 'Đã cập nhật ảnh kỷ niệm.');
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={async () => {
                        const prev = data.memories[idx - 1];
                        await adminUpdateMemory(mem.id, { orderIndex: prev.orderIndex });
                        await adminUpdateMemory(prev.id, { orderIndex: mem.orderIndex });
                        await loadAdmin();
                        onDataUpdated();
                      }}
                      aria-label="Đưa ảnh lên trước"
                      className="p-2 rounded-xl border border-[#CFE4CB] disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === data.memories.length - 1}
                      onClick={async () => {
                        const next = data.memories[idx + 1];
                        await adminUpdateMemory(mem.id, { orderIndex: next.orderIndex });
                        await adminUpdateMemory(next.id, { orderIndex: mem.orderIndex });
                        await loadAdmin();
                        onDataUpdated();
                      }}
                      aria-label="Đưa ảnh xuống sau"
                      className="p-2 rounded-xl border border-[#CFE4CB] disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await adminDeleteMemory(mem.id);
                        await loadAdmin();
                        onDataUpdated();
                        showToast('success', 'Đã xóa ảnh kỷ niệm.');
                      }}
                      aria-label="Xóa ảnh"
                      className="p-2 rounded-xl text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: TEACHERS & 9 ENVELOPES + PER-LETTER AUDIO MANAGEMENT */}
        {activeTab === 'teachers' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#DCEAD8] p-5">
              <h2 className="font-display font-extrabold text-lg text-[#1F561C]">
                Quản lý 9 thầy cô, nội dung 9 phong thư & âm thanh riêng (MP3 / M4A / WAV)
              </h2>
              <p className="text-sm text-[#576E57] mt-1">
                Mỗi phong thư giữ nguyên nội dung chữ và có thể gắn thêm 1 file ghi âm lời chúc riêng cho nút NGHE ở Chặng 4.
              </p>
            </div>

            {data.teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="bg-white rounded-2xl border border-[#DCEAD8] p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {teacher.avatarUrl && (
                      <img
                        src={teacher.avatarUrl}
                        alt={teacher.name}
                        className="w-11 h-11 rounded-full object-cover border border-[#CFE4CB]"
                      />
                    )}
                    <div>
                      <h3 className="font-display font-extrabold text-base text-[#1F561C]">
                        {teacher.orderNumber}. {teacher.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#5E735E]">{teacher.role}</p>
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF8EA] text-[#286323] text-xs font-bold cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{teacher.avatarUrl ? 'Đổi ảnh thầy/cô' : 'Tải ảnh thầy/cô'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const url = await handleUpload(e.target.files?.[0], 'teachers');
                        if (!url) return;
                        await adminUpdateTeacher(teacher.id, { avatarUrl: url });
                        await loadAdmin();
                        onDataUpdated();
                        showToast('success', `Đã cập nhật ảnh cho ${teacher.name}.`);
                      }}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  defaultValue={teacher.letterTitle}
                  aria-label={`Tiêu đề phong thư của ${teacher.name}`}
                  onBlur={async (e) => {
                    if (e.target.value !== teacher.letterTitle) {
                      await adminUpdateTeacher(teacher.id, { letterTitle: e.target.value });
                      await loadAdmin();
                      onDataUpdated();
                      showToast('success', 'Đã lưu tiêu đề thư.');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#CFE4CB] text-sm font-bold"
                />

                <textarea
                  rows={3}
                  defaultValue={teacher.letterContent}
                  aria-label={`Nội dung phong thư của ${teacher.name}`}
                  onBlur={async (e) => {
                    if (e.target.value !== teacher.letterContent) {
                      await adminUpdateTeacher(teacher.id, { letterContent: e.target.value });
                      await loadAdmin();
                      onDataUpdated();
                      showToast('success', 'Đã cập nhật nội dung phong thư.');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#CFE4CB] text-sm"
                />

                {/* Per-Letter Audio Management Slot */}
                <div className="rounded-2xl bg-[#F6FCF4] border border-[#D4ECCF] p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-[#2B6E24]" aria-hidden="true" />
                      <span className="text-xs font-extrabold text-[#1F561C]">
                        Âm thanh phong thư #{teacher.orderNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                          teacher.audioUrl
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {teacher.audioUrl ? 'Đã có âm thanh' : 'Chưa có âm thanh'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2B6E24] text-white text-xs font-bold cursor-pointer hover:bg-[#22581D]">
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {teacher.audioUrl ? 'Thay file âm thanh' : 'Tải file âm thanh'}
                        </span>
                        <input
                          type="file"
                          accept=".mp3,.m4a,.wav,audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/wav"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            e.target.value = '';
                            if (!file) return;
                            const check = validateTeacherAudioUpload(
                              file.type,
                              file.name,
                              file.size
                            );
                            if (!check.valid) {
                              showToast('error', check.error || 'Tệp âm thanh chưa hợp lệ.');
                              return;
                            }
                            setBusyId(`audio-${teacher.id}`);
                            try {
                              const mime =
                                file.type ||
                                (file.name.toLowerCase().endsWith('.m4a')
                                  ? 'audio/mp4'
                                  : file.name.toLowerCase().endsWith('.wav')
                                  ? 'audio/wav'
                                  : 'audio/mpeg');
                              const url = await uploadMediaFile(file, file.name, mime, 'teachers');
                              await adminUpdateTeacher(teacher.id, { audioUrl: url });
                              await loadAdmin();
                              onDataUpdated();
                              showToast(
                                'success',
                                `Đã cập nhật âm thanh phong thư cho ${teacher.name}.`
                              );
                            } catch (err) {
                              showToast(
                                'error',
                                err instanceof Error
                                  ? err.message
                                  : 'Không thể tải tệp âm thanh lên.'
                              );
                            } finally {
                              setBusyId(null);
                            }
                          }}
                        />
                      </label>

                      {teacher.audioUrl && (
                        <button
                          type="button"
                          disabled={busyId === `audio-${teacher.id}`}
                          onClick={async () => {
                            setBusyId(`audio-${teacher.id}`);
                            try {
                              await adminUpdateTeacher(teacher.id, { audioUrl: null });
                              await loadAdmin();
                              onDataUpdated();
                              showToast(
                                'success',
                                `Đã xóa file âm thanh của ${teacher.name}.`
                              );
                            } catch (err) {
                              showToast('error', (err as Error).message);
                            } finally {
                              setBusyId(null);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa file</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {teacher.audioUrl && (
                    <div className="pt-1">
                      <p className="text-[11px] font-bold text-[#4A684A] mb-1">
                        Nghe thử bản ghi âm:
                      </p>
                      <audio controls src={teacher.audioUrl} preload="metadata" className="w-full h-9" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 7: SETTINGS, MUSIC, COVER, PETALS & STAGE TEXT */}
        {activeTab === 'content' && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await adminUpdateSettings(data.settings);
              await loadAdmin();
              onDataUpdated();
              showToast('success', 'Đã lưu toàn bộ cài đặt và nội dung website Mầm Xanh.');
            }}
            className="bg-white rounded-2xl border border-[#DCEAD8] p-6 space-y-6"
          >
            {/* Background Music + Cover Image + Falling Petals Toggle */}
            <div className="grid md:grid-cols-2 gap-6 pb-5 border-b border-[#EAF3E7]">
              <div className="space-y-3">
                <h2 className="font-display font-extrabold text-base text-[#1F561C]">
                  Nhạc nền website (Người gieo mầm xanh)
                </h2>
                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FEF3C7] text-[#854D0E] text-xs sm:text-sm font-bold cursor-pointer">
                    <Music className="w-4 h-4" />
                    <span>Tải tệp MP3 nhạc nền mới</span>
                    <input
                      type="file"
                      accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                      className="hidden"
                      onChange={async (e) => {
                        const url = await handleUpload(e.target.files?.[0], 'settings');
                        if (!url) return;
                        await adminUpdateSettings({ musicUrl: url });
                        await loadAdmin();
                        onDataUpdated();
                        showToast('success', 'Đã cập nhật tệp nhạc nền MP3 mới.');
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      await adminUpdateSettings({
                        musicUrl: '/assets/nguoi-gieo-mam-xanh.mp3',
                      });
                      await loadAdmin();
                      onDataUpdated();
                      showToast('success', 'Đã khôi phục nhạc nền Người gieo mầm xanh mặc định.');
                    }}
                    className="px-3 py-2 rounded-xl border border-[#D4E6D0] text-xs font-bold text-[#496449] hover:bg-[#F3FAF0] cursor-pointer"
                  >
                    Dùng bản MP3 gốc
                  </button>
                </div>
                <p className="text-xs font-semibold text-[#5A725B]">
                  File hiện tại: {data.settings.musicUrl || '/assets/nguoi-gieo-mam-xanh.mp3'}
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="font-display font-extrabold text-base text-[#1F561C]">
                  Ảnh bìa Trang chủ & Hiệu ứng hoa rơi
                </h2>
                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EEF8EA] text-[#286323] text-xs sm:text-sm font-bold cursor-pointer">
                    <ImageIcon className="w-4 h-4" />
                    <span>Thay ảnh bìa mới</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const url = await handleUpload(e.target.files?.[0], 'settings');
                        if (!url) return;
                        await adminUpdateSettings({ coverImageUrl: url });
                        await loadAdmin();
                        onDataUpdated();
                        showToast('success', 'Đã cập nhật ảnh bìa mới.');
                      }}
                    />
                  </label>
                  {data.settings.coverImageUrl && (
                    <button
                      type="button"
                      onClick={async () => {
                        await adminUpdateSettings({ coverImageUrl: null });
                        await loadAdmin();
                        onDataUpdated();
                        showToast('success', 'Đã khôi phục ảnh bìa Mầm Xanh mặc định.');
                      }}
                      className="px-3 py-2 rounded-xl border border-[#D4E6D0] text-xs font-bold text-[#496449] hover:bg-[#F3FAF0] cursor-pointer"
                    >
                      Dùng ảnh bìa gốc
                    </button>
                  )}
                </div>

                <label className="inline-flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={data.settings.fallingPetalsEnabled !== false}
                    onChange={(e) =>
                      setData({
                        ...data,
                        settings: {
                          ...data.settings,
                          fallingPetalsEnabled: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-[#4E9F3D] rounded cursor-pointer"
                  />
                  <Sparkles className="w-4 h-4 text-[#EC4899]" />
                  <span className="text-sm font-bold text-[#2D4D2D]">
                    Bật hiệu ứng hoa rơi nhẹ nhàng xuyên suốt 6 chặng
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#496449] mb-1.5">
                Lời ngỏ (Chặng 1 – Hạt mầm đầu tiên)
              </label>
              <textarea
                rows={7}
                value={data.settings.introContent}
                onChange={(e) =>
                  setData({
                    ...data,
                    settings: { ...data.settings, introContent: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFE4CB] text-sm"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#496449] mb-1.5">
                  Lời kết chính (Chặng 6 – Vươn mình đón nắng)
                </label>
                <textarea
                  rows={4}
                  value={data.settings.outroQuote}
                  onChange={(e) =>
                    setData({
                      ...data,
                      settings: { ...data.settings, outroQuote: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFE4CB] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#496449] mb-1.5">
                  Dòng chữ ký kết thúc (Chặng 6)
                </label>
                <textarea
                  rows={4}
                  value={data.settings.outroClosing}
                  onChange={(e) =>
                    setData({
                      ...data,
                      settings: { ...data.settings, outroClosing: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFE4CB] text-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {dialogueEntries.map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-[#496449] mb-1">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={data.settings.dialogues[key] || ''}
                    onChange={(e) =>
                      setData({
                        ...data,
                        settings: {
                          ...data.settings,
                          dialogues: {
                            ...data.settings.dialogues,
                            [key]: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#CFE4CB] text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="garden-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-display font-extrabold text-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu tất cả cài đặt & nội dung</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* MODAL A: View Student Current Avatar (Full Aspect Ratio) */}
      {viewAvatarStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
          onClick={() => setViewAvatarStudent(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Xem ảnh đại diện ${viewAvatarStudent.name}`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white border-2 border-[#D4ECCF] p-5 shadow-2xl text-center"
          >
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#ECF4E9]">
              <h3 className="font-display font-extrabold text-base text-[#1F561C]">
                STT {viewAvatarStudent.orderNumber} · {viewAvatarStudent.name}
              </h3>
              <button
                type="button"
                onClick={() => setViewAvatarStudent(null)}
                aria-label="Đóng xem ảnh"
                className="p-1.5 rounded-xl bg-[#F4F9F2] text-[#2F5D2A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-5 rounded-2xl bg-[#F6FAF4] border border-[#DCEAD8] p-4 flex items-center justify-center min-h-[240px]">
              {viewAvatarStudent.avatarUrl ? (
                <img
                  src={viewAvatarStudent.avatarUrl}
                  alt={viewAvatarStudent.name}
                  className="max-h-72 w-auto object-contain"
                />
              ) : (
                <p className="text-sm font-semibold text-[#5E765E]">
                  Học sinh này chưa có ảnh PNG thật. Nhấn nút THAY ẢNH để tải ảnh lên.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL B: Side-by-Side Preview & Confirm Replacement Avatar */}
      {avatarPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
          onClick={() => !confirmingAvatarUpload && setAvatarPreview(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Xác nhận thay ảnh đại diện học sinh"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-3xl bg-white border-2 border-[#D4ECCF] p-6 shadow-2xl"
          >
            <h3 className="font-display font-black text-lg text-[#1F561C]">
              Xác nhận thay ảnh đại diện: {avatarPreview.student.name}
            </h3>
            <p className="text-xs sm:text-sm text-[#576E57] mt-1">
              Ảnh gốc được giữ nguyên tỷ lệ và chất lượng, chỉ cập nhật riêng cho học sinh này (không ảnh hưởng 32 học sinh khác hoặc sản phẩm).
            </p>

            <div className="grid grid-cols-2 gap-4 my-5">
              <div className="rounded-2xl bg-[#F8FAF7] border border-[#DCEAD8] p-3 text-center">
                <p className="text-xs font-bold text-[#6B7F6B] mb-2">Ảnh hiện tại</p>
                <div className="h-44 flex items-center justify-center">
                  {avatarPreview.student.avatarUrl ? (
                    <img
                      src={avatarPreview.student.avatarUrl}
                      alt="Ảnh cũ"
                      className="max-h-full w-auto object-contain"
                    />
                  ) : (
                    <span className="text-xs text-[#6B7F6B]">Chưa có ảnh PNG</span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-[#ECFDF5] border-2 border-[#65B741] p-3 text-center">
                <p className="text-xs font-bold text-[#256D1B] mb-2">Ảnh mới sẽ thay</p>
                <div className="h-44 flex items-center justify-center">
                  <img
                    src={avatarPreview.previewObjectUrl}
                    alt="Xem trước ảnh mới"
                    className="max-h-full w-auto object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                disabled={confirmingAvatarUpload}
                onClick={() => {
                  URL.revokeObjectURL(avatarPreview.previewObjectUrl);
                  setAvatarPreview(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-[#CFE4CB] bg-white text-sm font-bold text-[#496449] cursor-pointer"
              >
                HỦY
              </button>
              <button
                type="button"
                disabled={confirmingAvatarUpload}
                onClick={() => void handleConfirmAvatarReplacement()}
                className="garden-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-extrabold cursor-pointer disabled:opacity-60"
              >
                <Check className="w-4 h-4" />
                <span>{confirmingAvatarUpload ? 'Đang tải ảnh...' : 'XÁC NHẬN THAY ẢNH'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL C: Confirm Delete Student Avatar */}
      {confirmDeleteAvatarStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
          onClick={() => setConfirmDeleteAvatarStudent(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Xác nhận xóa ảnh đại diện"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white border-2 border-red-200 p-6 shadow-2xl"
          >
            <h3 className="font-display font-black text-lg text-red-700">
              Xác nhận xóa ảnh đại diện
            </h3>
            <p className="text-sm text-[#394E39] mt-2">
              Bạn có chắc chắn muốn xóa ảnh đại diện PNG của học sinh{' '}
              <strong>{confirmDeleteAvatarStudent.name}</strong> không?
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteAvatarStudent(null)}
                className="px-4 py-2 rounded-xl border border-[#CFE4CB] text-sm font-bold text-[#496449] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={busyId === confirmDeleteAvatarStudent.id}
                onClick={() => void handleConfirmDeleteAvatar()}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 cursor-pointer"
              >
                Xác nhận xóa ảnh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL D: Edit Student Details */}
      {editingStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
          onClick={() => setEditingStudent(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Sửa thông tin học sinh"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setStudentEditError('');
              try {
                await adminUpdateStudent(editingStudent.id, {
                  name: editingStudent.name,
                  orderNumber: editingStudent.orderNumber,
                  shortIntro: editingStudent.shortIntro,
                  sproutVariant: editingStudent.sproutVariant,
                });
                setEditingStudent(null);
                await loadAdmin();
                onDataUpdated();
                showToast('success', 'Đã lưu thông tin học sinh.');
              } catch (err) {
                setStudentEditError(err instanceof Error ? err.message : 'Không thể lưu thông tin học sinh.');
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white border-2 border-[#D4ECCF] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-lg text-[#1F561C]">
                Sửa thông tin học sinh
              </h3>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                aria-label="Đóng"
                className="p-1.5 rounded-xl bg-[#F4F9F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#496449] mb-1">Họ và tên</label>
              <input
                type="text"
                required
                value={editingStudent.name}
                onChange={(e) =>
                  setEditingStudent({ ...editingStudent, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#CFE4CB] text-sm font-bold"
              />
            </div>

            {studentEditError && (
              <p id="student-edit-error" role="alert" className="text-sm font-semibold text-red-700">
                {studentEditError}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#496449] mb-1">Số thứ tự</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={editingStudent.orderNumber || ''}
                  aria-invalid={Boolean(studentEditError)}
                  aria-describedby={studentEditError ? 'student-edit-error' : undefined}
                  onChange={(e) => {
                    setStudentEditError('');
                    setEditingStudent({
                      ...editingStudent,
                      orderNumber: Number(e.target.value),
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#CFE4CB] text-sm font-bold tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#496449] mb-1">Mẫu chờ</label>
                <select
                  value={editingStudent.sproutVariant}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      sproutVariant: e.target.value as SproutVariantId,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#CFE4CB] text-sm"
                >
                  {SPROUT_VARIANTS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#496449] mb-1">
                Giới thiệu ngắn sản phẩm
              </label>
              <input
                type="text"
                value={editingStudent.shortIntro}
                onChange={(e) =>
                  setEditingStudent({ ...editingStudent, shortIntro: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#CFE4CB] text-sm"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#ECF4E9]">
              <button
                type="button"
                onClick={async () => {
                  const targetName = editingStudent.name;
                  await adminDeleteStudent(editingStudent.id);
                  setEditingStudent(null);
                  await loadAdmin();
                  onDataUpdated();
                  showToast('success', `Đã xóa hồ sơ học sinh ${targetName}.`);
                }}
                className="px-3.5 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 cursor-pointer"
              >
                Xóa học sinh này
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-[#CFE4CB] text-xs font-bold text-[#496449] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="garden-btn-primary px-5 py-2 rounded-xl text-white text-xs font-extrabold cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
