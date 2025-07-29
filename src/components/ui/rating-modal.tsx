'use client'

import React from "react";
import { useState } from "react";
import { Rating } from "@mui/material";
import { ModalContent, Modal, ModalBody, ModalHeader, ModalFooter, useDisclosure, Button } from "@nextui-org/react";
import { createActivityLog } from "@/app/api/course/course-detail-list";
import { StudentActivityLog } from "@/app/api/data-model";

const RatingModal = ({
    isOpen,
    onOpenChange,
    setRating,
    fetchIsActivityLogWithSameLearningStyleExist,
    studentId,
    sessionId,
    learningStyleId,
    duration,
} : {
    isOpen: boolean;
    onOpenChange: () => void;
    setRating: (rating: number) => void;
    fetchIsActivityLogWithSameLearningStyleExist: () => void;
    studentId: string;
    sessionId: string;
    learningStyleId: string;
    duration: number;
}) => {
    // const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [rating, setUpdateRating] = useState(0);

    const handleChangeRating = (newValue: number) => {
        setRating(newValue);
        setUpdateRating(newValue);
    }

    const addActivityLog = async() => {
        const activityLog: StudentActivityLog = {
            StudentId: studentId,
            SessionId: sessionId,
            LearningStyleId: learningStyleId,
            TimeSpent: duration,
            Rating: rating,
            CreatedDate: new Date().toISOString(),
        }

        const res = await createActivityLog(activityLog);
        if(!res.success){
            alert(res.message);
            return;
        }
        fetchIsActivityLogWithSameLearningStyleExist();
    }
    
    return (
        <Modal
            backdrop="blur"
            isDismissable={false}
            isKeyboardDismissDisabled={false}
            hideCloseButton={true}
            isOpen={isOpen} 
            onOpenChange={() => {
                onOpenChange()
            }}
            placement="top-center"
        >
            <ModalContent>
            {(onClose) => (
                <>
                <ModalHeader className="flex flex-col gap-1">Do you think this content match your learning style?</ModalHeader>
                <ModalBody>
                    <Rating
                        name="simple-controlled"
                        value={rating}
                        onChange={(event, newValue) => {
                            handleChangeRating(newValue ?? 0);
                        }}
                    />
                </ModalBody>
                <ModalFooter>
                    {/* <Button color="danger" variant="flat" onPress={() => {onClose()}}>Close</Button> */}
                    <Button color="primary" onPress={async() => {await addActivityLog(); onClose()}}>Submit</Button>
                </ModalFooter>
                </>
            )}
            </ModalContent>
        </Modal>
    )
}

export default RatingModal;