import React, { CSSProperties } from 'react';
import { MetaState, buildTetrisState, buildTetrisStateHistory } from '../tetris_lib/models/MetaGame';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
    ChartDataset,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Game } from '../tetris_lib/models/Game';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);


export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: 'Tetris Score',
        },
    }
};

export const MetaScoreChart = ({metaStates, previousTimelineMetaStates}: { metaStates: MetaState[]; previousTimelineMetaStates: MetaState[] | null; }): JSX.Element => {

    return <Line options={options} data={GetData(metaStates, previousTimelineMetaStates)} />
}

const MAX_CHART_LENGTH = 20

const GetData = (metaStates: MetaState[], previousTimelineStates: MetaState[] | null): ChartData<"line", number[]> => {
    const latestMetaState = metaStates[metaStates.length - 1]
    const tetrisStates = buildTetrisStateHistory(latestMetaState.moves, latestMetaState.moves.length, latestMetaState.seed)

    // console.log({in: 'ScoreChart.GetData', data: TakeLast(tetrisStates, MAX_CHART_LENGTH)})

    let datasets: ChartDataset<"line", number[]>[] = [
        {
            label: 'current timeline',
            data: TakeLast(tetrisStates, MAX_CHART_LENGTH).map(game => game.points),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }
    ]

    if (previousTimelineStates != null) {
        const previousTimelineLastState = previousTimelineStates[previousTimelineStates.length - 1]
        const prevTimelineTetris = buildTetrisStateHistory(previousTimelineLastState.moves, previousTimelineLastState.moves.length, previousTimelineLastState.seed)
        const paddedTimeline = PadArray(prevTimelineTetris, tetrisStates.length, null)
        datasets.push({
            label: 'previous timeline',
            data: TakeLast(paddedTimeline, MAX_CHART_LENGTH).map(game => game != null ? game.points : -1),
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
        })
        console.log({in: 'ScoreChart.GetData - prev timeline', previousTimelineStates, currentTetris: tetrisStates, prevTetris: prevTimelineTetris, prevtetrisPadded: paddedTimeline, datasets})
    }

    return {
        labels: TakeLast([...Array(tetrisStates.length).keys()], MAX_CHART_LENGTH),
        datasets,
    };
}

function TakeLast<T>(array: T[], n: number) : T[] {
    if (array.length < n) {
        return Array(n - array.length).concat(array)
    }

    let result: T[] = Array(n)
    for (let i = 0; i < n; i++){
        result[i] = array[array.length - n + i]
    }

    return result
}

function PadArray<T>(arr: T[],len: number,fill: T): T[] {
    let padded = [...arr]
    for (let i = 0; i < arr.length - len; i++)
    {
        padded.push(fill)
    }
    
    return padded
  }
  