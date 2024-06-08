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
export type Post = {
  id: Generated<number>;
  uuid: string;
  content: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  userId: string;
  schoolId: string | null;
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
  classId: string;
  responsibleUserId: string;
  canteenLimit: number | null;
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
export type SubjectClass = {
  id: string;
  subjectId: string;
  classId: string;
  quantity: number;
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
  subjectQuantity: Generated<number>;
  classWeekDay: string | null;
  startTime: string | null;
  endTime: string | null;
  teacherAvailabilityId: string | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
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
  Canteen: Canteen;
  CanteenItem: CanteenItem;
  CanteenItemPurchased: CanteenItemPurchased;
  CanteenPurchase: CanteenPurchase;
  Class: Class;
  ClassSchedule: ClassSchedule;
  Comment: Comment;
  CommentLike: CommentLike;
  File: File;
  FixedClass: FixedClass;
  Notification: Notification;
  Post: Post;
  PurchaseRequest: PurchaseRequest;
  Role: Role;
  School: School;
  SchoolChain: SchoolChain;
  Student: Student;
  StudentPei: StudentPei;
  Subject: Subject;
  SubjectClass: SubjectClass;
  Teacher: Teacher;
  TeacherAvailability: TeacherAvailability;
  TeacherHasClass: TeacherHasClass;
  User: User;
  UserLikedPost: UserLikedPost;
};
