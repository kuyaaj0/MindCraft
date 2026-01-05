// Returns student level & title based on XP
export function getStudentLevelData(xp) {
    const levels = [
        { xp: 3000, level: 15, title: "Learning Legend" },
        { xp: 1500, level: 10, title: "Mind Master" },
        { xp: 500,  level: 5,  title: "Knowledge Explorer" },
        { xp: 0,    level: 1,  title: "Beginner" }
    ];

    for (let entry of levels) {
        if (xp >= entry.xp) return { level: entry.level, title: entry.title };
    }
    // Fallback (should never hit)
    return { level: 1, title: "Beginner" };
}
