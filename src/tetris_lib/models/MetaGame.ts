import { PositionedPiece, buildMatrix, hardDrop, setPiece, isEmptyPosition } from './Matrix';
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
        const droppedPiece = hardDrop(matrix, piece)
        const [newMatrix, linesClearedByMove] = setPiece(matrix, droppedPiece)
        matrix = newMatrix
        linesCleared += linesClearedByMove   
    }

    // TODO consistent queue
    const queue = PieceQueue.create(5);
    const nextPiece = initializePiece(PieceQueue.getNext(queue));
    
    return {
        lines: linesCleared,
        matrix: matrix,
        heldPiece: undefined,
        points: linesCleared * pointsPerLine,
        queue,
        piece: nextPiece,
        state: isEmptyPosition(matrix, nextPiece) ? 'PLAYING' : 'LOST'
    }
}