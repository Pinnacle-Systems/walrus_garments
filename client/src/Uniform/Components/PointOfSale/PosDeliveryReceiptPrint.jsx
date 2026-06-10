import React from 'react';
import { Page, Text, View, Document } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';
import moment from 'moment';
import BarcodeGenerator from '../BarcodeGenerator';

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
        'xl': '16pt'
      }
    },
  },
});

const PosDeliveryReceiptPrint = ({
  docId,
  date,
  items = [],
}) => {

  let printCopies = 1

  const totalQty = items.reduce((acc, item) => acc + parseFloat(item.qty || 0), 0);


  const SummarySlip = () => (
    <Page size={[226, 1200]} style={tw('p-2 bg-white flex flex-col')}>
      <View style={tw('border-2 border-black p-3 items-center w-full flex flex-col justify-center')}>
        <Text style={tw('text-[10pt] font-bold mb-1 text-center')}>BILL SUMMARY SLIP</Text>
        <View style={tw('w-full border-b border-black mb-2')} />

        <Text style={tw('text-[8pt] font-bold uppercase text-center mb-0.5')}>Bill Number</Text>
        <Text style={tw('text-lg font-black text-center mb-1.5')}>{docId}</Text>

        {docId && (
          <View style={tw('items-center justify-center mb-2')}>
            <BarcodeGenerator value={docId} width={170} height={45} />
          </View>
        )}

        <Text style={tw('text-[8pt] font-bold uppercase text-center mb-0.5')}>Total Quantity</Text>
        <Text style={tw('text-xl font-black text-center mb-2')}>{totalQty}</Text>

        <Text style={tw('text-[7pt] italic text-center')}>{moment(date).format('DD/MM/YYYY HH:mm')}</Text>
      </View>
    </Page>
  );

  return (
    <Document title={`DELIVERY_RECEIPT_${docId}`}>
      {Array.from({ length: printCopies }).map((_, i) => (
        <SummarySlip key={`copy-${i}`} />
      ))}
    </Document>
  );
};

export default PosDeliveryReceiptPrint;
