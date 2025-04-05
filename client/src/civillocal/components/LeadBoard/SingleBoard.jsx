// App.js
import React, { useState, useEffect } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { useGetLeadQuery } from '../../../redux/services/LeadFormService';
import LeadItem from './LeadItem';
import { getCommonParams } from '../../../Utils/helper';

const SingleBoard = ({ name, onClick }) => {
  const [boardData, setBoardData] = useState([{}]);

  const { branchId } = getCommonParams()
  const { data: leadData } = useGetLeadQuery({ params: { branchId, status: name } })




  useEffect(() => {
    setBoardData(leadData?.data || []);
  }, [leadData]);


  return (
    <Droppable droppableId={name} direction="horizontal" type="COLUMN" >
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} >
          <div className='w-full'>
            <div className='w-full text-center bg-gray-400 rounded'>
              {name}
            </div>
            {boardData.map((leadItem) => (
              <Draggable key={`Draggable-${leadItem.id}`} draggableId={`Draggable-${leadItem.id}`} index={leadItem.id}
                isDragDisabled={true}
              >

                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <LeadItem key={leadItem.id} leadItem={leadItem} onClick={onClick} leadId={leadItem.id} boardData={boardData} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default SingleBoard;
