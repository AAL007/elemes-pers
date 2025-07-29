'use client'

import React from "react"
import { useEffect, useState } from "react"
import { 
    Button,
    Input, 
    Tooltip,
    Radio,
    RadioGroup,
} from "@nextui-org/react"
import { PlusIcon } from "@/components/icon/plus-icon"
import { IconTrash, IconX, IconReload } from "@tabler/icons-react"
import { fetchAssessmentById, createOption, createQuestion, updateOption, updateQuestion, fetchQuestionAnswer } from "@/app/api/assignment/create-edit-assignment"
import { MsAssessment, MsOption, MsQuestion } from "@/app/api/data-model"
import { generateGUID } from "../../../../../../utils/utils"
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { uploadFileToAzureBlobStorage, replaceFileInAzureBlobStorage, deleteFileInAzureBlobStorageByUrl } from "@/app/api/azure-helper"

export type question = {
    questionId: string;
    question: string;
    image: File | null;
    imageUrl: string | null;
    options: option[];
}

type option = {
    optionId: string;
    option: string;
    isAnswer: boolean;
}

const defaultQuestion: question = {
    questionId: '',
    question: '',
    image: null,
    imageUrl: null,
    options: [
        {
            option: '',
            optionId: '',
            isAnswer: false
        }
    ]
}

const CreateEditAssignment = ({ params } : { params: {parameters: string}}) => {
    const userData = useSelector((state: RootState) => state.user);
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [questions, setQuestions] = useState<question[]>([defaultQuestion])
    const [counter, setCounter] = useState<number>(0)
    const [assessment, setAssessment] = useState<MsAssessment>()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isCreate, setIsCreate] = useState<boolean>(false)

    const fetchingAssessment = async() => {
        const res = await fetchAssessmentById(params.parameters[1])
        setAssessment(res.data[0])
    }

    const fetchingExistingQuestionAnswer = async() => {
        const res = await fetchQuestionAnswer(params.parameters[1])
        if(res.success){
            let tempQuestions: question[] = []
            let questionMap: {[key: string]: question} = {}

            for(let i = 0; i < res.data.length; i++){
                const row = res.data[i];
                const { questionId, question, imageUrl, optionId, option, isAnswer } = row;

                if (!questionMap[questionId]) {
                    questionMap[questionId] = {
                        questionId: questionId,
                        question: question,
                        image: null,
                        imageUrl: imageUrl,
                        options: []
                    };
                }

                questionMap[questionId].options.push({
                    optionId: optionId,
                    option: option,
                    isAnswer: isAnswer
                });
            }
            tempQuestions = Object.values(questionMap);

            console.log(tempQuestions)
            setQuestions(tempQuestions)
        }
    }

    useEffect(() => {
        fetchingAssessment()
        if(params.parameters[0] == 'create'){
            setIsCreate(true)
        }else{
            fetchingExistingQuestionAnswer()
            setIsCreate(false)
        }
    }, [])

    const handleButtonClick = () => {
        if(fileInputRef.current){
            fileInputRef.current.click()
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if(file){
            const reader = new FileReader()
            const updatedQuestions = [...questions]
            updatedQuestions[counter].image = file
            reader.onload = () => {
                updatedQuestions[counter].imageUrl = reader.result as string
                setQuestions(updatedQuestions)
            }
            reader.readAsDataURL(file);
        }
    }

    const handleAddMoreOption = () => {
        const updatedQuestions = [...questions]
        updatedQuestions[counter].options.push({
            optionId: '',
            option: '',
            isAnswer: false
        })
        setQuestions(updatedQuestions)
    }

    const handleDeleteOption = (index: number) => {
        const updatedQuestions = [...questions]
        updatedQuestions[counter].options.splice(index, 1)
        setQuestions(updatedQuestions)
    }

    const handleDeleteQuestion = () => {
        const updatedQuestions = [...questions]
        updatedQuestions.splice(counter, 1)
        setCounter(counter - 1)
        setQuestions(updatedQuestions)
    }

    const handleAddQuestion = () => {
        console.log(questions)
        const updatedQuestions = [...questions]
        console.log(updatedQuestions)
        updatedQuestions.push({
            questionId: '',
            question: '',
            image: null,
            imageUrl: null,
            options: [
                {
                    optionId: '',
                    option: '',
                    isAnswer: false
                }
            ]
        })
        console.log(updatedQuestions)
        setQuestions(updatedQuestions)
        setCounter(counter + 1)
    }

    const handleChangeIsAnswer = (index: number) => {
        const updatedQuestions = [...questions]
        updatedQuestions[counter].options = updatedQuestions[counter].options.map((option, optionIndex) => {
            if(optionIndex === index){
                return {
                    ...option,
                    isAnswer: true
                }
            }else{
                return {
                    ...option,
                    isAnswer: false
                }
            }
        })
        setQuestions(updatedQuestions)
    }

    const handleSubmit = async() => {
        setIsLoading(true)
        console.log(questions)
        for(let i = 0; i < questions.length; i++){
            let questionId = (isCreate || questions[i].questionId == '') ? generateGUID() : questions[i].questionId
            let blobUrl = questions[i].image ? (isCreate ? await uploadFileToAzureBlobStorage('assessment', questions[i].image as File, params.parameters[1], questionId) : await replaceFileInAzureBlobStorage('assessment', questions[i].image as File, params.parameters[1], questionId)) : questions[i].imageUrl
            const newQuestion: MsQuestion = {
                QuestionId: questionId,
                AssessmentId: params.parameters[1],
                Question: questions[i].question,
                ImageUrl: blobUrl,
                CreatedBy: userData.name,
                CreatedDate: new Date(),
                UpdatedBy: null,
                UpdatedDate: null
            }
            console.log(newQuestion)
            const res = isCreate ? await createQuestion(newQuestion) : await updateQuestion(newQuestion)
            if(!res.success){
                setIsLoading(false)
                alert(res.message)
                return
            }
            for(let j = 0; j < questions[i].options.length; j++){
                let optionId = (isCreate || questions[i].options[j].optionId == '') ? generateGUID() : questions[i].options[j].optionId
                const newOption: MsOption = {
                    OptionId: optionId,
                    QuestionId: questionId,
                    Option: questions[i].options[j].option,
                    IsAnswer: questions[i].options[j].isAnswer,
                    CreatedBy: userData.name,
                    CreatedDate: new Date(),
                    UpdatedBy: null,
                    UpdatedDate: null
                }
                console.log(newOption)
                const res = isCreate ? await createOption(newOption) : await updateOption(newOption)
                if(!res.success){
                    setIsLoading(false)
                    alert(res.message)
                    return
                }
            }
        }
        window.location.href = `/assignment/assignment-management`
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6 align-middle">
                <h1 className="text-2xl font-bold">{assessment?.AssessmentName}</h1>
                {counter > 0 && (
                    <Tooltip color="danger" content="Delete Question">
                        <span className="text-lg text-danger cursor-pointer active:opacity-50">
                            <IconTrash aria-disabled={isLoading} size={24} color="red" onClick={() => handleDeleteQuestion()} />
                        </span>
                    </Tooltip>
                )}
            </div>
            <div className="flex justify-between mt-4 items-center">
                <h2 className="text-lg font-bold mr-5">{counter + 1}. </h2>
                <Input
                    disabled={isLoading} 
                    variant="bordered" 
                    labelPlacement="inside" 
                    label="Question" 
                    placeholder="Enter Question" 
                    value={questions[counter].question}
                    onChange={(e) => {
                        const updatedQuestions = [...questions];
                        updatedQuestions[counter].question = e.target.value;
                        setQuestions(updatedQuestions);
                    }}
                />
            </div>
            <Button disabled={isLoading} disableRipple={true} className="ml-3 mt-3 border-none bg-transparent w-29" onClick={handleButtonClick}>
                {(questions[counter].image || (questions[counter].imageUrl && !isCreate)) ? <IconReload size={20} /> : <PlusIcon size={24} />}
                {(questions[counter].image || (questions[counter].imageUrl && !isCreate)) ? 'Change Image' : 'Add Image'}
            </Button>
            <input 
                type="file"
                ref={fileInputRef}
                style={{display: 'none'}}
                accept="image/*"
                onChange={handleFileChange}
            />
            {(questions[counter].image || (questions[counter].imageUrl && !isCreate)) && <img className="pl-8 w-1/4 h-1/4" src={questions[counter]?.imageUrl as string} alt="question-image" />}
            <RadioGroup isDisabled={isLoading} value={questions[counter].options.findIndex(x => x.isAnswer == true).toString()} onValueChange={(e) => {console.log(e); handleChangeIsAnswer(parseInt(e))}}>
                {questions[counter].options.map((option, index) => (
                    <Input 
                        disabled={isLoading}
                        key={index} 
                        variant="bordered" 
                        labelPlacement="inside" 
                        value={option.option}
                        startContent={
                            <Radio value={index.toString()}/>
                        }
                        endContent={
                            index == 0 ? (
                                <></>
                            ) : (
                                <Tooltip color="danger" content="Delete Option">
                                    <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                        <IconX aria-disabled={isLoading} size={24} color="red" onClick={() => handleDeleteOption(index)} />
                                    </span>
                                </Tooltip>
                            )
                        }
                        placeholder={`Enter option ${index+1}`} 
                        className="w-full mt-3 pl-8"
                        onChange={(e) => {
                            const updatedQuestions = [...questions];
                            updatedQuestions[counter].options[index].option = e.target.value;
                            setQuestions(updatedQuestions);
                        }}
                    />
                ))}
            </RadioGroup>
            <Button disabled={isLoading} disableRipple={true} className="ml-3 mt-3 border-none bg-transparent w-29" onClick={() => handleAddMoreOption()}>
                <PlusIcon size={24} />
                Add More Options
            </Button>
            <div className="mt-8 flex w-full pl-8 justify-end">
                {counter > 0 && (
                    <div className="mr-3">
                        <Button disabled={isLoading} variant="bordered" color="primary" onClick={() => setCounter(counter - 1)}>Back</Button>
                    </div>
                )}
                {(questions.length > 1 && counter+1 != questions.length) && (
                    <div className="mr-3">
                        <Button disabled={isLoading} color="primary" onClick={() => {setCounter(counter + 1)}}>Next</Button>
                    </div>
                )}
                <div className="mr-3">
                    <Button disabled={isLoading} color="secondary" onClick={() => {handleAddQuestion()}}>Add More Question</Button>
                </div>
                <div>
                    {<Button isLoading={isLoading} color="success" onClick={() => {handleSubmit()}}>Submit</Button>}
                </div>
            </div>
        </div>
    )
}

export default CreateEditAssignment