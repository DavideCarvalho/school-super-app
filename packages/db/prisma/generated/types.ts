import type { ColumnType } from "kysely";

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

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
};
export type Class = {
  id: string;
  name: string;
  slug: string;
  schoolId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type File = {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
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
export type Notification = {
  id: string;
  title: string;
  body: string | null;
  cleared: Generated<number>;
  userId: string;
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
export type Role = {
  id: string;
  name: string;
};
export type School = {
  id: string;
  name: string;
  slug: string;
};
export type Student = {
  id: string;
  classId: string;
  responsibleUserId: string;
  canteenLimit: number | null;
};
export type StudentCanteenItemPurchase = {
  id: string;
  studentId: string;
  canteenItemId: string;
  price: number;
  quantity: number;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  payed: Generated<number>;
};
export type StudentPei = {
  id: string;
  studentId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  report: string | null;
  needs: string | null;
  interests: string | null;
  skillsToWork: string | null;
  learningObjectives: string | null;
  resourcesAndTools: string | null;
  evaluation: string | null;
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
  startTime: string;
  endTime: string;
};
export type TeacherHasClass = {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  classWeekDay: string;
  classTime: string;
  startTime: string;
  endTime: string;
  teacherAvailabilityId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  active: Generated<number>;
};
export type TeacherHasSubject = {
  id: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type User = {
  id: string;
  name: string;
  slug: string;
  email: string;
  schoolId: string;
  roleId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  teacherId: string | null;
};
export type DB = {
  Canteen: Canteen;
  CanteenItem: CanteenItem;
  Class: Class;
  File: File;
  Notification: Notification;
  PurchaseRequest: PurchaseRequest;
  Role: Role;
  School: School;
  Student: Student;
  StudentCanteenItemPurchase: StudentCanteenItemPurchase;
  StudentPei: StudentPei;
  Subject: Subject;
  Teacher: Teacher;
  TeacherAvailability: TeacherAvailability;
  TeacherHasClass: TeacherHasClass;
  TeacherHasSubject: TeacherHasSubject;
  User: User;
};
