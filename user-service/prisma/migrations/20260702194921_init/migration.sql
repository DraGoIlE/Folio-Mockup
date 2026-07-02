/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_account_id_fkey";

-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_account_id_fkey";

-- DropTable
DROP TABLE "accounts";

-- DropEnum
DROP TYPE "Role";
