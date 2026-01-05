// Returns teacher level & title based on XP
export function getTeacherLevelData(xp) {
    const levels = [
        { xp: 4000, level: 20, title: "Master Educator" },
        { xp: 2500, level: 15, title: "Knowledge Mentor" },
        { xp: 1000, level: 8,  title: "Rising Instructor" },
        { xp: 0,    level: 1,  title: "New Teacher" }
    ];

    for (let entry of levels) {
        if (xp >= entry.xp) return { level: entry.level, title: entry.title };
    }
    // Fallback (should never hit)
    return { level: 1, title: "New Teacher" };
}
