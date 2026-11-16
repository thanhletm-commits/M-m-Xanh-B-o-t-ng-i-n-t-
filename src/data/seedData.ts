import type {
  DatabaseState,
  MemoryPhoto,
  Product,
  ProductType,
  SproutVariantId,
  Student,
  Teacher,
  WishMessage,
} from '../types/mamxanh';

const SPROUT_CYCLE: SproutVariantId[] = [
  'flower_sunny',
  'book_buddy',
  'artist_brush',
  'music_note',
  'sport_ball',
  'star_origami',
  'watering_can',
  'peach_ribbon',
  'backpack_explorer',
  'dew_leaf',
];

const STUDENT_ENTRIES: { name: string; intro: string; type: ProductType; title: string; body: string }[] = [
  {
    name: 'Nguyễn Hoàng Bảo An',
    intro: 'Thiệp hoa nắng tặng cô chủ nhiệm',
    type: 'thiep',
    title: 'Tấm thiệp bông hoa nắng tặng cô',
    body: 'Con vẽ bông hoa hướng dương rực rỡ để cảm ơn cô đã dạy con từng nét chữ đầu tiên ở lớp 1/8 ạ!',
  },
  {
    name: 'Trần Minh Anh',
    intro: 'Tranh vẽ khu vườn lớp 1/8',
    type: 'tranh',
    title: 'Khu vườn Mầm Xanh của chúng em',
    body: 'Bức tranh vẽ sân trường Huỳnh Ngọc Huệ buổi sáng đầy nắng và nụ cười của cô trò mình.',
  },
  {
    name: 'Lê Ngọc Gia Bảo',
    intro: 'Lời chúc 20/11 gửi thầy cô',
    type: 'loi_chuc',
    title: 'Lời chúc bé nhỏ gửi thầy cô yêu thương',
    body: 'Nhân ngày 20/11, con kính chúc thầy cô luôn mạnh khỏe, vui tươi mỗi khi đến lớp cùng chúng con.',
  },
  {
    name: 'Phạm Quỳnh Chi',
    intro: 'Bài viết ngắn về giờ Văn hóa đọc',
    type: 'bai_viet',
    title: 'Giờ đọc sách em yêu thích nhất',
    body: 'Mỗi lần nghe cô Khanh kể chuyện cổ tích, em thấy thế giới thật dịu dàng và nhiều điều kỳ diệu.',
  },
  {
    name: 'Võ Đức Duy',
    intro: 'Sản phẩm thủ công gấp sao',
    type: 'anh_san_pham',
    title: 'Hộp ngôi sao giấy ước mơ',
    body: 'Con tự tay gấp những ngôi sao nhỏ xinh bằng giấy màu để gửi tặng quý thầy cô lớp 1/8.',
  },
  {
    name: 'Nguyễn Thảo Đan',
    intro: 'Thiệp trái tim sắc màu',
    type: 'thiep',
    title: 'Trái tim yêu thương 20/11',
    body: 'Con trang trí trái tim hồng đào cùng chữ "Con yêu cô" thật nắn nót tặng cô Minh Thanh.',
  },
  {
    name: 'Huỳnh Gia Hân',
    intro: 'Tranh sáp màu cô giáo em',
    type: 'tranh',
    title: 'Cô giáo dịu hiền trên bục giảng',
    body: 'Con thích nhất nụ cười ấm áp của cô khi khen cả lớp viết chữ đẹp và ngay ngắn.',
  },
  {
    name: 'Đặng Quang Huy',
    intro: 'Lời chúc gửi thầy Thể dục',
    type: 'loi_chuc',
    title: 'Cảm ơn thầy đã dạy con chạy thật nhanh',
    body: 'Con rất thích những giờ tập thể dục vui nhộn trên sân trường cùng thầy Thái Học ạ!',
  },
  {
    name: 'Bùi Khánh Hưng',
    intro: 'Bài thơ ngắn tặng thầy cô',
    type: 'bai_viet',
    title: 'Mầm xanh lớp 1/8',
    body: 'Em là hạt mầm nhỏ / Đón nắng sớm ban mai / Nhờ bàn tay thầy cô / Em lớn lên từng ngày.',
  },
  {
    name: 'Phan Ngọc Bảo Khang',
    intro: 'Thiệp lá xanh gửi cô Toán',
    type: 'thiep',
    title: 'Bông hoa điểm mười tặng cô Trúc Mai',
    body: 'Con hứa sẽ làm thật nhiều phép tính đúng và giữ vở sạch đẹp để cô vui lòng.',
  },
  {
    name: 'Ngô Minh Khôi',
    intro: 'Tranh vẽ lớp học xanh',
    type: 'tranh',
    title: 'Góc học tập đầy nắng của lớp 1/8',
    body: 'Trong tranh có bảng xanh, phấn trắng, lọ hoa tươi và bạn bè đang giơ tay phát biểu.',
  },
  {
    name: 'Trương Hoàng Lan',
    intro: 'Lời chúc ngọt ngào 20/11',
    type: 'loi_chuc',
    title: 'Chúc mừng Ngày Nhà giáo Việt Nam',
    body: 'Con chúc các thầy cô luôn tràn đầy niềm vui và có thật nhiều kỷ niệm đẹp với lớp 1/8.',
  },
  {
    name: 'Đoàn Gia Linh',
    intro: 'Sản phẩm thiệp nổi 3D',
    type: 'anh_san_pham',
    title: 'Thiệp hoa giấy bật mở',
    body: 'Khi mở tấm thiệp ra, những cánh hoa giấy sắc màu sẽ bung nở thay lời cảm ơn của con.',
  },
  {
    name: 'Vũ Khánh Linh',
    intro: 'Tranh vẽ nốt nhạc vui',
    type: 'tranh',
    title: 'Giờ Âm nhạc rộn ràng tiếng hát',
    body: 'Con vẽ cô Hồ Lê Thi đang đánh đàn và cả lớp hát vang bài ca tri ân thầy cô.',
  },
  {
    name: 'Nguyễn Phúc Long',
    intro: 'Lời chúc gửi thầy Đạo đức',
    type: 'loi_chuc',
    title: 'Bài học làm người tốt',
    body: 'Con cảm ơn thầy Ngô Xuân Chung đã dạy con biết lễ phép, yêu thương và giúp đỡ bạn bè.',
  },
  {
    name: 'Lý Thảo My',
    intro: 'Thiệp bướm hồng đào',
    type: 'thiep',
    title: 'Cánh bướm mùa thu tặng cô',
    body: 'Con cắt dán chú bướm nhỏ đậu trên chiếc lá xanh để tặng cô giáo nhân dịp 20/11.',
  },
  {
    name: 'Hồ Hoàng Nam',
    intro: 'Bài viết về ngôi trường mến yêu',
    type: 'bai_viet',
    title: 'Buổi sáng ở trường Huỳnh Ngọc Huệ',
    body: 'Sáng nào đến cổng trường con cũng nghe tiếng chim hót và thấy thầy cô mỉm cười chào đón.',
  },
  {
    name: 'Cao Ngọc Bảo Ngọc',
    intro: 'Tranh vẽ Tiếng Anh vui nhộn',
    type: 'tranh',
    title: 'Những từ tiếng Anh đầu tiên của em',
    body: 'Cảm ơn cô Ngọc Bích đã giúp con tự tin nói lời chào và hát những bài hát tiếng Anh dễ thương.',
  },
  {
    name: 'Dương Minh Nhật',
    intro: 'Sản phẩm ghép lá cây khô',
    type: 'anh_san_pham',
    title: 'Bức tranh ghép từ lá vườn trường',
    body: 'Con nhặt những chiếc lá vàng, lá xanh rụng dưới sân để ghép thành bó hoa tặng thầy cô.',
  },
  {
    name: 'Tạ Phương Nhi',
    intro: 'Thiệp cúc họa mi trắng',
    type: 'thiep',
    title: 'Những bông cúc nhỏ tri ân',
    body: 'Con chúc cô giáo luôn xinh đẹp, dịu dàng và thật nhiều sức khỏe để dìu dắt chúng con.',
  },
  {
    name: 'Đinh Tuấn Phong',
    intro: 'Lời chúc khám phá thiên nhiên',
    type: 'loi_chuc',
    title: 'Yêu giờ Tự nhiên xã hội',
    body: 'Con cảm ơn cô Trần Kim Ngân đã dạy con biết cách chăm sóc cây xanh và bảo vệ môi trường.',
  },
  {
    name: 'Mai Ngọc Bảo Quyên',
    intro: 'Tranh vẽ cầu vồng sau mưa',
    type: 'tranh',
    title: 'Cầu vồng ước mơ lớp 1/8',
    body: 'Thầy cô giống như ánh nắng ấm giúp những hạt mầm nhỏ chúng em vươn tới cầu vồng rực rỡ.',
  },
  {
    name: 'Châu Gia Phúc',
    intro: 'Thiệp quyển vở sạch chữ đẹp',
    type: 'thiep',
    title: 'Trang vở đầu tiên con viết tặng cô',
    body: 'Con luyện viết thật tròn và đều những chữ cái đầu đời để làm món quà nhỏ tặng cô 20/11.',
  },
  {
    name: 'Lâm Bảo Quân',
    intro: 'Video đọc lời chúc ngắn',
    type: 'video',
    title: 'Lời chúc 20/11 từ bạn Bảo Quân',
    body: 'Góc chia sẻ video lời chúc ngắn của học sinh (bản mẫu DEMO chờ giáo viên tải video thật).',
  },
  {
    name: 'Nguyễn Ngọc Quỳnh',
    intro: 'Tranh vẽ giờ Mĩ thuật',
    type: 'tranh',
    title: 'Sắc màu kỳ diệu cùng cô Thu Thảo',
    body: 'Cô dạy con cách pha màu nắng vàng và xanh lá thật tươi sáng cho bức tranh vườn hoa.',
  },
  {
    name: 'Thái Minh Tâm',
    intro: 'Bài viết ngắn cảm ơn cô chủ nhiệm',
    type: 'bai_viet',
    title: 'Bàn tay cô nắm tay con viết chữ',
    body: 'Ngày đầu đi học con còn bỡ ngỡ, nhưng nhờ cô nắm tay hướng dẫn nên con đã viết được tên mình.',
  },
  {
    name: 'Tô Ngọc Thanh Thảo',
    intro: 'Thiệp hoa đào hồng phấn',
    type: 'thiep',
    title: 'Nhành hoa yêu thương gửi thầy cô',
    body: 'Con tô màu hồng đào nhẹ nhàng và vẽ thêm hai chiếc lá non giống Bé Mầm Xanh ạ!',
  },
  {
    name: 'Quách Gia Thịnh',
    intro: 'Sản phẩm mô hình chậu cây giấy',
    type: 'anh_san_pham',
    title: 'Chậu mầm xanh để bàn tặng cô',
    body: 'Con gấp chậu cây bằng giấy bìa cứng có gắn lời chúc 20/11 ngay trên chiếc lá xanh.',
  },
  {
    name: 'Lưu Minh Thư',
    intro: 'Lời chúc êm đềm ngày 20/11',
    type: 'loi_chuc',
    title: 'Gửi ngàn lời cảm ơn đến thầy cô',
    body: 'Con cảm ơn thầy cô đã luôn kiên nhẫn lắng nghe và khích lệ chúng con từng ngày.',
  },
  {
    name: 'Nguyễn Anh Tiến',
    intro: 'Tranh vẽ sân bóng rộn tiếng cười',
    type: 'tranh',
    title: 'Giờ ra chơi vui vẻ của lớp 1/8',
    body: 'Dưới tán cây xanh mát của trường, chúng con cùng chơi đùa và học bao điều hay.',
  },
  {
    name: 'Hà Ngọc Bảo Trâm',
    intro: 'Thiệp trái tim gấp cánh bướm',
    type: 'thiep',
    title: 'Cảm ơn thầy cô đã nâng bước chúng con',
    body: 'Chúc thầy cô một ngày 20/11 thật ấm áp bên những đóa hoa điểm mười của học trò.',
  },
  {
    name: 'Phùng Gia Uyên',
    intro: 'Bài viết ngắn về bạn bè lớp 1/8',
    type: 'bai_viet',
    title: 'Ngôi nhà thứ hai mang tên 1/8',
    body: 'Ở lớp 1/8 có 33 mầm xanh luôn yêu thương nhau và cùng nhau học chăm ngoan mỗi ngày.',
  },
  {
    name: 'Trần Bảo Vy',
    intro: 'Tranh vẽ mầm xanh đón nắng',
    type: 'tranh',
    title: 'Mầm xanh vươn mình dưới ánh bình minh',
    body: 'Bức tranh cuối cùng trong khu vườn thay lời chúc tốt đẹp nhất gửi đến thầy cô trường Huỳnh Ngọc Huệ.',
  },
];

const students: Student[] = STUDENT_ENTRIES.map((entry, idx) => ({
  id: `stu-${idx + 1}`,
  orderNumber: idx + 1,
  name: entry.name,
  avatarUrl: null,
  sproutVariant: SPROUT_CYCLE[idx % SPROUT_CYCLE.length],
  shortIntro: entry.intro,
  isDemo: true,
}));

const products: Product[] = STUDENT_ENTRIES.flatMap((entry, idx) => {
  const stuId = `stu-${idx + 1}`;
  const mainProduct: Product = {
    id: `prd-${idx + 1}-a`,
    studentId: stuId,
    type: entry.type,
    title: entry.title,
    description: entry.body,
    mediaUrl: null,
    isDemo: true,
    createdAt: '2026-11-10T08:00:00.000Z',
  };
  // Give several students a second product so Prev/Next navigation inside modal can be experienced immediately
  if (idx % 3 === 0) {
    const bonusProduct: Product = {
      id: `prd-${idx + 1}-b`,
      studentId: stuId,
      type: 'loi_chuc',
      title: `Lời chúc bổ sung của ${entry.name.split(' ').slice(-1)[0]}`,
      description: `Con kính chúc quý thầy cô Trường Tiểu học Huỳnh Ngọc Huệ luôn dồi dào sức khỏe, hạnh phúc và tràn ngập niềm vui bên học trò lớp 1/8!`,
      mediaUrl: null,
      isDemo: true,
      createdAt: '2026-11-11T09:00:00.000Z',
    };
    return [mainProduct, bonusProduct];
  }
  return [mainProduct];
});

const teachers: Teacher[] = [
  {
    id: 'tch-1',
    orderNumber: 1,
    name: 'Cô giáo Lê Thị Minh Thanh',
    role: 'Giáo viên chủ nhiệm lớp 1/8',
    subjectKey: 'homeroom',
    avatarUrl: null,
    accentColor: '#65B741',
    letterTitle: 'Gửi Cô giáo chủ nhiệm kính mến',
    letterContent:
      'Cô Minh Thanh ơi, từ những ngày đầu tiên bước chân vào lớp 1 còn nhiều bỡ ngỡ, chính bàn tay dịu dàng và giọng nói ấm áp của cô đã nâng đỡ chúng con từng nét chữ, từng phép tính. Nhân ngày 20/11, 33 mầm xanh lớp 1/8 xin kính chúc cô luôn mạnh khỏe, tươi trẻ và mãi là người mẹ hiền thứ hai của chúng con!',
  },
  {
    id: 'tch-2',
    orderNumber: 2,
    name: 'Cô giáo Phạm Thị Khanh',
    role: 'Giảng dạy môn Văn hóa đọc',
    subjectKey: 'reading',
    avatarUrl: null,
    accentColor: '#F59E0B',
    letterTitle: 'Tri ân Cô giáo Văn hóa đọc',
    letterContent:
      'Cảm ơn cô Phạm Thị Khanh đã mở ra trước mắt chúng con cả một thế giới diệu kỳ qua từng trang sách. Nhờ những tiết Văn hóa đọc đầy say mê của cô, chúng con biết yêu câu chữ, biết lắng nghe và ươm mầm ước mơ đẹp cho riêng mình.',
  },
  {
    id: 'tch-3',
    orderNumber: 3,
    name: 'Thầy Ngô Xuân Chung',
    role: 'Giảng dạy môn Đạo đức',
    subjectKey: 'ethics',
    avatarUrl: null,
    accentColor: '#0EA5E9',
    letterTitle: 'Kính gửi Thầy giáo dạy Đạo đức',
    letterContent:
      'Những câu chuyện giản dị mà sâu sắc trong giờ Đạo đức của thầy Ngô Xuân Chung đã giúp chúng con hiểu thế nào là lễ phép, biết yêu thương ông bà, cha mẹ và sẻ chia cùng bạn bè. Kính chúc thầy ngày 20/11 thật nhiều niềm vui và hạnh phúc!',
  },
  {
    id: 'tch-4',
    orderNumber: 4,
    name: 'Cô Vũ Thị Ngọc Bích',
    role: 'Giáo viên Tiếng Anh',
    subjectKey: 'english',
    avatarUrl: null,
    accentColor: '#EC4899',
    letterTitle: 'Gửi Cô Vũ Thị Ngọc Bích thân yêu',
    letterContent:
      'Mỗi giờ Tiếng Anh cùng cô Ngọc Bích luôn rộn ràng tiếng hát, trò chơi và những lời chào thật tự tin. Cảm ơn cô đã gieo vào lòng chúng con niềm hứng thú khám phá ngôn ngữ mới. Happy Vietnamese Teachers’ Day, dear Teacher!',
  },
  {
    id: 'tch-5',
    orderNumber: 5,
    name: 'Cô Trần Kim Ngân',
    role: 'Giáo viên Tự nhiên xã hội',
    subjectKey: 'science',
    avatarUrl: null,
    accentColor: '#10B981',
    letterTitle: 'Tri ân Cô giáo Tự nhiên xã hội',
    letterContent:
      'Nhờ những bài học gần gũi của cô Trần Kim Ngân, chúng con biết quan sát chiếc lá xanh, bầu trời trong, biết giữ gìn sức khỏe và yêu quý thiên nhiên quanh mình. Kính chúc cô luôn tràn đầy nhiệt huyết và niềm vui!',
  },
  {
    id: 'tch-6',
    orderNumber: 6,
    name: 'Cô Diệp Lệ Trúc Mai',
    role: 'Giáo viên Toán tăng cường',
    subjectKey: 'math',
    avatarUrl: null,
    accentColor: '#8B5CF6',
    letterTitle: 'Gửi Cô giáo Toán tăng cường',
    letterContent:
      'Những con số và phép tính tưởng chừng khô khan bỗng trở nên thật gần gũi và thú vị qua sự hướng dẫn tận tình của cô Diệp Lệ Trúc Mai. Cảm ơn cô đã giúp chúng con tự tin tư duy và yêu thích môn Toán hơn mỗi ngày!',
  },
  {
    id: 'tch-7',
    orderNumber: 7,
    name: 'Cô Hồ Lê Thi',
    role: 'Giáo viên Âm nhạc',
    subjectKey: 'music',
    avatarUrl: null,
    accentColor: '#F43F5E',
    letterTitle: 'Gửi Cô giáo Âm nhạc dịu hiền',
    letterContent:
      'Tiếng đàn và lời ca trong trẻo của cô Hồ Lê Thi luôn mang lại cho lớp 1/8 những giờ học ngập tràn tiếng cười. Chúc cô ngày 20/11 thật rạng rỡ và mãi giữ ngọn lửa yêu âm nhạc truyền cho bao thế hệ học trò!',
  },
  {
    id: 'tch-8',
    orderNumber: 8,
    name: 'Cô Trần Thị Thu Thảo',
    role: 'Giáo viên Mĩ thuật',
    subjectKey: 'art',
    avatarUrl: null,
    accentColor: '#FB923C',
    letterTitle: 'Tri ân Cô giáo Mĩ thuật',
    letterContent:
      'Cảm ơn cô Trần Thị Thu Thảo đã nâng niu từng nét vẽ ngây thơ và dạy chúng con phối nên những gam màu tươi sáng của tuổi thơ. Chúc cô luôn nhiều sức khỏe và có thêm thật nhiều bức tranh đẹp cùng lớp 1/8!',
  },
  {
    id: 'tch-9',
    orderNumber: 9,
    name: 'Thầy Nguyễn Thái Học',
    role: 'Giáo viên Thể dục',
    subjectKey: 'pe',
    avatarUrl: null,
    accentColor: '#14B8A6',
    letterTitle: 'Kính gửi Thầy giáo Thể dục',
    letterContent:
      'Những bài khởi động khỏe khoắn và trò chơi vận động trên sân trường cùng thầy Nguyễn Thái Học luôn giúp chúng con thêm dẻo dai, đoàn kết và hào hứng mỗi ngày đến lớp. Kính chúc thầy luôn mạnh khỏe và tràn đầy năng lượng!',
  },
];

const memories: MemoryPhoto[] = [
  {
    id: 'mem-1',
    category: 'Khoảnh khắc bên thầy cô',
    caption: 'Khoảnh khắc ấm áp bên cô giáo chủ nhiệm trong những tuần đầu lớp 1 (Ảnh mẫu DEMO)',
    imageUrl: null,
    orderIndex: 1,
    isDemo: true,
  },
  {
    id: 'mem-2',
    category: 'Khoảnh khắc bên thầy cô',
    caption: 'Cô trò lớp 1/8 cùng nhau chăm sóc góc thiên nhiên xanh mát (Ảnh mẫu DEMO)',
    imageUrl: null,
    orderIndex: 2,
    isDemo: true,
  },
  {
    id: 'mem-3',
    category: 'Những giờ học',
    caption: 'Giờ tập viết nắn nót từng con chữ đầu đời của các bạn lớp 1/8 (Ảnh mẫu DEMO)',
    imageUrl: null,
    orderIndex: 3,
    isDemo: true,
  },
  {
    id: 'mem-4',
    category: 'Những giờ học',
    caption: 'Cùng cô Văn hóa đọc khám phá những câu chuyện cổ tích hay (Ảnh mẫu DEMO)',
    imageUrl: null,
    orderIndex: 4,
    isDemo: true,
  },
  {
    id: 'mem-5',
    category: 'Hoạt động tập thể',
    caption: 'Tiếng cười giòn tan trong giờ sinh hoạt tập thể chào mừng 20/11 (Ảnh mẫu DEMO)',
    imageUrl: null,
    orderIndex: 5,
    isDemo: true,
  },
  {
    id: 'mem-6',
    category: 'Sân trường và lớp học',
    caption: 'Sân trường Tiểu học Huỳnh Ngọc Huệ rực nắng sớm mai (Ảnh mẫu DEMO)',
    imageUrl: null,
    orderIndex: 6,
    isDemo: true,
  },
  {
    id: 'mem-7',
    category: 'Những kỷ niệm đáng nhớ',
    caption: 'Ngày hội làm thiệp tri ân tặng quý thầy cô của 33 mầm xanh (Ảnh mẫu DEMO)',
    imageUrl: null,
    orderIndex: 7,
    isDemo: true,
  },
];

const messages: WishMessage[] = [
  {
    id: 'msg-1',
    teacherId: 'tch-1',
    studentId: 'stu-1',
    studentName: 'Nguyễn Hoàng Bảo An',
    teacherName: 'Cô giáo Lê Thị Minh Thanh',
    content: 'Con chúc cô Minh Thanh ngày 20/11 thật nhiều niềm vui và luôn mạnh khỏe ạ! (Mẫu DEMO)',
    cardImageUrl: null,
    audioUrl: null,
    status: 'approved',
    isDemo: true,
    createdAt: '2026-11-12T08:30:00.000Z',
  },
  {
    id: 'msg-2',
    teacherId: 'tch-2',
    studentId: 'stu-4',
    studentName: 'Phạm Quỳnh Chi',
    teacherName: 'Cô giáo Phạm Thị Khanh',
    content: 'Con rất thích nghe cô Khanh kể chuyện trong giờ đọc sách. Con chúc cô luôn vui vẻ! (Mẫu DEMO)',
    cardImageUrl: null,
    audioUrl: null,
    status: 'approved',
    isDemo: true,
    createdAt: '2026-11-12T09:15:00.000Z',
  },
  {
    id: 'msg-3',
    teacherId: 'tch-3',
    studentId: 'stu-15',
    studentName: 'Nguyễn Phúc Long',
    teacherName: 'Thầy Ngô Xuân Chung',
    content: 'Con cảm ơn thầy Chung đã dạy con những bài học đạo đức thật ý nghĩa ạ! (Mẫu DEMO)',
    cardImageUrl: null,
    audioUrl: null,
    status: 'approved',
    isDemo: true,
    createdAt: '2026-11-12T10:00:00.000Z',
  },
  {
    id: 'msg-4',
    teacherId: 'tch-4',
    studentId: 'stu-18',
    studentName: 'Cao Ngọc Bảo Ngọc',
    teacherName: 'Cô Vũ Thị Ngọc Bích',
    content: 'Con chúc cô Ngọc Bích luôn xinh đẹp và dạy chúng con thật nhiều bài hát tiếng Anh hay ạ! (Mẫu DEMO)',
    cardImageUrl: null,
    audioUrl: null,
    status: 'approved',
    isDemo: true,
    createdAt: '2026-11-12T11:20:00.000Z',
  },
  {
    id: 'msg-5',
    teacherId: 'tch-7',
    studentId: 'stu-14',
    studentName: 'Vũ Khánh Linh',
    teacherName: 'Cô Hồ Lê Thi',
    content: 'Con yêu những tiết Âm nhạc rộn ràng cùng cô Thi lắm ạ! Chúc cô 20/11 thật hạnh phúc! (Mẫu DEMO)',
    cardImageUrl: null,
    audioUrl: null,
    status: 'approved',
    isDemo: true,
    createdAt: '2026-11-12T14:00:00.000Z',
  },
  {
    id: 'msg-6',
    teacherId: 'tch-8',
    studentId: 'stu-25',
    studentName: 'Nguyễn Ngọc Quỳnh',
    teacherName: 'Cô Trần Thị Thu Thảo',
    content: 'Con cảm ơn cô Thu Thảo đã dạy con vẽ những bông hoa thật xinh tặng mẹ và thầy cô! (Mẫu DEMO)',
    cardImageUrl: null,
    audioUrl: null,
    status: 'approved',
    isDemo: true,
    createdAt: '2026-11-12T15:10:00.000Z',
  },
  {
    id: 'msg-7',
    teacherId: 'tch-9',
    studentId: 'stu-8',
    studentName: 'Đặng Quang Huy',
    teacherName: 'Thầy Nguyễn Thái Học',
    content: 'Con chúc thầy Thái Học luôn khỏe mạnh để chơi thể thao cùng lớp 1/8 mỗi tuần ạ! (Mẫu DEMO)',
    cardImageUrl: null,
    audioUrl: null,
    status: 'pending',
    isDemo: true,
    createdAt: '2026-11-13T07:45:00.000Z',
  },
];

export const INITIAL_SEED_DATA: DatabaseState = {
  students,
  products,
  teachers,
  messages,
  memories,
  settings: {
    introTitle: 'HẠT MẦM ĐẦU TIÊN',
    introContent: `Có những hạt mầm được gieo xuống từ đất mẹ, lớn lên nhờ nắng ấm và những giọt mưa lành. Cũng có những hạt mầm được gieo từ tình yêu thương, từ sự tận tụy và những bài học đầu tiên của thầy cô.

Trong hành trình trưởng thành của mỗi chúng em, thầy cô chính là những người lặng lẽ vun trồng, chăm sóc và chắp cánh cho những ước mơ.

Nhân ngày Nhà giáo Việt Nam 20/11, chúng em xin gửi đến thầy cô những tình cảm yêu thương và lòng biết ơn chân thành nhất.

Báo tường điện tử MẦM XANH là món quà nhỏ được kết nên từ những bức tranh, tấm thiệp, lời chúc và những kỷ niệm đáng nhớ của tập thể lớp 1/8.

Mỗi sản phẩm là một hạt mầm yêu thương. Mỗi lời chúc là một bông hoa đẹp. Tất cả cùng tạo nên khu vườn tri ân dành tặng những người đã tận tâm gieo mầm tri thức.

Chúng em yêu thương và kính tặng thầy cô!`,
    introSignature: 'Tập thể học sinh lớp 1/8.',
    outroQuote: `Mỗi hạt mầm hôm nay sẽ lớn lên thành những chồi xanh của ngày mai.

Những bài học, tình yêu thương và sự tận tâm của thầy cô sẽ luôn là hành trang quý giá trên hành trình trưởng thành của chúng em.

Nhân ngày Nhà giáo Việt Nam 20/11, chúng em kính chúc thầy cô luôn mạnh khỏe, hạnh phúc và thành công.`,
    outroClosing: `MẦM XANH – Ươm yêu thương, Gặt tương lai.

Tập thể học sinh lớp 1/8 kính tặng!`,
    musicTitle: 'Người gieo mầm xanh – Hoàng Dũng (Piano)',
    musicUrl: '/assets/nguoi-gieo-mam-xanh.mp3',
    coverImageUrl: null,
    fallingPetalsEnabled: true,
    dialogues: {
      home: 'Xin chào! Mình là Mầm Xanh. Hôm nay, mình sẽ cùng bạn khám phá khu vườn yêu thương của lớp 1/8 nhé!',
      stage1:
        'Mỗi hành trình đẹp đều bắt đầu từ một hạt mầm yêu thương. Cùng mình mở lá thư lời ngỏ nhé!',
      stage2:
        'Đây là khu vườn yêu thương của chúng mình! Mỗi bạn nhỏ mang một món quà tri ân thầy cô. Bạn hãy chạm vào từng bạn để khám phá nhé!',
      stage3:
        'Cùng mình ngắm nhìn những khoảnh khắc thật đẹp dưới mái trường nhé! Những điều bình dị hôm nay sẽ trở thành miền ký ức của ngày mai.',
      stage4:
        'Mình có 9 phong thư và Cây tri ân thật đặc biệt dành cho thầy cô. Bạn hãy mở thư hoặc nhấn Gửi lời chúc nhé!',
      stage5:
        'Đến góc trò chơi Đố vui 20/11 rồi! Trả lời cùng Mầm Xanh 5 câu hỏi để nhận huy hiệu Nhà Thông Thái Nhí nhé!',
      stage6:
        'Cảm ơn thầy cô đã gieo những hạt mầm yêu thương và giúp chúng mình vươn mình đón nắng mỗi ngày!',
    },
  },
};
