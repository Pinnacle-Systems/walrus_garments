import React from 'react'
import SingleBoard from './SingleBoard'
import { DragDropContext } from 'react-beautiful-dnd'
import { useUpdateLeadMutation } from '../../../redux/services/LeadFormService';

const LeadBoard = ({ onClick }) => {
    const [updateLead] = useUpdateLeadMutation();

    const onDragEnd = async (result) => {
        const { destination, draggableId } = result;
        const leadId = draggableId?.split("-")[1];
        const droppableUniqueId = destination?.droppableId;

        // Make API call to update card position
        if (!destination) return;
        try {
            await updateLead({ id: leadId, status: droppableUniqueId })
        } catch (error) {
            console.error('Error updating card position: ', error);
        }
    };
    const boards = [
        {
            name: "Leads"
        },
        {
            name: "Quotes"
        },
        {
            name: "Revision"
        },
        {
            name: "InProgress"
        },
        {
            name: "Cancelled"
        },

    ]
    return (
        <div className='w-full'>
            <div className='text-2xl text-center w-full text-blue-500'>Lead Tracking Board</div>
            <div className='grid grid-cols-5 h-[400px] w-full'>
                <DragDropContext onDragEnd={onDragEnd}>
                    {boards.map(((i, index) =>
                        <SingleBoard name={i.name} key={index} onClick={onClick} />
                    ))}
                </DragDropContext>
            </div>
        </div>
    )
}

export default LeadBoard