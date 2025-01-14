-- CreateTable
CREATE TABLE "UserFeedback" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "feedback" TEXT NOT NULL,
    "image" BYTEA,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "UserFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserFeedback_userId_idx" ON "UserFeedback"("userId");

-- CreateIndex
CREATE INDEX "UserFeedback_createdAt_idx" ON "UserFeedback"("createdAt");

-- AddForeignKey
ALTER TABLE "UserFeedback" ADD CONSTRAINT "UserFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
