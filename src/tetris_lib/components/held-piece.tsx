import React from 'react';
import { HeldPiece } from '../models/Game';
import PieceView from './piece-view';

export default function HeldPieceView(props: {heldPiece: HeldPiece | undefined}): JSX.Element {
  return <PieceView piece={props?.heldPiece?.piece} />;
}
