import { useEffect } from "react";
import TransactionLineItemsSection, { standardTransactionPlaceholderRowCount, transactionTableClassName, transactionTableHeadClassName, transactionTableIndexCellClassName, transactionTableRowClassName } from "../ReusableComponents/TransactionLineItemsSection";
import { DropdownInputNew } from "../../../Inputs";

const ExpenseEntryItems = ({ expenseItems, setExpenseItems, expenseTypeList, readOnly }) => {

    const compactHeaderCellClassName = "bg-gray-300 px-1 py-0.5 text-center font-bold text-[10px] text-slate-700 border-r border-b border-gray-300";
    const compactCellClassName = "border-r border-b border-gray-300 p-0 text-[10px]";
    const compactFocusCellClassName = `${compactCellClassName} focus-within:bg-blue-50`;
    const compactSelectClassName = "h-full w-full rounded-none border-0 bg-transparent px-1 py-0 text-left outline-none focus:outline-none text-[10px]";
    const compactNumberInputClassName = "h-full w-full rounded-none border-0 bg-transparent px-1 py-0 text-right outline-none focus:outline-none text-[10px]";

    const handleInputChange = (value, index, field) => {
        const newItems = [...expenseItems];
        newItems[index][field] = value;
        setExpenseItems(newItems);
    };

    const addNewRow = () => {
        setExpenseItems([
            ...expenseItems,
            {
                expenseCategoryId: "",
                description: "",
                amount: "",
                id: '',
                poItemsId: "",
                taxMethod: ""
            }
        ]);
    };

    useEffect(() => {
        const length = standardTransactionPlaceholderRowCount;
        if (expenseItems?.length >= length) return;
        setExpenseItems((prev) => {
            const currentLen = prev?.length || 0;
            if (currentLen >= length) return prev;
            let newArray = Array.from({ length: length - currentLen }, () => ({
                expenseCategoryId: "",
                description: "",
                amount: "",
                id: '',
                poItemsId: "",
                taxMethod: ""
            }));
            return [...prev, ...newArray];
        });
    }, [setExpenseItems, expenseItems]);

    const totalAmount = expenseItems?.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0) || 0;

    const selectableExpenses = expenseTypeList?.data?.map(exp => ({
        value: exp.id,
        label: exp.name
    })) || [];

    return (
        <fieldset className="h-full min-h-0">
            <TransactionLineItemsSection
                panelClassName="h-full min-h-0"
                contentClassName="min-h-0 overflow-hidden rounded-md border border-slate-200 !py-0"
            >
                <div className="h-full overflow-auto">
                    <table className={transactionTableClassName}>
                        <thead className={transactionTableHeadClassName}>
                            <tr>
                                <th className={`${compactHeaderCellClassName} w-12`}>S.No</th>
                                <th className={`${compactHeaderCellClassName} w-64`}>Expense Type *</th>
                                <th className={compactHeaderCellClassName}>Description</th>
                                <th className={`${compactHeaderCellClassName} w-32`}>Amount *</th>
                                <th className={`${compactHeaderCellClassName} w-12`}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(expenseItems || []).map((row, index) => {
                                return (
                                    <tr key={index} className={transactionTableRowClassName}>
                                        <td className={transactionTableIndexCellClassName}>{index + 1}</td>

                                        {/* Expense Type */}
                                        <td className={compactFocusCellClassName}>
                                            <DropdownInputNew
                                                searchable={true}
                                                options={selectableExpenses}
                                                value={row.expenseCategoryId}
                                                setValue={v => handleInputChange(v, index, "expenseCategoryId")}
                                                readOnly={readOnly}
                                                className="w-full !px-1 !py-0.5 !text-[11px] !border-0 !shadow-none"
                                                width="w-full"
                                            />
                                        </td>

                                        {/* Description */}
                                        <td className={compactFocusCellClassName}>
                                            <input
                                                type="text"
                                                className={compactSelectClassName}
                                                value={row.description || ""}
                                                onChange={e => handleInputChange(e.target.value, index, "description")}
                                                readOnly={readOnly}
                                                placeholder="Description"
                                            />
                                        </td>

                                        {/* Amount */}
                                        <td className={`${compactFocusCellClassName} text-right`}>
                                            <input
                                                type="number"
                                                className={compactNumberInputClassName}
                                                onFocus={e => e.target.select()}
                                                value={row.amount || ""}
                                                onChange={e => handleInputChange(e.target.value, index, "amount")}
                                                readOnly={readOnly}
                                                placeholder="0.00"
                                            />
                                        </td>

                                        {/* Action */}
                                        <td className={`${compactCellClassName} text-center`}>
                                            <button
                                                onClick={addNewRow}
                                                disabled={readOnly}
                                                className="w-full h-full text-blue-600 font-bold hover:bg-blue-50 py-1"
                                                title="Add Row"
                                            >
                                                +
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="sticky bottom-0 z-10 bg-gray-200 border-t border-gray-300">
                            <tr className="h-[24px]">
                                <td colSpan="3" className="px-2 text-right font-bold text-[11px] text-slate-700">Total:</td>
                                <td className="px-2 text-right font-bold text-[11px] text-slate-900">
                                    {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </TransactionLineItemsSection>
        </fieldset>
    );
};

export default ExpenseEntryItems;