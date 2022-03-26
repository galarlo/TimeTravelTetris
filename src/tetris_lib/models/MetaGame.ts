import { PositionedPiece, buildMatrix, hardDrop, setPiece, isEmptyPosition, Matrix } from './Matrix';
import { Game, initializePiece, pointsPerLine } from './Game';
import { pieces } from './Piece';
import * as PieceQueue from '../modules/piece-queue';

export type MetaAction =
    | {action: "DROP_PIECE", piece: PositionedPiece}

export function metaUpdate(pieces: PositionedPiece[], action: MetaAction): PositionedPiece[] {
    switch (action.action)
    {
        case "DROP_PIECE": {
            const pieceAtTop: PositionedPiece = {...action.piece, position: {...action.piece.position, y: 0}}
            const newPieces = [...pieces]
            newPieces.push(pieceAtTop)
            return newPieces
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
    let matrices = []
    let matrix = buildMatrix()
    for (const move of moves) {
        let {newMatrix} = applyTetrisMove(matrix, move)
        matrices.push(newMatrix)
        matrix = newMatrix
    }

    return matrices
}