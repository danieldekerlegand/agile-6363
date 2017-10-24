CREATE TABLE "course" (
	 "course_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	 "course_name" TEXT(255,0) NOT NULL
);
CREATE TABLE "questions" (
	"question_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	"question_text" TEXT(255,0) NOT NULL,
      "question_type" TEXT(255,0) NOT NULL,
      "course_id" INTEGER NOT NULL
);
CREATE TABLE "options" (
	"option_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	"context" TEXT(255,0) NOT NULL,
      "question_id" INTEGER NOT NULL,
      "is_correct" INTEGER NOT NULL
);
