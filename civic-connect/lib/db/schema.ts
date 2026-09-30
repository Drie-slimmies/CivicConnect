import {
  pgEnum,
  pgTable,
  serial,
  text,
  varchar,
  integer,
  doublePrecision,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", [
  "requester",
  "staff",
  "manager",
  "admin",
]);

export const requestStatusEnum = pgEnum("request_status", [
  "submitted",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("requester"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailUnique: uniqueIndex("users_email_unique").on(table.email),
}));

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
}, (table) => ({
  nameUnique: uniqueIndex("categories_name_unique").on(table.name),
}));

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
}, (table) => ({
  nameUnique: uniqueIndex("departments_name_unique").on(table.name),
}));

export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  trackingId: varchar("tracking_id", { length: 20 }).notNull(),

  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  gpsLat: doublePrecision("gps_lat"),
  gpsLng: doublePrecision("gps_lng"),

  categoryId: integer("category_id").notNull().references(() => categories.id),

  urgencyScore: integer("urgency_score"),

  status: requestStatusEnum("status").notNull().default("submitted"),
  resolutionNotes: text("resolution_notes"),

  requesterId: integer("requester_id").notNull().references(() => users.id),
  assignedStaffId: integer("assigned_staff_id").references(() => users.id),
  assignedDepartmentId: integer("assigned_department_id").references(() => departments.id),

  version: integer("version").notNull().default(1),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  trackingIdUnique: uniqueIndex("service_requests_tracking_id_unique").on(table.trackingId),
}));

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull().references(() => serviceRequests.id),
  userId: integer("user_id").notNull().references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  requestsSubmitted: many(serviceRequests, { relationName: "requester" }),
  requestsAssigned: many(serviceRequests, { relationName: "assignedStaff" }),
  auditLogs: many(auditLogs),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  serviceRequests: many(serviceRequests),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  serviceRequests: many(serviceRequests),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ one, many }) => ({
  category: one(categories, {
    fields: [serviceRequests.categoryId],
    references: [categories.id],
  }),
  requester: one(users, {
    fields: [serviceRequests.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  assignedStaff: one(users, {
    fields: [serviceRequests.assignedStaffId],
    references: [users.id],
    relationName: "assignedStaff",
  }),
  assignedDepartment: one(departments, {
    fields: [serviceRequests.assignedDepartmentId],
    references: [departments.id],
  }),
  auditLogs: many(auditLogs),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  serviceRequest: one(serviceRequests, {
    fields: [auditLogs.serviceRequestId],
    references: [serviceRequests.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
