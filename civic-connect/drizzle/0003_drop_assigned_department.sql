ALTER TABLE "service_requests" DROP CONSTRAINT "service_requests_assigned_department_id_departments_id_fk";
--> statement-breakpoint
ALTER TABLE "service_requests" DROP COLUMN "assigned_department_id";