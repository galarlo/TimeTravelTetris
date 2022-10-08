import React, { useEffect, useReducer, useRef, useState } from 'react';
import styled from 'styled-components';
import Gameboard from '../tetris_lib/components/gameboard';
import { buildTetrisState, applyMetaMove, getGameboards, getEmptyMetaGameState, MetaGame, metaUpdate, buildMetaStates, MetaState, getEmptyMetaGame } from '../tetris_lib/models/MetaGame';
import {Digits, DigitsProps} from './GamePanel';
import GamePanel from './GamePanel';
import TypedShell from './TypedShell';
import { HeldPiece } from '../tetris_lib/models/Game';
import HeldPieceView from '../tetris_lib/components/held-piece';
import styles from '../react-draggable-lists-master/src/styles.css';
import {
  List,
  arrayMove,
  arrayRemove
} from "baseui/dnd-list";
import HorizontalDraggableList from '../draggable-list/HorizontalDraggableList';
import hash from 'object-hash'
import ScrollIntoView from './scrollIntoView';
import { MetaScoreChart } from './ScoreChart';


const Container = styled.div`
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  font-weight: 300;
  width: 100%;
  position: relative;
`;

const LeftHalf = styled.div`
  width: 50%;
  min-height: 100vh;
  background: #fafafa;
  border-right: 1px solid #eaeaea;
  padding: 0 18px;
`;

const RightHalf = styled.div`
  width: 50%;
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
`;

const VerticallyCenterChildren = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 100vh;
`;

const Heading = styled(VerticallyCenterChildren)`
  text-align: center;
`;

const Title = styled.h1`
  font-weight: 300;
  color: #000;
`;

const SubTitle = styled.h2`
  font-weight: 300;
  font-size: 18px;
`;

const TenthScaled = styled.div`{transform: scale(0.3)}`

export const App = (): JSX.Element => {
  const [metaGame, metaDispatcher] = useReducer(metaUpdate, getEmptyMetaGame())
  console.log({in: "app", metaGame})
  const metaStates = buildMetaStates(metaGame)
  const currentMetaState = metaStates[metaStates.length - 1]
  const currentGame = buildTetrisState(currentMetaState.moves, currentMetaState.currentGame, currentMetaState.seed)
  const moves = currentMetaState.moves
  const gameboards = getGameboards(moves)
  return (
    <div style={{width: '100%', height: '100%', margin: 0, padding: 0, position: 'absolute'}}>
      <div style={{height: '50%', width: '100%', display: 'flex'}}>
        <GamePanel key={hash(currentGame)} metaDispatcher={metaDispatcher} inititalGame={currentGame} />
        <div style={{marginLeft: '3%'}}>
              <p>
                tetris points
                <br />
                <Digits>{currentGame.points}</Digits>
              </p>
              <p>
                meta-tetris points
                <br />
                <Digits>{currentMetaState.metaScore}</Digits> <br/>
                (<Digits>{ metaScoreDiff(metaStates) }</Digits> changed)
              </p>
              <p>
                lines
                <br />
                <Digits>{currentGame.lines}</Digits>
              </p>
        </div>
        <div style={{marginLeft: '3%'}}>
          <MetaScoreChart metaStates={metaStates}/>
        </div>
      </div>
      <div style={{height: '50%', width: '100%'}}>
        <HorizontalDraggableList 
          items={gameboards.slice(0, -1).map((board, i) => {return {id: i + "", content: 
          <ScrollIntoView isEnabled={i === currentMetaState.currentGame || currentMetaState.currentGame >= currentMetaState.moves.length}>
            <div style={resolve_style(currentMetaState, i)} onClick={() => metaDispatcher({action: "TIME_TRAVEL_TO", index: i})}>
              <Gameboard matrix={board} piece={moves[i]}/> 
            </div>
          </ScrollIntoView>}})} 
          onReorder={(oldIndex: number, newIndex: number) => metaDispatcher({action: "REORDER_MOVES", oldIndex, newIndex})} />
      </div>
    </div>
  )
};

function resolve_style(metaState: MetaState, index: number): React.CSSProperties {
  if (index === metaState.currentGame) {
    return {border: '3px green solid'}
  } else if (metaState.disallowed_time_travels.includes(index)) {
    return {border: '2px #813e3e dotted', opacity: '0.5'}
  } else {
    return {}
  }
}

function metaScoreDiff(metaStates: MetaState[]): number {
  if (metaStates.length <= 2) return 0
  return metaStates[metaStates.length - 2].metaScore - metaStates[metaStates.length - 1].metaScore
}