import React, { useState } from 'react';
import empty from "../../../assets/empty.png"
import { DeleteButton } from '../../../Buttons';
import { getImageUrlPath } from '../../../Utils/helper';
import { Upload } from 'lucide-react';

const BrowseSingleImage = ({ picture, setPicture, readOnly }) => {
    const [isDragging, setIsDragging] = useState(false);

    // Format image for preview
    const imageFormatter = () => {
        if (picture) {
            if (typeof picture === "object") {
                return URL.createObjectURL(picture);
            } else {
                return picture;
            }
        }
        return null;
    };

    const handleFile = (file) => {
        if (readOnly) return;
        console.log(file)
        if (file) {
            setPicture(file);
        } else {
            alert("Please upload a valid image file.");
        }
    };

    // Drag-over event
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    // Drag leave event
    const handleDragLeave = () => {
        setIsDragging(false);
    };

    // Drop event
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const imageWidth = "150px";
    const imageHeight = "150px";

    // Handle click event to trigger the file input
    const handleClick = () => {
        if (!picture) {
            document.getElementById("profileImage").click();  // Trigger the file input on click
        }
    };
    return (
        <div
            className={`flex gap-1 flex-col items-center rounded-lg p-4 transition-all duration-200  `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}

        >
            <div className={`outline-2 outline-dashed  rounded ${isDragging ? "outline-green-500" : "outline-gray-400"}`}
                onClick={handleClick} >
                {Boolean(picture) ? (
                    <img
                        style={{ height: imageHeight, width: imageWidth, objectFit: 'cover' }}
                        src={imageFormatter()}
                        alt="Uploaded"
                    />
                ) : (
                    <div
                        style={{ height: imageHeight, width: imageWidth, objectFit: 'cover' }} className='flex justify-center items-center text-secondary'>
                        <Upload size={40} />
                    </div>
                )}
            </div>

            <div className='flex flex-col'>
                <div className='flex justify-center'>
                    {/* File Input */}
                    <input
                        type="file"
                        id="profileImage"
                        className='hidden'
                        accept="image/*"
                        onChange={(e) => handleFile(e.target.files[0])}
                    />

                    {/* Drag & Drop or Browse */}
                    {!picture && (
                        <span className="text-xs max-w-[150px] text-center text-gray-500 w-full">
                            {isDragging ? "Release to upload" : "click to upload"}
                        </span>
                    )}
                </div>
            </div>

            {/* Delete Image */}
            {picture && (
                <span onClick={() => { if (!readOnly) { setPicture(null) } }} className='cursor-pointer rounded-md h-8 px-2 text-xs hover:border-red-400 text-red-500'>
                    Remove
                </span>
            )}
        </div>
    );
};

export default BrowseSingleImage;