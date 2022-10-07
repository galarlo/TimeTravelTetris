import React, { useEffect, useReducer, useRef, useState } from 'react';
import styled from 'styled-components';
import Gameboard from '../tetris_lib/components/gameboard';
import { buildTetrisState, metaUpdate, getGameboards, getEmptyMetaGame, MetaGame } from '../tetris_lib/models/MetaGame';
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
import { resolve } from 'path';


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
  const currentGame = buildTetrisState(metaGame.moves, metaGame.currentGame, metaGame.seed)
  const moves = metaGame.moves
  const gameboards = getGameboards(moves)
  return (
    <div style={{width: '100%', height: '100%', margin: 0, padding: 0, position: 'absolute'}}>
      <div style={{height: '50%', width: '100%',}}>
        <GamePanel key={hash(currentGame)} metaDispatcher={metaDispatcher} inititalGame={currentGame} />
      </div>
      <div style={{height: '50%', width: '100%'}}>
        <HorizontalDraggableList 
          items={gameboards.slice(0, -1).map((board, i) => {return {id: i + "", content: 
          <ScrollIntoView isEnabled={i === metaGame.currentGame || metaGame.currentGame >= metaGame.moves.length}>
            <div style={resolve_style(metaGame, i)} onClick={() => metaDispatcher({action: "TIME_TRAVEL_TO", index: i})}>
              <Gameboard matrix={board} piece={moves[i]}/> 
            </div>
          </ScrollIntoView>}})} 
          onReorder={(oldIndex: number, newIndex: number) => metaDispatcher({action: "REORDER_MOVES", oldIndex, newIndex})} />
      </div>
    </div>
  )
  return (
  <Container>
    <LeftHalf>
      {/* <Heading>
        <Title>react tetris</Title>
        <SubTitle>Embed a game of Tetris in your React app</SubTitle>
        <TypedShell>npm install --save react-tetris</TypedShell>
      </Heading> */}

      <HorizontalDraggableList 
        items={gameboards.slice(0, -1).map((board, i) => {return {id: i + "", content: 
        <ScrollIntoView isEnabled={i === metaGame.currentGame || metaGame.currentGame >= metaGame.moves.length}>
          <div style={resolve_style(metaGame, i)} onClick={() => metaDispatcher({action: "TIME_TRAVEL_TO", index: i})}>
            <Gameboard matrix={board} piece={moves[i]}/> 
          </div>
        </ScrollIntoView>}})} 
        onReorder={(oldIndex: number, newIndex: number) => metaDispatcher({action: "REORDER_MOVES", oldIndex, newIndex})} />
    </LeftHalf>
    <RightHalf style={{border: metaGame.currentGame >= metaGame.moves.length ? '1  px green solid' : ''}}>
      <VerticallyCenterChildren>
          <GamePanel key={hash(currentGame)} metaDispatcher={metaDispatcher} inititalGame={currentGame} />
      </VerticallyCenterChildren>
    </RightHalf>
  </Container>
  )
};

function resolve_style(metaGame: MetaGame, index: number): React.CSSProperties {
  if (index == metaGame.currentGame) {
    return {border: '3px green solid'}
  } else if (metaGame.disallowed_time_travels.includes(index)) {
    return {border: '2px #813e3e dotted', opacity: '0.5'}
  } else {
    return {}
  }
}