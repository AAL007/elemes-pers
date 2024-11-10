'use server'

import * as tf from '@tensorflow/tfjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        let {answerValues} = await request.json();
        const modelUrl = `${process.env.APPLICATION_URL}/model/model.json`;
        const model = await tf.loadLayersModel(modelUrl);
        // const inputData = tf.tensor2d([answer], [1, answer.length]);
        // const output = model.predict(inputData) as tf.Tensor;
        // const predictedClass = output.argMax(-1).dataSync()[0];
        // const learningStyles = ['Visual', 'Auditory', 'Kinesthetic']
        // console.log(learningStyles[predictedClass]);
        return NextResponse.json({ message: 'Model loaded successfully' });
    } catch (error) {
        if(error instanceof Error){
            return NextResponse.json({message: error.message, status: 500});
        }
    }
}
