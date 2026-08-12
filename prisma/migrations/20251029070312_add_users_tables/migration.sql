-- CreateTable
CREATE TABLE "Classification" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Classification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactConfig" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "contactSuggestion" TEXT NOT NULL,
    "agentDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryConfig" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "companyHistory" TEXT NOT NULL,
    "agentDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoryConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoryConfig" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "memoryGuidelines" TEXT NOT NULL,
    "agentDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemoryConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingConfig" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "paymentMethods" TEXT NOT NULL,
    "agentDescription" TEXT NOT NULL,
    "noPricingInfoText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicesConfig" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "servicesOffered" TEXT NOT NULL,
    "agentDescription" TEXT NOT NULL,
    "conversationStyle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicesConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmalltalkConfig" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "smalltalkGuidelines" TEXT NOT NULL,
    "agentDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmalltalkConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- AddForeignKey
ALTER TABLE "ContactConfig" ADD CONSTRAINT "ContactConfig_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryConfig" ADD CONSTRAINT "HistoryConfig_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryConfig" ADD CONSTRAINT "MemoryConfig_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingConfig" ADD CONSTRAINT "PricingConfig_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicesConfig" ADD CONSTRAINT "ServicesConfig_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmalltalkConfig" ADD CONSTRAINT "SmalltalkConfig_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
