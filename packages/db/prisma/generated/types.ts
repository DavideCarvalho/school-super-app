import type { ColumnType } from "kysely";

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type AcademicPeriod = {
  id: string;
  startDate: Timestamp;
  endDate: Timestamp;
  isActive: Generated<number>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type Assignment = {
  id: string;
  name: string;
  classId: string;
  description: string | null;
  dueDate: Timestamp;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  grade: Generated<number>;
  teacherHasClassId: string | null;
  academicPeriodId: string | null;
};
export type Attendance = {
  id: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  classDayId: string;
  note: string;
};
export type Calendar = {
  id: string;
  classId: string;
  name: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  isActive: Generated<number>;
};
export type CalendarConfig = {
  id: string;
  classesConfig: unknown | null;
  classesClashConfig: unknown | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type CalendarSlot = {
  id: string;
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
  id: string;
  schoolId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  responsibleUserId: string;
};
export type CanteenItem = {
  id: string;
  name: string;
  price: number;
  canteenId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  active: Generated<number>;
};
export type CanteenItemPurchased = {
  id: string;
  price: number;
  quantity: number;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  canteenPurchaseId: string;
  canteenItemId: string;
};
export type CanteenPurchase = {
  id: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  payed: Generated<number>;
  userId: string;
};
export type Class = {
  id: string;
  name: string;
  slug: string;
  schoolId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type ClassDay = {
  id: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  date: Timestamp;
  name: string;
  weekday: number;
  teacherHasClassId: string;
};
export type ClassSchedule = {
  id: string;
  classId: string;
  name: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  isActive: Generated<number>;
};
export type Comment = {
  id: Generated<number>;
  uuid: string;
  postId: number;
  comment: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  userId: string;
};
export type CommentLike = {
  id: string;
  commentId: number;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  userId: string;
};
export type FixedClass = {
  id: string;
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
  id: string;
  title: string;
  body: string | null;
  cleared: Generated<number>;
  userId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type Occurence = {
  id: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  studentId: string;
  text: string;
  classDayId: string | null;
};
export type Post = {
  id: Generated<number>;
  uuid: string;
  content: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  userId: string;
  schoolId: string | null;
};
export type PrintRequest = {
  id: string;
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
  id: string;
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
  id: string;
  responsibleUserId: string;
  occurenceId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  studentAttendingClassId: string | null;
};
export type Role = {
  id: string;
  name: string;
};
export type School = {
  id: string;
  name: string;
  slug: string;
  schoolChainId: string | null;
};
export type SchoolChain = {
  id: string;
  name: string;
  slug: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type Student = {
  id: string;
  canteenLimit: number | null;
};
export type StudentAttendingClass = {
  id: string;
  studentId: string;
  classId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  academicPeriodId: string | null;
};
export type StudentHasAssignment = {
  id: string;
  studentId: string;
  assignmentId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  grade: Generated<number>;
};
export type StudentHasClassAttendance = {
  id: string;
  studentId: string;
  attendanceId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type StudentHasResponsible = {
  id: string;
  studentId: string;
  responsibleId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type Subject = {
  id: string;
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
  id: string;
  teacherId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  day: string;
  startTime: Timestamp;
  endTime: Timestamp;
};
export type TeacherHasClass = {
  id: string;
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
  id: string;
  teacherId: string;
  subjectId: string;
};
export type User = {
  id: string;
  name: string;
  slug: string;
  email: string;
  schoolId: string | null;
  roleId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  teacherId: string | null;
  externalAuthId: string | null;
  imageUrl: string | null;
  active: Generated<number>;
};
export type UserLikedPost = {
  id: string;
  postId: number;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  userId: string;
};
export type DB = {
  AcademicPeriod: AcademicPeriod;
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
  ClassDay: ClassDay;
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
  StudentAttendingClass: StudentAttendingClass;
  StudentHasAssignment: StudentHasAssignment;
  StudentHasClassAttendance: StudentHasClassAttendance;
  StudentHasResponsible: StudentHasResponsible;
  Subject: Subject;
  Teacher: Teacher;
  TeacherAvailability: TeacherAvailability;
  TeacherHasClass: TeacherHasClass;
  TeacherHasSubject: TeacherHasSubject;
  User: User;
  UserLikedPost: UserLikedPost;
};
