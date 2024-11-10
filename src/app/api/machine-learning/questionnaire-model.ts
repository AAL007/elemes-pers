'use client'

import * as tf from '@tensorflow/tfjs';

export async function questionnairePrediction(answer: number[]) {
    try {
        console.log(answer)
        const model = await tf.loadLayersModel('http://localhost:3000/model/model.json');
        console.log(model)
        const inputData = tf.tensor2d([answer], [1, answer.length]);
        const output = model.predict(inputData) as tf.Tensor;
        const predictedClass = output.argMax(-1).dataSync()[0];
        const learningStyles = ['Visual', 'Auditory', 'Kinesthetic']
        console.log(learningStyles[predictedClass]);
    } catch (error) {
        console.error(error)
    }
}
