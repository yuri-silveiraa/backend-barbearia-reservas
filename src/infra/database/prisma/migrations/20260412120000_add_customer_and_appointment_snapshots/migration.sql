-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_whatsapp_key" ON "Customer"("whatsapp");
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add nullable columns first so existing appointments can be backfilled safely.
ALTER TABLE "Appointment" ADD COLUMN "customerId" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "customerName" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "customerWhatsapp" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "barberName" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "serviceName" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "scheduledAt" TIMESTAMP(3);

-- Backfill customers for existing authenticated clients.
INSERT INTO "Customer" ("id", "name", "whatsapp", "userId", "createdAt", "updatedAt")
SELECT c."id", u."name", u."telephone", u."id", NOW(), NOW()
FROM "Client" c
JOIN "User" u ON u."id" = c."userId"
ON CONFLICT ("whatsapp") DO NOTHING;

-- Backfill appointment snapshots from the current relations.
UPDATE "Appointment" a
SET
  "customerId" = cu."id",
  "customerName" = u_client."name",
  "customerWhatsapp" = u_client."telephone",
  "barberName" = u_barber."name",
  "serviceName" = s."name",
  "scheduledAt" = t."date"
FROM "Client" c, "User" u_client, "Customer" cu, "Barber" b, "User" u_barber, "Service" s, "Time" t
WHERE a."clientId" = c."id"
  AND u_client."id" = c."userId"
  AND cu."userId" = u_client."id"
  AND b."id" = a."barberId"
  AND u_barber."id" = b."userId"
  AND s."id" = a."serviceId"
  AND t."id" = a."timeId";

ALTER TABLE "Appointment" ALTER COLUMN "customerId" SET NOT NULL;
ALTER TABLE "Appointment" ALTER COLUMN "customerName" SET NOT NULL;
ALTER TABLE "Appointment" ALTER COLUMN "customerWhatsapp" SET NOT NULL;
ALTER TABLE "Appointment" ALTER COLUMN "barberName" SET NOT NULL;
ALTER TABLE "Appointment" ALTER COLUMN "serviceName" SET NOT NULL;
ALTER TABLE "Appointment" ALTER COLUMN "scheduledAt" SET NOT NULL;
ALTER TABLE "Appointment" ALTER COLUMN "clientId" DROP NOT NULL;

ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
