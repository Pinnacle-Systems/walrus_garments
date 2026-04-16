import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';
import moment from 'moment';

const tw = createTw({
  theme: {
    extend: {
      colors: {
        primary: '#000000',
      },
      fontSize: {
        'xxs': '7pt',
        'xs': '8pt',
        'sm': '9pt',
        'base': '10pt',
        'lg': '12pt',
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

const PosThermalPrint = ({ 
  docId, 
  date, 
  branchData, 
  customerData, 
  items = [], 
  payments = { cash: 0, upi: 0, card: 0 },
  summary = { subtotal: 0, tax: 0, discount: 0, total: 0, received: 0, balance: 0 }
}) => {

  const totalQty = items.reduce((acc, item) => acc + parseFloat(item.qty || 0), 0);

  return (
    <Document title={`POS_RECEIPT_${docId}`}>
      <Page size={[216, 1200]} style={tw('p-2 bg-white flex flex-col')}>
        {/* Header */}
        <View style={tw('flex flex-col items-center mb-1')}>
          <Text style={tw('font-bold text-xs')}>{branchData?.branchName || "WALRUS GARMENTS"}</Text>
          <Text style={tw('text-[7pt] text-center w-full')}>
            {branchData?.address || "Address details not available"}
          </Text>
          <Text style={tw('text-xxs')}>Ph No.: {branchData?.phone || branchData?.contactMobile?.toString() || branchData?.contactPersonNumber || "9159477722"}</Text>
          {branchData?.gstNo && <Text style={tw('text-xxs')}>GSTIN: {branchData.gstNo}</Text>}
        </View>

        <View style={tw('flex flex-col items-center my-1')}>
          <Text style={tw('font-bold text-xxs underline')}>TAX INVOICE</Text>
        </View>

        {/* Transaction Info */}
        <View style={tw('flex flex-row justify-between mb-1 py-1 border-t border-b border-gray-200')}>
            <View style={tw('flex flex-col w-1/2')}>
                <Text style={tw('text-xxs font-bold')}>{customerData?.name?.toUpperCase() || "WALK-IN CUSTOMER"}</Text>
                {customerData?.contact && <Text style={tw('text-[6pt]')}>M: {customerData.contact.toString()}</Text>}
            </View>
            <View style={tw('flex flex-col items-end w-1/2')}>
                <Text style={tw('text-xxs')}># {docId}</Text>
                <Text style={tw('text-xxs')}>Date: {moment(date).format('DD/MM/YYYY')}</Text>
            </View>
        </View>

        {/* Items Table Header */}
        <View style={styles.dottedLine} />
        <View style={tw('flex flex-row justify-between py-1')}>
          <Text style={tw('text-xxs font-bold w-[45%]')}>Item</Text>
          <Text style={tw('text-xxs font-bold w-[15%] text-right')}>Qty</Text>
          <Text style={tw('text-xxs font-bold w-[20%] text-right')}>Rate</Text>
          <Text style={tw('text-xxs font-bold w-[20%] text-right')}>Amt</Text>
        </View>
        <View style={styles.dottedLine} />

        {/* Items Rows */}
        {items.map((item, index) => {
          const itemTaxPercent = parseFloat(item.taxPercent || item.Hsn?.tax || item.tax || 0);
          const rowTotal = parseFloat(item.qty || 0) * parseFloat(item.price || item.rate || 0);
          const taxableValue = rowTotal / (1 + (itemTaxPercent / 100));
          const itemTax = rowTotal - taxableValue;

          return (
            <View key={index} style={tw('flex flex-col mb-1.5')}>
              <View style={tw('flex flex-row justify-between')}>
                <View style={tw('w-[45%] flex flex-col')}>
                  <Text style={tw('text-xxs font-bold')}>{item?.Item?.name || item?.itemName}</Text>
                  <Text style={tw('text-[6pt] text-gray-500')}>
                    {item?.Size?.name || item?.sizeName} | {item?.Color?.name || item?.colorName} | Tax: {itemTaxPercent}%
                  </Text>
                </View>
                <Text style={tw('text-xxs w-[15%] text-right')}>{parseFloat(item.qty || 0)}</Text>
                <Text style={tw('text-xxs w-[20%] text-right')}>{parseFloat(item.price || item.rate || 0).toFixed(2)}</Text>
                <Text style={tw('text-xxs w-[20%] text-right')}>{rowTotal.toFixed(2)}</Text>
              </View>
            </View>
          );
        })}

        <View style={styles.dottedLine} />

        {/* Summary Table */}
        <View style={tw('flex flex-col py-1 gap-1')}>
          <View style={tw('flex flex-row justify-between')}>
            <Text style={tw('text-xxs font-bold')}>Total Items:</Text>
            <Text style={tw('text-xxs')}>{items.length} (Qty: {totalQty})</Text>
          </View>
          <View style={tw('flex flex-row justify-between')}>
            <Text style={tw('text-xxs')}>Subtotal (Excl. Tax) :</Text>
            <Text style={tw('text-xxs')}>{summary.subtotal.toFixed(2)}</Text>
          </View>
          {summary.tax > 0 && (
            <>
              <View style={tw('flex flex-row justify-between')}>
                <Text style={tw('text-xxs')}>CGST :</Text>
                <Text style={tw('text-xxs')}>{(summary.tax / 2).toFixed(2)}</Text>
              </View>
              <View style={tw('flex flex-row justify-between')}>
                <Text style={tw('text-xxs')}>SGST :</Text>
                <Text style={tw('text-xxs')}>{(summary.tax / 2).toFixed(2)}</Text>
              </View>
            </>
          )}
          {summary.discount > 0 && (
            <View style={tw('flex flex-row justify-between')}>
              <Text style={tw('text-xxs')}>Discount :</Text>
              <Text style={tw('text-xxs text-red-500')}>-{summary.discount.toFixed(2)}</Text>
            </View>
          )}
          <View style={tw('flex flex-row justify-between py-1 border-t border-dotted border-gray-400 mt-1')}>
            <Text style={tw('text-xs font-black')}>GRAND TOTAL :</Text>
            <Text style={tw('text-xs font-black')}>Rs. {summary.total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.dottedLine} />

        {/* Payment Logic Breakdown */}
        <View style={tw('flex flex-col py-1 gap-1 bg-gray-50 p-1')}>
          <Text style={tw('text-[7pt] font-black underline mb-1')}>PAYMENT BREAKDOWN</Text>
          {payments.cash > 0 && (
            <View style={tw('flex flex-row justify-between')}>
              <Text style={tw('text-xxs')}>Cash Paid :</Text>
              <Text style={tw('text-xxs')}>{payments.cash.toFixed(2)}</Text>
            </View>
          )}
          {payments.upi > 0 && (
            <View style={tw('flex flex-row justify-between')}>
              <Text style={tw('text-xxs')}>UPI / GPay :</Text>
              <Text style={tw('text-xxs')}>{payments.upi.toFixed(2)}</Text>
            </View>
          )}
          {payments.card > 0 && (
            <View style={tw('flex flex-row justify-between')}>
              <Text style={tw('text-xxs')}>Card Paid :</Text>
              <Text style={tw('text-xxs')}>{payments.card.toFixed(2)}</Text>
            </View>
          )}
          <View style={tw('flex flex-row justify-between border-t border-gray-300 pt-1 mt-1')}>
            <Text style={tw('text-xxs font-bold')}>Total Received :</Text>
            <Text style={tw('text-xxs font-bold')}>{summary.received.toFixed(2)}</Text>
          </View>
          <View style={tw('flex flex-row justify-between')}>
            <Text style={tw('text-xxs font-bold')}>Balance Returned:</Text>
            <Text style={tw('text-xxs font-bold')}>{summary.balance.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.dottedLine} />

        {/* Footer */}
        <View style={tw('flex flex-col items-center mt-2')}>
          <Text style={tw('text-[8pt] font-bold')}>THANK YOU!</Text>
          <Text style={tw('text-[7pt]')}>Visit Again</Text>
          <Text style={tw('text-[6pt] mt-2 italic')}>Product returns only valid within 7 days with original tag.</Text>
        </View>

        <View style={tw('flex flex-col items-center mt-4 border-t border-gray-100 pt-2')}>
           <Text style={tw('text-[5pt] text-gray-400')}>Printed via Walrus ERP POS System</Text>
        </View>

      </Page>
    </Document>
  );
};

export default PosThermalPrint;
