/*
  Warnings:

  - Added the required column `atualizedAt` to the `Balance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Balance" ADD COLUMN     "atualizedAt" TIMESTAMP(3) NOT NULL;
