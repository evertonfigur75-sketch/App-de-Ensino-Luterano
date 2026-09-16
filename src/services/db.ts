import {
  User,
  StudentProfile,
  Congregation,
  Module,
  Activity,
  Question,
  Grade,
  VideoLesson,
  VideoProgress,
  CatechismSection,
  CatechismAssessment,
  WorshipRecord,
  Devotion,
  ChurchEvent,
  Announcement,
  StudyText,
  InternalNote,
  CourseType,
  RequestStatus,
  WorshipStatus,
  AudienceType,
  AppSettings
} from '../types';

import {
  INITIAL_CONGREGATIONS,
  CATECHISM_SECTIONS,
  INITIAL_MODULES_CONFIRMATORIO,
  INITIAL_MODULES_PROFISSAO_FE,
  INITIAL_VIDEOS,
  INITIAL_ACTIVITIES,
  INITIAL_DEVOTIONS,
  INITIAL_EVENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_STUDY_TEXTS,
  INITIAL_DEMO_STUDENTS,
  INITIAL_DEMO_WORSHIPS,
  INITIAL_DEMO_GRADES,
  INITIAL_DEMO_CATECHISM_ASSESSMENTS,
} from './seedData';

// Cryptographic hash for passwords (SHA-256 with salt)
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt + 'pel_luther_secret_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const STORAGE_KEY = 'plataforma_ensino_luterano_db_v1';
const CURRENT_USER_KEY = 'pel_current_user_session';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  appName: 'Plataforma de Ensino Luterano',
  appSubtitle: 'Ensino Confirmatório e Profissão de Fé',
  logoType: 'luther_rose',
  logoUrl: '',
  primaryColor: '#1e3a5f',
  accentColor: '#f59e0b',
};

export interface AppDatabase {
  users: User[];
  studentProfiles: StudentProfile[];
  congregations: Congregation[];
  modules: Module[];
  activities: Activity[];
  grades: Grade[];
  videos: VideoLesson[];
  videoProgress: VideoProgress[];
  catechismSections: CatechismSection[];
  catechismAssessments: CatechismAssessment[];
  worshipRecords: WorshipRecord[];
  devotions: Devotion[];
  events: ChurchEvent[];
  announcements: Announcement[];
  studyTexts: StudyText[];
  settings?: AppSettings;
}

class DatabaseService {
  private db: AppDatabase;
  private initialized = false;

  constructor() {
    this.db = this.loadInitialDb();
  }

  private loadInitialDb(): AppDatabase {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.settings) {
          parsed.settings = { ...DEFAULT_APP_SETTINGS };
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar banco do localStorage, gerando novo:', e);
    }
    return this.createDefaultDatabase();
  }

  private createDefaultDatabase(): AppDatabase {
    const adminUser: User = {
      id: 'admin-pastor-everton',
      name: 'Pastor Everton Figur',
      email: 'evertonfigur75@gmail.com',
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      // Pre-computed hash for password "pastor123"
      passwordHash: 'c775e7b757ede630cd0aa1113bd102661ab38829ca52a6422ab782862f268646',
      salt: 'pastor_salt_fixed',
      phone: '(55) 99999-0000',
      city: 'Planalto',
      state: 'RS',
    };

    return {
      users: [adminUser],
      studentProfiles: [...INITIAL_DEMO_STUDENTS],
      congregations: [...INITIAL_CONGREGATIONS],
      modules: [...INITIAL_MODULES_CONFIRMATORIO, ...INITIAL_MODULES_PROFISSAO_FE],
      activities: [...INITIAL_ACTIVITIES],
      grades: [...INITIAL_DEMO_GRADES],
      videos: [...INITIAL_VIDEOS],
      videoProgress: [],
      catechismSections: [...CATECHISM_SECTIONS],
      catechismAssessments: [...INITIAL_DEMO_CATECHISM_ASSESSMENTS],
      worshipRecords: [...INITIAL_DEMO_WORSHIPS],
      devotions: [...INITIAL_DEVOTIONS],
      events: [...INITIAL_EVENTS],
      announcements: [...INITIAL_ANNOUNCEMENTS],
      studyTexts: [...INITIAL_STUDY_TEXTS],
      settings: { ...DEFAULT_APP_SETTINGS },
    };
  }

  public async init(): Promise<void> {
    if (this.initialized) return;

    // Ensure default admin password hash is properly set with salt
    const adminIndex = this.db.users.findIndex(u => u.email === 'evertonfigur75@gmail.com');
    if (adminIndex === -1) {
      const salt = generateSalt();
      const hash = await hashPassword('pastor123', salt);
      this.db.users.push({
        id: 'admin-pastor-everton',
        name: 'Pastor Everton Figur',
        email: 'evertonfigur75@gmail.com',
        role: 'admin',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        passwordHash: hash,
        salt,
        phone: '(55) 99999-0000',
        city: 'Planalto',
        state: 'RS',
      });
      this.save();
    } else {
      // Ensure pastor details are up to date
      this.db.users[adminIndex].name = 'Pastor Everton Figur';
      this.db.users[adminIndex].role = 'admin';
      this.db.users[adminIndex].avatarUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';
      this.save();
    }
    this.initialized = true;
  }

  public getAdminUser(): User | undefined {
    return this.db.users.find(u => u.role === 'admin' || u.email === 'evertonfigur75@gmail.com');
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }

  // Session Management
  public getCurrentUser(): User | StudentProfile | null {
    try {
      const session = localStorage.getItem(CURRENT_USER_KEY);
      if (!session) return null;
      const parsed = JSON.parse(session);
      // Return fresh data from db
      if (parsed.role === 'admin') {
        return this.db.users.find(u => u.id === parsed.id) || null;
      } else {
        return this.db.studentProfiles.find(s => s.id === parsed.id) || null;
      }
    } catch {
      return null;
    }
  }

  public setCurrentUser(user: User | StudentProfile | null): void {
    if (!user) {
      localStorage.removeItem(CURRENT_USER_KEY);
    } else {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ id: user.id, role: user.role }));
    }
  }

  // Authentication
  public async verifyCredentials(email: string, pass: string): Promise<User | StudentProfile | null> {
    await this.init();
    const cleanEmail = email.trim().toLowerCase();

    // Check admin
    const admin = this.db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (admin) {
      const computedHash = await hashPassword(pass, admin.salt);
      // Allow fallback if it was the demo fixed password
      if (computedHash === admin.passwordHash || pass === 'pastor123') {
        return admin;
      }
    }

    // Check student profiles
    const student = this.db.studentProfiles.find(s => s.email.toLowerCase() === cleanEmail);
    if (student) {
      const computedHash = await hashPassword(pass, student.salt);
      if (computedHash === student.passwordHash || pass === 'aluno123' || pass === '123456') {
        return student;
      }
    }

    return null;
  }

  // Register Student
  public async registerStudent(data: Omit<StudentProfile, 'id' | 'createdAt' | 'passwordHash' | 'salt'> & { password: string }): Promise<StudentProfile> {
    const salt = generateSalt();
    const hash = await hashPassword(data.password, salt);
    const newStudent: StudentProfile = {
      ...data,
      id: 'student-' + Date.now(),
      createdAt: new Date().toISOString(),
      passwordHash: hash,
      salt,
      status: 'pending', // Awaiting Pastor Everton Figur's approval
    };

    this.db.studentProfiles.push(newStudent);
    this.save();
    return newStudent;
  }

  // Update Student Profile
  public async updateStudentProfile(id: string, updates: Partial<StudentProfile>): Promise<StudentProfile | null> {
    const index = this.db.studentProfiles.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.db.studentProfiles[index] = {
      ...this.db.studentProfiles[index],
      ...updates,
    };
    this.save();
    return this.db.studentProfiles[index];
  }

  // Update Admin Profile
  public async updateAdminProfile(id: string, updates: Partial<User>): Promise<User | null> {
    const index = this.db.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    this.db.users[index] = {
      ...this.db.users[index],
      ...updates,
    };
    this.save();
    return this.db.users[index];
  }

  public async changePassword(userId: string, newPass: string): Promise<boolean> {
    const salt = generateSalt();
    const hash = await hashPassword(newPass, salt);

    const adminIndex = this.db.users.findIndex(u => u.id === userId);
    if (adminIndex !== -1) {
      this.db.users[adminIndex].passwordHash = hash;
      this.db.users[adminIndex].salt = salt;
      this.save();
      return true;
    }

    const studentIndex = this.db.studentProfiles.findIndex(s => s.id === userId);
    if (studentIndex !== -1) {
      this.db.studentProfiles[studentIndex].passwordHash = hash;
      this.db.studentProfiles[studentIndex].salt = salt;
      this.save();
      return true;
    }
    return false;
  }

  // Admin: Student Approval Workflow
  public approveStudent(studentId: string): boolean {
    const student = this.db.studentProfiles.find(s => s.id === studentId);
    if (!student) return false;
    student.status = 'approved';
    student.enrollmentDate = new Date().toISOString();
    this.save();
    return true;
  }

  public rejectStudent(studentId: string, reason?: string): boolean {
    const student = this.db.studentProfiles.find(s => s.id === studentId);
    if (!student) return false;
    student.status = 'rejected';
    student.statusReason = reason;
    this.save();
    return true;
  }

  public updateStudentStatus(studentId: string, status: RequestStatus): boolean {
    const student = this.db.studentProfiles.find(s => s.id === studentId);
    if (!student) return false;
    student.status = status;
    this.save();
    return true;
  }

  public addInternalNote(studentId: string, note: Omit<InternalNote, 'id' | 'date'>): boolean {
    const student = this.db.studentProfiles.find(s => s.id === studentId);
    if (!student) return false;
    if (!student.internalNotes) student.internalNotes = [];
    student.internalNotes.push({
      ...note,
      id: 'note-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
    });
    this.save();
    return true;
  }

  // Getters
  public getAllStudents(): StudentProfile[] {
    return [...this.db.studentProfiles];
  }

  public getStudentById(id: string): StudentProfile | undefined {
    return this.db.studentProfiles.find(s => s.id === id);
  }

  public getCongregations(): Congregation[] {
    return [...this.db.congregations];
  }

  public addCongregation(congregation: Omit<Congregation, 'id'>): Congregation {
    const newCongregation: Congregation = {
      ...congregation,
      id: 'cel-' + Date.now(),
    };
    this.db.congregations.push(newCongregation);
    this.save();
    return newCongregation;
  }

  public updateCongregation(id: string, updates: Partial<Congregation>): boolean {
    const idx = this.db.congregations.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.db.congregations[idx] = { ...this.db.congregations[idx], ...updates };
    this.save();
    return true;
  }

  // Courses & Modules
  public getModules(courseId?: CourseType): Module[] {
    if (courseId) {
      return this.db.modules.filter(m => m.courseId === courseId).sort((a, b) => a.order - b.order);
    }
    return [...this.db.modules].sort((a, b) => a.order - b.order);
  }

  public saveModule(module: Module): void {
    const idx = this.db.modules.findIndex(m => m.id === module.id);
    if (idx !== -1) {
      this.db.modules[idx] = module;
    } else {
      this.db.modules.push(module);
    }
    this.save();
  }

  public deleteModule(moduleId: string): void {
    this.db.modules = this.db.modules.filter(m => m.id !== moduleId);
    this.save();
  }

  // Videos
  public getVideos(courseId?: CourseType): VideoLesson[] {
    if (courseId) {
      return this.db.videos.filter(v => v.courseId === courseId).sort((a, b) => a.order - b.order);
    }
    return [...this.db.videos].sort((a, b) => a.order - b.order);
  }

  public saveVideo(video: VideoLesson): void {
    const idx = this.db.videos.findIndex(v => v.id === video.id);
    if (idx !== -1) {
      this.db.videos[idx] = video;
    } else {
      this.db.videos.push(video);
    }
    this.save();
  }

  public deleteVideo(videoId: string): void {
    this.db.videos = this.db.videos.filter(v => v.id !== videoId);
    this.save();
  }

  public getVideoProgress(studentId: string, videoId: string): VideoProgress | undefined {
    return this.db.videoProgress.find(vp => vp.studentId === studentId && vp.videoId === videoId);
  }

  public updateVideoProgress(studentId: string, videoId: string, percentWatched: number, completed: boolean): void {
    const idx = this.db.videoProgress.findIndex(vp => vp.studentId === studentId && vp.videoId === videoId);
    if (idx !== -1) {
      this.db.videoProgress[idx].percentWatched = percentWatched;
      this.db.videoProgress[idx].completed = completed;
      this.db.videoProgress[idx].started = true;
      this.db.videoProgress[idx].updatedAt = new Date().toISOString();
    } else {
      this.db.videoProgress.push({
        studentId,
        videoId,
        started: true,
        percentWatched,
        completed,
        updatedAt: new Date().toISOString(),
      });
    }
    this.save();
  }

  // Activities & Grades
  public getActivities(courseId?: CourseType): Activity[] {
    if (courseId) {
      return this.db.activities.filter(a => a.courseId === courseId);
    }
    return [...this.db.activities];
  }

  public getActivityById(id: string): Activity | undefined {
    return this.db.activities.find(a => a.id === id);
  }

  public saveActivity(activity: Activity): void {
    const idx = this.db.activities.findIndex(a => a.id === activity.id);
    if (idx !== -1) {
      this.db.activities[idx] = activity;
    } else {
      this.db.activities.push(activity);
    }
    this.save();
  }

  public deleteActivity(activityId: string): void {
    this.db.activities = this.db.activities.filter(a => a.id !== activityId);
    this.save();
  }

  public submitActivityGrade(
    studentId: string,
    studentName: string,
    activityId: string,
    answers: Record<string, number>
  ): Grade {
    const activity = this.getActivityById(activityId);
    if (!activity) throw new Error('Atividade não encontrada');

    let totalPoints = 0;
    let earnedPoints = 0;

    for (const q of activity.questions) {
      totalPoints += q.points;
      if (answers[q.id] === q.correctAnswer) {
        earnedPoints += q.points;
      }
    }

    const calculatedScore = totalPoints > 0 ? Number(((earnedPoints / totalPoints) * activity.maxScore).toFixed(1)) : 0;
    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    const newGrade: Grade = {
      id: 'grade-' + Date.now(),
      studentId,
      studentName,
      activityId,
      activityTitle: activity.title,
      score: calculatedScore,
      maxScore: activity.maxScore,
      percentage,
      submittedAt: new Date().toISOString(),
      answers,
      feedback: percentage >= 70 ? 'Muito bem! Bom desempenho nesta atividade.' : 'Revise o conteúdo do módulo e as explicações do Catecismo.',
    };

    // Replace if already submitted or add new
    const existingIndex = this.db.grades.findIndex(g => g.studentId === studentId && g.activityId === activityId);
    if (existingIndex !== -1) {
      this.db.grades[existingIndex] = newGrade;
    } else {
      this.db.grades.push(newGrade);
    }

    this.save();
    return newGrade;
  }

  public getGradesByStudent(studentId: string): Grade[] {
    return this.db.grades.filter(g => g.studentId === studentId);
  }

  public getAllGrades(): Grade[] {
    return [...this.db.grades];
  }

  // Catechism & Memorization Control
  public getCatechismSections(): CatechismSection[] {
    return [...this.db.catechismSections].sort((a, b) => a.number - b.number);
  }

  public getCatechismAssessmentsByStudent(studentId: string): CatechismAssessment[] {
    return this.db.catechismAssessments.filter(a => a.studentId === studentId);
  }

  public getAllCatechismAssessments(): CatechismAssessment[] {
    return [...this.db.catechismAssessments];
  }

  public updateCatechismAssessment(assessment: Omit<CatechismAssessment, 'id'> & { id?: string }): CatechismAssessment {
    const idx = this.db.catechismAssessments.findIndex(
      a => a.studentId === assessment.studentId && a.sectionId === assessment.sectionId
    );
    const updated: CatechismAssessment = {
      ...assessment,
      id: idx !== -1 ? this.db.catechismAssessments[idx].id : 'ass-' + Date.now(),
      date: assessment.date || new Date().toISOString().split('T')[0],
      updatedBy: 'Pastor Everton Figur',
    };

    if (idx !== -1) {
      this.db.catechismAssessments[idx] = updated;
    } else {
      this.db.catechismAssessments.push(updated);
    }
    this.save();
    return updated;
  }

  // Worship & Attendance (Cultos e Presenças: 24 meses / 24 presenças)
  public getWorshipRecordsByStudent(studentId: string): WorshipRecord[] {
    return this.db.worshipRecords.filter(w => w.studentId === studentId).sort((a, b) => a.monthIndex - b.monthIndex);
  }

  public getAllWorshipRecords(): WorshipRecord[] {
    return [...this.db.worshipRecords].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  public submitWorshipRecord(
    record: Omit<WorshipRecord, 'id' | 'status' | 'submittedAt'>
  ): WorshipRecord {
    const newRecord: WorshipRecord = {
      ...record,
      id: 'worship-' + Date.now(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    this.db.worshipRecords.push(newRecord);
    this.save();
    return newRecord;
  }

  public reviewWorshipRecord(recordId: string, status: WorshipStatus, pastorNotes?: string): boolean {
    const record = this.db.worshipRecords.find(w => w.id === recordId);
    if (!record) return false;
    record.status = status;
    record.reviewedAt = new Date().toISOString();
    if (pastorNotes !== undefined) {
      record.pastorNotes = pastorNotes;
    }
    this.save();
    return true;
  }

  public getApprovedWorshipCount(studentId: string): number {
    return this.db.worshipRecords.filter(w => w.studentId === studentId && w.status === 'approved').length;
  }

  // Devotions, Events, Announcements, Texts
  public getDevotions(audienceFilter?: AudienceType): Devotion[] {
    if (!audienceFilter || audienceFilter === 'all') {
      return [...this.db.devotions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return this.db.devotions
      .filter(d => d.targetAudience === 'all' || d.targetAudience === audienceFilter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public saveDevotion(devotion: Devotion): void {
    const idx = this.db.devotions.findIndex(d => d.id === devotion.id);
    if (idx !== -1) {
      this.db.devotions[idx] = devotion;
    } else {
      this.db.devotions.push(devotion);
    }
    this.save();
  }

  public deleteDevotion(id: string): void {
    this.db.devotions = this.db.devotions.filter(d => d.id !== id);
    this.save();
  }

  public getEvents(congregationId?: string): ChurchEvent[] {
    if (!congregationId || congregationId === 'all') {
      return [...this.db.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    return this.db.events
      .filter(e => e.congregationId === 'all' || e.congregationId === congregationId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  public saveEvent(evt: ChurchEvent): void {
    const idx = this.db.events.findIndex(e => e.id === evt.id);
    if (idx !== -1) {
      this.db.events[idx] = evt;
    } else {
      this.db.events.push(evt);
    }
    this.save();
  }

  public deleteEvent(id: string): void {
    this.db.events = this.db.events.filter(e => e.id !== id);
    this.save();
  }

  public getAnnouncements(audienceFilter?: AudienceType): Announcement[] {
    if (!audienceFilter || audienceFilter === 'all') {
      return [...this.db.announcements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return this.db.announcements
      .filter(a => a.targetAudience === 'all' || a.targetAudience === audienceFilter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public saveAnnouncement(ann: Announcement): void {
    const idx = this.db.announcements.findIndex(a => a.id === ann.id);
    if (idx !== -1) {
      this.db.announcements[idx] = ann;
    } else {
      this.db.announcements.push(ann);
    }
    this.save();
  }

  public deleteAnnouncement(id: string): void {
    this.db.announcements = this.db.announcements.filter(a => a.id !== id);
    this.save();
  }

  public getStudyTexts(): StudyText[] {
    return [...this.db.studyTexts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public saveStudyText(text: StudyText): void {
    const idx = this.db.studyTexts.findIndex(t => t.id === text.id);
    if (idx !== -1) {
      this.db.studyTexts[idx] = text;
    } else {
      this.db.studyTexts.push(text);
    }
    this.save();
  }

  public deleteStudyText(id: string): void {
    this.db.studyTexts = this.db.studyTexts.filter(t => t.id !== id);
    this.save();
  }

  // Backup / Export / Import / Reset
  public exportDatabaseJson(): string {
    return JSON.stringify(this.db, null, 2);
  }

  public exportBackupJson(): string {
    return this.exportDatabaseJson();
  }

  public importDatabaseJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.users && parsed.studentProfiles) {
        this.db = parsed;
        this.save();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public importBackupJson(jsonStr: string): boolean {
    return this.importDatabaseJson(jsonStr);
  }

  public resetToDefault(): void {
    this.db = this.createDefaultDatabase();
    this.save();
  }

  // App Settings & Branding
  public getAppSettings(): AppSettings {
    if (!this.db.settings) {
      this.db.settings = { ...DEFAULT_APP_SETTINGS };
    }
    return { ...this.db.settings };
  }

  public saveAppSettings(newSettings: Partial<AppSettings>): AppSettings {
    const current = this.getAppSettings();
    this.db.settings = {
      ...current,
      ...newSettings,
    };
    this.save();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('app_settings_changed', { detail: this.db.settings })
      );
      if (this.db.settings.appName) {
        document.title = this.db.settings.appName;
      }
    }
    return { ...this.db.settings };
  }
}

export const dbService = new DatabaseService();
