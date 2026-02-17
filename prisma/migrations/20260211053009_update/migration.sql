-- CreateTable
CREATE TABLE `admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `status` ENUM('A', 'D') NOT NULL DEFAULT 'A',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `admin_username_key`(`username`),
    UNIQUE INDEX `admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faculty_role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` ENUM('HOD', 'TEACHER') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faculty` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `faculty_id` VARCHAR(50) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `status` ENUM('A', 'D') NOT NULL DEFAULT 'A',
    `role` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `faculty_faculty_id_key`(`faculty_id`),
    UNIQUE INDEX `faculty_email_key`(`email`),
    INDEX `faculty_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentID` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `status` ENUM('A', 'D') NOT NULL DEFAULT 'A',
    `currentSem` VARCHAR(2) NOT NULL DEFAULT '01',
    `academicYearId` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `student_studentID_key`(`studentID`),
    UNIQUE INDEX `student_email_key`(`email`),
    INDEX `student_currentSem_idx`(`currentSem`),
    INDEX `student_academicYearId_idx`(`academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `department` (
    `dept_id` VARCHAR(10) NOT NULL,
    `dept_name` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`dept_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `semester` (
    `semester_id` VARCHAR(2) NOT NULL,
    `semester_name` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`semester_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course` (
    `course_id` VARCHAR(191) NOT NULL,
    `course_name` VARCHAR(100) NOT NULL,
    `semester_id` VARCHAR(2) NOT NULL,
    `dept_id` VARCHAR(10) NOT NULL,

    INDEX `course_dept_id_idx`(`dept_id`),
    INDEX `course_semester_id_idx`(`semester_id`),
    PRIMARY KEY (`course_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faculty_course_mapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `facultyId` INTEGER NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `academicYearId` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `faculty_course_mapping_facultyId_idx`(`facultyId`),
    INDEX `faculty_course_mapping_courseId_idx`(`courseId`),
    INDEX `faculty_course_mapping_academicYearId_idx`(`academicYearId`),
    UNIQUE INDEX `faculty_course_mapping_facultyId_courseId_academicYearId_key`(`facultyId`, `courseId`, `academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `topic` (
    `topic_id` INTEGER NOT NULL AUTO_INCREMENT,
    `topic_name` VARCHAR(255) NOT NULL,
    `topic_description` TEXT NULL,
    `courseId` VARCHAR(191) NOT NULL,

    INDEX `topic_courseId_idx`(`courseId`),
    PRIMARY KEY (`topic_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subtopic` (
    `subtopic_id` INTEGER NOT NULL AUTO_INCREMENT,
    `subtopic_name` VARCHAR(255) NOT NULL,
    `subtopic_description` TEXT NULL,
    `topicId` INTEGER NULL,
    `parentId` INTEGER NULL,

    INDEX `subtopic_topicId_idx`(`topicId`),
    INDEX `subtopic_parentId_idx`(`parentId`),
    PRIMARY KEY (`subtopic_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `academic_year` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `academic_year_label_key`(`label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `topic_coverage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topicId` INTEGER NOT NULL,
    `facultyId` INTEGER NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `semesterId` VARCHAR(191) NOT NULL,
    `academicYearId` INTEGER NOT NULL,
    `taughtOn` DATE NOT NULL,
    `remark` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `topic_coverage_courseId_semesterId_academicYearId_idx`(`courseId`, `semesterId`, `academicYearId`),
    UNIQUE INDEX `topic_coverage_topicId_facultyId_courseId_semesterId_academi_key`(`topicId`, `facultyId`, `courseId`, `semesterId`, `academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subtopic_coverage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subtopicId` INTEGER NOT NULL,
    `facultyId` INTEGER NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `semesterId` VARCHAR(191) NOT NULL,
    `academicYearId` INTEGER NOT NULL,
    `taughtOn` DATE NOT NULL,
    `remark` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `subtopic_coverage_courseId_semesterId_academicYearId_idx`(`courseId`, `semesterId`, `academicYearId`),
    UNIQUE INDEX `subtopic_coverage_subtopicId_facultyId_courseId_semesterId_a_key`(`subtopicId`, `facultyId`, `courseId`, `semesterId`, `academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_course_mapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `student_course_mapping_studentId_idx`(`studentId`),
    INDEX `student_course_mapping_courseId_idx`(`courseId`),
    UNIQUE INDEX `student_course_mapping_studentId_courseId_key`(`studentId`, `courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_academic_year` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `academicYearId` INTEGER NOT NULL,
    `status` ENUM('REGULAR', 'BACKLOG', 'REPEAT', 'PASSED') NOT NULL DEFAULT 'REGULAR',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `student_academic_year_studentId_idx`(`studentId`),
    INDEX `student_academic_year_academicYearId_idx`(`academicYearId`),
    INDEX `student_academic_year_studentId_status_idx`(`studentId`, `status`),
    UNIQUE INDEX `student_academic_year_studentId_academicYearId_key`(`studentId`, `academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `faculty` ADD CONSTRAINT `faculty_role_fkey` FOREIGN KEY (`role`) REFERENCES `faculty_role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `student_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_year`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `student_currentSem_fkey` FOREIGN KEY (`currentSem`) REFERENCES `semester`(`semester_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course` ADD CONSTRAINT `course_dept_id_fkey` FOREIGN KEY (`dept_id`) REFERENCES `department`(`dept_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course` ADD CONSTRAINT `course_semester_id_fkey` FOREIGN KEY (`semester_id`) REFERENCES `semester`(`semester_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faculty_course_mapping` ADD CONSTRAINT `faculty_course_mapping_facultyId_fkey` FOREIGN KEY (`facultyId`) REFERENCES `faculty`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faculty_course_mapping` ADD CONSTRAINT `faculty_course_mapping_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`course_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faculty_course_mapping` ADD CONSTRAINT `faculty_course_mapping_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_year`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topic` ADD CONSTRAINT `topic_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`course_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subtopic` ADD CONSTRAINT `subtopic_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `topic`(`topic_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subtopic` ADD CONSTRAINT `subtopic_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `subtopic`(`subtopic_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topic_coverage` ADD CONSTRAINT `topic_coverage_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `topic`(`topic_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topic_coverage` ADD CONSTRAINT `topic_coverage_facultyId_fkey` FOREIGN KEY (`facultyId`) REFERENCES `faculty`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topic_coverage` ADD CONSTRAINT `topic_coverage_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`course_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topic_coverage` ADD CONSTRAINT `topic_coverage_semesterId_fkey` FOREIGN KEY (`semesterId`) REFERENCES `semester`(`semester_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topic_coverage` ADD CONSTRAINT `topic_coverage_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_year`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subtopic_coverage` ADD CONSTRAINT `subtopic_coverage_subtopicId_fkey` FOREIGN KEY (`subtopicId`) REFERENCES `subtopic`(`subtopic_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subtopic_coverage` ADD CONSTRAINT `subtopic_coverage_facultyId_fkey` FOREIGN KEY (`facultyId`) REFERENCES `faculty`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subtopic_coverage` ADD CONSTRAINT `subtopic_coverage_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`course_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subtopic_coverage` ADD CONSTRAINT `subtopic_coverage_semesterId_fkey` FOREIGN KEY (`semesterId`) REFERENCES `semester`(`semester_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subtopic_coverage` ADD CONSTRAINT `subtopic_coverage_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_year`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_course_mapping` ADD CONSTRAINT `student_course_mapping_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_course_mapping` ADD CONSTRAINT `student_course_mapping_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`course_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_academic_year` ADD CONSTRAINT `student_academic_year_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_academic_year` ADD CONSTRAINT `student_academic_year_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_year`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
