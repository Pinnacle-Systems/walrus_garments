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
  taxMethod = "WithoutTax",
  isSupplierOutside = false,
  taxDetails = {}
}) => {
  const findFromList = (id, list, key) => {
    if (!id || !list) return "";
    const item = list.find(l => parseInt(l.id) === parseInt(id));
    return item ? item[key] : "";
  };

  const getTaxBreakup = () => {
    const breakup = {};
    items.forEach((item) => {
      const taxRate = parseFloat(item.tax || item.taxPercent || 0);
      const qty = parseFloat(item.qty || 0);
      const price = parseFloat(item.price || 0);
      let taxableAmount = 0;
      let taxAmount = 0;
      if (taxMethod === "inclusive" || taxMethod === "With Tax") {
        const netTotal = price * qty;
        taxableAmount = netTotal / (1 + taxRate / 100);
        taxAmount = netTotal - taxableAmount;
      } else {
        taxableAmount = price * qty;
        taxAmount = (taxableAmount * taxRate) / 100;
      }
      const rateKey = taxRate.toFixed(2);
      if (!breakup[rateKey]) {
        breakup[rateKey] = {
          taxRate,
          taxableAmount: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          totalTax: 0,
        };
      }
      breakup[rateKey].taxableAmount += taxableAmount;
      if (isSupplierOutside) {
        breakup[rateKey].igst += taxAmount;
      } else {
        breakup[rateKey].cgst += taxAmount / 2;
        breakup[rateKey].sgst += taxAmount / 2;
      }
      breakup[rateKey].totalTax += taxAmount;
    });
    return Object.values(breakup);
  };

  const taxBreakup = getTaxBreakup();
  const taxableAmount = taxBreakup.reduce((acc, b) => acc + b.taxableAmount, 0);
  const totalTax = taxBreakup.reduce((acc, b) => acc + b.totalTax, 0);
  const totalQty = items.reduce((acc, item) => acc + parseFloat(item.qty || 0), 0);
  const cgstTotal = taxBreakup.reduce((acc, b) => acc + b.cgst, 0);
  const sgstTotal = taxBreakup.reduce((acc, b) => acc + b.sgst, 0);
  const igstTotal = taxBreakup.reduce((acc, b) => acc + b.igst, 0);
  const netAmount = Math.round(taxableAmount + totalTax);

  return (
    <Document title={`${title}_${docId}`}>
      <Page size={[216, 800]} style={tw('p-1 bg-white flex flex-col')}>
        {/* Header */}
        <View style={tw('flex flex-col items-center mb-1')}>
          <Text style={tw('font-bold text-xs')}>{branchData?.branchName || "WALRUS"}</Text>
          <Text style={tw('text-xxs')}>{branchData?.address || "State: 33-Tamil Nadu"}</Text>
          <Text style={tw('text-xxs')}>Ph No.: {branchData?.contactPersonNumber || branchData?.phone || "9159477722"}</Text>
        </View>

        <View style={tw('flex flex-col items-center mb-1')}>
          <Text style={tw('font-bold text-xxs underline')}>{title}</Text>
        </View>

        {/* Customer & Info */}
        <View style={tw('flex flex-row justify-between mb-1')}>
          <Text style={tw('text-xxs font-bold w-1/2')}>{customerData?.name?.toUpperCase() || "CASH"}</Text>
          <View style={tw('flex flex-col items-end w-1/2')}>
            <Text style={tw('text-xxs')}>Date: {moment(date).format('DD/MM/YYYY')}</Text>
            <Text style={tw('text-xxs')}>Time: {moment().format('HH:mm A')}</Text>
          </View>
        </View>

        <View style={tw('flex flex-col mb-1')}>
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
                <Text style={tw('text-xxs w-[15%] text-right')}>{parseFloat(item.qty || 0).toFixed(2)}</Text>
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
          <Text style={tw('text-xxs font-bold w-1/4')}>Total Qty:</Text>
          <Text style={tw('text-xxs font-bold w-1/12 text-right')}>{totalQty.toFixed(2)}</Text>
          <Text style={tw('text-xxs font-bold w-1/2 text-right')}>Rs. {taxableAmount.toFixed(2)}</Text>
        </View>

        <View style={tw('flex flex-col items-end py-1 space-y-0.5')}>
          <View style={tw('flex flex-row w-full justify-between')}>
            <Text style={tw('text-xxs')}>Sub Total :</Text>
            <Text style={tw('text-xxs')}>{taxableAmount.toFixed(2)}</Text>
          </View>
          
          {isSupplierOutside ? (
            igstTotal > 0 && (
              <View style={tw('flex flex-row w-full justify-between')}>
                <Text style={tw('text-xxs')}>IGST :</Text>
                <Text style={tw('text-xxs')}>{igstTotal.toFixed(2)}</Text>
              </View>
            )
          ) : (
            <>
              {cgstTotal > 0 && (
                <View style={tw('flex flex-row w-full justify-between')}>
                  <Text style={tw('text-xxs')}>CGST :</Text>
                  <Text style={tw('text-xxs')}>{cgstTotal.toFixed(2)}</Text>
                </View>
              )}
              {sgstTotal > 0 && (
                <View style={tw('flex flex-row w-full justify-between')}>
                  <Text style={tw('text-xxs')}>SGST :</Text>
                  <Text style={tw('text-xxs')}>{sgstTotal.toFixed(2)}</Text>
                </View>
              )}
            </>
          )}

          <View style={tw('flex flex-row w-full justify-between')}>
            <Text style={tw('text-xxs')}>Tax Amount :</Text>
            <Text style={tw('text-xxs')}>{totalTax.toFixed(2)}</Text>
          </View>

          <View style={tw('flex flex-row w-full justify-between')}>
            <Text style={tw('text-xxs')}>Round off :</Text>
            <Text style={tw('text-xxs')}>{(netAmount - (taxableAmount + totalTax)).toFixed(2)}</Text>
          </View>

          <View style={tw('flex flex-row w-full justify-between py-1 border-t border-black border-dashed mt-1')}>
            <Text style={tw('text-xs font-bold')}>NET TOTAL :</Text>
            <Text style={tw('text-xs font-bold')}>Rs. {netAmount.toFixed(2)}</Text>
          </View>
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
