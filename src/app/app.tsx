import React, { useReducer, useState } from 'react';
import styled from 'styled-components';
import Gameboard from '../tetris_lib/components/gameboard';
import { buildTetrisState, metaUpdate, getGameboards } from '../tetris_lib/models/MetaGame';
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

const App = (): JSX.Element => {
  const [moves, metaDispatcher] = useReducer(metaUpdate, [])
  const mainGamePanelState = buildTetrisState(moves)
  const gameboards = getGameboards(moves)
  return (
  <Container>
    <LeftHalf>
      {/* <Heading>
        <Title>react tetris</Title>
        <SubTitle>Embed a game of Tetris in your React app</SubTitle>
        <TypedShell>npm install --save react-tetris</TypedShell>
      </Heading> */}

      <HorizontalDraggableList 
        items={gameboards.map((board, i) => {return {id: i + "", content: 
        <div style={{border: '1px black solid'}}>
          <Gameboard matrix={board} piece={moves[i]}/> 
        </div>}})} 
        onReorder={(oldIndex: number, newIndex: number) => metaDispatcher({action: "REORDER_MOVES", oldIndex, newIndex})} />
    </LeftHalf>
    <RightHalf>
      <VerticallyCenterChildren>
        <GamePanel key={hash(mainGamePanelState)} metaDispatcher={metaDispatcher} inititalGame={mainGamePanelState}/>
      </VerticallyCenterChildren>
    </RightHalf>
  </Container>
)};

export default App;
