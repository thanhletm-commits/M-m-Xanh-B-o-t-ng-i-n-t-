import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeQuizResult,
  computeTreeLeaves,
  evaluateQuizAnswer,
  getApprovedWishes,
  getFallingPetalCount,
  getMemoriesByCategory,
  getStudentProducts,
  getWishesByTeacher,
  MAX_UPLOAD_BYTES,
  QUIZ_BADGE_TITLE,
  QUIZ_QUESTIONS,
  validateStudentAvatarUpload,
  validateTeacherAudioUpload,
  validateUploadFile,
  validateWishSubmission,
} from './mamxanh';
import { INITIAL_SEED_DATA } from '../data/seedData';

test('seed data contains exactly 33 students, 9 teachers, MP3 music and 6 stage dialogues', () => {
  assert.equal(INITIAL_SEED_DATA.students.length, 33);
  assert.equal(INITIAL_SEED_DATA.teachers.length, 9);
  assert.equal(INITIAL_SEED_DATA.settings.musicUrl, '/assets/nguoi-gieo-mam-xanh.mp3');
  assert.equal(INITIAL_SEED_DATA.settings.fallingPetalsEnabled, true);
  assert.ok(INITIAL_SEED_DATA.settings.dialogues.stage5.length > 0);
  assert.ok(INITIAL_SEED_DATA.settings.dialogues.stage6.length > 0);
  const variantSet = new Set(INITIAL_SEED_DATA.students.map((s) => s.sproutVariant));
  assert.ok(variantSet.size >= 8, 'Should use at least 8 distinct sprout variants');
});

test('validateWishSubmission rejects empty or invalid free-text inputs and accepts any valid student & teacher names', () => {
  assert.equal(
    validateWishSubmission({
      teacherName: '',
      studentName: 'Bé Minh Anh',
      content: 'Con chúc cô nhiều sức khỏe!',
    }).valid,
    false
  );
  assert.equal(
    validateWishSubmission({
      teacherName: 'Cô Minh Thanh',
      studentName: 'A',
      content: 'Con chúc cô nhiều sức khỏe!',
    }).valid,
    false
  );
  assert.equal(
    validateWishSubmission({
      teacherName: 'Cô Minh Thanh',
      studentName: 'Bé Minh Anh',
      content: 'Hi',
    }).valid,
    false
  );
  assert.equal(
    validateWishSubmission({
      teacherName: 'Cô Minh Thanh',
      studentName: 'Bé Minh Anh',
      content: 'Xem link https://spam.example.com',
    }).valid,
    false
  );
  assert.equal(
    validateWishSubmission({
      teacherName: 'Cô giáo Hoa Hồng',
      studentName: 'Bé Bông lớp 1/8',
      content: 'Con chúc cô luôn vui vẻ và mạnh khỏe nhân ngày 20/11 ạ!',
    }).valid,
    true
  );
});

test('validateUploadFile allows valid images/audio/video and blocks oversized or unsupported files', () => {
  assert.equal(validateUploadFile('image/png', 1024 * 500).valid, true);
  assert.equal(validateUploadFile('audio/webm;codecs=opus', 1024 * 300).valid, true);
  assert.equal(validateUploadFile('application/x-msdownload', 1024).valid, false);
  assert.equal(validateUploadFile('image/jpeg', MAX_UPLOAD_BYTES + 1).valid, false);
});

test('validateStudentAvatarUpload strictly permits PNG/JPG/JPEG within 8MB', () => {
  assert.equal(validateStudentAvatarUpload('image/png', 200_000).valid, true);
  assert.equal(validateStudentAvatarUpload('image/jpeg', 200_000).valid, true);
  assert.equal(validateStudentAvatarUpload('image/gif', 200_000).valid, false);
  assert.equal(validateStudentAvatarUpload('video/mp4', 200_000).valid, false);
  assert.equal(validateStudentAvatarUpload('image/png', MAX_UPLOAD_BYTES + 10).valid, false);
});

test('only approved wishes appear publicly while pending and hidden wishes stay filtered out', () => {
  const sample = INITIAL_SEED_DATA.messages;
  const approved = getApprovedWishes(sample);
  assert.ok(approved.length > 0);
  assert.ok(approved.every((m) => m.status === 'approved'));
  assert.ok(
    sample.some((m) => m.status === 'pending'),
    'Seed data includes a pending wish for moderation check'
  );
  assert.equal(
    approved.some((m) => m.status === 'pending' || m.status === 'hidden'),
    false
  );
});

test('getWishesByTeacher filters correctly', () => {
  const tch1Approved = getWishesByTeacher(INITIAL_SEED_DATA.messages, 'tch-1', true);
  assert.ok(tch1Approved.every((w) => w.teacherId === 'tch-1' && w.status === 'approved'));
});

test('getStudentProducts returns products belonging to the selected student', () => {
  const firstStu = INITIAL_SEED_DATA.students[0];
  const items = getStudentProducts(INITIAL_SEED_DATA.products, firstStu.id);
  assert.ok(items.length >= 1);
  assert.ok(items.every((p) => p.studentId === firstStu.id));
});

test('getMemoriesByCategory orders by orderIndex and filters accurately', () => {
  const filtered = getMemoriesByCategory(INITIAL_SEED_DATA.memories, 'Những giờ học');
  assert.ok(filtered.length > 0);
  assert.ok(filtered.every((m) => m.category === 'Những giờ học'));
});

test('computeTreeLeaves maps every approved wish (including free-text wishes without teacherId) within safe canopy bounds', () => {
  const approved = [
    ...getApprovedWishes(INITIAL_SEED_DATA.messages),
    {
      id: 'msg-custom-free',
      teacherId: null,
      studentId: null,
      studentName: 'Em Bảo Ngọc',
      teacherName: 'Cô giáo Âm nhạc Lan Hương',
      content: 'Con chúc cô luôn hát hay và vui tươi mỗi ngày!',
      cardImageUrl: null,
      audioUrl: null,
      status: 'approved' as const,
      isDemo: false,
      createdAt: new Date().toISOString(),
    },
  ];
  const leaves = computeTreeLeaves(approved, INITIAL_SEED_DATA.teachers);
  assert.equal(leaves.length, approved.length);
  for (const leaf of leaves) {
    assert.ok(leaf.xPercent >= 12 && leaf.xPercent <= 88);
    assert.ok(leaf.yPercent >= 12 && leaf.yPercent <= 62);
  }
});

test('Stage 5 Quiz evaluates all 5 questions accurately and awards badge at >= 60%', () => {
  assert.equal(QUIZ_QUESTIONS.length, 5);
  assert.deepEqual(
    QUIZ_QUESTIONS.map((q) => q.correctOption),
    ['B', 'A', 'C', 'A', 'B']
  );

  const q1Correct = evaluateQuizAnswer(QUIZ_QUESTIONS[0], 'B');
  assert.equal(q1Correct.isCorrect, true);

  const q1Wrong = evaluateQuizAnswer(QUIZ_QUESTIONS[0], 'A');
  assert.equal(q1Wrong.isCorrect, false);

  const perfectResult = computeQuizResult({
    q1: 'B',
    q2: 'A',
    q3: 'C',
    q4: 'A',
    q5: 'B',
  });
  assert.equal(perfectResult.correctCount, 5);
  assert.equal(perfectResult.totalQuestions, 5);
  assert.equal(perfectResult.earnedBadge, true);
  assert.equal(perfectResult.badgeTitle, QUIZ_BADGE_TITLE);

  const partialFail = computeQuizResult({
    q1: 'A',
    q2: 'A',
    q3: 'B',
    q4: 'C',
    q5: 'A',
  });
  assert.equal(partialFail.correctCount, 1);
  assert.equal(partialFail.earnedBadge, false);
});

test('getFallingPetalCount respects desktop (20-30) and mobile (8-12) budgets', () => {
  const desktopCount = getFallingPetalCount(false);
  const mobileCount = getFallingPetalCount(true);
  assert.ok(desktopCount >= 20 && desktopCount <= 30);
  assert.ok(mobileCount >= 8 && mobileCount <= 12);
});

test('validateTeacherAudioUpload allows MP3/M4A/WAV within 8MB and blocks invalid formats or oversized files', () => {
  assert.equal(validateTeacherAudioUpload('audio/mpeg', 'loi-chuc.mp3', 500_000).valid, true);
  assert.equal(validateTeacherAudioUpload('audio/mp4', 'loi-chuc.m4a', 500_000).valid, true);
  assert.equal(validateTeacherAudioUpload('audio/wav', 'loi-chuc.wav', 500_000).valid, true);
  assert.equal(validateTeacherAudioUpload('', 'loi-chuc.m4a', 500_000).valid, true);
  assert.equal(validateTeacherAudioUpload('image/png', 'anh.png', 500_000).valid, false);
  assert.equal(
    validateTeacherAudioUpload('audio/mpeg', 'too-big.mp3', MAX_UPLOAD_BYTES + 1).valid,
    false
  );
});

test('computeTreeLeaves outputs pastel pink/peach heart colors', () => {
  const approved = getApprovedWishes(INITIAL_SEED_DATA.messages);
  const nodes = computeTreeLeaves(approved, INITIAL_SEED_DATA.teachers);
  const allowedHeartColors = ['#FB7185', '#F472B6', '#FDA4AF', '#F9A8D4', '#FB923C', '#F43F5E'];
  assert.ok(nodes.length > 0);
  assert.ok(nodes.every((n) => allowedHeartColors.includes(n.color)));
});
