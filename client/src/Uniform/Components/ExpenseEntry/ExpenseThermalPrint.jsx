import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';
import moment from 'moment';

const tw = createTw({
  theme: {
    extend: {
      colors: {
        primary: '#000000',
      },
      fontSize: {
        'xxs': '8.5pt',
        'xs': '10pt',
        'sm': '11pt',
        'base': '12pt',
        'lg': '14pt',
      }
    },
  },
});

const styles = StyleSheet.create({
  page: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    width: '216pt', // Standard 80mm Thermal Receipt width
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'dashed',
    marginVertical: 4,
  },
});

const ExpenseThermalPrint = ({
  docId,
  date,
  branchData,
  expenseItems = [],
  expenseTypeList = [],
  remarks = ""
}) => {
  const findFromList = (id, list, key) => {
    if (!id || !list || !Array.isArray(list)) return "";
    const item = list.find(l => parseInt(l.id) === parseInt(id));
    return item ? (item[key] || item.name || item.categoryName || "") : "";
  };

  const totalAmount = expenseItems.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

  return (
    <Document title={`Expense_${docId || 'New'}`}>
      <Page size={[226, 600]} style={tw('p-2 bg-white flex flex-col')}>
        {/* Header */}
        <View style={tw('flex flex-col items-center mb-2')}>
          <Text style={tw('font-bold text-base')}>{branchData?.branchName || "WALRUS"}</Text>
          <Text style={tw('text-xxs text-center w-full px-2')}>
            {branchData?.address || "Address details not available"}
          </Text>
          {(branchData?.phone || branchData?.contactMobile || branchData?.contactPersonNumber) && (
            <Text style={tw('text-xxs')}>
              Ph No.: {branchData?.phone || branchData?.contactMobile?.toString() || branchData?.contactPersonNumber}
            </Text>
          )}
          {branchData?.gstNo && <Text style={tw('text-xxs font-bold')}>GSTIN: {branchData.gstNo}</Text>}
        </View>

        <View style={tw('flex flex-col items-center my-1')}>
          <Text style={tw('font-bold text-xs underline')}>EXPENSE VOUCHER</Text>
        </View>

        {/* Transaction Info */}
        <View style={tw('flex flex-row justify-between mb-1 py-1 border-t border-b border-gray-200')}>
          <View style={tw('flex flex-col w-1/2')}>
            <Text style={tw('text-xxs font-bold')}>Voucher No: {docId || "New"}</Text>
          </View>
          <View style={tw('flex flex-col items-end w-1/2')}>
            <Text style={tw('text-xxs')}>Date: {date ? moment(date).format('DD/MM/YYYY') : moment().format('DD/MM/YYYY')}</Text>
          </View>
        </View>

        {/* Table Header */}
        <View style={tw('flex flex-row justify-between py-1 border-b border-black')}>
          <Text style={tw('text-xxs font-bold w-2/3')}>Expense Category / Desc</Text>
          <Text style={tw('text-xxs font-bold w-1/3 text-right')}>Amount</Text>
        </View>

        {/* Expense Items List */}
        <View style={tw('flex flex-col gap-1 py-1')}>
          {expenseItems?.filter((i) => i.expenseCategoryId).map((item, index) => {
            const catName = item.expenseCategoryName || item.categoryName || findFromList(item.expenseCategoryId, expenseTypeList, 'name') || 'General Expense';
            const amt = parseFloat(item.amount || 0);

            return (
              <View key={index} style={tw('flex flex-col py-0.5 border-b border-gray-100')}>
                <View style={tw('flex flex-row justify-between')}>
                  <Text style={tw('text-xxs font-bold w-2/3')}>{index + 1}. {catName}</Text>
                  <Text style={tw('text-xxs font-bold w-1/3 text-right')}>Rs. {amt.toFixed(2)}</Text>
                </View>
                {item.description ? (
                  <Text style={tw('text-[7.5pt] text-gray-600 pl-3')}>{item.description}</Text>
                ) : null}
              </View>
            );
          })}
        </View>

        <View style={styles.dottedLine} />

        {/* Total Expense */}
        <View style={tw('flex flex-row justify-between py-1.5')}>
          <Text style={tw('text-sm font-black')}>TOTAL EXPENSE:</Text>
          <Text style={tw('text-sm font-black')}>Rs. {totalAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.dottedLine} />

        {remarks ? (
          <View style={tw('flex flex-col mt-1')}>
            <Text style={tw('text-[8pt] font-bold')}>Remarks:</Text>
            <Text style={tw('text-[7.5pt] text-gray-600')}>{remarks}</Text>
          </View>
        ) : null}

        {/* Footer Signatures */}
        <View style={tw('flex flex-row justify-between items-center mt-6 pt-2')}>
          <Text style={tw('text-[7pt]')}>Prepared By</Text>
          <Text style={tw('text-[7pt]')}>Authorized Signatory</Text>
        </View>

        <View style={tw('flex flex-col items-center mt-4 border-t border-gray-100 pt-1')}>
          <Text style={tw('text-[5pt] text-gray-400')}>Printed via Walrus ERP System</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ExpenseThermalPrint;
