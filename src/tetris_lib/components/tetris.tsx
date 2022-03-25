import React from 'react';
import Gameboard from './gameboard';
import * as Game from '../models/Game';
import HeldPieceView from './held-piece';
import PieceQueueView from './piece-queue';
import { KeyboardMap, useKeyboardControls } from '../hooks/useKeyboardControls';
import { MetaAction } from '../models/MetaGame';

type RenderFn = (params: {
  // HeldPiece: React.ComponentType<any>;
  // Gameboard: React.ComponentType<any>;
  // PieceQueue: React.ComponentType<any>;
  HeldPiece: () => JSX.Element;
  Gameboard: () => JSX.Element;
  PieceQueue: () => JSX.Element;
  points: number;
  linesCleared: number;
  level: number;
  state: Game.State;
  controller: Controller;
}) => React.ReactElement;

type Controller = {
  pause: () => void;
  resume: () => void;
  hold: () => void;
  hardDrop: () => void;
  moveDown: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  flipClockwise: () => void;
  flipCounterclockwise: () => void;
  restart: () => void;
};

type Props = {
  keyboardControls?: KeyboardMap;
  children: RenderFn;
  metaDispatcher: React.Dispatch<MetaAction>;
  initialGame: Game.Game;
};

const defaultKeyboardMap: KeyboardMap = {
  down: 'MOVE_DOWN',
  left: 'MOVE_LEFT',
  right: 'MOVE_RIGHT',
  space: 'HARD_DROP',
  z: 'FLIP_COUNTERCLOCKWISE',
  x: 'FLIP_CLOCKWISE',
  up: 'FLIP_CLOCKWISE',
  p: 'TOGGLE_PAUSE',
  c: 'HOLD',
  shift: 'HOLD'
};

// https://harddrop.com/wiki/Tetris_Worlds#Gravity
const tickSeconds = (level: number) =>
  (0.8 - (level - 1) * 0.007) ** (level - 1);

export default function Tetris(props: Props): JSX.Element {
  const [game, dispatch] = React.useReducer((game: Game.Game, action: Game.Action) => Game.update(game, action, props.metaDispatcher), props.initialGame);
  console.log({in: "tetris", props, game})
  const keyboardMap = props.keyboardControls ?? defaultKeyboardMap;
  useKeyboardControls(keyboardMap, dispatch);
  const level = Game.getLevel(game);

  React.useEffect(() => {
    let interval: number | undefined;
    if (game.state === 'PLAYING') {
      interval = window.setInterval(() => {
        dispatch('TICK');
      }, tickSeconds(level) * 1000);
    }

    return () => {
      window.clearInterval(interval);
    };
  }, [game.state, level]);

  const controller = React.useMemo(
    () => ({
      pause: () => dispatch('PAUSE'),
      resume: () => dispatch('RESUME'),
      hold: () => dispatch('HOLD'),
      hardDrop: () => dispatch('HARD_DROP'),
      moveDown: () => dispatch('MOVE_DOWN'),
      moveLeft: () => dispatch('MOVE_LEFT'),
      moveRight: () => dispatch('MOVE_RIGHT'),
      flipClockwise: () => dispatch('FLIP_CLOCKWISE'),
      flipCounterclockwise: () => dispatch('FLIP_COUNTERCLOCKWISE'),
      restart: () => dispatch('RESTART')
    }),
    [dispatch]
  );

  return props.children({
        HeldPiece: () => <HeldPieceView heldPiece={game.heldPiece} />,
        Gameboard: () => <Gameboard matrix={game.matrix} piece={game.piece} />,
        PieceQueue: () => <PieceQueueView queue={game.queue} />,
        points: game.points,
        linesCleared: game.lines,
        state: game.state,
        level,
        controller
      })
}
