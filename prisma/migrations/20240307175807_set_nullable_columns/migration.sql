-- AlterTable
ALTER TABLE "VacansiesSettings" ALTER COLUMN "publishChannelId" DROP NOT NULL,
ALTER COLUMN "vacansiesPublishChannelId" DROP NOT NULL,
ALTER COLUMN "embed" DROP NOT NULL;
