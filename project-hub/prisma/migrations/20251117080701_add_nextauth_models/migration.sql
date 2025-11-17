-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "expires_in" INTEGER,
ADD COLUMN     "ext_expires_in" INTEGER,
ADD COLUMN     "oauth_token" TEXT,
ADD COLUMN     "oauth_token_secret" TEXT;
