import React from 'react';
import { viewMatrix } from '../models/Game';
import { Matrix, PositionedPiece } from '../models/Matrix';
import { getClassName } from '../models/Piece';

export default function GameboardView(props: {matrix: Matrix, piece: PositionedPiece}): JSX.Element {
  console.log({message: "In GameboardView", props})
  const gameboardWithPiece = viewMatrix(props.matrix, props.piece)
  return (
    <table className="game-board">
      <tbody>
        {gameboardWithPiece.map((row, i) => {
          const blocksInRow = row.map((block, j) => {
            const classString = `game-block ${
              block ? getClassName(block) : 'block-empty'
            }`;
            return <td key={j} className={classString} />;
          });

          return <tr key={i}>{blocksInRow}</tr>;
        })}
      </tbody>
    </table>
  );
}
