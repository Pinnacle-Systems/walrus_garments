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

const PaymentThermalPrint = ({
  paymentData,
  branchData
}) => {
  if (!paymentData) return null;

  const {
    docId,
    cvv,
    paidAmount,
    paymentMode,
    paymentFlow,
    refDocId,
    Party,
    paymentRefNo
  } = paymentData;


  const title = paymentFlow === "Receipt" ? "PAYMENT RECEIPT" : "PAYMENT VOUCHER";

  return (
    <Document title={`${paymentFlow}_${docId}`}>
      <Page size={[226, 600]} style={tw('p-2 bg-white flex flex-col')}>
        {/* Header */}
        <View style={tw('flex flex-col items-center mb-2')}>
          <Text style={tw('font-bold text-base')}>{branchData?.branchName || "WALRUS"}</Text>
          <Text style={tw('text-xxs text-center w-full px-2')}>
            {branchData?.address || "Address details not available"}
          </Text>
          <Text style={tw('text-xxs')}>Ph No.: {branchData?.phone || branchData?.contactMobile?.toString() || branchData?.contactPersonNumber || ""}</Text>
          {branchData?.gstNo && <Text style={tw('text-xxs font-bold')}>GSTIN: {branchData.gstNo}</Text>}
        </View>

        <View style={tw('flex flex-col items-center my-1')}>
          <Text style={tw('font-bold text-xs underline')}>{title}</Text>
        </View>

        {/* Transaction Info */}
        <View style={tw('flex flex-row justify-between mb-1 py-1 border-t border-b border-gray-200')}>
          <View style={tw('flex flex-col w-1/2')}>
            <Text style={tw('text-xxs font-bold')}>NO: {docId}</Text>
          </View>
          <View style={tw('flex flex-col items-end w-1/2')}>
            <Text style={tw('text-xxs')}>Date: {moment(cvv).format('DD/MM/YYYY')}</Text>
          </View>
        </View>

        <View style={tw('flex flex-col gap-2 py-2')}>
          <View style={tw('flex flex-row')}>
            <Text style={tw('text-xxs w-1/3')}>Received From:</Text>
            <Text style={tw('text-xxs font-bold flex-1')}>{Party?.name || "N/A"}</Text>
          </View>

          <View style={tw('flex flex-row')}>
            <Text style={tw('text-xxs w-1/3')}>Against Doc:</Text>
            <Text style={tw('text-xxs flex-1')}>{refDocId || "-"}</Text>
          </View>

          <View style={tw('flex flex-row')}>
            <Text style={tw('text-xxs w-1/3')}>Payment Mode:</Text>
            <Text style={tw('text-xxs flex-1')}>{paymentMode || "-"}</Text>
          </View>

          {paymentRefNo && (
            <View style={tw('flex flex-row')}>
              <Text style={tw('text-xxs w-1/3')}>Ref No:</Text>
              <Text style={tw('text-xxs flex-1')}>{paymentRefNo}</Text>
            </View>
          )}
        </View>

        <View style={styles.dottedLine} />

        <View style={tw('flex flex-row justify-between py-2')}>
          <Text style={tw('text-sm font-black')}>AMOUNT RECEIVED:</Text>
          <Text style={tw('text-sm font-black')}>Rs. {parseFloat(paidAmount || 0).toFixed(2)}</Text>
        </View>

        <View style={styles.dottedLine} />

        {/* Footer */}
        <View style={tw('flex flex-col items-center mt-4')}>
          <Text style={tw('text-[8pt] font-bold')}>THANK YOU!</Text>
          <Text style={tw('text-[6pt] mt-4')}>Authorized Signatory</Text>
        </View>

        <View style={tw('flex flex-col items-center mt-6 border-t border-gray-100 pt-2')}>
          <Text style={tw('text-[5pt] text-gray-400')}>Printed via Walrus ERP System</Text>
        </View>

      </Page>
    </Document>
  );
};

export default PaymentThermalPrint;
