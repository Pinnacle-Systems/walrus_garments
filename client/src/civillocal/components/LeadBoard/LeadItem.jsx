import {
    Card,
    CardBody,
    Typography,
} from "@material-tailwind/react";
import { getDateFromDateTimeToDisplay } from "../../../Utils/helper";
import moment from "moment";
import { useState } from "react";
import { ARROW_DOWN_ICON } from '../../../icons';
import { ARROW_UP_ICON } from '../../../icons';
import { HYPER_ICON } from '../../../icons';


export default function LeadItem({ leadItem, onClick, leadId, boardData }) {

    let todayDate = new Date()
    let leadCreateDate = new Date(leadItem?.createdAt)
    const [isView, setIsView] = useState(false)

    let createDate = leadCreateDate.setDate(leadCreateDate.getDate() + parseInt("3"))





    const colorCode = () => {
        if (leadItem?.dueDate) {
            if ((moment(new Date(leadItem?.dueDate).getTime()).format("YYYY-MM-DD") === moment(todayDate.getTime()).format("YYYY-MM-DD") && !leadItem?.Quotes)) {
                return "bg-amber-400"
            }
            else if ((moment(new Date(leadItem?.dueDate).getTime()).format("YYYY-MM-DD") > moment(todayDate.getTime()).format("YYYY-MM-DD") && !leadItem?.Quotes)) {
                return "bg-green-300"
            }
            else if ((moment(new Date(leadItem?.dueDate).getTime()).format("YYYY-MM-DD") < moment(todayDate.getTime()).format("YYYY-MM-DD") && !leadItem?.Quotes)) {
                return "bg-red-300"
            }
            else {
                return "bg-sky-300"
            }

        }
        else if (!leadItem?.dueDate) {

            if ((moment(new Date(createDate).getTime()).format("YYYY-MM-DD") === moment(todayDate.getTime()).format("YYYY-MM-DD") && !leadItem?.Quotes)) {
                return "bg-amber-400"
            }
            else if ((moment(new Date(createDate).getTime()).format("YYYY-MM-DD") > moment(todayDate.getTime()).format("YYYY-MM-DD") && !leadItem?.Quotes)) {
                return "bg-green-300"
            }
            else if ((moment(new Date(createDate).getTime()).format("YYYY-MM-DD") < moment(todayDate.getTime()).format("YYYY-MM-DD") && !leadItem?.Quotes)) {
                return "bg-red-300"
            }
            else {
                return "bg-sky-300"
            }

        }
    }

    return (
        <Card className={`${"w-full text-xs mt-2"} ${colorCode()} `} >
            <CardBody className="-mt-2">
                <Typography variant="h6" className="text-xs" color="blue-gray">
                    {leadItem?.docId}-----{leadItem?.Party?.name}-----{leadItem?.contact}
                </Typography>

                <div className="flex justify-around mt-1 w-full">

                    <Typography variant="h6" className="text-xs w-[95%] h-full p-0.5" color="blue-gray">
                        {leadItem?.location}
                    </Typography>
                    <button
                        type='button'
                        onClick={() => onClick(leadId)}
                        className='text-lg mt-1 text-black w-[5%] h-full'>{HYPER_ICON}
                    </button>

                </div>

                {/* <button
                    type='button'
                    onClick={() => {
                        setIsView(prev => !prev)
                    }}
                    className='text-xs text-black border border-gray-500 bg-gray-200 rounded-lg p-0.5 mt-1'>Read More....
                </button> */}


                {/* {
                    (isView) && */}
                <>
                    <Typography variant="h10" className="text-xs mt-1">
                        {leadItem?.workDescription} ----  <span className="text-xs">
                            {getDateFromDateTimeToDisplay(leadItem?.createdAt)}
                        </span>
                    </Typography>
                    {/* <Typography variant="h10" className="text-xs">
                        <span className="text-xs">
                            {getDateFromDateTimeToDisplay(leadItem?.createdAt)}
                        </span>
                    </Typography> */}
                </>
                {/* } */}

            </CardBody>
        </Card>
    );
}