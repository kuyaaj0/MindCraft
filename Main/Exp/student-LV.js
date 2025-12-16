export function getStudentLevelData(xp) {
  if (xp >= 3000) return { level: 15, title: "Learning Legend" };
  if (xp >= 1500) return { level: 10, title: "Mind Master" };
  if (xp >= 500) return { level: 5, title: "Knowledge Explorer" };
  return { level: 1, title: "Beginner" };
}
