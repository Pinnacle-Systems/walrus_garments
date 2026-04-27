import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
} from "@react-pdf/renderer";
import numberToText from "number-to-text";
import moment from "moment";
import WalrusLogo from "../../../assets/walrusNew.png";
import { findFromList, getCommonParams } from "../../../Utils/helper";
import { useGetBranchByIdQuery } from "../../../redux/services/BranchMasterService";

// ─── Colour palette matching the screenshot ────────────────────────────────
const PURPLE = "#7878c8";       // header band fill
const PURPLE_DARK = "#5c5ca8";  // darker accent
const WHITE = "#ffffff";
const GRAY_BG = "#f5f5f5";
const BORDER = "#d0d0e8";
const TEXT_DARK = "#1a1a2e";
const TEXT_MID = "#444466";
const TEXT_LIGHT = "#888899";

// ─── Tiny style helpers (no tailwind needed) ───────────────────────────────
const s = {
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: TEXT_DARK,
    backgroundColor: WHITE,
    padding: 24,
  },
  // Purple band heading row
  bandRow: {
    flexDirection: "row",
    backgroundColor: PURPLE,
  },
  bandCell: {
    color: WHITE,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    padding: "4 6",
  },
  // Table cells
  cell: {
    padding: "3 5",
    fontSize: 8,
    color: TEXT_DARK,
  },
  cellBold: {
    padding: "3 5",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: TEXT_DARK,
  },
  // Borders
  border: { border: `1 solid ${BORDER}` },
  borderB: { borderBottom: `1 solid ${BORDER}` },
  borderR: { borderRight: `1 solid ${BORDER}` },
  borderT: { borderTop: `1 solid ${BORDER}` },
  // Flex helpers
  row: { flexDirection: "row" },
  flex1: { flex: 1 },
  // Summary row in totals box
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "3 6",
    borderBottom: `1 solid ${BORDER}`,
  },
  summaryLabel: { fontSize: 8, color: TEXT_MID },
  summaryValue: { fontSize: 8, color: TEXT_DARK, fontFamily: "Helvetica-Bold" },
};

// ─── Component ─────────────────────────────────────────────────────────────
const PremiumSalesPrintFormat = ({
  title = "",
  subTittle,
  docId = "N/A",
  date = new Date(),
  branchData = {},
  customerData = {},
  items = [],
  totals = {},
  remarks = "",
  terms = "Thank you for doing business with us!",
  taxMethod = "WithoutTax",
  isSupplierOutside = false,
  itemList = [],
  sizeList = [],
  colorList = [],
  uomList = [],
  hsnList = [],
}) => {
  const formattedDate = moment(date).format("DD-MM-YYYY");
  const formattedTime = moment(date).format("hh:mm A");

  console.log(branchData, "branchData")

  // ── Tax calculation ────────────────────────────────────────────────────
  const getTaxBreakup = () => {
    const breakup = {};
    items.forEach((item) => {
      const taxRate = parseFloat(item.tax || item.taxPercent || 0);
      const qty = parseFloat(item.qty || 0);
      const price = parseFloat(item.price || 0);
      let taxableAmount = 0;
      let taxAmount = 0;
      if (taxMethod === "inclusive") {
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
  const cgstTotal = taxBreakup.reduce((acc, b) => acc + b.cgst, 0);
  const sgstTotal = taxBreakup.reduce((acc, b) => acc + b.sgst, 0);
  const igstTotal = taxBreakup.reduce((acc, b) => acc + b.igst, 0);
  const netAmount = taxableAmount + totalTax;

  const fmt = (n, dec = 2) =>
    parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: dec });

  // ── Helper: row shading ────────────────────────────────────────────────
  const rowBg = (idx) => ({ backgroundColor: idx % 2 === 0 ? WHITE : "#efeffa" });

  // ── Column widths for item table ───────────────────────────────────────
  const col = {
    sno: "4%",
    item: "26%",
    hsn: "9%",
    qty: "8%",
    price: "10%",
    disc: "8%",
    cgst: "11%",
    sgst: "11%",
    amt: "13%",
  };

  return (
    <Document title={`${title} - ${docId}`}>
      <Page size="A4" style={s.page}>

        {/* ═══ TOP BAR: title centred, company right ═══════════════════ */}
        <View
          style={[
            s.row,
            {
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
              paddingBottom: 4,
              borderBottom: `2 solid ${PURPLE}`,
            },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image src={WalrusLogo} style={{ width: 120, height: 30, marginRight: 8 }} />

          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Helvetica-Bold",
                color: TEXT_DARK,
              }}
            >
              {branchData?.branchName || "WALRUS GARMENTS"}
            </Text>
            <Text style={{ fontSize: 9, color: TEXT_MID }}>
              {branchData?.address || ""}
            </Text>
            <Text style={{ fontSize: 8, color: TEXT_MID }}>
              Ph. no.: {branchData?.contactMobile || "N/A"}
            </Text>
          </View>
        </View>

        {/* ═══ DOCUMENT TITLE ═════════════════════════════════════════ */}
        <Text
          style={{
            textAlign: "center",
            fontFamily: "Helvetica-Bold",
            fontSize: 11,
            color: TEXT_DARK,
            marginBottom: 6,
          }}
        >
          {title}
        </Text>

        {/* ═══ BILL TO / SHIPPING TO / INVOICE DETAILS ════════════════ */}
        <View style={[s.border, { marginBottom: 6 }]} wrap={false}>
          {/* Purple band */}
          <View style={s.bandRow}>
            <Text style={[s.bandCell, { flex: 2, borderRight: `1 solid ${WHITE}` }]}>
              Bill To:
            </Text>
            <Text style={[s.bandCell, { flex: 2, borderRight: `1 solid ${WHITE}` }]}>
              Shipping To
            </Text>
            <Text style={[s.bandCell, { flex: 1.5, color: "#ffeeaa" }]}>
              {subTittle} Details
            </Text>
          </View>
          {/* Content row */}
          <View style={[s.row, { minHeight: 60 }]}>
            {/* Bill To */}
            <View style={[s.flex1, s.borderR, { flex: 2, padding: 5 }]}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9, marginBottom: 2 }}>
                {customerData?.name || "—"}
              </Text>
              <Text style={{ fontSize: 8, color: TEXT_MID, marginBottom: 2 }}>
                {customerData?.address || ""}
              </Text>
              <Text style={{ fontSize: 8, color: TEXT_MID }}>
                Contact No.: {customerData?.contactPersonNumber || "—"}
              </Text>
            </View>
            {/* Shipping To */}
            <View style={[s.flex1, s.borderR, { flex: 2, padding: 5 }]}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9, marginBottom: 2 }}>
                {customerData?.name || "—"}
              </Text>
              <Text style={{ fontSize: 8, color: TEXT_MID }}>
                {customerData?.address || ""}
              </Text>
            </View>
            {/* Invoice Details */}
            <View style={{ flex: 1.5, padding: 5 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                <Text style={{ fontSize: 8, color: TEXT_MID }}>{subTittle} No.:</Text>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: PURPLE_DARK }}>
                  {docId}
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                <Text style={{ fontSize: 8, color: TEXT_MID }}>Date:</Text>
                <Text style={{ fontSize: 8, color: TEXT_DARK }}>{formattedDate}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                <Text style={{ fontSize: 8, color: TEXT_MID }}>Time:</Text>
                <Text style={{ fontSize: 8, color: TEXT_DARK }}>{formattedTime}</Text>
              </View>
              {/* <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 8, color: TEXT_MID }}>Tax Method:</Text>
                <Text style={{ fontSize: 8, color: TEXT_DARK }}>{taxMethod}</Text>
              </View> */}
            </View>
          </View>
        </View>

        {/* ═══ ITEMS TABLE ════════════════════════════════════════════ */}
        <View style={[s.border, { marginBottom: 0 }]}>
          {/* Header */}
          <View style={[s.bandRow, { borderBottom: `1 solid ${WHITE}` }]} fixed>
            <Text style={[s.bandCell, { width: col.sno, textAlign: "center" }]}>#</Text>
            <Text style={[s.bandCell, { width: col.item, borderLeft: `1 solid ${WHITE}` }]}>Item name</Text>
            <Text style={[s.bandCell, { width: col.hsn, borderLeft: `1 solid ${WHITE}`, textAlign: "center" }]}>HSC/SAC</Text>
            <Text style={[s.bandCell, { width: col.qty, borderLeft: `1 solid ${WHITE}`, textAlign: "center" }]}>Qty</Text>
            <Text style={[s.bandCell, { width: col.price, borderLeft: `1 solid ${WHITE}`, textAlign: "right" }]}>Price/unit</Text>
            <Text style={[s.bandCell, { width: col.disc, borderLeft: `1 solid ${WHITE}`, textAlign: "right" }]}>Discount</Text>
            <Text style={[s.bandCell, { width: col.cgst, borderLeft: `1 solid ${WHITE}`, textAlign: "right" }]}>CGST</Text>
            <Text style={[s.bandCell, { width: col.sgst, borderLeft: `1 solid ${WHITE}`, textAlign: "right" }]}>SGST</Text>
            <Text style={[s.bandCell, { width: col.amt, borderLeft: `1 solid ${WHITE}`, textAlign: "right" }]}>Amount</Text>
          </View>

          {/* Item rows */}
          {items.map((item, idx) => {
            const qty = parseFloat(item.qty || 0);
            const price = parseFloat(item.price || 0);
            const taxRate = parseFloat(item.tax || item.taxPercent || 0);
            let rowTaxable = price * qty;
            let cgstAmt = 0, sgstAmt = 0;
            if (taxMethod === "With Tax") {
              rowTaxable = (price * qty) / (1 + taxRate / 100);
            }
            if (!isSupplierOutside) {
              cgstAmt = (rowTaxable * taxRate) / 200;
              sgstAmt = cgstAmt;
            }
            const lineAmount = price * qty;
            const hsnCode = findFromList(
              item.hsnId || itemList?.find((i) => i.id === item.itemId)?.hsnId,
              hsnList,
              "name"
            );
            return (
              <View
                key={idx}
                style={[
                  s.row,
                  { borderTop: `1 solid ${BORDER}` },
                  rowBg(idx),
                ]}
                wrap={false}
              >
                <Text style={[s.cell, { width: col.sno, textAlign: "center" }]}>{idx + 1}</Text>
                <View style={{ width: col.item, borderLeft: `1 solid ${BORDER}` }}>
                  <Text style={[s.cellBold, { paddingBottom: 0 }]}>
                    {findFromList(item.itemId, itemList, "name") || "—"}
                  </Text>
                  <Text style={{ fontSize: 7, color: TEXT_LIGHT, paddingLeft: 5, paddingBottom: 3 }}>
                    {[
                      findFromList(item.sizeId, sizeList, "name"),
                      findFromList(item.colorId, colorList, "name"),
                    ]
                      .filter(Boolean)
                      .join(" | ")}
                  </Text>
                </View>
                <Text style={[s.cell, { width: col.hsn, borderLeft: `1 solid ${BORDER}`, textAlign: "center" }]}>
                  {hsnCode || "—"}
                </Text>
                <Text style={[s.cell, { width: col.qty, borderLeft: `1 solid ${BORDER}`, textAlign: "right" }]}>
                  {qty.toFixed(2)}
                </Text>
                <Text style={[s.cell, { width: col.price, borderLeft: `1 solid ${BORDER}`, textAlign: "right" }]}>
                  Rs. {fmt(price)}
                </Text>
                <Text style={[s.cell, { width: col.disc, borderLeft: `1 solid ${BORDER}`, textAlign: "right" }]}>
                  {"—"}
                </Text>
                <Text style={[s.cell, { width: col.cgst, borderLeft: `1 solid ${BORDER}`, textAlign: "right" }]}>
                  {cgstAmt > 0 ? `Rs. ${fmt(cgstAmt)} (${taxRate / 2}%)` : "—"}
                </Text>
                <Text style={[s.cell, { width: col.sgst, borderLeft: `1 solid ${BORDER}`, textAlign: "right" }]}>
                  {sgstAmt > 0 ? `Rs. ${fmt(sgstAmt)} (${taxRate / 2}%)` : "—"}
                </Text>
                <Text style={[s.cellBold, { width: col.amt, borderLeft: `1 solid ${BORDER}`, textAlign: "right" }]}>
                  Rs. {fmt(lineAmount)}
                </Text>
              </View>
            );
          })}

          {/* Totals row */}
          <View
            style={[
              s.row,
              {
                borderTop: `1 solid ${BORDER}`,
                backgroundColor: GRAY_BG,
              },
            ]}
            wrap={false}
          >
            <Text style={[s.cellBold, { width: col.sno, textAlign: "center" }]} />
            <Text style={[s.cellBold, { width: col.item, borderLeft: `1 solid ${BORDER}` }]}>Total</Text>
            <Text style={[s.cellBold, { width: col.hsn, borderLeft: `1 solid ${BORDER}` }]} />
            <Text style={[s.cellBold, { width: col.qty, borderLeft: `1 solid ${BORDER}`, textAlign: "center" }]}>
              {items.reduce((a, i) => a + parseFloat(i.qty || 0), 0).toFixed(2)}
            </Text>
            <Text style={[s.cellBold, { width: col.price, borderLeft: `1 solid ${BORDER}` }]} />
            <Text style={[s.cellBold, { width: col.disc, borderLeft: `1 solid ${BORDER}` }]} />
            <Text style={[s.cellBold, { width: col.cgst, borderLeft: `1 solid ${BORDER}`, textAlign: "right" }]}>
              Rs. {fmt(taxBreakup.reduce((a, b) => a + b.cgst, 0))}
            </Text>
            <Text style={[s.cellBold, { width: col.sgst, borderLeft: `1 solid ${BORDER}`, textAlign: "right" }]}>
              Rs. {fmt(taxBreakup.reduce((a, b) => a + b.sgst, 0))}
            </Text>
            <Text style={[s.cellBold, { width: col.amt, borderLeft: `1 solid ${BORDER}`, textAlign: "right" }]}>
              Rs. {fmt(netAmount)}
            </Text>
          </View>
        </View>

        <View style={[s.row, { marginTop: 6, marginBottom: 6, justifyContent: "flex-end" }]} wrap={false}>
          {/* Totals summary */}
          <View style={[s.border, { width: 180 }]}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Sub Total</Text>
              <Text style={s.summaryValue}>Rs. {fmt(taxableAmount)}</Text>
            </View>

            {isSupplierOutside ? (
              igstTotal > 0 && (
                <View style={s.summaryRow}>
                  <Text style={s.summaryLabel}>IGST</Text>
                  <Text style={s.summaryValue}>Rs. {fmt(igstTotal)}</Text>
                </View>
              )
            ) : (
              <>
                {cgstTotal > 0 && (
                  <View style={s.summaryRow}>
                    <Text style={s.summaryLabel}>CGST</Text>
                    <Text style={s.summaryValue}>Rs. {fmt(cgstTotal)}</Text>
                  </View>
                )}
                {sgstTotal > 0 && (
                  <View style={s.summaryRow}>
                    <Text style={s.summaryLabel}>SGST</Text>
                    <Text style={s.summaryValue}>Rs. {fmt(sgstTotal)}</Text>
                  </View>
                )}
              </>
            )}

            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Tax Amount</Text>
              <Text style={s.summaryValue}>Rs. {fmt(totalTax)}</Text>
            </View>

            <View
              style={[
                s.summaryRow,
                { backgroundColor: PURPLE, borderTop: `2 solid ${PURPLE_DARK}` },
              ]}
            >
              <Text style={[s.summaryLabel, { color: WHITE, fontFamily: "Helvetica-Bold" }]}>
                Total
              </Text>
              <Text style={[s.summaryValue, { color: WHITE, fontSize: 10 }]}>
                Rs. {fmt(netAmount)}
              </Text>
            </View>
            {/* <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Received</Text>
              <Text style={s.summaryValue}>Rs. {fmt(totals?.received || 0)}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Balance</Text>
              <Text style={s.summaryValue}>Rs. {fmt((netAmount || 0) - (totals?.received || 0))}</Text>
            </View> */}
          </View>
        </View>

        {/* ═══ AMOUNT IN WORDS  +  DESCRIPTION ═══════════════════════ */}
        <View style={[s.row, { marginBottom: 6, border: `1 solid ${BORDER}` }]} wrap={false}>
          <View style={[s.flex1, s.borderR]}>
            <View style={[s.bandRow]}>
              <Text style={s.bandCell}>Invoice Amount in Words</Text>
            </View>
            <Text style={{ fontSize: 8, padding: 6, color: TEXT_DARK, fontFamily: "Helvetica-Bold" }}>
              {numberToText.convertToText(Math.round(netAmount), {
                language: "en-in",
                separator: "",
              })}{" "}
              Only
            </Text>
          </View>
          <View style={s.flex1}>
            <View style={s.bandRow}>
              <Text style={s.bandCell}>Remarks</Text>
            </View>
            <Text style={{ fontSize: 8, padding: 6, color: TEXT_MID }}>
              {remarks || "--"}
            </Text>
          </View>
        </View>

        {/* ═══ BANK DETAILS  +  TERMS  +  SIGNATURE ══════════════════ */}
        <View style={[s.row, { border: `1 solid ${BORDER}` }]} wrap={false}>
          {/* Bank Details */}
          <View style={[{ flex: 1.2 }, s.borderR]}>
            <View style={s.bandRow}>
              <Text style={s.bandCell}>Bank Details</Text>
            </View>
            <View style={{ padding: 6 }}>
              <View style={[s.row, { marginBottom: 3 }]}>
                <Text style={{ width: 80, fontSize: 8, color: TEXT_MID }}>Bank Name:</Text>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>
                  {branchData?.bankName || "—"}
                </Text>
              </View>
              <View style={[s.row, { marginBottom: 3 }]}>
                <Text style={{ width: 80, fontSize: 8, color: TEXT_MID }}>Bank Account No.:</Text>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>
                  {branchData?.accountNo || "—"}
                </Text>
              </View>
              <View style={s.row}>
                <Text style={{ width: 80, fontSize: 8, color: TEXT_MID }}>Bank IFSC code:</Text>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>
                  {branchData?.ifscCode || "—"}
                </Text>
              </View>
            </View>
          </View>

          {/* Terms & Conditions */}
          <View style={[{ flex: 1.2 }, s.borderR]}>
            <View style={s.bandRow}>
              <Text style={s.bandCell}>Terms and conditions</Text>
            </View>
            <Text style={{ fontSize: 8, padding: 6, color: TEXT_MID }}>
              {Array.isArray(terms) ? terms.join("\n") : terms || "—"}
            </Text>
          </View>

          {/* Authorized Signatory */}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", padding: 6 }}>
            <Text style={{ fontSize: 8, color: TEXT_MID, marginBottom: 4 }}>
              For : {branchData?.branchName || "Walrus Garments"}
            </Text>
            <View
              style={{
                width: 60,
                height: 40,
                border: `1 solid ${BORDER}`,
                backgroundColor: GRAY_BG,
                marginBottom: 4,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 7, color: TEXT_LIGHT }}>Seal</Text>
            </View>
            <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: TEXT_DARK }}>
              Authorized Signatory
            </Text>
          </View>
        </View>

        {/* ═══ Page Number ════════════════════════════════════════════ */}
        <Text
          style={{
            position: "absolute",
            bottom: 10,
            right: 24,
            fontSize: 7,
            color: TEXT_LIGHT,
          }}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          fixed
        />

      </Page>
    </Document>
  );
};

export default PremiumSalesPrintFormat;
