-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('INVITED', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ROLE_USER', 'ROLE_HR');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('ANNUAL', 'ON_DEMAND', 'SPECIAL', 'UNPAID');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkDayOverrideType" AS ENUM ('WORKING', 'NON_WORKING');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "password_hash" VARCHAR(255),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "employee_number" VARCHAR(50),
    "role" "UserRole" NOT NULL DEFAULT 'ROLE_USER',
    "status" "UserStatus" NOT NULL DEFAULT 'INVITED',
    "archived_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activation_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "used_at" TIMESTAMPTZ(3),
    "revoked_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activation_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entitlements" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "annual_limit_days" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE NOT NULL,
    "type" "LeaveType" NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "reason" VARCHAR(1000) NOT NULL,
    "public_note" VARCHAR(250),
    "working_days" INTEGER NOT NULL DEFAULT 0,
    "decided_by_id" UUID,
    "decision_comment" VARCHAR(1000),
    "decided_at" TIMESTAMPTZ(3),
    "cancelled_by_id" UUID,
    "cancellation_comment" VARCHAR(1000),
    "cancelled_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_request_days" (
    "id" UUID NOT NULL,
    "leave_request_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "working" BOOLEAN NOT NULL,
    "non_working_reason" VARCHAR(255),
    "charged_entitlement_year" INTEGER,
    "on_demand_year" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_request_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_calendar_overrides" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "type" "WorkDayOverrideType" NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "work_calendar_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entitlement_deadline_snapshots" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "source_year" INTEGER NOT NULL,
    "deadline_year" INTEGER NOT NULL,
    "unused_days_at_deadline" INTEGER NOT NULL,
    "captured_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entitlement_deadline_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "actor_user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "subject_type" VARCHAR(50) NOT NULL,
    "subject_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_number_key" ON "users"("employee_number");

-- CreateIndex
CREATE INDEX "users_status_role_idx" ON "users"("status", "role");

-- CreateIndex
CREATE INDEX "users_last_name_first_name_idx" ON "users"("last_name", "first_name");

-- CreateIndex
CREATE UNIQUE INDEX "activation_tokens_token_hash_key" ON "activation_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "activation_tokens_user_id_expires_at_idx" ON "activation_tokens"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "entitlements_year_idx" ON "entitlements"("year");

-- CreateIndex
CREATE UNIQUE INDEX "entitlements_user_id_year_key" ON "entitlements"("user_id", "year");

-- CreateIndex
CREATE INDEX "leave_requests_user_id_status_starts_on_idx" ON "leave_requests"("user_id", "status", "starts_on");

-- CreateIndex
CREATE INDEX "leave_requests_status_type_starts_on_idx" ON "leave_requests"("status", "type", "starts_on");

-- CreateIndex
CREATE INDEX "leave_requests_starts_on_ends_on_idx" ON "leave_requests"("starts_on", "ends_on");

-- CreateIndex
CREATE INDEX "leave_request_days_date_working_idx" ON "leave_request_days"("date", "working");

-- CreateIndex
CREATE INDEX "leave_request_days_charged_entitlement_year_idx" ON "leave_request_days"("charged_entitlement_year");

-- CreateIndex
CREATE INDEX "leave_request_days_on_demand_year_idx" ON "leave_request_days"("on_demand_year");

-- CreateIndex
CREATE UNIQUE INDEX "leave_request_days_leave_request_id_date_key" ON "leave_request_days"("leave_request_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "work_calendar_overrides_date_key" ON "work_calendar_overrides"("date");

-- CreateIndex
CREATE INDEX "entitlement_deadline_snapshots_deadline_year_idx" ON "entitlement_deadline_snapshots"("deadline_year");

-- CreateIndex
CREATE UNIQUE INDEX "entitlement_deadline_snapshots_user_id_source_year_key" ON "entitlement_deadline_snapshots"("user_id", "source_year");

-- CreateIndex
CREATE INDEX "audit_log_action_created_at_idx" ON "audit_log"("action", "created_at");

-- CreateIndex
CREATE INDEX "audit_log_subject_id_created_at_idx" ON "audit_log"("subject_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_log_actor_user_id_created_at_idx" ON "audit_log"("actor_user_id", "created_at");

-- AddForeignKey
ALTER TABLE "activation_tokens" ADD CONSTRAINT "activation_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_decided_by_id_fkey" FOREIGN KEY ("decided_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_cancelled_by_id_fkey" FOREIGN KEY ("cancelled_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_request_days" ADD CONSTRAINT "leave_request_days_leave_request_id_fkey" FOREIGN KEY ("leave_request_id") REFERENCES "leave_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entitlement_deadline_snapshots" ADD CONSTRAINT "entitlement_deadline_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
