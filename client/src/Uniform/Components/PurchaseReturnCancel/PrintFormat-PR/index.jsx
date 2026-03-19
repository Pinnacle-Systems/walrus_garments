

// import {
//   Document,
//   Page,
//   View,
//   Text,
//   Image,
//   Font,
//   StyleSheet,
// } from "@react-pdf/renderer";
// import Sangeethatex from "../../../../../src/assets/walrusNew.png";
// import tw from "../../../../Utils/tailwind-react-pdf";
// import numberToText from "number-to-text";
// import { findFromList, getCommonParams, getDateFromDateTimeToDisplay } from "../../../../Utils/helper";
// import { useGetBranchByIdQuery } from "../../../../redux/services/BranchMasterService";
// import { useGetPartyByIdQuery } from "../../../../redux/services/PartyMasterService";
// import { useGetPaytermMasterQuery } from "../../../../redux/services/PayTermMasterServices";
// import { useGetTermsAndConditionsQuery } from "../../../../redux/services/TermsAndConditionsService";
// import TaxDetails from "./TaxDetails";
// import { Loader } from "../../../../Basic/components";

// // Font registration
// Font.register({
//   family: "Roboto",
//   src: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,600;1,400;1,600&display=swap",
// });

// const styles = StyleSheet.create({
//   // page: {
//   //   fontFamily: "Helvetica",
//   //   fontSize: 8,
//   //   padding: 10,
//   //   border: "1 solid #000",
//   // },
//   borderBox: { border: "1 solid black", margin: 0, padding: 8, },
//   page: {
//     // fontFamily: "Helvetica",
//     fontSize: 8,
//     padding: 0,
//     border: "1 solid #000",
//   },
//   header: {
//     alignItems: "center",
//     textAlign: "center",
//     marginBottom: 7,
//     justifyContent: "space-between",
//     flexDirection: "row",
//     padding: 7,
//   },
//   logoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 4,

//   },
//   logo: {
//     width: 120,
//     height: 40,
//     // marginRight: ,
//   },
//   companyText: {
//     fontSize: 9,
//     marginBottom: 1,
//     textAlign: "left",
//     marginRight: 4
//   },
//   greenTitle: {
//     textAlign: "center",
//     fontSize: 15,
//     color: "#FFFF",
//     backgroundColor: "#FE0002",
//     paddingVertical: 4,
//     // borderBottom: "18 solid #1D3A76",

//     fontWeight: "500",
//     // marginVertical: 4,
//     // textDecoration: "underline",
//     // marginBottom: 6,
//   },
//   infoRow: {
//     flexDirection: "row",
//     border: "1 solid #000",
//     justifyContent: "space-between",
//     padding: 4,
//   },
//   infoLeft: { flex: 1 },
//   infoRight: {
//     width: 80,
//     height: 80,
//     border: "1 solid #000",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   sectionTitle: {
//     fontSize: 8,
//     fontWeight: "bold",
//     color: "#FFFF",
//     // backgroundColor: "#e6ffe6",
//     backgroundColor: "#FE0002",
//     padding: 6,
//     marginBottom: 2
//   },
//   boxRow: {
//     flexDirection: "row",
//     border: "1 solid #000",
//     marginTop: 4,
//   },
//   boxCol: {
//     flex: 1,
//     borderRight: "1 solid #000",
//   },
//   boxContent: {
//     padding: 4,
//     fontSize: 8,
//   },
//   tableHeader: {
//     flexDirection: "row",
//     borderTop: "1 solid #000",
//     borderBottom: "1 solid #000",
//     marginTop: 6,
//     backgroundColor: "#FE0002",
//     padding: 3,
//     color: "#FFFF"
//   },
//   th: {
//     flex: 1,
//     fontSize: 8,
//     fontWeight: "bold",
//     textAlign: "center",
//     borderRight: "1 solid #000",
//     padding: 3,
//   },
//   td: {
//     flex: 1,
//     fontSize: 8,
//     textAlign: "center",
//     borderRight: "1 solid #000",
//     borderBottom: "1 solid #000",
//     padding: 3,
//   },
//   totalRow: {
//     flexDirection: "row",
//     borderTop: "1 solid #000",
//   },
//   totalLabel: {
//     flex: 8,
//     textAlign: "center",
//     fontSize: 8,
//     fontWeight: "bold",
//     padding: 3,
//   },
//   totalValue: {
//     flex: 1.2,
//     textAlign: "right",
//     fontSize: 8,
//     padding: 3,
//   },
//   taxBox: {
//     width: 180,
//     border: "1 solid #000",
//     alignSelf: "flex-end",
//     marginTop: 4,
//   },
//   taxHeader: {
//     backgroundColor: "#d1fae5",
//     borderBottom: "1 solid #000",
//     textAlign: "center",
//     fontWeight: "bold",
//     fontSize: 8,
//     padding: 3,
//   },
//   taxRow: {
//     flexDirection: "row",
//     borderTop: "1 solid #000",
//   },
//   taxLabel: { flex: 1, padding: 3, fontSize: 8 },
//   taxValue: {
//     flex: 1,
//     textAlign: "right",
//     padding: 3,
//     fontSize: 8,
//   },
//   remarksSection: {
//     marginTop: 6,
//   },
//   footer: {
//     marginTop: 10,
//   },
//   signatureRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 20,
//   },
//   signature: {
//     flex: 1,
//     textAlign: "center",
//     fontWeight: "bold",
//     fontSize: 8,
//   },
//   pageNumber: {
//     position: "absolute",
//     bottom: 10,
//     right: 30,
//     fontSize: 7,
//     color: "#555",
//   },
//   poDetails: {
//     marginTop: 10,
//     width: "50%", // adjust as needed
//   },

//   detailRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 4,
//   },

//   label: {
//     fontSize: 8,
//     fontWeight: "bold",
//   },

//   value: {
//     fontSize: 8,
//     textAlign: "right",
//     flexShrink: 1, // helps long text wrap properly
//   },
// });
// const YarnPurchaseOrderReturnPrintFormat = ({
//   isTaxHookDetailsLoading,
//   poNumber,
//   poDate,
//   deliveryToId,
//   dueDate,
//   payTermId,
//   deliveryType,
//   supplierDetails,
//   poItems,
//   taxTemplateId,
//   discountType,
//   discountValue,
//   remarks,
//   poType,
//   branchData,
//   termsAndCondition,
//   taxDetails,
//   deliveryTo,
//   taxKey,
//   taxGroupWise,
//   colorList, uomList, accessoryList, sizeList, itemList,

// }) => {


//   const filledPoItems = [
//     ...poItems,
//     ...Array(Math.max(0, 10 - poItems.length)).fill({}), // empty rows
//   ];



//   function findAccessoryName(accessoryId, accessoryArray, field) {

//     let accessoryObj = accessoryArray?.find(item => parseInt(item.id) == accessoryId)

//     if (field == "accessoryItem") {
//       return accessoryObj?.accessoryItem?.name
//     }
//     else if ("accessoryGroup") {
//       return accessoryObj?.accessoryItem?.AccessoryGroup?.name
//     }

//   }



//   if (isTaxHookDetailsLoading) return <Loader />



//   return (
//     <Document>
//       <Page size="A4" style={styles.borderBox}>
//         <View style={styles.page}>

//           <View style={styles.header}>
//             <View style={{ width: 125, flexWrap: 'wrap' }}>
//               <Text style={styles.companyText}>{branchData.address}</Text>

//               <View style={{ flexDirection: 'row' }}>
//                 <Text style={[styles.companyText, { width: 40 }]}>Mobile</Text>
//                 <Text style={styles.companyText}>: {branchData.contactMobile}</Text>
//               </View>

//               <View style={{ flexDirection: 'row' }}>
//                 <Text style={[styles.companyText, { width: 40 }]}>Email</Text>
//                 <Text style={styles.companyText}>: {branchData.contactEmail}</Text>
//               </View>

//               <View style={{ flexDirection: 'row' }}>
//                 <Text style={[styles.companyText, { width: 40 }]}>GST No</Text>
//                 <Text style={styles.companyText}>: {branchData.gstNo}</Text>
//               </View>
//             </View>

//             <View style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
//               <Text
//                 style={{
//                   fontSize: 20,
//                   color: "#FE0002",
//                   fontWeight: "bold",
//                   marginBottom: 4,
//                   marginTop: 10,
//                   textAlign: "center",
//                 }}
//               >
//                 {branchData.branchName}
//               </Text>
//             </View>

//             <Image src={Sangeethatex} style={styles.logo} />
//           </View>

//           <View >
//             <Text style={styles.greenTitle}>PURCHASE RETURN</Text>
//             <View style={{ alignItems: "flex-end", marginTop: 5, marginBottom: 3, marginRight: 7 }}>
//               <View style={{}}>
//                 <View style={{ flexDirection: "row", marginBottom: 3 }}>
//                   <Text style={[styles.companyText, { width: 50, textAlign: "left" }]}>PO No</Text>
//                   <Text style={styles.companyText}>: {poNumber}</Text>
//                 </View>

//                 <View style={{ flexDirection: "row", marginBottom: 3 }}>
//                   <Text style={[styles.companyText, { width: 50, textAlign: "left" }]}>PO Date</Text>
//                   <Text style={styles.companyText}>: {getDateFromDateTimeToDisplay(poDate)}</Text>
//                 </View>

//                 <View style={{ flexDirection: "row", marginBottom: 3 }}>
//                   <Text style={[styles.companyText, { width: 50, textAlign: "left" }]}>Due Date</Text>
//                   <Text style={styles.companyText}>: {getDateFromDateTimeToDisplay(dueDate)}</Text>
//                 </View>
//               </View>
//             </View>




//           </View>
//           <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
//             {/* SUPPLIER DETAILS */}
//             <View style={{ flex: 1 }}>
//               <Text style={styles.sectionTitle}>FROM</Text>

//               <View style={styles.boxContent}>
//                 <Text
//                   style={{
//                     fontWeight: "bold",
//                     paddingHorizontal: 4,
//                     marginBottom: 4,
//                     color: "#0F766E",
//                   }}
//                 >
//                   {branchData.branchName}
//                 </Text>

//                 <Text style={{ paddingHorizontal: 4, textTransform: "uppercase", marginBottom: 2 }}>{branchData.address}</Text>





//                 <View style={{ flexDirection: "row" }}>
//                   <Text style={[styles.companyText, { width: 70 }]}>GST No</Text>
//                   <Text style={styles.companyText}>: {branchData?.gstNo}</Text>
//                 </View>



//               </View>
//             </View>

//             <View style={{ flex: 1 }}>
//               <Text style={styles.sectionTitle}>TO</Text>
//               <View style={styles.boxContent}>
//                 <Text
//                   style={{
//                     fontWeight: "bold",
//                     paddingHorizontal: 4,
//                     marginBottom: 4,
//                     color: "#0F766E",
//                   }}
//                 >
//                   {supplierDetails?.name}
//                 </Text>

//                 <Text style={{ textTransform: "uppercase", marginBottom: 2 }}>{supplierDetails?.address}</Text>

//                 <View style={{ flexDirection: "row", marginTop: 2 }}>
//                   <Text style={[styles.companyText, { width: 70 }]}>Mobile No</Text>
//                   <Text style={styles.companyText}>: {supplierDetails?.contactPersonNumber}</Text>
//                 </View>



//                 <View style={{ flexDirection: "row" }}>
//                   <Text style={[styles.companyText, { width: 70 }]}>GST No</Text>
//                   <Text style={styles.companyText}>: {supplierDetails?.gstNo}</Text>
//                 </View>

//                 <View style={{ flexDirection: "row" }}>
//                   <Text style={[styles.companyText, { width: 70 }]}>Email</Text>
//                   <Text style={styles.companyText}>: {supplierDetails?.email}</Text>
//                 </View>
//               </View>
//             </View>
//           </View>



//           <View style={styles.tableHeader}>
//             <Text style={[styles.th, { flex: 0.7 }]}>S.No</Text>
//             <Text style={[styles.th, { flex: 6 }]}>Item Name</Text>

//             <Text style={[styles.th, { flex: 1 }]}>Size</Text>
//             <Text style={[styles.th, { flex: 3 }]}>Color</Text>
//             <Text style={[styles.th, { flex: 1 }]}>Uom</Text>
//             <Text style={[styles.th, { flex: 2 }]}>Price</Text>
//             <Text style={[styles.th, { flex: 2 }]}>Qty</Text>

//             <Text style={[styles.th, { flex: 1.5 }]}>Tax(%)</Text>

//             <Text style={[styles.th, { flex: 3 }]}>Gross</Text>
//           </View>

//           {filledPoItems?.map((val, index) => (
//             <View key={index} style={{ flexDirection: "row", borderBottom: "1 solid #d1d5db" }}>
//               <Text style={[styles.td, { flex: 0.7 }]}>{index + 1}</Text>
//               <Text style={[styles.td, { flex: 6 , textAlign: "left" }]}>
//                 {findFromList(val.itemId, itemList?.data, "name")}
//               </Text>
//               <Text style={[styles.td, { flex: 1, textAlign: "left" }]}>
//                 {findFromList(val.sizeId, sizeList?.data, "name")}

//               </Text>
//               <Text style={[styles.td, { flex: 3, textAlign: "left" }]}>
//                 {findFromList(val.colorId, colorList?.data, "name")}
//               </Text>

//               <Text style={[styles.td, { flex: 1 }]}>
//                 {findFromList(val.uomId, uomList?.data, "left")}
//               </Text>

//               <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>
//                 {val?.price
//                   ? parseFloat(val.price).toFixed(3)
//                   : ""}
//               </Text>
//               <Text style={[styles.td, { flex: 2 ,textAlign: "right" }]}>
//                 {val?.qty
//                   ? parseFloat(val.qty).toFixed(3)
//                   : ""}
//               </Text>


//               <Text style={[styles.td, { flex: 1.5, textAlign: "right" }]}>
//                 {val?.taxPercent
//                   ? parseFloat(val.taxPercent).toFixed(3)
//                   : ""}
//               </Text>

//               <Text style={[styles.td, { flex: 3, textAlign: "right" }]}>
//                 {val?.qty && val?.price
//                   ? (parseFloat(val.qty) * parseFloat(val.price)).toFixed(3)
//                   : ""}
//               </Text>
//             </View>
//           ))}



//           <View
//             style={{
//               flexDirection: "row",
//               // borderTop: "1 solid #9ca3af",
//               borderBottom: "1 solid #9ca3af",
//             }}
//           >
//             <Text
//               style={{
//                 flex: 12.5,
//                 textAlign: "center",
//                 fontSize: 8,
//                 fontWeight: "bold",
//                 padding: 3,
//               }}
//             >
//               TOTAL
//             </Text>
//             <Text
//               style={{
//                 flex: 2,
//                 textAlign: "right",
//                 fontSize: 8,
//                 padding: 3,
//                 borderLeft: "1 solid #9ca3af",
//               }}
//             >
//               {parseFloat(taxDetails.taxableAmount).toFixed(2)}
//             </Text>
//           </View>




//           <View >

//             <View
//               style={{
//                 marginTop: 6,
//                 border: "1 solid #9ca3af",
//                 borderRadius: 4,
//                 overflow: "hidden",
//               }}
//             >
//               <View
//                 style={{
//                   borderBottom: "1 solid #9ca3af",
//                   backgroundColor: "#FE0002",
//                   paddingVertical: 5,
//                   paddingHorizontal: 6,
//                   marginBottom: 4
//                 }}
//               >
//                 <Text
//                   style={{
//                     fontSize: 9,
//                     fontWeight: "bold",
//                     color: "#FFFFFF",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   Amount in Words: Rs.{" "}
//                   {numberToText.convertToText(taxDetails?.netAmount || 0, {
//                     language: "en-in",
//                     separator: "",
//                   })}{" "}
//                   Only
//                 </Text>
//               </View>

//               <View
//                 style={{
//                   flexDirection: "row",
//                   borderTop: "1 solid #9ca3af",
//                   height: 130,
//                 }}
//               >
//                 <View
//                   style={{
//                     flex: 0.3,
//                     borderRight: "1 solid #9ca3af",
//                     backgroundColor: "#f0f4ff",
//                     paddingVertical: 5,
//                     paddingHorizontal: 6,
//                     minHeight: 60,
//                     width: 40

//                   }}
//                 >
//                   <Text
//                     style={{
//                       fontSize: 8,
//                       fontWeight: "bold",
//                       color: "#FE0002",
//                       flexWrap: "wrap"
//                     }}
//                   >
//                     Remarks:
//                   </Text>
//                   <Text style={{ fontSize: 8, flexWrap: "wrap" }}>
//                     {remarks || "—"}
//                   </Text>
//                 </View>


//                 <View
//                   style={{
//                     flex: 0.7,
//                     paddingVertical: 5,
//                     paddingHorizontal: 6,
//                     minHeight: 60,
//                     width: 100

//                   }}
//                 >
//                   <Text
//                     style={{
//                       fontSize: 8,
//                       fontWeight: "bold",
//                       color: "#FE0002",
//                       flexWrap: "wrap",
//                     }}
//                   >
//                     Terms & Conditions:
//                   </Text>
//                   <Text style={{ fontSize: 8, flexWrap: "wrap" }}>
//                     {/* {term || "—"}
//                         */}
//                     {/* {findFromList(term, termsData?.data, "termsAndCondition")} */}
//                   </Text>
//                 </View>
//               </View>
//             </View>








//           </View>

//           <View style={{ marginTop: 20 }}>
//             <Text
//               style={{ fontSize: 8, textAlign: "right", fontWeight: "bold" }}
//             >
//               For {branchData.branchName}
//             </Text>
//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 marginTop: 20,
//               }}
//             >
//               {["Prepared By", "Verified By", "Received By", "Approved By"].map(
//                 (role) => (
//                   <Text
//                     key={role}
//                     style={{
//                       fontSize: 8,
//                       textAlign: "center",
//                       fontWeight: "bold",
//                       flex: 1,
//                     }}
//                   >
//                     {role}
//                   </Text>
//                 )
//               )}
//             </View>
//           </View>







//         </View>
//         <View style={{
//           marginTop: 20, textAlign: "center", fontSize: 8,

//         }}>
//           <Text
//             render={({ pageNumber, totalPages }) =>
//               `Page ${pageNumber} / ${totalPages}`
//             }
//           />
//         </View>



//       </Page>
//     </Document >
//   );
// };

// export default YarnPurchaseOrderReturnPrintFormat;

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
  navy:       "#1A2744",   // primary header/accent
  navyMid:    "#253560",   // secondary navy
  navyLight:  "#EEF1F8",   // subtle bg tint
  gold:       "#C9A84C",   // premium accent line
  goldLight:  "#F5EDD4",   // warm highlight bg
  white:      "#FFFFFF",
  offWhite:   "#FAFAFA",
  border:     "#C8CDD8",
  borderDark: "#8E95A9",
  text:       "#1A1F2E",
  textMuted:  "#5A6070",
  teal:       "#0E7A6A",   // supplier name accent
};

const styles = StyleSheet.create({
  // ── Outer wrapper ──────────────────────────────────────────────────────────
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

  // ── Gold rule accent ───────────────────────────────────────────────────────
  goldRule: {
    height: 3,
    backgroundColor: COLOR.gold,
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLOR.white,
  },
  headerLeft: {
    width: 130,
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8,
  },
  companyName: {
    fontSize: 22,
    color: COLOR.navy,
    fontWeight: "bold",
    letterSpacing: 1.5,
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
    width: 115,
    height: 38,
  },
  companyInfoText: {
    fontSize: 7.5,
    color: COLOR.textMuted,
    marginBottom: 2,
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

  // ── Document title banner ──────────────────────────────────────────────────
  titleBanner: {
    backgroundColor: COLOR.navy,
    paddingVertical: 6,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 13,
    color: COLOR.white,
    fontWeight: "bold",
    letterSpacing: 3,
    textAlign: "center",
  },

  // ── PO reference row ──────────────────────────────────────────────────────
  poRefRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 4,
    backgroundColor: COLOR.navyLight,
    borderBottom: `1 solid ${COLOR.border}`,
  },
  poRefBox: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  poRefLabel: {
    fontSize: 7.5,
    color: COLOR.textMuted,
    width: 46,
  },
  poRefSep: {
    fontSize: 7.5,
    color: COLOR.textMuted,
    marginRight: 3,
  },
  poRefValue: {
    fontSize: 7.5,
    color: COLOR.navy,
    fontWeight: "bold",
  },

  // ── FROM / TO section ─────────────────────────────────────────────────────
  addressSection: {
    flexDirection: "row",
    borderBottom: `1 solid ${COLOR.border}`,
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
    fontSize: 7,
    fontWeight: "bold",
    color: COLOR.gold,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
    borderBottom: `0.5 solid ${COLOR.gold}`,
    paddingBottom: 2,
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
    textTransform: "uppercase",
  },
  addressRow: {
    flexDirection: "row",
    marginBottom: 1.5,
  },
  addressLabel: {
    fontSize: 7.5,
    color: COLOR.textMuted,
    width: 58,
  },
  addressValue: {
    fontSize: 7.5,
    color: COLOR.text,
  },

  // ── Table ─────────────────────────────────────────────────────────────────
  tableWrapper: {
    marginHorizontal: 0,
    borderTop: `1 solid ${COLOR.border}`,
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
    paddingVertical: 2,
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
    paddingVertical: 3,
  },

  // ── Total bar ─────────────────────────────────────────────────────────────
  totalBar: {
    flexDirection: "row",
    backgroundColor: COLOR.navyLight,
    borderTop: `1 solid ${COLOR.borderDark}`,
    borderBottom: `1 solid ${COLOR.borderDark}`,
  },
  totalLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLOR.navy,
    padding: 4,
    textAlign: "center",
  },
  totalValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLOR.navy,
    padding: 4,
    textAlign: "right",
    borderLeft: `0.5 solid ${COLOR.borderDark}`,
  },

  // ── Amount in words + remarks ─────────────────────────────────────────────
  amountWordsBar: {
    backgroundColor: COLOR.navy,
    paddingVertical: 5,
    paddingHorizontal: 14,
  },
  amountWordsText: {
    fontSize: 8,
    color: COLOR.white,
    fontWeight: "bold",
  },
  bottomSection: {
    flexDirection: "row",
    borderTop: `1 solid ${COLOR.border}`,
    minHeight: 100,
  },
  remarksBox: {
    flex: 1,
    borderRight: `1 solid ${COLOR.border}`,
    padding: 10,
    backgroundColor: COLOR.offWhite,
  },
  tcBox: {
    flex: 1.4,
    padding: 10,
    backgroundColor: COLOR.white,
  },
  bottomBoxTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: COLOR.navy,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 5,
    paddingBottom: 2,
    borderBottom: `0.5 solid ${COLOR.gold}`,
  },
  bottomBoxText: {
    fontSize: 7.5,
    color: COLOR.textMuted,
    lineHeight: 1.5,
  },

  // ── Signature row ─────────────────────────────────────────────────────────
  signatureSection: {
    marginHorizontal: 14,
    marginTop: 16,
    marginBottom: 10,
  },
  forCompany: {
    fontSize: 8,
    color: COLOR.textMuted,
    textAlign: "right",
    marginBottom: 16,
  },
  forCompanyName: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLOR.navy,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `0.5 solid ${COLOR.border}`,
    paddingTop: 4,
  },
  signatureLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: COLOR.navy,
    textAlign: "center",
    flex: 1,
  },

  // ── Page number ───────────────────────────────────────────────────────────
  pageNumberBar: {
    backgroundColor: COLOR.navyLight,
    borderTop: `0.5 solid ${COLOR.border}`,
    paddingVertical: 4,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "center",
  },
  pageNumberText: {
    fontSize: 7,
    color: COLOR.textMuted,
  },
});

// ─── Column flex widths (must stay in sync between header + rows) ────────────
const COL = {
  sno:   0.7,
  item:  5.5,
  size:  1.2,
  color: 3,
  uom:   1.2,
  price: 2,
  qty:   2,
  tax:   1.5,
  gross: 3,
};

const YarnPurchaseOrderReturnPrintFormat = ({
  isTaxHookDetailsLoading,
  poNumber,
  poDate,
  dueDate,
  supplierDetails,
  poItems,
  taxDetails,
  remarks,
  branchData,
  colorList, uomList, sizeList, itemList,
}) => {
  const filledPoItems = [
    ...poItems,
    ...Array(Math.max(0, 10 - poItems.length)).fill({}),
  ];

  if (isTaxHookDetailsLoading) return <Loader />;

  return (
    <Document>
      <Page size="A4" style={styles.borderBox}>
        <View style={styles.page}>

          {/* ── Top gold rule ── */}
          <View style={styles.goldRule} />

          {/* ── Header ── */}
          <View style={styles.header}>
            {/* Left: branch info */}
            <View style={styles.headerLeft}>
              <Text style={styles.companyInfoText}>{branchData.address}</Text>
              <View style={styles.companyInfoRow}>
                <Text style={styles.companyInfoLabel}>Mobile</Text>
                <Text style={[styles.companyInfoValue, { color: "#5A6070" }]}>: </Text>
                <Text style={styles.companyInfoValue}>{branchData.contactMobile}</Text>
              </View>
              <View style={styles.companyInfoRow}>
                <Text style={styles.companyInfoLabel}>Email</Text>
                <Text style={[styles.companyInfoValue, { color: "#5A6070" }]}>: </Text>
                <Text style={styles.companyInfoValue}>{branchData.contactEmail}</Text>
              </View>
              <View style={styles.companyInfoRow}>
                <Text style={styles.companyInfoLabel}>GST No</Text>
                <Text style={[styles.companyInfoValue, { color: "#5A6070" }]}>: </Text>
                <Text style={styles.companyInfoValue}>{branchData.gstNo}</Text>
              </View>
            </View>

            {/* Center: company name */}
            <View style={styles.headerCenter}>
              <Text style={styles.companyName}>{branchData.branchName}</Text>
              <View style={{ height: 1.5, backgroundColor: COLOR.gold, width: 120, marginVertical: 3 }} />
              <Text style={styles.tagline}>Textile Excellence</Text>
            </View>

            {/* Right: logo */}
            <Image src={Sangeethatex} style={styles.logo} />
          </View>

          {/* ── Bottom gold rule ── */}
          <View style={styles.goldRule} />

          {/* ── Title banner ── */}
          <View style={styles.titleBanner}>
            <Text style={styles.titleText}>PURCHASE RETURN</Text>
          </View>

          {/* ── PO Reference row ── */}
          <View style={styles.poRefRow}>
            {[
              { label: "PO No",    value: poNumber },
              { label: "PO Date",  value: getDateFromDateTimeToDisplay(poDate) },
              { label: "Due Date", value: getDateFromDateTimeToDisplay(dueDate) },
            ].map(({ label, value }) => (
              <View key={label} style={styles.poRefBox}>
                <Text style={styles.poRefLabel}>{label}</Text>
                <Text style={styles.poRefSep}>:</Text>
                <Text style={styles.poRefValue}>{value}</Text>
              </View>
            ))}
          </View>

          {/* ── FROM / TO ── */}
          <View style={styles.addressSection}>
            {/* FROM */}
            <View style={styles.addressBlock}>
              <Text style={styles.addressSectionLabel}>From</Text>
              <Text style={styles.addressName}>{branchData.branchName}</Text>
              <Text style={styles.addressText}>{branchData.address}</Text>
              <View style={styles.addressRow}>
                <Text style={styles.addressLabel}>GST No</Text>
                <Text style={[styles.addressValue, { color: "#5A6070" }]}>: </Text>
                <Text style={styles.addressValue}>{branchData?.gstNo}</Text>
              </View>
            </View>

            <View style={styles.addressDivider} />

            {/* TO */}
            <View style={styles.addressBlock}>
              <Text style={styles.addressSectionLabel}>To</Text>
              <Text style={styles.addressName}>{supplierDetails?.name}</Text>
              <Text style={styles.addressText}>{supplierDetails?.address}</Text>
              {[
                { label: "Mobile No", value: supplierDetails?.contactPersonNumber },
                { label: "GST No",    value: supplierDetails?.gstNo },
                { label: "Email",     value: supplierDetails?.email },
              ].map(({ label, value }) => (
                <View key={label} style={styles.addressRow}>
                  <Text style={styles.addressLabel}>{label}</Text>
                  <Text style={[styles.addressValue, { color: "#5A6070" }]}>: </Text>
                  <Text style={styles.addressValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Table header ── */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: COL.sno }]}>S.No</Text>
            <Text style={[styles.th, { flex: COL.item,  textAlign: "left" }]}>Item Name</Text>
            <Text style={[styles.th, { flex: COL.size }]}>Size</Text>
            <Text style={[styles.th, { flex: COL.color }]}>Color</Text>
            <Text style={[styles.th, { flex: COL.uom }]}>UOM</Text>
            <Text style={[styles.th, { flex: COL.price }]}>Price</Text>
            <Text style={[styles.th, { flex: COL.qty }]}>Qty</Text>
            <Text style={[styles.th, { flex: COL.tax }]}>Tax %</Text>
            <Text style={[styles.th, { flex: COL.gross, borderRight: 0 }]}>Gross</Text>
          </View>

          {/* ── Table rows ── */}
          {filledPoItems.map((val, index) => (
            <View
              key={index}
              style={[styles.tdRow, index % 2 === 1 ? styles.tdRowAlt : {}]}
            >
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
                {val?.price ? parseFloat(val.price).toFixed(3) : ""}
              </Text>
              <Text style={[styles.td, { flex: COL.qty, textAlign: "right" }]}>
                {val?.qty ? parseFloat(val.qty).toFixed(3) : ""}
              </Text>
              <Text style={[styles.td, { flex: COL.tax, textAlign: "right" }]}>
                {val?.taxPercent ? parseFloat(val.taxPercent).toFixed(2) : ""}
              </Text>
              <Text style={[styles.td, { flex: COL.gross, textAlign: "right", borderRight: 0 }]}>
                {val?.qty && val?.price
                  ? (parseFloat(val.qty) * parseFloat(val.price)).toFixed(3)
                  : ""}
              </Text>
            </View>
          ))}

          {/* ── Total bar ── */}
          <View style={styles.totalBar}>
            <Text style={[styles.totalLabel, { flex: 12.5 }]}>TOTAL</Text>
            <Text style={[styles.totalValue, { flex: 3 }]}>
              {parseFloat(taxDetails?.taxableAmount || 0).toFixed(2)}
            </Text>
          </View>

          {/* ── Gold rule ── */}
          <View style={[styles.goldRule, { marginTop: 6 }]} />

          {/* ── Amount in words ── */}
          <View style={styles.amountWordsBar}>
            <Text style={styles.amountWordsText}>
              Amount in Words: Rs.{" "}
              {numberToText.convertToText(taxDetails?.netAmount || 0, {
                language: "en-in",
                separator: "",
              })}{" "}
              Only
            </Text>
          </View>

          {/* ── Remarks & T&C ── */}
          <View style={styles.bottomSection}>
            <View style={styles.remarksBox}>
              <Text style={styles.bottomBoxTitle}>Remarks</Text>
              <Text style={styles.bottomBoxText}>{remarks || "—"}</Text>
            </View>
            <View style={styles.tcBox}>
              <Text style={styles.bottomBoxTitle}>Terms & Conditions</Text>
              <Text style={styles.bottomBoxText}>—</Text>
            </View>
          </View>

          {/* ── Gold rule ── */}
          <View style={styles.goldRule} />

          {/* ── Signature ── */}
          <View style={styles.signatureSection}>
            <Text style={styles.forCompany}>
              For{" "}
              <Text style={styles.forCompanyName}>{branchData.branchName}</Text>
            </Text>
            <View style={styles.signatureRow}>
              {["Prepared By", "Verified By", "Received By", "Approved By"].map(
                (role) => (
                  <Text key={role} style={styles.signatureLabel}>
                    {role}
                  </Text>
                )
              )}
            </View>
          </View>

        </View>

        {/* ── Page number ── */}
        <View style={styles.pageNumberBar}>
          <Text
            style={styles.pageNumberText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>

      </Page>
    </Document>
  );
};

export default YarnPurchaseOrderReturnPrintFormat;