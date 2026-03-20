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
  // Module-specific lists for lookups
  itemList = [],
  sizeList = [],
  colorList = [],
  uomList = [],
  hsnList = [],
}) => {
  // Format dates
  const formattedDate = moment(date).format("DD-MMM-YYYY");

  // Pre-calculate totals if not provided
  const grossTotal = totals.gross || items.reduce((acc, item) => acc + (parseFloat(item.qty || 0) * parseFloat(item.price || 0)), 0);
  const netAmount = totals.net || grossTotal; // Assume simple case if no tax info

  // Fill table with empty rows for premium look (consistent length)
  const MIN_ROWS = 10;
  const tableData = [
    ...items,
    ...Array(Math.max(0, MIN_ROWS - items.length)).fill({ placeholder: true }),
  ];

  return (
    <Document title={`${title} - ${docId}`}>
      <Page size="A4" style={[tw("p-10 bg-white"), { fontFamily: "Helvetica" }]}>
        
        {/* === HEADER === */}
        <View style={tw("flex-row justify-between items-start mb-8")}>
          <View style={tw("flex-row items-center")}>
            <Image src={WalrusLogo} style={tw("w-16 h-16 mr-4")} />
            <View>
              <Text style={tw("text-2xl font-bold text-slate-800 tracking-tight")}>{branchData?.branchName || "WALRUS GARMENTS"}</Text>
              <Text style={tw("text-xs text-slate-500 max-w-[200px] mt-1")}>
                {branchData?.address || "Building No., Street Name, City, State, ZIP"}
              </Text>
              <Text style={tw("text-[10px] text-slate-400 mt-1")}>
                GSTIN: {branchData?.gstNo || "N/A"} | PAN: {branchData?.panNo || "N/A"}
              </Text>
              <Text style={tw("text-[10px] text-slate-400")}>
                Email: {branchData?.contactEmail || "info@walrus.com"}
              </Text>
            </View>
          </View>
          
          <View style={tw("items-end")}>
            <View style={tw("bg-slate-800 px-4 py-2 rounded-sm mb-2")}>
              <Text style={tw("text-white text-lg font-bold tracking-widest uppercase")}>{title}</Text>
            </View>
            <View style={tw("flex-row gap-4")}>
              <View style={tw("items-end")}>
                <Text style={tw("text-[9px] text-slate-400 uppercase font-bold")}>Document No.</Text>
                <Text style={tw("text-sm font-bold text-slate-800")}>{docId}</Text>
              </View>
              <View style={tw("items-end")}>
                <Text style={tw("text-[9px] text-slate-400 uppercase font-bold")}>Date</Text>
                <Text style={tw("text-sm font-bold text-slate-800")}>{formattedDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* === CUSTOMER DETAILS === */}
        <View style={tw("flex-row justify-between mb-8 pb-4 border-b border-slate-100")}>
          <View style={tw("w-1/2")}>
            <Text style={tw("text-[9px] text-slate-400 uppercase font-bold mb-2 tracking-wider")}>Bill To</Text>
            <Text style={tw("text-sm font-bold text-slate-800 uppercase")}>{customerData?.name || "Customer Name"}</Text>
            <Text style={tw("text-[10px] text-slate-500 mt-1 max-w-[250px]")}>
              {customerData?.address || "Customer Address Details"}
            </Text>
            <Text style={tw("text-[10px] text-slate-500 mt-2")}>
              GSTIN: {customerData?.gstNo || "N/A"} | Mobile: {customerData?.contactPersonNumber || "N/A"}
            </Text>
          </View>
          
          <View style={tw("w-1/3 items-end")}>
            {/* Additional Info like Ref No, Delivery Type etc. can go here */}
            <View style={tw("flex-row gap-2 mb-1 items-center")}>
              <Text style={tw("text-[9px] text-slate-400 uppercase font-bold")}>Payment Terms:</Text>
              <Text style={tw("text-[10px] text-slate-700 font-bold")}>{customerData?.payTermName || "Immediate"}</Text>
            </View>
            <View style={tw("flex-row gap-2 items-center")}>
              <Text style={tw("text-[9px] text-slate-400 uppercase font-bold")}>Due Date:</Text>
              <Text style={tw("text-[10px] text-slate-700")}>{formattedDate}</Text>
            </View>
          </View>
        </View>

        {/* === ITEMS TABLE === */}
        <View style={tw("flex-1")}>
          {/* Table Header */}
          <View style={tw("flex-row bg-slate-800 rounded-t-sm items-center py-2 px-3")}>
            <Text style={[tw("text-[9px] text-white font-bold"), { flex: 0.5 }]}>#</Text>
            <Text style={[tw("text-[9px] text-white font-bold"), { flex: 4 }]}>Item Description</Text>
            <Text style={[tw("text-[9px] text-white font-bold text-center"), { flex: 1 }]}>HSN</Text>
            <Text style={[tw("text-[9px] text-white font-bold text-center"), { flex: 1 }]}>UOM</Text>
            <Text style={[tw("text-[9px] text-white font-bold text-right"), { flex: 1.5 }]}>Qty</Text>
            <Text style={[tw("text-[9px] text-white font-bold text-right"), { flex: 1.5 }]}>Rate</Text>
            <Text style={[tw("text-[9px] text-white font-bold text-right"), { flex: 2 }]}>Amount</Text>
          </View>

          {/* Table Rows */}
          {tableData.map((item, idx) => (
            <View 
              key={idx} 
              style={[
                tw("flex-row border-b border-slate-50 items-center py-3 px-3"),
                idx % 2 === 0 ? tw("bg-white") : tw("bg-slate-50/50")
              ]}
            >
              <Text style={[tw("text-[10px] text-slate-500"), { flex: 0.5 }]}>{idx + 1}</Text>
              <View style={{ flex: 4 }}>
                {item.placeholder ? (
                  <Text style={tw("text-[10px] text-transparent")}>-</Text>
                ) : (
                  <>
                    <Text style={tw("text-[10px] text-slate-800 font-bold uppercase")}>
                      {findFromList(item.itemId, itemList, "name") || "ITEM NAME"}
                    </Text>
                    <Text style={tw("text-[8px] text-slate-400 mt-0.5 uppercase")}>
                      Size: {findFromList(item.sizeId, sizeList, "name") || "—"} | Color: {findFromList(item.colorId, colorList, "name") || "—"}
                    </Text>
                  </>
                )}
              </View>
              <Text style={[tw("text-[10px] text-slate-600 text-center"), { flex: 1 }]}>
                {item.placeholder ? "" : (findFromList(item.hsnId, hsnList, "name") || "—")}
              </Text>
              <Text style={[tw("text-[10px] text-slate-600 text-center"), { flex: 1 }]}>
                {item.placeholder ? "" : (findFromList(item.uomId, uomList, "name") || "—")}
              </Text>
              <Text style={[tw("text-[10px] text-slate-800 text-right font-bold"), { flex: 1.5 }]}>
                {item.placeholder ? "" : parseFloat(item.qty || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={[tw("text-[10px] text-slate-800 text-right"), { flex: 1.5 }]}>
                {item.placeholder ? "" : parseFloat(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={[tw("text-[10px] text-slate-800 text-right font-bold"), { flex: 2 }]}>
                {item.placeholder ? "" : (parseFloat(item.qty || 0) * parseFloat(item.price || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
        </View>

        {/* === FOOTER SECTION === */}
        <View style={tw("mt-8 border-t-2 border-slate-800 pt-4")}>
          <View style={tw("flex-row justify-between")}>
            
            {/* Left: Remarks & Words */}
            <View style={tw("w-2/3 pr-8")}>
              <View style={tw("mb-4")}>
                <Text style={tw("text-[9px] text-slate-400 uppercase font-bold mb-1")}>Amount in Words</Text>
                <Text style={tw("text-[10px] font-bold text-slate-800 italic")}>
                  {numberToText.convertToText(Math.round(netAmount), { language: "en-in", separator: "" })} Only
                </Text>
              </View>
              
              <View style={tw("bg-slate-50 p-3 rounded-sm")}>
                <Text style={tw("text-[9px] text-slate-400 uppercase font-bold mb-1")}>Remarks / Notes</Text>
                <Text style={tw("text-[9px] text-slate-600 leading-relaxed")}>{remarks}</Text>
              </View>
            </View>

            {/* Right: Summary */}
            <View style={tw("w-1/3 bg-slate-800 rounded-sm p-4")}>
               <View style={tw("flex-row justify-between mb-2 pb-2 border-b border-slate-700")}>
                  <Text style={tw("text-[9px] text-slate-400 font-bold uppercase")}>Gross Total</Text>
                  <Text style={tw("text-[11px] text-white font-bold")}>{grossTotal.toLocaleString('en-IN')}</Text>
               </View>
               <View style={tw("flex-row justify-between mb-2")}>
                  <Text style={tw("text-[9px] text-slate-400 font-bold uppercase")}>Taxable Amount</Text>
                  <Text style={tw("text-[11px] text-slate-200")}>{grossTotal.toLocaleString('en-IN')}</Text>
               </View>
               <View style={tw("flex-row justify-between items-center mt-2 pt-2 border-t border-slate-600")}>
                  <Text style={tw("text-xs text-white uppercase font-bold tracking-tighter")}>Net Payable</Text>
                  <Text style={tw("text-xl text-green-400 font-bold")}>₹{netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
               </View>
            </View>
          </View>

          {/* Signatures */}
          <View style={tw("flex-row justify-between mt-12 pt-12")}>
            <View style={tw("items-center")}>
              <View style={tw("w-32 border-b border-slate-300 mb-2")} />
              <Text style={tw("text-[9px] text-slate-400 uppercase font-bold")}>Prepared By</Text>
            </View>
            <View style={tw("items-center")}>
              <View style={tw("w-32 border-b border-slate-300 mb-2")} />
              <Text style={tw("text-[9px] text-slate-400 uppercase font-bold")}>Receiver's Sign</Text>
            </View>
            <View style={tw("items-center")}>
              <View style={tw("w-40 border-b border-slate-800 mb-2")} />
              <Text style={tw("text-[9px] text-slate-800 uppercase font-bold")}>For {branchData?.branchName || "Walrus Garments"}</Text>
              <Text style={tw("text-[8px] text-slate-400 italic mt-1")}>Authorized Signatory</Text>
            </View>
          </View>
          
          {/* Terms and Conditions (Optional) */}
          {terms.length > 0 && (
            <View style={tw("mt-8 pt-4 border-t border-slate-100")}>
              <Text style={tw("text-[8px] text-slate-400 uppercase font-bold mb-2")}>Terms & Conditions</Text>
              {terms.map((term, i) => (
                <Text key={i} style={tw("text-[7px] text-slate-400 mb-1")}>{i+1}. {term}</Text>
              ))}
            </View>
          )}

        </View>

        {/* Page Numbering */}
        <Text
          style={tw("absolute bottom-6 right-10 text-[8px] text-slate-300")}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />

      </Page>
    </Document>
  );
};

export default PremiumSalesPrintFormat;
