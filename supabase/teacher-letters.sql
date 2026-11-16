-- Nine teacher envelopes transcribed from the original HTML. Keep edits already saved.
insert into public.teachers (id, order_number, name, role, subject_key, accent_color, letter_title, letter_content)
values
  ('tch-1', 1, 'Cô giáo Lê Thị Minh Thanh', 'Giáo viên chủ nhiệm lớp 1/8', 'homeroom', '#65B741', '', 'Kính gửi Cô giáo Lê Thị Minh Thanh,

(Nội dung DEMO – giáo viên cập nhật lời tri ân trong trang quản trị.)'),
  ('tch-2', 2, 'Cô giáo Phạm Thị Khanh', 'Giảng dạy môn Văn hóa đọc', 'reading', '#F59E0B', '', 'Kính gửi Cô giáo Phạm Thị Khanh,

(Nội dung DEMO – giáo viên cập nhật lời tri ân trong trang quản trị.)'),
  ('tch-3', 3, 'Thầy Ngô Xuân Chung', 'Giảng dạy môn Đạo đức', 'ethics', '#0EA5E9', '', 'Kính gửi Thầy Ngô Xuân Chung,

(Nội dung DEMO – giáo viên cập nhật lời tri ân trong trang quản trị.)'),
  ('tch-4', 4, 'Cô Vũ Thị Ngọc Bích', 'Giáo viên Tiếng Anh', 'english', '#EC4899', '', 'Kính gửi Cô Vũ Thị Ngọc Bích,

(Nội dung DEMO – giáo viên cập nhật lời tri ân trong trang quản trị.)'),
  ('tch-5', 5, 'Cô Trần Kim Ngân', 'Giáo viên Tự nhiên xã hội', 'science', '#10B981', '', 'Kính gửi Cô Trần Kim Ngân,

(Nội dung DEMO – giáo viên cập nhật lời tri ân trong trang quản trị.)'),
  ('tch-6', 6, 'Cô Diệp Lệ Trúc Mai', 'Giáo viên Toán tăng cường', 'math', '#8B5CF6', '', 'Kính gửi Cô Diệp Lệ Trúc Mai,

(Nội dung DEMO – giáo viên cập nhật lời tri ân trong trang quản trị.)'),
  ('tch-7', 7, 'Cô Hồ Lê Thi', 'Giáo viên Âm nhạc', 'music', '#F43F5E', '', 'Kính gửi Cô Hồ Lê Thi,

(Nội dung DEMO – giáo viên cập nhật lời tri ân trong trang quản trị.)'),
  ('tch-8', 8, 'Cô Trần Thị Thu Thảo', 'Giáo viên Mĩ thuật', 'art', '#FB923C', '', 'Kính gửi Cô Trần Thị Thu Thảo,

(Nội dung DEMO – giáo viên cập nhật lời tri ân trong trang quản trị.)'),
  ('tch-9', 9, 'Thầy Nguyễn Thái Học', 'Giáo viên Thể dục', 'pe', '#14B8A6', '', 'Kính gửi Thầy Nguyễn Thái Học,

(Nội dung DEMO – giáo viên cập nhật lời tri ân trong trang quản trị.)')
on conflict (id) do nothing;
