-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN "clockInLocation" TEXT;
ALTER TABLE "Attendance" ADD COLUMN "clockOutLocation" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "department" TEXT,
    "position" TEXT,
    "location" TEXT,
    "gender" TEXT,
    "dateOfBirth" DATETIME,
    "joinDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phoneNumber" TEXT,
    "hourlyRate" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Employee" ("createdAt", "dateOfBirth", "department", "employeeId", "gender", "hourlyRate", "id", "joinDate", "location", "name", "phoneNumber", "position", "role", "updatedAt") SELECT "createdAt", "dateOfBirth", "department", "employeeId", "gender", "hourlyRate", "id", "joinDate", "location", "name", "phoneNumber", "position", "role", "updatedAt" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_employeeId_key" ON "Employee"("employeeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
