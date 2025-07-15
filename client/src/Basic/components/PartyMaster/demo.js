     <div className="bg-white p-3 rounded-md border border-gray-200">
         <div className="grid grid-cols-2 mb-2">
          <div className='col-span-1'>
                  <DropdownWithSearch 
                    options={branchTypeData?.data}
                    labelField={"name"}
                    label={"Branch Category"}
                     required
                         value={branchType}
                    setValue={setBranchType}
                  />

          </div>
              </div>
          <div className="space-y-2">
            <div className="relative">
              <TextInput
                    name="Branch Name"
                    type="text"
                    value={branchName}
                    setValue={setBranchName}
                    // readOnly={readOnly}
                     required
                    disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100"
                  /> 
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
               <TextArea
                name="Address"
                value={branchAddress}
                setValue={setBranchAddress}
                required
                rows={2}
                className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="123 Fashion St, Textile District"
              /> 
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="relative">
               <TextInput
                    name="Email"
                    type="text"
                    value={branchEmail}
                    setValue={setBranchEmail}
                    // readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100"
                  /> 
              </div>
            </div>

            <div className="space-y-2">
           <TextInput
                    name="Website"
                    type="text"
                    value={branchWebsite}
                    setValue={setBranchWebsite}
                    // readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100"
                  /> 
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
           
            </div>
           <div className="space-y-2">
              <div className="relative">
                <TextInput
                    name="Contact Person Name"
                    type="text"
                    value={branchContactPerson}
                    setValue={setBranchcontactPerson}
                    // readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100"
                  /> 
              </div>
            </div>
          
          </div>
        <div className="grid grid-cols-2 gap-3">

              <div className="">
                <TextInput
                    name="Contact Number"
                    type="text"
                    value={branchContact}
                    setValue={setBranchContact}
                    // readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100"
                  /> 
              
              </div>
                <TextInput
                            name="Designation"
                            type="text"
                            // value={contact}
    
                            // setValue={setContact}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100 w-10"
                          />
                            <TextInput
                            name="Department"
                            type="text"
                            // value={contact}
    
                            // setValue={setContact}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100 w-10"
                          />
                  <div>

                      <TextInput
                    name="Opening Hours"
                    type="text"
                    value={openingHours}
                    setValue={setopeningHours}
                    // readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100"
                  /> 
                  </div>
            
                    </div>
      </div> 