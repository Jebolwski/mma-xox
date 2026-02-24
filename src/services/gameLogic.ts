import { Fighter } from "../interfaces/Fighter";

/**
 * Levenshtein Distance - String similarity calculation
 * Calculates edit distance between two strings
 */
export const levenshteinDistance = (a: string, b: string): number => {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1,
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

/**
 * Filter fighters by name using fuzzy matching
 * Supports partial matches and typo tolerance
 */
export const filterByName = (name: string, fighters_url: Fighter[]): Fighter[] => {
    if (name.length < 4) {
        return [];
    }

    const nameLower = name.toLowerCase();
    const inputWords = nameLower.split(/\s+/).filter((w) => w.length > 0);

    const scoredFighters = fighters_url.map((fighter) => {
        const fighterNameLower = fighter.Fighter.toLowerCase();
        const fighterWords = fighterNameLower.split(/\s+/);

        let totalScore = 0;
        let matchCount = 0;

        for (const inputWord of inputWords) {
            for (const fighterWord of fighterWords) {
                const distance = levenshteinDistance(inputWord, fighterWord);

                // Tolerance: 1-2 character edits
                if (distance <= 2) {
                    totalScore += 10 - distance;
                    matchCount++;
                    break;
                }

                // Include match (higher priority)
                if (fighterWord.includes(inputWord)) {
                    totalScore += 15;
                    matchCount++;
                    break;
                }
            }
        }

        return { fighter, score: totalScore, matchCount };
    });

    // Filter and sort by relevance
    const filteredFighters = scoredFighters
        .filter((item) => item.matchCount > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.fighter);

    return filteredFighters;
};

/**
 * Check for winner on the board
 * Returns: "red", "blue", "Draw!", or null
 */
export const checkWinner = (gameState: any): string | null => {
    if (!gameState) {
        return null;
    }

    const board = [
        [
            gameState?.fighter00.bg,
            gameState?.fighter01.bg,
            gameState?.fighter02.bg,
        ],
        [
            gameState?.fighter10.bg,
            gameState?.fighter11.bg,
            gameState?.fighter12.bg,
        ],
        [
            gameState?.fighter20.bg,
            gameState?.fighter21.bg,
            gameState?.fighter22.bg,
        ],
    ];

    const winPatterns = [
        // Yatay Kazanma
        [
            [0, 0],
            [0, 1],
            [0, 2],
        ],
        [
            [1, 0],
            [1, 1],
            [1, 2],
        ],
        [
            [2, 0],
            [2, 1],
            [2, 2],
        ],
        // Dikey Kazanma
        [
            [0, 0],
            [1, 0],
            [2, 0],
        ],
        [
            [0, 1],
            [1, 1],
            [2, 1],
        ],
        [
            [0, 2],
            [1, 2],
            [2, 2],
        ],
        // Çapraz Kazanma
        [
            [0, 0],
            [1, 1],
            [2, 2],
        ],
        [
            [0, 2],
            [1, 1],
            [2, 0],
        ],
    ];

    // 🎯 Kazanan var mı kontrol et
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        const cellA = board[a[0]][a[1]];
        const cellB = board[b[0]][b[1]];
        const cellC = board[c[0]][c[1]];

        if (
            cellA !== "from-stone-300/70 to-stone-500/70" &&
            cellA === cellB &&
            cellB === cellC
        ) {
            return cellA.includes("red") ? "red" : "blue";
        }
    }

    // 🎯 Beraberlik kontrolü
    const isBoardFull = board
        .flat()
        .every((cell) => cell !== "from-stone-300/70 to-stone-500/70");

    if (isBoardFull) {
        return "Draw!";
    }

    return null;
};
