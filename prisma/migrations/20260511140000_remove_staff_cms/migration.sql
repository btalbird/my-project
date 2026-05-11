-- Drop staff / CMS / design / branding tables (respect FK order)

DROP TABLE IF EXISTS "AuditLog" CASCADE;

ALTER TABLE IF EXISTS "Page" DROP CONSTRAINT IF EXISTS "Page_publishedVersionId_fkey";

DROP TABLE IF EXISTS "PageVersion" CASCADE;
DROP TABLE IF EXISTS "Page" CASCADE;

ALTER TABLE IF EXISTS "DesignDocument" DROP CONSTRAINT IF EXISTS "DesignDocument_publishedAssetId_fkey";

DROP TABLE IF EXISTS "DesignDocument" CASCADE;
DROP TABLE IF EXISTS "Asset" CASCADE;

DROP TABLE IF EXISTS "SiteTheme" CASCADE;

DROP TYPE IF EXISTS "AssetKind";
DROP TYPE IF EXISTS "ContentStatus";
