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

export const MetaScoreChart = ({metaStates}: {metaStates: MetaState[]}): JSX.Element => {

    return <Line options={options} data={GetData(metaStates)} />
}

const MAX_CHART_LENGTH = 20

const GetData = (metaStates: MetaState[]): ChartData<"line", number[]> => {
    const latestMetaState = metaStates[metaStates.length - 1]
    const tetrisStates = buildTetrisStateHistory(latestMetaState.moves, latestMetaState.moves.length, latestMetaState.seed)

    // console.log({in: 'ScoreChart.GetData', data: TakeLast(tetrisStates, MAX_CHART_LENGTH)})

    return {
        labels: TakeLast([...Array(tetrisStates.length).keys()], MAX_CHART_LENGTH),
        datasets: [
            {
                label: 'current timeline',
                data: TakeLast(tetrisStates, MAX_CHART_LENGTH).map(game => game.points),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            // {
            //     label: 'previous timeline',
            //     data: TakeLast(tetrisStates, MAX_CHART_LENGTH).map(game => game.points),
            //     borderColor: 'rgb(53, 162, 235)',
            //     backgroundColor: 'rgba(53, 162, 235, 0.5)',
            // },
        ],
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