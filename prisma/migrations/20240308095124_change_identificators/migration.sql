/*
  Warnings:

  - The primary key for the `Vacancy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `VacansiesSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `vacancyId` on the `Question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_vacancyId_fkey";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "vacancyId",
ADD COLUMN     "vacancyId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Vacancy" DROP CONSTRAINT "Vacancy_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Vacancy_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "VacansiesSettings" DROP CONSTRAINT "VacansiesSettings_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "VacansiesSettings_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
