import { supabase } from "../lib/supabase";
import { logAudit } from "./auditService";

export async function hasAccessToCourse(
  studentId: number,
  courseId: number,
): Promise<boolean> {
  const { data } = await supabase
    .from("course_access")
    .select("courseAccess_id")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .maybeSingle();

  return !!data;
}

export async function getAccessibleCourseIds(
  studentId: number,
): Promise<number[]> {
  const { data, error } = await supabase
    .from("course_access")
    .select("course_id")
    .eq("student_id", studentId);

  if (error) {
    console.error("getAccessibleCourseIds:", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.course_id);
}

export async function unlockNextCourse(
  studentId: number,
  completedCourseId: number,
  studentName: string,
): Promise<{ unlocked: boolean; nextCourseName?: string }> {
  const { data: sequence } = await supabase
    .from("course_sequence")
    .select("next_course_id")
    .eq("course_id", completedCourseId)
    .maybeSingle();

  if (!sequence?.next_course_id) return { unlocked: false };

  const nextCourseId = sequence.next_course_id;
  const alreadyUnlocked = await hasAccessToCourse(studentId, nextCourseId);
  if (alreadyUnlocked) return { unlocked: false };

  const { data: nextCourse } = await supabase
    .from("course")
    .select("courseName")
    .eq("course_id", nextCourseId)
    .single();

  const { error } = await supabase.from("course_access").insert({
    student_id: studentId,
    course_id: nextCourseId,
    unlockedBy: null,
  });

  if (error) {
    console.error("unlockNextCourse:", error.message);
    return { unlocked: false };
  }

  await logAudit({
    actorType: "student",
    actorId: String(studentId),
    actorName: studentName,
    action: "student_passed_assessment",
    targetType: "course",
    targetId: String(nextCourseId),
    targetName: nextCourse?.courseName,
    metadata: { completedCourseId, autoUnlocked: true },
  });

  return { unlocked: true, nextCourseName: nextCourse?.courseName };
}

export async function adminUnlockCourseForStudent(
  studentId: number,
  courseId: number,
  adminId: string,
  adminName: string,
  studentName: string,
  courseName: string,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("course_access").insert({
    student_id: studentId,
    course_id: courseId,
    unlockedBy: adminId,
  });

  if (error) {
    if (error.code === "23505")
      return { success: false, error: "Already unlocked." };
    return { success: false, error: error.message };
  }

  await logAudit({
    actorType: "admin",
    actorId: adminId,
    actorName: adminName,
    action: "admin_unlocked_course_single",
    targetType: "student",
    targetId: String(studentId),
    targetName: studentName,
    metadata: { courseId, courseName },
  });

  return { success: true };
}

export async function adminUnlockCourseForAll(
  courseId: number,
  adminId: string,
  adminName: string,
  courseName: string,
): Promise<{ success: boolean; count?: number; error?: string }> {
  const { data: students, error: studentsError } = await supabase
    .from("student")
    .select("id")
    .eq("isAccountSetup", true);

  if (studentsError) return { success: false, error: studentsError.message };

  const rows = (students ?? []).map((s) => ({
    student_id: s.id,
    course_id: courseId,
    unlockedBy: adminId,
  }));

  if (rows.length === 0) return { success: true, count: 0 };

  const { error } = await supabase.from("course_access").upsert(rows, {
    onConflict: "student_id,course_id",
    ignoreDuplicates: true,
  });

  if (error) return { success: false, error: error.message };

  await logAudit({
    actorType: "admin",
    actorId: adminId,
    actorName: adminName,
    action: "admin_unlocked_course_all",
    targetType: "course",
    targetId: String(courseId),
    targetName: courseName,
    metadata: { studentCount: rows.length },
  });

  return { success: true, count: rows.length };
}

export async function adminLockCourseForStudent(
  studentId: number,
  courseId: number,
  adminId: string,
  adminName: string,
  studentName: string,
  courseName: string,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("course_access")
    .delete()
    .eq("student_id", studentId)
    .eq("course_id", courseId);

  if (error) return { success: false, error: error.message };

  await logAudit({
    actorType: "admin",
    actorId: adminId,
    actorName: adminName,
    action: "admin_locked_course_single",
    targetType: "student",
    targetId: String(studentId),
    targetName: studentName,
    metadata: { courseId, courseName },
  });

  return { success: true };
}

export async function adminLockCourseForAll(
  courseId: number,
  adminId: string,
  adminName: string,
  courseName: string,
): Promise<{ success: boolean; count?: number; error?: string }> {
  if (courseId === 1) {
    return {
      success: false,
      error: "Cannot lock the first course for all students.",
    };
  }

  const { data: affected } = await supabase
    .from("course_access")
    .select("courseAccess_id")
    .eq("course_id", courseId);

  const { error } = await supabase
    .from("course_access")
    .delete()
    .eq("course_id", courseId);

  if (error) return { success: false, error: error.message };

  await logAudit({
    actorType: "admin",
    actorId: adminId,
    actorName: adminName,
    action: "admin_locked_course_all",
    targetType: "course",
    targetId: String(courseId),
    targetName: courseName,
    metadata: { studentCount: affected?.length ?? 0 },
  });

  return { success: true, count: affected?.length ?? 0 };
}
