import { useEffect } from "react";
import TransactionLineItemsSection, { standardTransactionPlaceholderRowCount } from "../ReusableComponents/TransactionLineItemsSection";

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

    return (
        <fieldset className="h-full min-h-0">
            <TransactionLineItemsSection
                panelClassName="h-full min-h-0 !border-0 !shadow-none"
                contentClassName="min-h-0 overflow-hidden !py-0"
            >
                <div className="h-full w-full overflow-auto border border-gray-300">
                    <table className="w-full border-collapse table-fixed bg-white">
                        <thead className="sticky top-0 z-20 bg-gray-100">
                            <tr className="h-[22px]">
                                <th className={compactHeaderCellClassName} style={{ width: '40px' }}>S.No</th>
                                <th className={compactHeaderCellClassName} style={{ width: '220px' }}>Expense Type *</th>
                                <th className={compactHeaderCellClassName}>Description</th>
                                <th className={compactHeaderCellClassName} style={{ width: '120px' }}>Amount *</th>
                                <th className={compactHeaderCellClassName} style={{ width: '30px', borderRight: 0 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenseItems?.map((row, index) => (
                                <tr key={index} className={`h-[22px] ${index % 2 === 1 ? "bg-white" : "bg-gray-100"}`}>
                                    <td className={`${compactCellClassName} text-center`}>{index + 1}</td>
                                    <td className={compactCellClassName}>
                                        <select
                                            disabled={readOnly}
                                            className={compactSelectClassName}
                                            value={row.expenseCategoryId}
                                            onChange={e => handleInputChange(e.target.value, index, "expenseCategoryId")}
                                        >
                                            <option value=""></option>
                                            {expenseTypeList?.data?.map(exp => (
                                                <option value={exp.id} key={exp.id}>{exp.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className={compactFocusCellClassName}>
                                        <input
                                            type="text"
                                            className={compactSelectClassName}
                                            value={row.description || ""}
                                            onChange={e => handleInputChange(e.target.value, index, "description")}
                                            readOnly={readOnly}
                                        />
                                    </td>
                                    <td className={compactCellClassName}>
                                        <input
                                            type="number"
                                            className={compactNumberInputClassName}
                                            value={row.amount || ""}
                                            onChange={e => handleInputChange(e.target.value, index, "amount")}
                                            onFocus={e => e.target.select()}
                                            readOnly={readOnly}
                                        />
                                    </td>
                                    <td className={`${compactCellClassName} text-center`} style={{ borderRight: 0 }}>
                                        <button
                                            onClick={addNewRow}
                                            className="w-full h-full text-blue-600 font-bold hover:bg-blue-100/50"
                                            disabled={readOnly}
                                        >
                                            +
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="sticky bottom-0 z-20">
                            <tr className="h-[22px] bg-gray-300">
                                <td colSpan="3" className="border-r border-gray-300 px-2 py-0 text-right font-bold text-[10px] text-slate-700">Total:</td>
                                <td className="border-r border-gray-300 px-1 py-0 text-right font-bold text-[10px] text-slate-800">
                                    {totalAmount.toFixed(2)}
                                </td>
                                <td className="p-0"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </TransactionLineItemsSection>
        </fieldset>
    );
};

export default ExpenseEntryItems;