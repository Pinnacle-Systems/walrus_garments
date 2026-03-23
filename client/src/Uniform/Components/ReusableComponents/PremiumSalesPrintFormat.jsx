import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import numberToText from "number-to-text";
import moment from "moment";
import WalrusLogo from "../../../assets/walrus.png";
import { findFromList } from "../../../Utils/helper";

// Register fonts if needed, or use default Helvetica
Font.register({
  family: "Inter",
  src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGkyMZhrib2dgV9_Xno.ttf",
  fontWeight: "normal",
});

Font.register({
  family: "Inter",
  src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGkyMZhrib2dgV9_Xno.ttf",
  fontWeight: "bold",
});

const PremiumSalesPrintFormat = ({
  title = "INVOICE",
  docId = "N/A",
  date = new Date(),
  branchData = {},
  customerData = {},
  items = [],
  totals = {},
  remarks = "—",
  terms = [],
  taxMethod = "Without Tax",
  isSupplierOutside = false,
  // Module-specific lists for lookups
  itemList = [],
  sizeList = [],
  colorList = [],
  uomList = [],
  hsnList = [],
}) => {
  // Format dates
  const formattedDate = moment(date).format("DD-MMM-YYYY");

  // Calculate tax breakup
  const getTaxBreakup = () => {
    const breakup = {};
    items.forEach((item) => {
      const taxRate = parseFloat(item.tax || item.taxPercent || 0);
      const qty = parseFloat(item.qty || 0);
      const price = parseFloat(item.price || 0);
      
      let taxableAmount = 0;
      let taxAmount = 0;

      if (taxMethod === "With Tax") {
        const netTotal = price * qty;
        taxableAmount = netTotal / (1 + (taxRate / 100));
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
  const grossTotal = taxBreakup.reduce((acc, b) => acc + b.taxableAmount, 0);
  const totalTax = taxBreakup.reduce((acc, b) => acc + b.totalTax, 0);
  const netAmount = grossTotal + totalTax;

  // Fill table with empty rows for premium look
  const MIN_ROWS = 12;
  const tableData = [
    ...items,
    ...Array(Math.max(0, MIN_ROWS - items.length)).fill({ placeholder: true }),
  ];

  return (
    <Document title={`${title} - ${docId}`}>
      <Page size="A4" style={[tw("p-8 bg-white"), { fontFamily: "Helvetica" }]}>
        
        {/* === HEADER === */}
        <View style={tw("flex-row justify-between items-start mb-6")}>
          <View style={tw("flex-row items-center")}>
            <Image src={WalrusLogo} style={tw("w-14 h-14 mr-4")} />
            <View>
              <Text style={tw("text-xl font-bold text-slate-900 tracking-tight")}>{branchData?.branchName || "WALRUS GARMENTS"}</Text>
              <Text style={tw("text-[10px] text-slate-500 max-w-[220px] mt-1 line-height-tight")}>
                {branchData?.address || "Building No., Street Name, City, State, ZIP"}
              </Text>
              <Text style={tw("text-[9px] text-slate-500 mt-1.5")}>
                GSTIN: <Text style={tw("font-bold text-slate-800")}>{branchData?.gstNo || "N/A"}</Text> | PAN: <Text style={tw("font-bold text-slate-800")}>{branchData?.panNo || "N/A"}</Text>
              </Text>
              <Text style={tw("text-[9px] text-slate-500 mt-0.5")}>
                Email: {branchData?.contactEmail || "info@walrus.com"}
              </Text>
            </View>
          </View>
          
          <View style={tw("items-end")}>
            <View style={tw("bg-slate-900 px-5 py-2.5 rounded-sm mb-3")}>
              <Text style={tw("text-white text-base font-bold tracking-[2px] uppercase")}>{title}</Text>
            </View>
            <View style={tw("flex-row gap-5 px-1")}>
              <View style={tw("items-end")}>
                <Text style={tw("text-[8px] text-slate-400 uppercase font-bold mb-0.5")}>Document No.</Text>
                <Text style={tw("text-xs font-bold text-slate-800")}>{docId}</Text>
              </View>
              <View style={tw("items-end")}>
                <Text style={tw("text-[8px] text-slate-400 uppercase font-bold mb-0.5")}>Date</Text>
                <Text style={tw("text-xs font-bold text-slate-800")}>{formattedDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* === DETAILS GRID === */}
        <View style={tw("flex-row mb-6 border-y border-slate-100 py-4")}>
          <View style={tw("flex-1 pr-4 border-r border-slate-50")}>
            <Text style={tw("text-[8px] text-slate-400 uppercase font-bold mb-2 tracking-wider")}>Bill To</Text>
            <Text style={tw("text-xs font-bold text-slate-800 uppercase mb-1")}>{customerData?.name || "Customer Name"}</Text>
            <Text style={tw("text-[9px] text-slate-500 leading-tight")}>
              {customerData?.address || "Customer Address Details"}
            </Text>
            <View style={tw("mt-2 pt-2 border-t border-slate-50 flex-row gap-3")}>
               <Text style={tw("text-[9px] text-slate-500")}>GSTIN: <Text style={tw("text-slate-800 font-bold")}>{customerData?.gstNo || "N/A"}</Text></Text>
               <Text style={tw("text-[9px] text-slate-500")}>Phone: <Text style={tw("text-slate-800 font-bold")}>{customerData?.contactPersonNumber || "N/A"}</Text></Text>
            </View>
          </View>
          
          <View style={tw("w-[160px] pl-6")}>
            <Text style={tw("text-[8px] text-slate-400 uppercase font-bold mb-3 tracking-wider")}>Reference Summary</Text>
            <View style={tw("flex-row justify-between mb-2")}>
              <Text style={tw("text-[9px] text-slate-500")}>Payment Terms</Text>
              <Text style={tw("text-[9px] text-slate-800 font-bold")}>{customerData?.payTermName || "Immediate"}</Text>
            </View>
            <View style={tw("flex-row justify-between mb-2")}>
              <Text style={tw("text-[9px] text-slate-500")}>Tax Method</Text>
              <Text style={tw("text-[9px] text-slate-800 font-bold")}>{taxMethod}</Text>
            </View>
            <View style={tw("flex-row justify-between")}>
              <Text style={tw("text-[9px] text-slate-500")}>Due Date</Text>
              <Text style={tw("text-[9px] text-slate-800")}>{formattedDate}</Text>
            </View>
          </View>
        </View>

        {/* === ITEMS TABLE === */}
        <View style={tw("min-h-[350px]")}>
          {/* Table Header */}
          <View style={tw("flex-row bg-slate-900 rounded-t-sm items-center py-2.5 px-3")}>
            <Text style={[tw("text-[8px] text-white font-bold"), { width: "4%" }]}>#</Text>
            <Text style={[tw("text-[8px] text-white font-bold"), { width: "40%" }]}>ITEM DESCRIPTION</Text>
            <Text style={[tw("text-[8px] text-white font-bold text-center"), { width: "12%" }]}>HSN</Text>
            <Text style={[tw("text-[8px] text-white font-bold text-right"), { width: "12%" }]}>QTY</Text>
            <Text style={[tw("text-[8px] text-white font-bold text-right"), { width: "14%" }]}>RATE</Text>
            <Text style={[tw("text-[8px] text-white font-bold text-right"), { width: "18%" }]}>AMOUNT</Text>
          </View>

          {/* Table Rows */}
          {tableData.map((item, idx) => (
            <View 
              key={idx} 
              style={[
                tw("flex-row border-b border-slate-50 items-center py-3 px-3 min-h-[35px]"),
                idx % 2 === 0 ? tw("bg-white") : tw("bg-slate-50/30")
              ]}
              wrap={false}
            >
              <Text style={[tw("text-[9px] text-slate-400"), { width: "4%" }]}>{idx + 1}</Text>
              <View style={{ width: "40%" }}>
                {item.placeholder ? null : (
                  <>
                    <Text style={tw("text-[9px] text-slate-800 font-bold")}>
                      {findFromList(item.itemId, itemList, "name") || "—"}
                    </Text>
                    <Text style={tw("text-[7px] text-slate-400 mt-0.5 uppercase tracking-wide")}>
                      {findFromList(item.sizeId, sizeList, "name") || "—"} | {findFromList(item.colorId, colorList, "name") || "—"}
                    </Text>
                  </>
                )}
              </View>
              <Text style={[tw("text-[9px] text-slate-600 text-center"), { width: "12%" }]}>
                {item.placeholder ? "" : (findFromList(item.hsnId || (itemList?.find(i => i.id === item.itemId)?.hsnId), hsnList, "name") || "—")}
              </Text>
              <Text style={[tw("text-[9px] text-slate-800 text-right"), { width: "12%" }]}>
                {item.placeholder ? "" : parseFloat(item.qty || 0).toFixed(2)}
              </Text>
              <Text style={[tw("text-[9px] text-slate-800 text-right"), { width: "14%" }]}>
                {item.placeholder ? "" : parseFloat(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={[tw("text-[9px] text-slate-800 text-right font-bold"), { width: "18%" }]}>
                {item.placeholder ? "" : (parseFloat(item.qty || 0) * parseFloat(item.price || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
        </View>

        {/* === TAX BREAKUP & TOTALS === */}
        <View style={tw("mt-6")} wrap={false}>
          <View style={tw("flex-row")}>
            {/* Left Column: Tax Breakup Table */}
            <View style={tw("flex-1 mr-8")}>
              <Text style={tw("text-[8px] text-slate-400 uppercase font-bold mb-2 tracking-wider")}>GST Breakup Details</Text>
              <View style={tw("border border-slate-100 rounded-sm overflow-hidden")}>
                <View style={tw("flex-row bg-slate-50 py-1.5 px-2 border-b border-slate-100")}>
                  <Text style={[tw("text-[7px] font-bold text-slate-600"), { flex: 1 }]}>TAX %</Text>
                  <Text style={[tw("text-[7px] font-bold text-slate-600 text-right"), { flex: 2 }]}>TAXABLE VAL</Text>
                  {isSupplierOutside ? (
                    <Text style={[tw("text-[7px] font-bold text-slate-600 text-right"), { flex: 2 }]}>IGST</Text>
                  ) : (
                    <>
                      <Text style={[tw("text-[7px] font-bold text-slate-600 text-right"), { flex: 1.5 }]}>CGST</Text>
                      <Text style={[tw("text-[7px] font-bold text-slate-600 text-right"), { flex: 1.5 }]}>SGST</Text>
                    </>
                  )}
                  <Text style={[tw("text-[7px] font-bold text-slate-600 text-right"), { flex: 2 }]}>TOTAL TAX</Text>
                </View>
                {taxBreakup.map((b, i) => (
                  <View key={i} style={tw("flex-row py-1.5 px-2 border-b border-slate-50 last:border-0")}>
                    <Text style={[tw("text-[8px] text-slate-700"), { flex: 1 }]}>{b.taxRate}%</Text>
                    <Text style={[tw("text-[8px] text-slate-700 text-right"), { flex: 2 }]}>{b.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                    {isSupplierOutside ? (
                      <Text style={[tw("text-[8px] text-slate-700 text-right"), { flex: 2 }]}>{b.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                    ) : (
                      <>
                        <Text style={[tw("text-[8px] text-slate-700 text-right"), { flex: 1.5 }]}>{b.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                        <Text style={[tw("text-[8px] text-slate-700 text-right"), { flex: 1.5 }]}>{b.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                      </>
                    )}
                    <Text style={[tw("text-[8px] text-slate-900 font-bold text-right"), { flex: 2 }]}>{b.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                  </View>
                ))}
              </View>
              
              <View style={tw("mt-4 pt-2 border-t border-slate-50")}>
                 <Text style={tw("text-[8px] text-slate-400 uppercase font-bold mb-1")}>Amount in Words</Text>
                 <Text style={tw("text-[9px] font-bold text-slate-800 italic")}>
                   {numberToText.convertToText(Math.round(netAmount), { language: "en-in", separator: "" })} Only
                 </Text>
              </View>
            </View>

            {/* Right Column: Totals Summary */}
            <View style={tw("w-[180px]")}>
               <View style={tw("bg-slate-900 rounded-sm p-4")}>
                  <View style={tw("flex-row justify-between mb-3 border-b border-slate-800 pb-2")}>
                    <Text style={tw("text-[8px] text-slate-400 font-bold uppercase")}>Gross Value</Text>
                    <Text style={tw("text-[10px] text-white font-bold")}>{grossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                  </View>
                  
                  {taxBreakup.map((b, i) => (
                    <View key={i} style={tw("flex-row justify-between mb-1.5")}>
                       <Text style={tw("text-[8px] text-slate-500")}>GST ({b.taxRate}%)</Text>
                       <Text style={tw("text-[9px] text-slate-300 font-medium")}>{b.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                    </View>
                  ))}

                  <View style={tw("flex-row justify-between items-center mt-4 pt-4 border-t border-slate-750")}>
                     <Text style={tw("text-[10px] text-white uppercase font-bold tracking-tight")}>Total Amount</Text>
                     <Text style={tw("text-xl text-white font-bold")}>₹{netAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</Text>
                  </View>
               </View>
            </View>
          </View>
        </View>

        {/* === FOOTER (REMARKS & BANK) === */}
        <View style={tw("mt-8 mb-4 flex-row gap-6")} wrap={false}>
          <View style={tw("flex-1 bg-slate-50/50 p-4 rounded-sm border border-slate-100")}>
            <Text style={tw("text-[8px] text-slate-400 uppercase font-bold mb-2 tracking-wider")}>Bank Account Details</Text>
            <View style={tw("flex-row mb-1.5")}>
               <Text style={[tw("text-[8px] text-slate-500"), { width: "60px" }]}>Account Name</Text>
               <Text style={tw("text-[8px] text-slate-800 font-bold")}>{branchData?.accountName || branchData?.branchName || "—"}</Text>
            </View>
            <View style={tw("flex-row mb-1.5")}>
               <Text style={[tw("text-[8px] text-slate-500"), { width: "60px" }]}>Bank Name</Text>
               <Text style={tw("text-[8px] text-slate-800 font-bold")}>{branchData?.bankName || "—"}</Text>
            </View>
            <View style={tw("flex-row mb-1.5")}>
               <Text style={[tw("text-[8px] text-slate-500"), { width: "60px" }]}>Account No</Text>
               <Text style={tw("text-[8px] text-slate-800 font-bold tracking-widest")}>{branchData?.accountNo || "—"}</Text>
            </View>
            <View style={tw("flex-row")}>
               <Text style={[tw("text-[8px] text-slate-500"), { width: "60px" }]}>IFSC Code</Text>
               <Text style={tw("text-[8px] text-slate-800 font-bold")}>{branchData?.ifscCode || "—"}</Text>
            </View>
          </View>

          <View style={tw("flex-1 bg-slate-50/50 p-4 rounded-sm border border-slate-100")}>
            <Text style={tw("text-[8px] text-slate-400 uppercase font-bold mb-2 tracking-wider")}>Notes & Remarks</Text>
            <Text style={tw("text-[9px] text-slate-600 line-height-relaxed")}>{remarks || "No additional remarks."}</Text>
          </View>
        </View>

        {/* === TERMS & SIGNATURE === */}
        <View style={tw("mt-auto")} wrap={false}>
          <View style={tw("flex-row justify-between pt-10")}>
            <View style={tw("items-center")}>
              <View style={tw("w-32 border-b border-slate-200 mb-2")} />
              <Text style={tw("text-[8px] text-slate-400 uppercase font-bold")}>Receiver's Sign</Text>
            </View>
            
            <View style={tw("items-center")}>
              <Text style={[tw("text-[8px] text-slate-800 font-bold mb-10"), { opacity: 0.8 }]}>For {branchData?.branchName || "Walrus Garments"}</Text>
              <View style={tw("w-40 border-b border-slate-300 mb-2")} />
              <Text style={tw("text-[8px] text-slate-500 uppercase font-bold")}>Authorized Signatory</Text>
            </View>
          </View>
          
          <View style={tw("mt-6 py-3 border-t border-slate-50 flex-row justify-between items-center")}>
             <View style={tw("flex-row gap-4")}>
               <Text style={tw("text-[7px] text-slate-400")}>Regd Off: {branchData?.address || "—"}</Text>
             </View>
             <Text style={tw("text-[7px] text-slate-300")}>This is a computer generated document.</Text>
          </View>
        </View>

        {/* Page Numbering */}
        <Text
          style={tw("absolute bottom-4 right-10 text-[7px] text-slate-300")}
          render={({ pageNumber, totalPages }) => `P-${pageNumber} / ${totalPages}`}
          fixed
        />

      </Page>
    </Document>
  );
};

export default PremiumSalesPrintFormat;
