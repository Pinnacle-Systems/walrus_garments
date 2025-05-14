import React from "react";
import { useSelector } from "react-redux";
import {
  NewButton,
  SaveButton,
  EditButton,
  DeleteButton,
  CloseButton,
  PrintButtonOnly,
  SearchButton,
  OpenTable,
  SaveExitButton,
} from "../../../UiComponents/Buttons/Buttons";
import toast from "react-hot-toast";
import secureLocalStorage from "react-secure-storage";
import { useGetPagePermissionsByIdQuery } from "../../../redux/services/PageMasterService";

const MastersForm = ({
  model,
  saveData,
  saveExitData,
  setReadOnly,
  deleteData,
  onClose = null,
  onSearch = null,
  onNew,
  childRecord = 0,
  onPrint = null,
  openReport = null,
  childRecordValidationActions = ["edit", "delete"],
  children,
  readOnly,
  emptyErrors,
  newForm,
  step,
}) => {
  const openTabs = useSelector((state) => state.openTabs);
  const activeTab = openTabs.tabs.find((tab) => tab.active);
  const currentPageId = activeTab.id;

  const userRoleId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userRoleId"
  );
  const {
    data: currentPagePermissions,
    isLoading,
    isFetching,
  } = useGetPagePermissionsByIdQuery(
    { currentPageId, userRoleId },
    { skip: !(currentPageId && userRoleId) }
  );

  const IsSuperAdmin = () => {
    return JSON.parse(
      secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "superAdmin"
      )
    );
  };

  const IsDefaultAdmin = () => {
    return JSON.parse(
      secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "defaultAdmin"
      )
    );
  };

  const isCurrentFinYearActive = () => {
    return Boolean(
      secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentFinYearActive"
      )
    );
  };

  const hasPermission = (callback, type) => {
    if (childRecordValidationActions.includes(type) && childRecord !== 0) {
      toast.error("Child Record Exists", { position: "top-center" });
      return;
    }
    if (IsSuperAdmin()) {
      callback();
    } else {
      if (isCurrentFinYearActive()) {
        if (IsDefaultAdmin()) {
          callback();
        } else if (currentPagePermissions.data[type]) {
          callback();
        } else {
          toast.error(`No Permission to ${type}...!`, {
            position: "top-center",
          });
        }
      } else {
        toast.error("Past Fin Year Only can view!", {
          position: "top-center",
        });
      }
    }
  };

  return (
    <div className="p-4 bg-gray-50">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
      
        <div className="bg-indigo-600 px-4 py-2">
          {model && (
            <h4 className="text-lg font-semibold text-white">
              {model}
            </h4>
          )}
        </div>
        
        {/* Content Section - Reduced padding */}
        <div className="p-4">
          <div className="space-y-4">
            {children}
          </div>
          
          {/* Action Buttons - More compact */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className="flex gap-2">
                <CloseButton
                  onClick={() => {
                    onClose();
                    emptyErrors();
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors duration-200 text-sm"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {!readOnly ? (
                  <>
                    <SaveButton
                      onClick={() => {
                        hasPermission(saveData, "edit");
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 text-sm"
                    />
                    <SaveExitButton
                      onClick={() => {
                        hasPermission(saveExitData, "edit");
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors duration-200 text-sm"
                    />
                  </>
                ) : (
                  <>
                    <DeleteButton
                      onClick={() => {
                        hasPermission(deleteData, "delete");
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 text-sm"
                    />
                    <EditButton
                      onClick={() => {
                        hasPermission(setReadOnly, "edit");
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors duration-200 text-sm"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MastersForm;