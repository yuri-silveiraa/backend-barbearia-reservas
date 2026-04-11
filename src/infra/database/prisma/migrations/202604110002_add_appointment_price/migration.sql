ALTER TABLE "Appointment" ADD COLUMN "price" DOUBLE PRECISION;

UPDATE "Appointment"
SET "price" = "Service"."price"
FROM "Service"
WHERE "Appointment"."serviceId" = "Service"."id";

ALTER TABLE "Appointment" ALTER COLUMN "price" SET NOT NULL;
