CREATE INDEX "audit_logs_service_request_id_idx" ON "audit_logs" USING btree ("service_request_id");--> statement-breakpoint
CREATE INDEX "service_requests_requester_id_idx" ON "service_requests" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "service_requests_assigned_staff_id_idx" ON "service_requests" USING btree ("assigned_staff_id");--> statement-breakpoint
CREATE INDEX "service_requests_status_idx" ON "service_requests" USING btree ("status");