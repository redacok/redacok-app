-- Add organisationId to BankAccount
ALTER TABLE "BankAccount" ADD COLUMN "organisationId" TEXT;

-- Add foreign key constraint
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_organisationId_fkey" 
    FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index for better query performance
CREATE INDEX "BankAccount_organisationId_idx" ON "BankAccount"("organisationId");
