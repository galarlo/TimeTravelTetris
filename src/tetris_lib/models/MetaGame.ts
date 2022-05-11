import { PositionedPiece, buildMatrix, hardDrop, setPiece, isEmptyPosition, Matrix } from './Matrix';
import { Game, initializePiece, pointsPerLine } from './Game';
import { pieces } from './Piece';
import * as PieceQueue from '../modules/piece-queue';
import { reorder } from '../../draggable-list/HorizontalDraggableList';
import {pieces as possiblePieces} from '../models/Piece'

export type MetaAction =
    | {action: "DROP_PIECE", piece: PositionedPiece}
    | {action: "REORDER_MOVES", oldIndex: number, newIndex: number}
    | {action: "RESTART"}
    | {action: "TIME_TRAVEL_TO", index: number}

export type MetaGame = {
    moves: PositionedPiece[],
    currentGame: number,
}

export function metaUpdate(metaGame: MetaGame, action: MetaAction): MetaGame {
    switch (action.action)
    {
        case "DROP_PIECE": {
            const newPiece: PositionedPiece = {...action.piece, position: {...action.piece.position, y: 0}}
            const newMoves = [...metaGame.moves]
            if (metaGame.currentGame >= metaGame.moves.length) {
                newMoves.push(newPiece)
            } else {
                newMoves[metaGame.currentGame] = newPiece
            }
            
            return {
                moves: newMoves,
                currentGame: metaGame.currentGame + 1,
            }
        }
        case "REORDER_MOVES": {
            const newPieces = reorderTyped(metaGame.moves, action.oldIndex, action.newIndex)
            console.log({in: "metaUpdate->REORDER_MOVES", newPieces, metaGame})
            return {
                moves: newPieces,
                currentGame: metaGame.currentGame,
            }       
        }
        case "TIME_TRAVEL_TO":{
            return {
                ...metaGame,
                currentGame: action.index,
            }
        }
        case "RESTART":
            return getEmptyMetaGame()
        default: {
            console.error({in: "metaUpdate", msg: "can't handle an action type!", action})
            throw new Error("can't handle an action type!")
        }
    }
}

export function buildTetrisState(pieces: PositionedPiece[], current: number): Game {
    let matrix = buildMatrix();
    let linesCleared = 0
    for (const piece of pieces.slice(0, current)) {
        const {newMatrix, linesClearedByMove} = applyTetrisMove(matrix, piece)
        matrix = newMatrix
        linesCleared += linesClearedByMove   
    }
    
    const currentPiece = current < pieces.length ? pieces[current] : initializePiece(possiblePieces[current % possiblePieces.length]) // TODO fix queue
    return {
        lines: linesCleared,
        matrix: matrix,
        heldPiece: undefined,
        points: linesCleared * pointsPerLine,
        state: currentPiece === undefined || isEmptyPosition(matrix, currentPiece) ? 'PLAYING' : 'LOST',
        piece: currentPiece,
        queue: {
            queue: pieces.slice(Math.min(pieces.length, current + 1))
                .map(positionedPiece => positionedPiece.piece)
                .concat(possiblePieces[pieces.length % possiblePieces.length]), // TODO fix queue
            bucket: [],
            minimumLength: 5,
        }
    }
}

export function applyTetrisMove(matrix: Matrix, pieceToDrop: PositionedPiece): {newMatrix: Matrix, linesClearedByMove: number} {
    const droppedPiece = hardDrop(matrix, pieceToDrop)
    const [newMatrix, linesClearedByMove] = setPiece(matrix, droppedPiece)
    return {newMatrix, linesClearedByMove}
}

export function getGameboards(moves: PositionedPiece[]): Matrix[] {
    let matrix = buildMatrix()
    let matrices = [matrix]
    for (const move of moves) {
        let {newMatrix} = applyTetrisMove(matrix, move)
        matrices.push(newMatrix)
        matrix = newMatrix
    }

    return matrices
}

export function reorderTyped<T>(list: Iterable<T>, startIndex: number, endIndex: number): T[] {
    return reorder(list, startIndex, endIndex)
};

export function getEmptyMetaGame(): MetaGame {
    return {
        moves: [],
        currentGame: 0,
    }
}