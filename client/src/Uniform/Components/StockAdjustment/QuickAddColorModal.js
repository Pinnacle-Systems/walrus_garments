import React, { useState } from "react";
import { TextInput } from "../../../Inputs";
import { useAddColorMasterMutation } from "../../../redux/uniformService/ColorMasterService";
import { getCommonParams } from "../../../Utils/helper";
import { toast } from "react-toastify";
import Modal from "../../../UiComponents/Modal";
import { Check, X } from "lucide-react";

const QuickAddColorModal = ({ isOpen, onClose, colorName, onCreated }) => {
  const params = getCommonParams();
  const [name, setName] = useState(colorName || "");
  const [active, setActive] = useState(true);

  const [addColor] = useAddColorMasterMutation();

  const handleSave = async () => {
    if (!name) {
      toast.info("Please fill color name");
      return;
    }

    try {
      const payload = {
        name,
        active,
        companyId: params.companyId,
      };

      const response = await addColor(payload).unwrap();
      if (response.statusCode === 0) {
        toast.success("Color created successfully");
        onCreated(response.data);
        onClose();
      } else {
        toast.error(response.message || "Failed to create color");
      }
    } catch (error) {
      console.error("Error creating color:", error);
      toast.error("An error occurred");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthClass="w-[350px]">
      <div className="p-4 bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-lg font-bold text-gray-800">Quick Add Color</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <TextInput
            name="Color Name"
            value={name}
            setValue={setName}
            required={true}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Save Color
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default QuickAddColorModal;
