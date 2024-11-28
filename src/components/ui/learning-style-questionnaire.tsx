"use client"

import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader, ModalFooter, ModalContent, Button, Radio, RadioGroup } from "@nextui-org/react";
import * as tf from '@tensorflow/tfjs';
import { updateLearningStyle } from "@/app/api/home/dashboard";

const options = [
    {id: 1, option: 'Strongly Disagree'},
    {id: 2, option: 'Disagree'},
    {id: 3, option: 'Neutral'},
    {id: 4, option: 'Agree'},
    {id: 5, option: 'Strongly Agree'}
]

const realQuestions = [
    {id: 1, question: 'I learn better by reading what the teacher writes on the chalkboard.', options},
    {id: 2, question: 'When I read instructions, I remember them better.', options},
    {id: 3, question: 'I understand better when I read instructions.', options},
    {id: 4, question: 'I learn better by reading than by listening to someone.', options},
    {id: 5, question: 'I learn more by reading textbooks than by listening to lectures.', options},
    {id: 6, question: 'When the teacher tells me the instructions I understand better.', options},
    {id: 7, question: 'When someone tells me how to do something in class, I learn it better.', options},
    {id: 8, question: 'I remember things I have heard in class better than things I have read.', options},
    {id: 9, question: 'I learn better in class when the teacher gives a lecture', options},
    {id: 10, question: 'I learn better in class when i listen to someone.', options},
    {id: 11, question: 'I prefer to learn by doing something in class.', options},
    {id: 12, question: 'When I do things in class, I learn better.', options},
    {id: 13, question: 'I enjoy learning in class by doing experiments.', options},
    {id: 14, question: 'I understand things better in class when I participate in role-playing.', options},
    {id: 15, question: 'I grasp concepts more effectively in class when i engage in role-playing activities', options}
]

const questions = [
    {id: 1, question: 'I learn better by reading what the teacher writes on the chalkboard.', options},
    {id: 2, question: 'I prefer to learn by doing something in class.', options},
    {id: 3, question: 'I learn better in class when the teacher gives a lecture', options},
    {id: 4, question: 'When I do things in class, I learn better.', options},
    {id: 5, question: 'When someone tells me how to do something in class, I learn it better.', options},
    {id: 6, question: 'When I read instructions, I remember them better.', options},
    {id: 7, question: 'I understand better when I read instructions.', options},
    {id: 8, question: 'I understand things better in class when I participate in role-playing.', options},
    {id: 9, question: 'I remember things I have heard in class better than things I have read.', options},
    {id: 10, question: 'I enjoy learning in class by doing experiments.', options},
    {id: 11, question: 'I learn better by reading than by listening to someone.', options},
    {id: 12, question: 'I learn better in class when i listen to someone.', options},
    {id: 13, question: 'I grasp concepts more effectively in class when i engage in role-playing activities', options},
    {id: 14, question: 'I learn more by reading textbooks than by listening to lectures.', options},
    {id: 15, question: 'When the teacher tells me the instructions I understand better.', options}
]

export type Answer = {
    question: string;
    answer: number;
}

const defaultAnswers: Answer[] = [
    {question: '', answer: 0},
    {question: '', answer: 0},
    {question: '', answer: 0},
    {question: '', answer: 0},
    {question: '', answer: 0},
    {question: '', answer: 0},
    {question: '', answer: 0},
    {question: '', answer: 0},
    {question: '', answer: 0},
    {question: '', answer: 0},
    {question: '', answer: 0},
    {question: '', answer: 0},
    {question: '', answer: 0},
    {question: '', answer: 0},
    {question: '', answer: 0},
]

const LearningStyleQuestionnaire = ({
    setIsLearningStyleNotExist,
    isLearningStyleNotExist = false,
    userId = ''
} : {
    setIsLearningStyleNotExist: (value: boolean) => void;
    isLearningStyleNotExist?: boolean;
    userId: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [counter, setCounter] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>(defaultAnswers)

    const handleAnswerChange = (value: number) => {
        setAnswers((prevAnswers) =>
            prevAnswers.map((answer, index) =>
              index === counter ? { question: questions[counter].question, answer: value } : answer
            )
        );
    }

    const questionnairePrediction = async (answer: number[]) => {
        try {
            const model = await tf.loadLayersModel('model/model.json');
            const inputData = tf.tensor2d([answer], [1, answer.length]);
            const output = model.predict(inputData) as tf.Tensor;
            const predictedClass = output.argMax(-1).dataSync()[0];
            const learningStyles = ['Visual', 'Kinesthetic', 'Auditory']
            // console.log(learningStyles[predictedClass]);
            const res = await updateLearningStyle(learningStyles[predictedClass], userId);
            if(!res.success){
                alert(res.message);
                return;
            }
            alert(`Your learning style is ${learningStyles[predictedClass]}. You can update your learning style in my profile page.`);
            setIsLearningStyleNotExist(false);
            setIsOpen(false);
        } catch (error) {
            console.error(error)
        }
    }
    

    const handleSubmit = async () => {
        let emptyAnswer = answers.filter((answer) => answer.answer === 0);
        if(emptyAnswer.length > 0){
            alert('Please answer all the questions');
            return;
        }
        const sortedAnswer = realQuestions.map((x: any) => {
            return {
                question: x.question,
                answer: answers.find((y: any) => y.question === x.question)?.answer ?? 1
            }
        })
        console.log(sortedAnswer);
        const answerValues = sortedAnswer.map((answer) => answer.answer);
        questionnairePrediction(answerValues);
    }

    useEffect(() => {
        setIsOpen(isLearningStyleNotExist);
    }, [isLearningStyleNotExist])

    return (
        <Modal hideCloseButton={true} isOpen={isOpen} isDismissable={false} isKeyboardDismissDisabled={true} backdrop="blur">
            <ModalContent className="px-2">
                <ModalHeader className="flex flex-col gap-1 text-2xl mt-2">VAK Questionnaire</ModalHeader>
                <ModalBody>
                    <div className="justify-center align-center">
                        <p className="font-semibold text-lg">{`${counter+1}. ${questions[counter].question}`}</p>
                        <RadioGroup value={answers[counter].answer.toString()} onValueChange={(e) => handleAnswerChange(parseInt(e))}>
                            {questions[counter].options.map((option) => (
                                <Radio className="shadow-sm items-center justify-start inline-flex w-full max-w-md bg-content1 cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent data-[selected=true]:border-primary mt-3 mb-2" key={option.id} value={option.id.toString()}>{option.option}</Radio>
                            ))}
                        </RadioGroup>
                    </div>
                </ModalBody>
                <ModalFooter className="mb-2">
                    {counter > 0 && <Button variant="bordered" color="primary" onClick={() => setCounter(counter - 1)}>Back</Button>}
                    {counter === questions.length - 1 ? <Button color="primary" onClick={() => handleSubmit()}>Submit</Button> : <Button color="primary" onClick={() => setCounter(counter + 1)}>Next</Button>}
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default LearningStyleQuestionnaire;