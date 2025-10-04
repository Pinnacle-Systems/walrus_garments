import React, { useCallback, useEffect, useState } from 'react'
import { discountTypes } from '../../../Utils/DropdownData';

import { Loader } from '../../../Basic/components';
import { substract as s } from '../../../Utils/helper';
import { useGetTaxTemplateByIdQuery } from '../../../redux/services/TaxTemplateServices';
import { useGetTaxTermMasterQuery } from '../../../redux/services/TaxTermMasterServices';


const TaxDetailsFullTemplate = ({ poItems, currentIndex: index, setCurrentSelectedIndex, readOnly, handleInputChange, isSupplierOutside, taxTypeId }) => {
    const substract = s
    const [formulas, setFormulas] = useState([])
    console.log(poItems, "poItems")

    const { data, isLoading, isFetching } = useGetTaxTemplateByIdQuery(taxTypeId, { skip: !taxTypeId })

    const { data: taxTermMaster, isLoading: isTemplateTermLoading, isFetching: isTemplateTermFetching } = useGetTaxTermMasterQuery(taxTypeId)

    console.log(data, taxTermMaster, '19');


   function getFormula(key) {
    // Direct row fields
    if (row[key] !== undefined) {
        return isNaN(row[key]) ? row[key] : parseFloat(row[key]);
    }

    // Check already calculated formulas
    const formulaObj = formulas.find(f => f.name?.toUpperCase() === key.toUpperCase());
    if (formulaObj) {
        return Number(getRegex(formulaObj.amount)) || 0;
    }

    return 0;
}



    function getRegex(formula) {
        if (!formula) return 0;
        let input = formula;

        const words = formula.match(/\{(.*?)\}/g);
        if (words) {
            words.forEach(element => {
                const key = element.slice(1, -1);
                input = input.replace(element, getFormula(key));
            });
        }

        try {
  
            const result = eval(input); // ⚠️ formula comes from DB, safe because backend controls it
            return result || 0;
        } catch (e) {
            console.error("Error evaluating formula:", formula, e);
            return 0;
        }
    }



    const getName = useCallback((id) => {
        if (!taxTermMaster) return ""
        let data = taxTermMaster.data.find(t => parseInt(t.id) === parseInt(id))
        if (!data) return ""
        return data.name
    }, [taxTermMaster])

    const getIsPoItem = useCallback((id) => {
        if (!taxTermMaster) return false
        let data = taxTermMaster.data.find(t => parseInt(t.id) === parseInt(id))
        if (!data) return false
        return data.isPoWise
    }, [taxTermMaster])


    useEffect(() => {
        if (data && taxTermMaster) {
            setFormulas(data?.data?.TaxTemplateDetails?.map(f => {
                return { name: (getName(f.taxTermId)), isPowise: getIsPoItem(f.taxTermId), displayName: f.displayName, value: f.value, amount: f.amount }
            }))
        }

    }, [isLoading, isFetching, isTemplateTermFetching, isTemplateTermLoading, taxTypeId, taxTermMaster, data, getName, getIsPoItem])


    if (!formulas || isFetching || isLoading || isTemplateTermFetching || isTemplateTermLoading) {
        return <Loader />
    }
    const row = poItems[index];

    console.log(row, "row72")

    if (!row) return null



    let price = isNaN(parseFloat(row["price"])) ? 0 : parseFloat(row["price"])
    let qty = isNaN(parseFloat(row["qty"])) ? 0 : parseFloat(row["qty"])
    let discountType = row["discountType"];
    let discountValue = isNaN(parseFloat(row["discountValue"])) ? 0 : parseFloat(row["discountValue"]);
    let taxPercent = isNaN(parseFloat(row["taxPercent"])) ? 0 : parseFloat(row["taxPercent"])
    if (!taxTermMaster || !formulas) return <div>Tax Term Not Loaded</div>
    console.log(price, qty, "formulas85")



    return (
        <div className={`${(Number.isInteger(index)) ? "block" : "hidden"} bg-gray-200 z-50 overflow-auto `}>
            <div className=" flex text-sm justify-around text-center border-t border-r border-l border-gray-500 bo font-bold p-1">
                <span>
                    Tax Details
                </span>
            </div>
            <table className="border border-gray-500 w-full text-xs text-start">
                <thead className="border border-gray-500">
                    <tr>
                        <th className="w-52 border border-gray-500">Tax Name</th>
                        <th className="w-28 border border-gray-500">Value</th>
                        <th className="w-28 border border-gray-500">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-500">Discount Type</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <select autoFocus disabled={readOnly} className='text-left w-full rounded h-8'
                                value={discountType}
                                onChange={(e) => handleInputChange(e.target.value, index, "discountType")}
                            >
                                <option hidden>
                                    Select
                                </option>
                                {discountTypes.map((option, index) => <option key={index} value={option.value} >
                                    {option.show}
                                </option>)}
                            </select>
                        </td>
                    </tr>
                    <tr className='h-7'>
                        <td className="border border-gray-500">Discount</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <input type="text" disabled={readOnly} className='h-7 w-full text-right' value={discountValue} onChange={(e) => handleInputChange(e.target.value, index, "discountValue")} />
                        </td>
                    </tr>
                    <tr className='h-7'>
                        <td className="border border-gray-500">Tax</td>
                        <td className="border border-gray-500" colSpan={2}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setCurrentSelectedIndex("");
                                }
                            }
                            }
                        >
                            <input type="text" disabled={readOnly} className='h-7 w-full text-right'
                                value={taxPercent} onChange={(e) => { handleInputChange(e.target.value, index, "taxPercent") }} />
                        </td>
                    </tr>
                    {formulas.filter(item => !item.isPowise).map((f, i) =>
                        <tr key={i}>
                            <td className="border border-gray-500 font-semibold">{f.displayName}</td>
                            <td className="border border-gray-500 font-semibold text-right">
                                {Number(getRegex(f.value)).toFixed(2)}
                            </td>
                            <td className="border border-gray-500 font-semibold text-right">
                                {Number(getRegex(f.amount)).toFixed(2)}
                            </td>
                        </tr>
                    )}

                </tbody>
            </table>
        </div>
    )
}

export default TaxDetailsFullTemplate;