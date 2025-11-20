import { describe, it, expect } from 'vitest'

// Mock filters function - basit bir test fonksiyonu
function checkWinner(board: string[][]): string | null {
    const winPatterns = [
        // Yatay
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        // Dikey
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        // Çapraz
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]],
    ]

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern
        if (
            board[a[0]][a[1]] &&
            board[a[0]][a[1]] === board[b[0]][b[1]] &&
            board[a[0]][a[1]] === board[c[0]][c[1]] &&
            board[a[0]][a[1]] !== 'empty'
        ) {
            return board[a[0]][a[1]]
        }
    }

    return null
}

describe('Game Logic', () => {
    it('should detect horizontal win', () => {
        const board = [
            ['red', 'red', 'red'],
            ['blue', 'empty', 'empty'],
            ['empty', 'empty', 'empty']
        ]

        expect(checkWinner(board)).toBe('red')
    })

    it('should detect vertical win', () => {
        const board = [
            ['blue', 'red', 'empty'],
            ['blue', 'red', 'empty'],
            ['blue', 'empty', 'empty']
        ]

        expect(checkWinner(board)).toBe('blue')
    })

    it('should detect diagonal win', () => {
        const board = [
            ['red', 'blue', 'empty'],
            ['blue', 'red', 'empty'],
            ['empty', 'empty', 'red']
        ]

        expect(checkWinner(board)).toBe('red')
    })

    it('should return null when no winner', () => {
        const board = [
            ['red', 'blue', 'red'],
            ['blue', 'red', 'blue'],
            ['blue', 'red', 'empty']
        ]

        expect(checkWinner(board)).toBe(null)
    })
})