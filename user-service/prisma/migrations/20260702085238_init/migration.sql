-- CreateEnum
CREATE TYPE "Role" AS ENUM ('candidate', 'company');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('active', 'closed');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "full_name" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cv_url" TEXT,
    "expected_salary" INTEGER,
    "experience_years" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "company_name" TEXT,
    "industry" TEXT,
    "description" TEXT,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_postings" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requirements" TEXT,
    "required_skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "salary_min" INTEGER,
    "salary_max" INTEGER,
    "status" "JobStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "job_postings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_account_id_key" ON "candidates"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_account_id_key" ON "companies"("account_id");

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
