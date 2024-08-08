import type { ColumnType } from "kysely";

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type AcademicPeriod = {
  id: Generated<string>;
  startDate: Timestamp;
  endDate: Timestamp;
  isActive: Generated<number>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  schoolId: string;
  isClosed: Generated<number>;
};
export type AcademicPeriodHoliday = {
  id: Generated<string>;
  date: Timestamp;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  academicPeriodId: string;
};
export type AcademicPeriodWeekendClass = {
  id: Generated<string>;
  academicPeriodId: string;
  date: Timestamp;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type Assignment = {
  id: Generated<string>;
  name: string;
  description: string | null;
  dueDate: Timestamp;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  grade: Generated<number>;
  teacherHasClassId: string;
  academicPeriodId: string;
};
export type Attendance = {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  note: string | null;
  date: Timestamp;
  calendarSlotId: string;
};
export type Calendar = {
  id: Generated<string>;
  classId: string;
  name: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  isActive: Generated<number>;
  academicPeriodId: string;
};
export type CalendarConfig = {
  id: Generated<string>;
  classesConfig: unknown | null;
  classesClashConfig: unknown | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type CalendarSlot = {
  id: Generated<string>;
  teacherHasClassId: string | null;
  classWeekDay: number;
  startTime: Timestamp;
  endTime: Timestamp;
  minutes: number;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  calendarId: string;
};
export type Canteen = {
  id: Generated<string>;
  schoolId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  responsibleUserId: string;
};
export type CanteenItem = {
  id: Generated<string>;
  name: string;
  price: number;
  canteenId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  active: Generated<number>;
};
export type CanteenItemPurchased = {
  id: Generated<string>;
  price: number;
  quantity: number;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  canteenPurchaseId: string;
  canteenItemId: string;
};
export type CanteenPurchase = {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  payed: Generated<number>;
  userId: string;
};
export type Class = {
  id: Generated<string>;
  name: string;
  slug: string;
  schoolId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type ClassSchedule = {
  id: Generated<string>;
  classId: string;
  name: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  isActive: Generated<number>;
};
export type Comment = {
  id: Generated<number>;
  uuid: Generated<string>;
  postId: number;
  comment: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  userId: string;
};
export type CommentLike = {
  id: Generated<string>;
  commentId: number;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  userId: string;
};
export type FixedClass = {
  id: Generated<string>;
  classScheduleId: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  subjectQuantity: Generated<number>;
  classWeekDay: string;
  startTime: string;
  endTime: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type Notification = {
  id: Generated<string>;
  title: string;
  body: string | null;
  cleared: Generated<number>;
  userId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type Occurence = {
  id: Generated<string>;
  date: Timestamp;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  studentId: string;
  text: string;
  teacherHasClassId: string;
};
export type Post = {
  id: Generated<number>;
  uuid: Generated<string>;
  content: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  userId: string;
  schoolId: string | null;
};
export type PrintRequest = {
  id: Generated<string>;
  userId: string;
  name: string;
  path: string;
  status: string;
  frontAndBack: Generated<number>;
  rejectedFeedback: string | null;
  quantity: Generated<number>;
  dueDate: Timestamp;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type PurchaseRequest = {
  id: Generated<string>;
  productName: string;
  quantity: number;
  finalQuantity: number | null;
  status: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  proposal: string | null;
  schoolId: string;
  dueDate: Timestamp;
  value: number;
  unitValue: number;
  finalUnitValue: number | null;
  finalValue: number | null;
  description: string | null;
  productUrl: string | null;
  purchaseDate: Timestamp | null;
  estimatedArrivalDate: Timestamp | null;
  arrivalDate: Timestamp | null;
  rejectionReason: string | null;
  requestingUserId: string;
  receiptPath: string | null;
};
export type ResponsibleUserAcceptedOccurence = {
  id: Generated<string>;
  responsibleUserId: string;
  occurenceId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type Role = {
  id: Generated<string>;
  name: string;
};
export type School = {
  id: Generated<string>;
  name: string;
  slug: string;
  schoolChainId: string | null;
  minimumGrade: Generated<number>;
  calculationAlgorithm: Generated<string>;
};
export type SchoolChain = {
  id: Generated<string>;
  name: string;
  slug: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type Student = {
  id: string;
  classId: string | null;
  canteenLimit: number | null;
};
export type StudentHasAcademicPeriod = {
  id: Generated<string>;
  studentId: string;
  academicPeriodId: string;
  classId: string | null;
};
export type StudentHasAssignment = {
  id: Generated<string>;
  studentId: string;
  assignmentId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  grade: number | null;
};
export type StudentHasAttendance = {
  id: Generated<string>;
  studentId: string;
  attendanceId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  present: Generated<number>;
};
export type StudentHasResponsible = {
  id: Generated<string>;
  studentId: string;
  responsibleId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type Subject = {
  id: Generated<string>;
  name: string;
  slug: string;
  schoolId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  quantityNeededScheduled: Generated<number>;
};
export type Teacher = {
  id: string;
};
export type TeacherAvailability = {
  id: Generated<string>;
  teacherId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  day: string;
  startTime: Timestamp;
  endTime: Timestamp;
};
export type TeacherHasClass = {
  id: Generated<string>;
  teacherId: string;
  classId: string;
  subjectId: string;
  subjectQuantity: Generated<number>;
  classWeekDay: string | null;
  startTime: string | null;
  endTime: string | null;
  teacherAvailabilityId: string | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  isActive: Generated<number>;
};
export type TeacherHasSubject = {
  id: Generated<string>;
  teacherId: string;
  subjectId: string;
};
export type User = {
  id: Generated<string>;
  name: string;
  slug: string;
  email: string;
  schoolId: string | null;
  roleId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  externalAuthId: string | null;
  imageUrl: string | null;
  active: Generated<number>;
};
export type UserLikedPost = {
  id: Generated<string>;
  postId: number;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  userId: string;
};
export type DB = {
  AcademicPeriod: AcademicPeriod;
  AcademicPeriodHoliday: AcademicPeriodHoliday;
  AcademicPeriodWeekendClass: AcademicPeriodWeekendClass;
  Assignment: Assignment;
  Attendance: Attendance;
  Calendar: Calendar;
  CalendarConfig: CalendarConfig;
  CalendarSlot: CalendarSlot;
  Canteen: Canteen;
  CanteenItem: CanteenItem;
  CanteenItemPurchased: CanteenItemPurchased;
  CanteenPurchase: CanteenPurchase;
  Class: Class;
  ClassSchedule: ClassSchedule;
  Comment: Comment;
  CommentLike: CommentLike;
  FixedClass: FixedClass;
  Notification: Notification;
  Occurence: Occurence;
  Post: Post;
  PrintRequest: PrintRequest;
  PurchaseRequest: PurchaseRequest;
  ResponsibleUserAcceptedOccurence: ResponsibleUserAcceptedOccurence;
  Role: Role;
  School: School;
  SchoolChain: SchoolChain;
  Student: Student;
  StudentHasAcademicPeriod: StudentHasAcademicPeriod;
  StudentHasAssignment: StudentHasAssignment;
  StudentHasAttendance: StudentHasAttendance;
  StudentHasResponsible: StudentHasResponsible;
  Subject: Subject;
  Teacher: Teacher;
  TeacherAvailability: TeacherAvailability;
  TeacherHasClass: TeacherHasClass;
  TeacherHasSubject: TeacherHasSubject;
  User: User;
  UserLikedPost: UserLikedPost;
};
