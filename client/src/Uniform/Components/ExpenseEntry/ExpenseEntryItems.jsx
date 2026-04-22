import { useEffect } from "react";
import { DropdownInputNew, TextInput } from "../../../Inputs";
import TransactionLineItemsSection, { standardTransactionPlaceholderRowCount, transactionTableCellClassName, transactionTableClassName, transactionTableFocusCellClassName, transactionTableHeadClassName, transactionTableHeaderCellClassName, transactionTableNumberInputClassName, transactionTableSelectInputClassName } from "../ReusableComponents/TransactionLineItemsSection";
import { HiX } from "react-icons/hi";

const ExpenseEntryItems = ({ expenseItems, setExpenseItems, expenseTypeList, readOnly }) => {

    const compactHeaderCellClassName = transactionTableHeaderCellClassName;
    const compactCellClassName = transactionTableCellClassName;
    const compactFocusCellClassName = transactionTableFocusCellClassName;
    const compactSelectClassName = transactionTableSelectInputClassName;
    const compactNumberInputClassName = transactionTableNumberInputClassName;
    const compactDropdownClassName = "h-full w-full max-w-none rounded-none border-0 bg-transparent px-1 py-0 text-[10px] shadow-none outline-none focus:bg-transparent focus:outline-none";


    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(expenseItems);
        newBlend[index][field] = value;
        setExpenseItems(newBlend);
    };






    useEffect(() => {
        const length = standardTransactionPlaceholderRowCount;
        if (expenseItems?.length >= length) return;
        setExpenseItems((prev) => {
            let newArray = Array.from({ length: length - prev.length }, () => ({
                expenseType: "",
                description: "",
                amount: "",
                id: '',
                poItemsId: "",
                taxMethod: ""
            }));
            return [...prev, ...newArray];
        });
    }, [setExpenseItems, expenseItems]);


    return (
        <>
            <fieldset className="h-full min-h-0">
                <TransactionLineItemsSection
                    panelClassName="h-full min-h-0"
                    contentClassName="min-h-0 overflow-hidden rounded-md border border-slate-200 !py-0"
                >
                    <div className="h-full w-[70vw] overflow-x-auto overflow-y-auto">
                        <table className={transactionTableClassName}>
                            <thead className={transactionTableHeadClassName}>
                                <tr>
                                    <th className={`${compactHeaderCellClassName} w-4`}>S.No</th>
                                    <th className={`${compactHeaderCellClassName} w-20`}>Expense Type</th>
                                    <th className={`${compactHeaderCellClassName} w-52`}>Description</th>
                                    <th className={`${compactHeaderCellClassName} w-12`}>Amount</th>


                                    <th className={`${compactHeaderCellClassName} w-2`}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenseItems?.map((row, index) => (
                                    <tr key={index}>
                                        <td className={`${compactCellClassName} text-center`}>{index + 1}</td>
                                        <td className={`${compactCellClassName}`}>
                                            <select
                                                onKeyDown={e => { if (e.key === "Delete") handleInputChange("", index, "expenseType"); }}
                                                tabIndex="0" disabled={readOnly}
                                                className={compactSelectClassName}
                                                value={row.expenseCategoryId}
                                                onChange={e => handleInputChange(e.target.value, index, "expenseCategoryId")}
                                                onBlur={e => handleInputChange(e.target.value, index, "expenseCategoryId")}
                                            >
                                                <option></option>
                                                {expenseTypeList?.data?.map(blend => (
                                                    <option value={blend.id} key={blend.id}>{blend?.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className={`${compactFocusCellClassName}`}>
                                            <textarea
                                                className={compactNumberInputClassName}
                                                onFocus={e => e.target.select()}
                                                value={row.description}
                                                onChange={e => handleInputChange(e.target.value, index, "description")}
                                                onBlur={e => handleInputChange((e.target.value), index, "description")}
                                            />
                                        </td>
                                        <td className={`${compactCellClassName}`}>
                                            <input
                                                min="0" type="number"
                                                className={compactNumberInputClassName}
                                                onFocus={e => e.target.select()}
                                                value={row.amount}
                                                onChange={e => handleInputChange(e.target.value, index, "amount")}
                                                onBlur={e => handleInputChange(parseFloat(e.target.value)
                                                    , index, "amount")}
                                            />
                                        </td>
                                        <td className={`${compactFocusCellClassName} text-center`}>
                                            <button
                                                onClick={() => addNewRow(index)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        if (index === saleOrderItems.length - 1) {
                                                            addNewRow(index);
                                                        }

                                                    }
                                                }}
                                                className="h-full w-full rounded-none bg-blue-50 py-0"
                                            >
                                                +
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>


                    </div>
                </TransactionLineItemsSection>
            </fieldset>
        </>
    )
}
export default ExpenseEntryItems