

import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";
import Sangeethatex from "../../../../../src/assets/walrusNew.png";
import numberToText from "number-to-text";
import { findFromList, getDateFromDateTimeToDisplay } from "../../../../Utils/helper";
import { Loader } from "../../../../Basic/components";

// ─── Design Tokens ──────────────────────────────────────────────────────────
const COLOR = {
  navy: "#1A2744",   // primary header/accent
  navyMid: "#253560",   // secondary navy
  navyLight: "#EEF1F8",   // subtle bg tint
  gold: "#C9A84C",   // premium accent line
  goldLight: "#F5EDD4",   // warm highlight bg
  white: "#FFFFFF",
  offWhite: "#FAFAFA",
  border: "#C8CDD8",
  borderDark: "#8E95A9",
  text: "#1A1F2E",
  textMuted: "#5A6070",
  teal: "#0E7A6A",   // supplier name accent
};

const styles = StyleSheet.create({
  borderBox: {
    border: `1.5 solid ${COLOR.navy}`,
    margin: 0,
    padding: 0,
  },
  page: {
    fontSize: 8,
    padding: 0,
    backgroundColor: COLOR.white,
  },
  goldRule: {
    height: 3,
    backgroundColor: COLOR.gold,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerLeft: {
    width: 150,
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8,
  },
  companyName: {
    fontSize: 20,
    color: COLOR.navy,
    fontWeight: "bold",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 2,
  },
  tagline: {
    fontSize: 7,
    color: COLOR.gold,
    letterSpacing: 2,
    textAlign: "center",
    textTransform: "uppercase",
  },
  logo: {
    width: 110,
    height: 35,
  },
  companyInfoRow: {
    flexDirection: "row",
    marginBottom: 1.5,
  },
  companyInfoLabel: {
    fontSize: 7.5,
    color: COLOR.textMuted,
    width: 42,
  },
  companyInfoValue: {
    fontSize: 7.5,
    color: COLOR.text,
  },
  titleBanner: {
    backgroundColor: COLOR.navy,
    paddingVertical: 6,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "center",
  },
  titleText: {
    fontSize: 12,
    color: COLOR.white,
    fontWeight: "bold",
    letterSpacing: 3,
  },
  poRefBox_Left: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  poRefLabel_Left: {
    fontSize: 7.5,
    color: COLOR.textMuted,
    width: 65,
  },
  poRefValue_Left: {
    fontSize: 7.5,
    color: COLOR.navy,
    fontWeight: "bold",
    flex: 1,
  },
  poRefBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    justifyContent: "flex-end",
  },
  poRefLabel: {
    fontSize: 7.5,
    color: COLOR.textMuted,
    textAlign: "right",
  },
  poRefSep: {
    fontSize: 7.5,
    color: COLOR.textMuted,
    marginHorizontal: 4,
  },
  poRefValue: {
    fontSize: 7.5,
    color: COLOR.navy,
    fontWeight: "bold",
    textAlign: "left",
    width: 80,
  },
  addressSection: {
    flexDirection: "row",
    borderBottom: `1 solid ${COLOR.border}`,
    minHeight: 80,
  },
  addressBlock: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addressDivider: {
    width: 1,
    backgroundColor: COLOR.border,
  },
  addressSectionLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: COLOR.navy,
    textTransform: "uppercase",
    backgroundColor: COLOR.navyLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
    borderRadius: 2,
    width: "100%",
  },
  addressName: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLOR.navy,
    marginBottom: 3,
  },
  addressText: {
    fontSize: 7.5,
    color: COLOR.textMuted,
    marginBottom: 1.5,
  },
  addressRow: {
    flexDirection: "row",
    marginBottom: 1.5,
  },
  addressLabel: {
    fontSize: 7.5,
    color: COLOR.textMuted,
    width: 60,
  },
  addressValue: {
    fontSize: 7.5,
    color: COLOR.text,
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLOR.navy,
    paddingVertical: 5,
  },
  th: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: COLOR.white,
    textAlign: "center",
    borderRight: `0.5 solid ${COLOR.navyMid}`,
    paddingHorizontal: 3,
  },
  tdRow: {
    flexDirection: "row",
    borderBottom: `0.5 solid ${COLOR.border}`,
  },
  tdRowAlt: {
    backgroundColor: COLOR.navyLight,
  },
  td: {
    fontSize: 7.5,
    color: COLOR.text,
    textAlign: "center",
    borderRight: `0.5 solid ${COLOR.border}`,
    paddingHorizontal: 3,
    paddingVertical: 4,
  },
  totalBar: {
    flexDirection: "row",
    backgroundColor: COLOR.navyLight,
    borderTop: `1 solid ${COLOR.borderDark}`,
  },
  totalLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLOR.navy,
    padding: 5,
    textAlign: "center",
  },
  totalValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLOR.navy,
    padding: 5,
    textAlign: "right",
    borderLeft: `0.5 solid ${COLOR.borderDark}`,
  },
  signatureSection: {
    marginHorizontal: 14,
    marginTop: 15,
    marginBottom: 10,
  },
  forCompany: {
    fontSize: 8,
    color: COLOR.textMuted,
    textAlign: "right",
    marginBottom: 20,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    flex: 1,
    alignItems: "center",
  },
  signatureLine: {
    width: "80%",
    borderTop: `0.5 solid ${COLOR.border}`,
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: COLOR.navy,
    textAlign: "center",
  },
});

const COL = {
  sno: 0.7,
  item: 5.5,
  size: 1.2,
  color: 3,
  uom: 1.2,
  price: 2,
  qty: 2,
  tax: 1.5,
  gross: 3,
};

const YarnPurchaseOrderReturnPrintFormat = React.forwardRef(({
  isTaxHookDetailsLoading,
  poNumber,
  poDate,
  supplierDetails,
  poItems = [],
  remarks,
  deliveryPerson,
  vehicleNo,
  branchData = {},
  colorList, uomList, sizeList, itemList,
}, ref) => {

  const isOutsideState = (supplierDetails?.City?.state?.name || "").toLowerCase() !== (branchData?.City?.state?.name || "tamil nadu").toLowerCase();

  const calculateDetailedTotals = () => {
    let taxableAmount = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let totalTax = 0;

    poItems.forEach(item => {
      const qty = parseFloat(item.qty || 0);
      const price = parseFloat(item.price || 0);



      const taxRate = parseFloat(item?.Item?.Hsn?.tax || 0);



      const lineTaxable = qty * price;
      const lineTax = (lineTaxable * taxRate) / 100;

      taxableAmount += lineTaxable;
      totalTax += lineTax;

      if (isOutsideState) {
        igst += lineTax;
      } else {
        cgst += lineTax / 2;
        sgst += lineTax / 2;
      }
    });

    const netAmount = Math.round(taxableAmount + totalTax);

    return {
      taxableAmount,
      cgst,
      sgst,
      igst,
      totalTax,
      netAmount
    };
  };

  const totals = calculateDetailedTotals();

  const filledPoItems = [
    ...poItems,
    ...Array(Math.max(0, 10 - poItems.length)).fill({}),
  ];
  console.log(filledPoItems, "filledPoItems")
  console.log(totals, "totals")

  if (isTaxHookDetailsLoading) return <Loader />;

  return (
    <Document>
      <Page size="A4" style={styles.borderBox}>
        <View style={styles.page}>
          <View style={styles.goldRule} />

          {/* ── Header ── */}
          <View style={styles.header}>
            {/* <View style={styles.headerLeft}>
              <Text style={styles.addressText}>{branchData.address}</Text>
              <View style={styles.companyInfoRow}>
                <Text style={styles.companyInfoLabel}>Mobile</Text>
                <Text style={styles.companyInfoValue}>: {branchData.contactMobile}</Text>
              </View>
              <View style={styles.companyInfoRow}>
                <Text style={styles.companyInfoLabel}>Email</Text>
                <Text style={styles.companyInfoValue}>: {branchData.contactEmail}</Text>
              </View>
              <View style={styles.companyInfoRow}>
                <Text style={styles.companyInfoLabel}>GST No</Text>
                <Text style={styles.companyInfoValue}>: {branchData.gstNo}</Text>
              </View>
            </View> */}

            <View style={styles.headerCenter}>
              <Text style={styles.companyName}>{branchData.branchName}</Text>
              <View style={{ height: 1.5, backgroundColor: COLOR.gold, width: 100, marginVertical: 3 }} />
              <Text style={styles.tagline}>Walrus Garments</Text>
            </View>

            <Image src={Sangeethatex} style={styles.logo} />
          </View>

          <View style={styles.goldRule} />

          {/* ── Title Banner ── */}
          <View style={styles.titleBanner}>
            <Text style={styles.titleText}>PURCHASE RETURN</Text>
          </View>

          {/* ── Address & Reference Section ── */}
          <View style={styles.addressSection}>
            {/* To Section (Left) */}
            <View style={styles.addressBlock}>
              <Text style={styles.addressSectionLabel}>To</Text>
              <Text style={styles.addressName}>{supplierDetails?.name}</Text>
              <Text style={styles.addressText}>{supplierDetails?.address}</Text>
              {[
                { label: "Phone", value: supplierDetails?.contactPersonNumber },
                { label: "GSTIN", value: supplierDetails?.gstNo },
                { label: "Email", value: supplierDetails?.contactPersonEmail },
              ].map(({ label, value }) => (
                <View key={label} style={styles.addressRow}>
                  <Text style={styles.addressLabel}>{label}</Text>
                  <Text style={{ fontSize: 7.5, color: COLOR.textMuted, marginHorizontal: 2 }}>:</Text>
                  <Text style={styles.addressValue}>{value || "—"}</Text>
                </View>
              ))}
            </View>

            <View style={styles.addressDivider} />

            {/* Reference Section (Right) */}
            <View style={styles.addressBlock}>
              <View style={{ marginTop: 2 }}>
                {[
                  { label: "Return No", value: poNumber },
                  { label: "Return Date", value: getDateFromDateTimeToDisplay(poDate) },
                  { label: "Branch GST", value: branchData?.gstNo },
                ].map(({ label, value }) => (
                  <View key={label} style={styles.poRefBox_Left}>
                    <Text style={styles.poRefLabel_Left}>{label}</Text>
                    <Text style={styles.poRefSep}>:</Text>
                    <Text style={styles.poRefValue_Left}>{value || "—"}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* ── Item Table ── */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: COL.sno }]}>#</Text>
            <Text style={[styles.th, { flex: COL.item, textAlign: "left" }]}>Item Name</Text>
            <Text style={[styles.th, { flex: COL.size }]}>Size</Text>
            <Text style={[styles.th, { flex: COL.color }]}>Color</Text>
            <Text style={[styles.th, { flex: COL.uom }]}>UOM</Text>
            <Text style={[styles.th, { flex: COL.price }]}>Price</Text>
            <Text style={[styles.th, { flex: COL.qty }]}>Qty</Text>
            {/* <Text style={[styles.th, { flex: COL.tax }]}>Tax%</Text> */}
            <Text style={[styles.th, { flex: COL.gross, borderRight: 0 }]}>Gross</Text>
          </View>

          {filledPoItems.map((val, index) => (
            <View key={index} style={[styles.tdRow, index % 2 === 1 ? styles.tdRowAlt : {}]}>
              <Text style={[styles.td, { flex: COL.sno }]}>{index + 1}</Text>
              <Text style={[styles.td, { flex: COL.item, textAlign: "left" }]}>
                {findFromList(val.itemId, itemList?.data, "name")}
              </Text>
              <Text style={[styles.td, { flex: COL.size, textAlign: "left" }]}>
                {findFromList(val.sizeId, sizeList?.data, "name")}
              </Text>
              <Text style={[styles.td, { flex: COL.color, textAlign: "left" }]}>
                {findFromList(val.colorId, colorList?.data, "name")}
              </Text>
              <Text style={[styles.td, { flex: COL.uom }]}>
                {findFromList(val.uomId, uomList?.data, "name")}
              </Text>
              <Text style={[styles.td, { flex: COL.price, textAlign: "right" }]}>
                {val?.price ? parseFloat(val.price).toFixed(2) : ""}
              </Text>
              <Text style={[styles.td, { flex: COL.qty, textAlign: "right" }]}>
                {val?.qty ? parseFloat(val.qty).toFixed(3) : ""}
              </Text>
              {/* <Text style={[styles.td, { flex: COL.tax, textAlign: "right" }]}>
                {val?.Item?.Hsn?.tax ? parseFloat(val.Item.Hsn.tax).toFixed(2) : ""}
              </Text> */}
              <Text style={[styles.td, { flex: COL.gross, textAlign: "right", borderRight: 0 }]}>
                {val?.qty && val?.price ? (parseFloat(val.qty) * parseFloat(val.price)).toFixed(2) : ""}
              </Text>
            </View>
          ))}

          {/* ── Totals Footer ── */}
          <View style={{ flexDirection: "row", justifyContent: "flex-end", backgroundColor: COLOR.navyLight }}>
            <View style={{ width: 190, borderLeft: `1 solid ${COLOR.border}` }}>
              {/* <View style={{ flexDirection: "row", borderBottom: `0.5 solid ${COLOR.border}`, padding: 3 }}>
                <Text style={{ flex: 1.2, fontSize: 7, color: COLOR.textMuted }}>Taxable Amount</Text>
                <Text style={{ flex: 1, fontSize: 7, textAlign: "right", fontWeight: "bold" }}>{totals.taxableAmount.toFixed(2)}</Text>
              </View> */}

              {/* {isOutsideState ? (
                totals.igst > 0 && (
                  <View style={{ flexDirection: "row", borderBottom: `0.5 solid ${COLOR.border}`, padding: 3 }}>
                    <Text style={{ flex: 1.2, fontSize: 7, color: COLOR.textMuted }}>IGST</Text>
                    <Text style={{ flex: 1, fontSize: 7, textAlign: "right", fontWeight: "bold" }}>{totals.igst.toFixed(2)}</Text>
                  </View>
                )
              ) : (
                <>
                  {totals.cgst > 0 && (
                    <View style={{ flexDirection: "row", borderBottom: `0.5 solid ${COLOR.border}`, padding: 3 }}>
                      <Text style={{ flex: 1.2, fontSize: 7, color: COLOR.textMuted }}>CGST</Text>
                      <Text style={{ flex: 1, fontSize: 7, textAlign: "right", fontWeight: "bold" }}>{totals.cgst.toFixed(2)}</Text>
                    </View>
                  )}
                  {totals.sgst > 0 && (
                    <View style={{ flexDirection: "row", borderBottom: `0.5 solid ${COLOR.border}`, padding: 3 }}>
                      <Text style={{ flex: 1.2, fontSize: 7, color: COLOR.textMuted }}>SGST</Text>
                      <Text style={{ flex: 1, fontSize: 7, textAlign: "right", fontWeight: "bold" }}>{totals.sgst.toFixed(2)}</Text>
                    </View>
                  )}
                </>
              )} */}

              {/* <View style={{ flexDirection: "row", borderBottom: `1 solid ${COLOR.border}`, padding: 3, backgroundColor: COLOR.offWhite }}>
                <Text style={{ flex: 1.2, fontSize: 7, color: COLOR.navy, fontWeight: "bold" }}>Total Tax Amount</Text>
                <Text style={{ flex: 1, fontSize: 7, textAlign: "right", fontWeight: "bold" }}>{totals.totalTax.toFixed(2)}</Text>
              </View> */}

              <View style={{ flexDirection: "row", padding: 4, backgroundColor: COLOR.goldLight }}>
                <Text style={{ flex: 1.2, fontSize: 8, fontWeight: "bold", color: COLOR.navy }}>NET PAYABLE:</Text>
                <Text style={{ flex: 1, fontSize: 8, textAlign: "right", fontWeight: "bold", color: COLOR.navy }}>{totals.taxableAmount.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.goldRule} />

          {/* ── Footer Info ── */}
          <View style={{ backgroundColor: COLOR.navy, paddingVertical: 5, paddingHorizontal: 14 }}>
            <Text style={{ fontSize: 8, color: COLOR.white, fontWeight: "bold" }}>
              Amount in Words: Rs. {numberToText.convertToText(totals.netAmount, { language: "en-in", separator: "" })} Only
            </Text>
          </View>

          <View style={{ flexDirection: "row", minHeight: 60, borderBottom: `1 solid ${COLOR.border}` }}>
            <View style={{ flex: 1.4, padding: 8, borderRight: `1 solid ${COLOR.border}`, backgroundColor: COLOR.offWhite }}>
              <Text style={{ fontSize: 7.5, fontWeight: "bold", color: COLOR.navy, marginBottom: 4 }}>REMARKS</Text>
              <Text style={{ fontSize: 7.5, color: COLOR.textMuted }}>{remarks || "—"}</Text>
            </View>
            <View style={{ flex: 1, padding: 8 }}>
              <Text style={{ fontSize: 7.5, fontWeight: "bold", color: COLOR.navy, marginBottom: 4 }}>DELIVERY DETAILS</Text>
              {/* <View style={{ flexDirection: "row", marginBottom: 2 }}>
                <Text style={{ fontSize: 7, color: COLOR.textMuted, width: 50 }}>Person</Text>
                <Text style={{ fontSize: 7, color: COLOR.text }}>: {deliveryPerson || "—"}</Text>
              </View> */}
              <View style={{ flexDirection: "row" }}>
                <Text style={{ fontSize: 7, color: COLOR.textMuted, width: 50 }}>Vehicle No</Text>
                <Text style={{ fontSize: 7, color: COLOR.text }}>: {vehicleNo || "—"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.signatureSection}>
            <Text style={styles.forCompany}>For <Text style={{ fontWeight: "bold" }}>{branchData.branchName}</Text></Text>
            <View style={styles.signatureRow}>
              {["Prepared By", "Verified By", "Received By", "Authorized Signatory"].map(role => (
                <View key={role} style={styles.signatureBox}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureLabel}>{role}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
});

export default YarnPurchaseOrderReturnPrintFormat;