import React from 'react';
import PieceQueue from '../modules/piece-queue';
import PieceView from './piece-view';

export default function PieceQueueView(props: {queue: PieceQueue}): JSX.Element {
  return (
    <div>
      {props.queue.queue.map((piece, i) => (
        <PieceView piece={piece} key={i} />
      ))}
    </div>
  );
}
