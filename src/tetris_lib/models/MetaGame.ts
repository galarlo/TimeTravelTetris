import { PositionedPiece, buildMatrix, hardDrop, setPiece, isEmptyPosition, Matrix } from './Matrix';
import { Game, initializePiece, pointsPerLine } from './Game';
import { pieces } from './Piece';
import * as PieceQueue from '../modules/piece-queue';
import { reorder } from '../../draggable-list/HorizontalDraggableList';

export type MetaAction =
    | {action: "DROP_PIECE", piece: PositionedPiece}
    | {action: "REORDER_MOVES", oldIndex: number, newIndex: number}
    | {action: "RESTART"}
    | {action: "TIME_TRAVEL_TO", index: number}

export type MetaGame = {
    moves: PositionedPiece[],
    tetrisGame: Game,
    shouldScrollToLatestMove: boolean
}

export function metaUpdate(metaGame: MetaGame, action: MetaAction): MetaGame {
    switch (action.action)
    {
        case "DROP_PIECE": {
            const pieceAtTop: PositionedPiece = {...action.piece, position: {...action.piece.position, y: 0}}
            const newPieces = [...metaGame.moves]
            newPieces.push(pieceAtTop)
            return {
                moves: newPieces,
                shouldScrollToLatestMove: true,
                tetrisGame: buildTetrisState(newPieces)
            }
        }
        case "REORDER_MOVES": {
            const newPieces = reorderTyped(metaGame.moves, action.oldIndex, action.newIndex)
            console.log({in: "metaUpdate->REORDER_MOVES", newPieces, metaGame})
            return {
                moves: newPieces,
                shouldScrollToLatestMove: false,
                tetrisGame: buildTetrisState(newPieces)
            }       
        }
        case "TIME_TRAVEL_TO":{
            const currentTetris: Game = {
                ...buildTetrisState(metaGame.moves.slice(0, Math.max(0, action.index - 1))),
                piece: metaGame.moves[action.index],
                queue: {
                    queue: metaGame.moves.slice(Math.min(metaGame.moves.length, action.index + 1)).map(positionedPiece => positionedPiece.piece),
                    bucket: [],
                    minimumLength: 5,
                },
            }

            return {
                ...metaGame, // TODO should scroll to traveled move. Maybe change `shouldScrollToLatestMove` to a `scrollTo: int`.
                tetrisGame: currentTetris
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

export function buildTetrisState(pieces: PositionedPiece[]): Game {
    let matrix = buildMatrix();
    let linesCleared = 0
    for (const piece of pieces) {
        const {newMatrix, linesClearedByMove} = applyTetrisMove(matrix, piece)
        matrix = newMatrix
        linesCleared += linesClearedByMove   
    }

    // TODO consistent queue
    const queue = PieceQueue.create(5);
    const newQueueResult = PieceQueue.getNext(queue)
    const nextPiece = initializePiece(newQueueResult.piece);
    
    return {
        lines: linesCleared,
        matrix: matrix,
        heldPiece: undefined,
        points: linesCleared * pointsPerLine,
        queue: newQueueResult.queue,
        piece: nextPiece,
        state: isEmptyPosition(matrix, nextPiece) ? 'PLAYING' : 'LOST',
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
        shouldScrollToLatestMove: false,
        tetrisGame: buildTetrisState([])
    }
}