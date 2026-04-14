ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_timeId_fkey";
ALTER TABLE "Appointment" ALTER COLUMN "timeId" DROP NOT NULL;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time"("id") ON DELETE SET NULL ON UPDATE CASCADE;
