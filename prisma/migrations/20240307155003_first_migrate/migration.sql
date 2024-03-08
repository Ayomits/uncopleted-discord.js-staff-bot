-- CreateTable
CREATE TABLE "VacansiesSettings" (
    "guildId" TEXT NOT NULL,
    "publishChannelId" TEXT NOT NULL,
    "vacansiesPublishChannelId" TEXT NOT NULL,
    "embed" JSONB NOT NULL,

    CONSTRAINT "VacansiesSettings_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "Vacancy" (
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Vacancy_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "placeholder" TEXT NOT NULL,
    "vacancyId" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vacancy_name_key" ON "Vacancy"("name");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;
