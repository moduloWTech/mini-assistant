/*
  Warnings:

  - You are about to drop the column `companyHistory` on the `HistoryConfig` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethods` on the `PricingConfig` table. All the data in the column will be lost.
  - You are about to drop the column `servicesOffered` on the `ServicesConfig` table. All the data in the column will be lost.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "HistoryConfig" DROP COLUMN "companyHistory";

-- AlterTable
ALTER TABLE "PricingConfig" DROP COLUMN "paymentMethods";

-- AlterTable
ALTER TABLE "ServicesConfig" DROP COLUMN "servicesOffered";

-- CreateTable
CREATE TABLE "KnowledgeChunk" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(768),
    "category" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KnowledgeChunk_clientId_category_idx" ON "KnowledgeChunk"("clientId", "category");

-- AddForeignKey
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
