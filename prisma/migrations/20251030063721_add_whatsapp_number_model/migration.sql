-- CreateTable
CREATE TABLE "WhatsappNumber" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappNumber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappNumber_phoneNumber_key" ON "WhatsappNumber"("phoneNumber");

-- AddForeignKey
ALTER TABLE "WhatsappNumber" ADD CONSTRAINT "WhatsappNumber_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
