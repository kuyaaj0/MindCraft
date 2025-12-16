export function getTeacherLevelData(xp) {
  if (xp >= 4000) return { level: 20, title: "Master Educator" };
  if (xp >= 2500) return { level: 15, title: "Knowledge Mentor" };
  if (xp >= 1000) return { level: 8, title: "Rising Instructor" };
  return { level: 1, title: "New Teacher" };
}
