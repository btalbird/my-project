-- CreateTable
CREATE TABLE "SiteTheme" (
    "id" TEXT NOT NULL,
    "draftJson" JSONB NOT NULL,
    "publishedJson" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteTheme_pkey" PRIMARY KEY ("id")
);
