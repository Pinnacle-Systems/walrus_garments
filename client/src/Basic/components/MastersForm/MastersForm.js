
import React, { useEffect } from "react";
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
  New
} from "../../../UiComponents/Buttons/Buttons";
import secureLocalStorage from "react-secure-storage";
import { useGetPagePermissionsByIdQuery } from "../../../redux/services/PageMasterService";
import { toast } from "react-toastify";




const MastersForm = ({
  model,
  saveData,
  setReadOnly,
  masterClass,
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
  step
}) => {


  const openTabs = useSelector((state) => state?.openTabs);

  const activeTab = openTabs?.tabs?.find(tab => tab.active);

  const currentPageId = activeTab?.id

  const userRoleId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userRoleId"
  );
  const {
    data: currentPagePermissions,
    isLoading,
    isFetching,
  } = useGetPagePermissionsByIdQuery({ currentPageId, userRoleId }, { skip: !(currentPageId && userRoleId) });

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

  // const hasPermission = (callback, type) => {
  //   if (childRecordValidationActions.includes(type) && childRecord !== 0) {
  //     toast.error("Child Record Exists", { position: "top-center" });
  //     return;
  //   }
  //   if (IsSuperAdmin()) {
  //     callback();
  //   } else {
  //     if (isCurrentFinYearActive()) {
  //       if (IsDefaultAdmin()) {
  //         console.log("Hit Masterform")
  //         callback();

  //       } else if (currentPagePermissions?.data[type]) {
  //         console.log("hit")
  //         callback();
  //       } else {
  //         toast.error(`No Permission to ${type}...!`, {
  //           position: "top-center",
  //         });
  //       }
  //     } else {
  //       toast.error(" Past Fin Year Only can view!", { position: "top-center" });
  //     }
  //   }
  // };
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
          toast.info(`No Permission to ${type}...!`, {
            position: "top-center",
          });


        }
      } else {
        toast.info(" Past Fin Year Only can view!", { position: "top-center" });
      }
    }
  };
  return (
    <div className="h-full px-6 py-3  bg-gray-50 rounded-md shadow-inner overflow-auto ">
      <div className="flex flex-col h-full">
        {model && (
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{model}</h2>
        )}

        <div className="bg-white rounded-md p-2 shadow-md ">
          {children}
        </div>

        <div className={`${"flex gap-x-5 items-center mt-auto pt-3 pb-3 border-t  border-gray-200 "} "${masterClass}" `}>
          <CloseButton
            onClick={() => {
              onClose();
              emptyErrors();
            }}
          />

          <SaveButton
            onClick={() => {
              hasPermission(saveData, "save");
            }}

          />
           <New
            onClick={() => {
              hasPermission(saveData, "new");
            }}

          />
            
          <div className="flex space-x-3">
            <DeleteButton
                onClick={() => {
                  hasPermission(deleteData, "delete");
                }}
              />
            {readOnly && (
              <EditButton
                onClick={() => {
                  hasPermission(setReadOnly, "edit");
                  if (!readOnly) {
                    toast.info("You Can Edit The Datas !..")
                  }
                }}
              />
            )}

          </div>

        </div>
      </div>
    </div>
  );

};


export default MastersForm;
