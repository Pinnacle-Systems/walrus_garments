import React, { useEffect, useState, useCallback } from 'react';
import { BRANCHES_API, FIN_YEAR_API, USERS_API } from '../../../Api';
import { dropDownFinYear, dropDownListObject } from '../../../Utils/contructObject';
import { getData } from '../../../Utils/Apicalls';
import secureLocalStorage from 'react-secure-storage';
import { useNavigate } from 'react-router-dom';
import { HOME_PATH } from '../../../Route/urlPaths';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Building2, Calendar, ChevronRight, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

const BASE_URL = process.env.REACT_APP_SERVER_URL

const BranchAndFinYearForm = ({ setIsGlobalOpen }) => {
    const [loading, setLoading] = useState(false);
    const [currentFinYear, setcurrentFinYear] = useState(secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + 'currentFinYear')
        ?
        secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + 'currentFinYear')
        : "");
    const [currentBranch, setCurrentBranch] = useState(secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + 'currentBranchId')
        ?
        secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + 'currentBranchId')
        : "");

    const [finYears, setFinYears] = useState([]);
    const [branches, setBranches] = useState([]);

    const retrieveFinYearData = useCallback(() => getData(FIN_YEAR_API, setFinYears, setLoading, { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }), []);
    useEffect(retrieveFinYearData, [retrieveFinYearData]);

    const retrieveBranchData = useCallback(() => {
        if (JSON.parse(secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "defaultAdmin"))) {
            getData(BRANCHES_API, setBranches, setLoading, {
                active: true, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
            });
        } else {
            axios({
                method: 'get',
                url: BASE_URL + USERS_API + `/${secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userId")}`
            }).then((result) => {
                if (result.status === 200) {
                    if (result.data.statusCode === 0) {
                        setBranches(result.data.data.UserOnBranch.map((branch) => { return { branchName: branch.Branch.branchName, id: branch.Branch.id } }));
                    }
                } else {
                    console.log(result);
                }
            }, (error) => {
                console.log(error);
                Swal.fire({
                    title: "Server Down",
                    icon: "error",

                });
            });
        }

    }, []);
    useEffect(retrieveBranchData, [retrieveBranchData]);

    useEffect(() => {
        if (branches.length > 0 && !currentBranch) {
            setCurrentBranch(branches[0]?.id || "");
        }
        if (finYears.length > 0 && !currentFinYear) {
            let selectedFinYears = dropDownFinYear(finYears?.filter(val => val?.active));
            setcurrentFinYear(selectedFinYears[0]?.value || "");
        }
    }, [branches, finYears, currentBranch, currentFinYear])

    const navigate = useNavigate();

    const onSubmit = () => {
        if (!(currentBranch && currentFinYear)) {
            toast.info("Select Branch and Fin. Year", { position: 'top-center' });
            return
        }
        secureLocalStorage.setItem(sessionStorage.getItem("sessionId") + "currentBranchId", currentBranch);
        secureLocalStorage.setItem(sessionStorage.getItem("sessionId") + "currentFinYear", currentFinYear);
        secureLocalStorage.setItem(sessionStorage.getItem("sessionId") + "currentFinYearActive", isCurrentFinYearActive());
        navigate(HOME_PATH);
        window.location.reload();
    }

    const isCurrentFinYearActive = () => {
        const year = finYears.find((finYr) => finYr.id === parseInt(currentFinYear));
        return year ? year.active : false;
    }

    return (
        <div className="flex flex-col items-center justify-center bg-transparent w-full max-w-md mx-auto p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-white rounded-[40px] shadow-2xl overflow-hidden border border-stone-100"
            >
                <div className="px-8 pt-10 pb-6">
                    <h2 className="text-2xl font-bold text-stone-900 mb-2">Session Details</h2>
                    <p className="text-stone-500 text-sm">Please select your working environment.</p>
                </div>

                <form className="px-8 pb-10 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-700 uppercase tracking-widest pl-1" htmlFor="branch">
                            Branch
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Building2 className="h-4 w-4 text-stone-400 group-focus-within:text-stone-900 transition-colors" />
                            </div>
                            <select
                                id="branch"
                                name="branch"
                                value={currentBranch}
                                onChange={(e) => { setCurrentBranch(e.target.value) }}
                                className="block w-full pl-11 pr-10 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-stone-900 transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="" hidden>Select Branch</option>
                                {dropDownListObject(branches, "branchName", "id").map((branch) => (
                                    <option key={branch.value} value={branch.value}>
                                        {branch.show}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <ChevronRight className="h-4 w-4 text-stone-400 rotate-90" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-700 uppercase tracking-widest pl-1" htmlFor="finyear">
                            Financial Year
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Calendar className="h-4 w-4 text-stone-400 group-focus-within:text-stone-900 transition-colors" />
                            </div>
                            <select
                                id="finyear"
                                name="finyear"
                                value={currentFinYear}
                                onChange={(e) => { setcurrentFinYear(e.target.value) }}
                                className="block w-full pl-11 pr-10 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-stone-900 transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="" hidden>Select Financial Year</option>
                                {dropDownFinYear(finYears).map((finyear) => (
                                    <option key={finyear.value} value={finyear.value}>
                                        {finyear.show}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <ChevronRight className="h-4 w-4 text-stone-400 rotate-90" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={() => { setIsGlobalOpen(false) }}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 border border-stone-200 text-stone-600 rounded-2xl font-bold text-sm hover:bg-stone-50 hover:text-stone-900 transition-all active:scale-[0.98]"
                            type="button"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>
                        <button
                            onClick={onSubmit}
                            className="flex-[2] py-3.5 px-6 bg-stone-900 text-white rounded-2xl font-bold text-sm hover:bg-black shadow-lg shadow-stone-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            type="button"
                        >
                            Enter Workspace
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default BranchAndFinYearForm;