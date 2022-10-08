import { PositionedPiece, buildMatrix, hardDrop, setPiece, isEmptyPosition, Matrix } from './Matrix';
import { Game, initializePiece, pointsPerLine } from './Game';
import { Piece, pieces } from './Piece';
import * as PieceQueue from '../modules/piece-queue';
import { reorder } from '../../draggable-list/HorizontalDraggableList';
import {pieces as possiblePieces} from '../models/Piece'
import { cyrb53 } from '../../utils';

export type MetaAction =
    | {action: "DROP_PIECE", piece: PositionedPiece}
    | {action: "REORDER_MOVES", oldIndex: number, newIndex: number}
    | {action: "RESTART"}
    | {action: "TIME_TRAVEL_TO", index: number}

export type MetaGame = {
    metaMoves: MetaAction[],
    // seed: number,
}

export type MetaState = {
    moves: PositionedPiece[],
    currentGame: number,
    seed: number,
    disallowed_time_travels: number[]
    metaScore: number,
}

export function metaUpdate(metaGame: MetaGame, action: MetaAction): MetaGame {
    return {
        ...metaGame,
        metaMoves: [...metaGame.metaMoves, action],
    }
}

export function applyMetaMove(prevState: MetaState, action: MetaAction): MetaState {
    switch (action.action)
    {
        case "DROP_PIECE": {
            const newPiece: PositionedPiece = {...action.piece, position: {...action.piece.position, y: 0}}
            const newMoves = [...prevState.moves]
            if (prevState.currentGame >= prevState.moves.length) {
                newMoves.push(newPiece)
            } else {
                newMoves[prevState.currentGame] = newPiece
            }
            
            return {
                ...prevState,
                moves: newMoves,
                currentGame: prevState.currentGame + 1,
                disallowed_time_travels: [prevState.currentGame],
                metaScore: prevState.metaScore + scoreDiff(prevState.moves, newMoves, prevState.seed)
            }
        }
        case "REORDER_MOVES": {
            const newPieces = reorderTyped(prevState.moves, action.oldIndex, action.newIndex)
            console.log({in: "metaUpdate->REORDER_MOVES", newPieces, metaGame: prevState})
            return {
                ...prevState,
                moves: newPieces,
                currentGame: action.newIndex,
                disallowed_time_travels: [],
                metaScore: prevState.metaScore + 3 * scoreDiff(prevState.moves, newPieces, prevState.seed),
            }       
        }
        case "TIME_TRAVEL_TO":{
            if (prevState.disallowed_time_travels.includes(action.index)) {
                return prevState
            }

            return {
                ...prevState,
                currentGame: action.index,
                disallowed_time_travels: [],
            }
        }
        case "RESTART":
            return getEmptyMetaGameState()
        default: {
            console.error({in: "metaUpdate", msg: "can't handle an action type!", action})
            throw new Error("can't handle an action type!")
        }
    }
}

export function buildMetaStates(metaGame: MetaGame, current: number | null = null): MetaState[] {
    current ||= metaGame.metaMoves.length
    let prevState = getEmptyMetaGameState()
    let metaStates: MetaState[] = []
    for (const metaMove of metaGame.metaMoves) {
        const currentState = applyMetaMove(prevState, metaMove)
        metaStates.push(currentState)
        prevState = currentState
    }

    return metaStates
}

export function buildTetrisState(pieces: PositionedPiece[], current: number, seed: number): Game {
    let matrix = buildMatrix();
    let linesCleared = 0
    for (const piece of pieces.slice(0, current)) {
        const {newMatrix, linesClearedByMove} = applyTetrisMove(matrix, piece)
        matrix = newMatrix
        linesCleared += linesClearedByMove   
    }
    
    const currentPiece = current < pieces.length ? pieces[current] : initializePiece(getQueuePieceAt(current, seed))
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
                .concat(getQueuePieceAt(pieces.length, seed)),
            bucket: [],
            minimumLength: 5,
        }
    }
}

function scoreDiff(old: PositionedPiece[], newMoves: PositionedPiece[], seed: number){
    const oldTetrisScore = buildTetrisState(old, old.length, seed).points
    const newTetrisScore = buildTetrisState(newMoves, newMoves.length, seed).points
    return newTetrisScore - oldTetrisScore

}

export function getQueuePieceAt(index: number, seed: number): Piece {
    const hash = cyrb53(index.toString(), seed)
    return possiblePieces[hash % possiblePieces.length]
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

export function getEmptyMetaGameState(): MetaState {
    return {
        moves: [],
        currentGame: 0,
        seed: Date.now(),
        disallowed_time_travels: [],
        metaScore: 0,
    }
}

export function getEmptyMetaGame(): MetaGame {
    return {metaMoves: [{action: "RESTART"}]}
}