// This file will contain the core logic for generating Sudoku puzzles.

function unUsedInBox(grid: (number | null)[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[row + i][col + j] === num) {
                return false;
            }
        }
    }
    return true;
}

function fillBox(grid: (number | null)[][], row: number, col: number) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    numbers.sort(() => Math.random() - 0.5);

    let index = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            grid[row + i][col + j] = numbers[index++];
        }
    }
}

function unUsedInRow(grid: (number | null)[][], i: number, num: number): boolean {
    for (let j = 0; j < 9; j++) {
        if (grid[i][j] === num) {
            return false;
        }
    }
    return true;
}

function unUsedInCol(grid: (number | null)[][], j: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
        if (grid[i][j] === num) {
            return false;
        }
    }
    return true;
}

function checkIfSafe(grid: (number | null)[][], i: number, j: number, num: number): boolean {
    return unUsedInRow(grid, i, num) && unUsedInCol(grid, j, num) &&
           unUsedInBox(grid, i - (i % 3), j - (j % 3), num);
}

function fillDiagonal(grid: (number | null)[][]) {
    for (let i = 0; i < 9; i += 3) {
        fillBox(grid, i, i);
    }
}

function fillRemaining(grid: (number | null)[][], i: number, j: number): boolean {
    if (i === 9) {
        return true;
    }

    if (j === 9) {
        return fillRemaining(grid, i + 1, 0);
    }

    if (grid[i][j] !== null) {
        return fillRemaining(grid, i, j + 1);
    }

    for (let num = 1; num <= 9; num++) {
        if (checkIfSafe(grid, i, j, num)) {
            grid[i][j] = num;
            if (fillRemaining(grid, i, j + 1)) {
                return true;
            }
            grid[i][j] = null;
        }
    }

    return false;
}

function removeKDigits(grid: (number | null)[][], k: number) {
    console.log("removeKDigits: Initial k =", k);
    let attempts = 0; // To prevent infinite loops if k is too high or grid is already empty
    const maxAttempts = 81 * 2; // Try a few times more than total cells

    while (k > 0 && attempts < maxAttempts) {
        attempts++;
        let cellId = Math.floor(Math.random() * 81);
        let i = Math.floor(cellId / 9);
        let j = cellId % 9;

        console.log(`removeKDigits: Attempt ${attempts}, Cell (${i}, ${j}), Value: ${grid[i][j]}, k: ${k}`);

        if (grid[i][j] !== null) {
            console.log(`removeKDigits: Removing digit at (${i}, ${j})`);
            grid[i][j] = null;
            k--;
            console.log("removeKDigits: k after removal =", k);
        }
    }
    if (k > 0) {
        console.warn(`removeKDigits: Could not remove all ${k} digits after ${maxAttempts} attempts.`);
    }
}

export function generateCompleteSudoku(): (number | null)[][] {
    let grid: (number | null)[][] = [];
    let solved = false;
    while (!solved) {
        grid = new Array(9).fill(null).map(() => new Array(9).fill(null));
        fillDiagonal(grid);
        solved = fillRemaining(grid, 0, 0);
    }
    return grid;
}

export function createSudokuPuzzle(board: (number | null)[][], difficulty: 'Easy' | 'Medium' | 'Expert'): (number | null)[][] {
    let k;
    switch (difficulty) {
        case 'Easy':
            k = 20;
            break;
        case 'Medium':
            k = 40;
            break;
        case 'Expert':
            k = 60;
            break;
    }
    
    const puzzle = board.map(row => [...row]);
    console.log("Puzzle before removing digits:", puzzle);
    removeKDigits(puzzle, k);
    console.log("Puzzle after removing digits:", puzzle);
    return puzzle;
}

export function isSudokuSolved(grid: (number | null)[][]): boolean {
    const newGrid = grid.map(row => [...row]);
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const num = newGrid[row][col];
            if (num === null) {
                return false; // The puzzle is not complete
            }
            // Temporarily remove the number to check if the placement is valid
            newGrid[row][col] = null;
            if (!checkIfSafe(newGrid, row, col, num)) {
                newGrid[row][col] = num;
                return false; // The puzzle is not solved correctly
            }
            newGrid[row][col] = num;
        }
    }
    return true; // The puzzle is solved correctly
}
