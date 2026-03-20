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
    padding: 10,
    backgroundColor: '#FFFFFF',
    width: '200pt', // Approx 72mm
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'dashed',
    marginVertical: 4,
  },
});

const ThermalSalesPrintFormat = ({ 
  title = "INVOICE",
  docId, 
  date, 
  branchData, 
  customerData, 
  items = [], 
  remarks,
  itemList = [],
  sizeList = [],
  colorList = [],
  uomList = [],
  hsnList = [],
  taxDetails = {} // Placeholder for tax calculations
}) => {

  const findFromList = (id, list, key) => {
    if (!id || !list) return "";
    const item = list.find(l => parseInt(l.id) === parseInt(id));
    return item ? item[key] : "";
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.qty || 0) * parseFloat(item.price || 0)), 0);
  };

  const calculateTotalQty = () => {
    return items.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0);
  };

  const grandTotal = calculateTotal();
  const cgst = grandTotal * 0.025; // Example 2.5%
  const sgst = grandTotal * 0.025; // Example 2.5%
  const finalTotal = Math.round(grandTotal + cgst + sgst);

  return (
    <Document title={`${title}_${docId}`}>
      <Page size={[200, 800]} style={tw('p-2 bg-white flex flex-col')}>
        {/* Header */}
        <View style={tw('flex flex-col items-center mb-2')}>
          <Text style={tw('font-bold text-lg')}>{branchData?.name || "WALRUS"}</Text>
          <Text style={tw('text-xxs')}>{branchData?.address || "State: 33-Tamil Nadu"}</Text>
          <Text style={tw('text-xxs')}>Ph No.: {branchData?.contactNumber || "9159477722"}</Text>
        </View>

        <View style={tw('flex flex-col items-center mb-2')}>
          <Text style={tw('font-bold text-xs underline')}>{title}</Text>
        </View>

        {/* Customer & Info */}
        <View style={tw('flex flex-row justify-between mb-1')}>
          <Text style={tw('text-xs font-bold w-1/2')}>{customerData?.name?.toUpperCase() || "CASH"}</Text>
          <View style={tw('flex flex-col items-end w-1/2')}>
            <Text style={tw('text-xxs')}>Date: {moment(date).format('DD/MM/YYYY')}</Text>
            <Text style={tw('text-xxs')}>Time: {moment().format('HH:mm A')}</Text>
          </View>
        </View>

        <View style={tw('flex flex-col mb-2')}>
          <Text style={tw('text-xxs')}>Order No: {docId}</Text>
          <Text style={tw('text-xxs')}>PO No.: {remarks || ""}</Text>
        </View>

        {/* Items Table Header */}
        <View style={styles.dottedLine} />
        <View style={tw('flex flex-row justify-between py-1')}>
          <Text style={tw('text-xxs font-bold w-[10%]')}>#</Text>
          <Text style={tw('text-xxs font-bold w-[45%]')}>Name</Text>
          <Text style={tw('text-xxs font-bold w-[15%] text-right')}>Qty</Text>
          <Text style={tw('text-xxs font-bold w-[15%] text-right')}>Price</Text>
          <Text style={tw('text-xxs font-bold w-[15%] text-right')}>Amt</Text>
        </View>
        <View style={styles.dottedLine} />

        {/* Items */}
        {items.map((item, index) => {
          const itemName = findFromList(item.itemId, itemList, "name");
          const sizeName = findFromList(item.sizeId, sizeList, "name");
          const colorName = findFromList(item.colorId, colorList, "name");
          const hsnCode = findFromList(findFromList(item.itemId, itemList, "hsnId"), hsnList, "name");
          const amount = parseFloat(item.qty || 0) * parseFloat(item.price || 0);

          return (
            <View key={index} style={tw('flex flex-col mb-1')}>
              <View style={tw('flex flex-row justify-between')}>
                <Text style={tw('text-xxs w-[10%]')}>{index + 1}</Text>
                <Text style={tw('text-xxs w-[45%]')}>{itemName} {sizeName} {colorName}</Text>
                <Text style={tw('text-xxs w-[15%] text-right')}>{item.qty}</Text>
                <Text style={tw('text-xxs w-[15%] text-right')}>{parseFloat(item.price || 0).toFixed(2)}</Text>
                <Text style={tw('text-xxs w-[15%] text-right')}>{amount.toFixed(2)}</Text>
              </View>
              {hsnCode && <Text style={tw('text-xxs ml-[10%] italic text-gray-600')}>HSN: {hsnCode}</Text>}
            </View>
          );
        })}

        <View style={styles.dottedLine} />

        {/* Totals */}
        <View style={tw('flex flex-row justify-between mb-1')}>
          <Text style={tw('text-xs font-bold w-1/4')}>Total</Text>
          <Text style={tw('text-xs font-bold w-1/12 text-right')}>{calculateTotalQty()}</Text>
          <Text style={tw('text-xs font-bold w-1/2 text-right')}>{grandTotal.toFixed(2)}</Text>
        </View>

        <View style={tw('flex flex-col items-end py-1 space-y-0.5')}>
          <View style={tw('flex flex-row w-full justify-end')}>
            <Text style={tw('text-xxs w-2/3 text-right')}>Sub Total :</Text>
            <Text style={tw('text-xxs w-1/3 text-right')}>{grandTotal.toFixed(2)}</Text>
          </View>
          <View style={tw('flex flex-row w-full justify-end')}>
            <Text style={tw('text-xxs w-2/3 text-right')}>SGST @ 2.5% :</Text>
            <Text style={tw('text-xxs w-1/3 text-right')}>{sgst.toFixed(2)}</Text>
          </View>
          <View style={tw('flex flex-row w-full justify-end')}>
            <Text style={tw('text-xxs w-2/3 text-right')}>CGST @ 2.5% :</Text>
            <Text style={tw('text-xxs w-1/3 text-right')}>{cgst.toFixed(2)}</Text>
          </View>
          <View style={tw('flex flex-row w-full justify-end')}>
            <Text style={tw('text-xxs w-2/3 text-right')}>Round off :</Text>
            <Text style={tw('text-xxs w-1/3 text-right')}>{(finalTotal - (grandTotal + sgst + cgst)).toFixed(2)}</Text>
          </View>
          <View style={tw('flex flex-row w-full justify-end py-1')}>
            <Text style={tw('text-xs font-bold w-2/3 text-right')}>Total :</Text>
            <Text style={tw('text-xs font-bold w-1/3 text-right')}>{finalTotal.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.dottedLine} />

        {/* Tax Details Breakdown */}
        <View style={tw('mb-2')}>
           <Text style={tw('text-xxs font-bold mb-1')}>Tax Details</Text>
           <Text style={tw('text-xxs')}>SGST @ 2.5% on {grandTotal.toFixed(2)} : {sgst.toFixed(2)}</Text>
           <Text style={tw('text-xxs')}>CGST @ 2.5% on {grandTotal.toFixed(2)} : {cgst.toFixed(2)}</Text>
        </View>

        <View style={styles.dottedLine} />

        {/* Payment & Footer */}
        <View style={tw('flex flex-col mb-4')}>
          <Text style={tw('text-xxs font-bold')}>ADV {taxDetails.advance || "0"} GPAY {moment(date).format('DD/MM/YY')}</Text>
        </View>

        <View style={tw('flex flex-col items-center')}>
          <Text style={tw('text-xxs')}>Terms & Conditions</Text>
          <Text style={tw('text-xxs font-bold mt-1')}>Thanks for doing business with us!</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ThermalSalesPrintFormat;
