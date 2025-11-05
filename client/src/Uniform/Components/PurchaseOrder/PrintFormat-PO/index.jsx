

// import {
//   Document,
//   Page,
//   View,
//   Text,
//   Image,
//   Font,
//   StyleSheet,
// } from "@react-pdf/renderer";
// import Sangeethatex from "../../../../../src/assets/Sangeethatex.png";
// import tw from "../../../../Utils/tailwind-react-pdf";
// import numberToText from "number-to-text";
// import { findFromList, getCommonParams, getDateFromDateTimeToDisplay } from "../../../../Utils/helper";
// import { useGetBranchByIdQuery } from "../../../../redux/services/BranchMasterService";
// import { useGetPartyByIdQuery } from "../../../../redux/services/PartyMasterService";
// import { useGetPaytermMasterQuery } from "../../../../redux/services/PayTermMasterServices";
// import { useGetTermsAndConditionsQuery } from "../../../../redux/services/TermsAndConditionsService";
// import useTaxDetailsHook from "../../../../CustomHooks/TaxHookDetails";
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
//     marginBottom: 4,
//     borderBottom: "1 solid #000",
//   },
//   logoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 4,

//   },
//   logo: {
//     // width: 60,
//     height: 40,
//     marginRight: 6,
//   },
//   companyText: {
//     fontSize: 8,
//     textAlign: "left",
//   },
//   greenTitle: {
//     textAlign: "center",
//     fontSize: 11,
//     color: "green",
//     fontWeight: "bold",
//     marginVertical: 4,
//     // textDecoration: "underline",
//     marginBottom: 6,
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
//     color: "green",
//     // backgroundColor: "#e6ffe6",
//     borderBottom: "1 solid #000",
//     padding: 6,
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
//     // backgroundColor: "#d1fae5",
//     borderTop: "1 solid #000",
//     borderBottom: "1 solid #000",
//     marginTop: 6,
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
// const YarnPurchaseOrderPrintFormat = ({
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
//   colorList, uomList, yarnList, sizeList, term

// }) => {



//   console.log(taxDetails, "taxDetails", poItems)



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
//         {/* Header */}
//         <View style={styles.page}>

//           <View style={styles.header}>
//             <Text style={{ fontSize: 12, color: "green", fontWeight: "bold", marginBottom: 4, marginTop: 10 }}>
//               {branchData.branchName}
//             </Text>
//             <View style={styles.logoRow}>
//               <Image src={Sangeethatex} style={styles.logo} />
//               <View>
//                 <Text style={styles.companyText}>{branchData.address}</Text>
//                 <Text style={styles.companyText}>Mobile: {branchData.mobile}</Text>
//                 <Text style={styles.companyText}>PAN No: {branchData.panNo}</Text>
//                 <Text style={styles.companyText}>GST No: {branchData.gstNo}</Text>
//               </View>
//             </View>
//           </View>
//           <View >
//             <Text style={styles.greenTitle}>YARN  PURCHASE ORDER </Text>
//             <Text style={{ marginBottom: 4, borderBottom: "1 solid #000", }}></Text>

//           </View>
//           <View style={{
//             justifyContent: "space-between", flexDirection: "row", marginTop: 4, paddingHorizontal: 4
//           }}  >
//             <View style={styles.poDetails}>
//               <View style={styles.detailRow}>
//                 <Text style={styles.label}>PO No :</Text>
//                 <Text style={styles.value}>{poNumber}</Text>
//               </View>
//               <View style={styles.detailRow}>
//                 <Text style={styles.label}>PO Date :</Text>
//                 <Text style={styles.value}>{getDateFromDateTimeToDisplay(poDate)}</Text>
//               </View>
//               <View style={styles.detailRow}>
//                 <Text style={styles.label}>Due Date :</Text>
//                 <Text style={styles.value}>{getDateFromDateTimeToDisplay(dueDate)}</Text>
//               </View>
//               <View style={styles.detailRow}>
//                 <Text style={styles.label}>Payment Terms :</Text>
//                 <Text style={styles.value}>{"-"}</Text>
//               </View>
//             </View>

//             <View style={styles.infoRight}>
//               <Text style={{ fontSize: 6 }}>QR: {poNumber}</Text>
//             </View>
//           </View>

//           {/* Vendor & Delivery */}
//           <View style={styles.boxRow}>
//             <View style={styles.boxCol}>
//               <Text style={styles.sectionTitle}>SUPPLIER DETAILS :</Text>
//               <View style={styles.boxContent}>
//                 <Text style={{ fontWeight: "bold", marginBottom: 4, paddingHorizontal: 4, }}>{supplierDetails?.name}</Text>
//                 <Text>{supplierDetails?.address}</Text>
//                 <Text>Mobile No: {supplierDetails?.mobile}</Text>
//                 <Text>PAN No: {supplierDetails?.panNo}</Text>
//                 <Text>GST No: {supplierDetails?.gstNo}</Text>
//                 <Text>Email: {supplierDetails?.email}</Text>
//               </View>
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.sectionTitle}>DELIVERY TO :</Text>
//               <View style={styles.boxContent}>
//                 <Text style={{ fontWeight: "bold", paddingHorizontal: 4, marginBottom: 4 }}>{branchData.branchName}</Text>
//                 <Text>{branchData.address}</Text>
//                 <Text>Mobile No: {branchData.mobile}</Text>
//                 <Text>GST No: {branchData.gstNo}</Text>
//               </View>
//             </View>
//           </View>

//           <View style={styles.tableHeader}>
//             <Text style={[styles.th, { flex: 0.7 }]}>S.No</Text>
//             <Text style={[styles.th, { flex: 3 }]}>Item</Text>
//             <Text style={[styles.th, { flex: 2 }]}>Color</Text>
//             <Text style={[styles.th, { flex: 1 }]}>UOM</Text>
//             {/* <Text style={[styles.th, { flex: 1 }]}>No. of Bags</Text> */}
//             <Text style={[styles.th, { flex: 1 }]}>Qty</Text>
//             <Text style={[styles.th, { flex: 1 }]}>Rate</Text>
//             <Text style={[styles.th, { flex: 1 }]}>Tax(%)</Text>
//             <Text style={[styles.th, { flex: 1.2 }]}>Amount</Text>
//           </View>


//           {poItems.map((val, index) => (
//             <View key={index} style={{ flexDirection: "row", borderBottom: "1 solid #d1d5db" }}>
//               <Text style={[styles.td, { flex: 0.7 }]}>{index + 1}</Text>
//               <Text style={[styles.td, { flex: 3 }]}>
//                 {findFromList(val.yarnId, yarnList?.data, "name")}
//               </Text>
//               <Text style={[styles.td, { flex: 2 }]}>
//                 {findFromList(val.colorId, colorList?.data, "name")}
//               </Text>
//               <Text style={[styles.td, { flex: 1 }]}>
//                 {findFromList(val.uomId, uomList?.data, "name")}
//               </Text>
//               {/* <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
//                 {parseFloat(val.noOfBags).toFixed(3)}
//               </Text> */}
//               <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
//                 {parseFloat(val.qty).toFixed(3)}
//               </Text>
//               <Text style={[styles.td, { flex: 1 }]}>
//                 {parseFloat(val.price).toFixed(3)}
//               </Text>
//               <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
//                 {parseFloat(val.taxPercent).toFixed(3)}
//               </Text>
//               <Text style={[styles.td, { flex: 1.2, textAlign: "right" }]}>
//                 {parseFloat(val.qty * val.price).toFixed(3)}
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
//                 flex: 15,
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


//           <View
//             style={{
//               alignSelf: "flex-end",
//               border: "1 solid #9ca3af",
//               // marginTop: 4,
//               width: 100,
//             }}
//           >
//             <View style={{}}>
//               <Text style={{ fontSize: 8, fontWeight: "bold", textAlign: "center", padding: 2 }}>
//                 TAX DETAILS
//               </Text>
//             </View>
//             <TaxDetails taxGroupWise={taxGroupWise} items={poItems} taxDetails={taxDetails} taxTemplateId={taxTemplateId} discountType={discountType} discountValue={discountValue} />



//             <View style={{ flexDirection: "row", borderTop: "1 solid #9ca3af", backgroundColor: "#d1fae5" }}>
//               <Text style={{ flex: 1, fontSize: 8, padding: 3 }}>Net Amount</Text>
//               <Text style={{ flex: 1, textAlign: "right", fontSize: 8, padding: 3 }}>
//                 {parseFloat(taxDetails.netAmount).toFixed(3)}
//               </Text>
//             </View>
//           </View>


//           <View style={{ marginTop: 6, borderLeft: "1 solid #9ca3af", borderTop: "1 solid #9ca3af", borderRight: "1 solid #9ca3af", borderBottom: "1 solid #9ca3af" }}>
//             {/* Amount in Words */}
//             <View style={{ borderBottom: "1 solid #9ca3af", padding: 5 }}>
//               <Text style={{ fontSize: 10, fontWeight: "bold" }}>Amount in Words:  Rs.{" "}
//                 {numberToText.convertToText(taxDetails?.netAmount, {
//                   language: "en-in",
//                   separator: "",
//                 })}{" "}
//                 Only</Text>

//             </View>

//             {/* Remarks */}
//             <View style={{ borderBottom: "1 solid #9ca3af", padding: 5 }}>
//               <Text style={{ fontSize: 8, fontWeight: "bold" }}>Remarks: {remarks}</Text>
//               {/* <Text style={{ fontSize: 8 }}></Text> */}
//             </View>

//             {/* Terms and Conditions */}
//             <View style={{ padding: 5 }}>
//               <Text style={{ fontSize: 8, fontWeight: "bold" }}>
//                 Terms and Conditions: {term}
//               </Text>
//               {/* {termsAndCondition?.data
//                 ?.filter((v) => v.isPurchaseOrder)
//                 ?.map((v) => (
//                   <Text key={v.id} style={{ fontSize: 7 }}>
//                     {v.description}
//                   </Text>
//                 ))} */}
//             </View>
//           </View>






//           <View style={{ marginTop: 10 }}>
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

// export default YarnPurchaseOrderPrintFormat;



import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";
import Sangeethatex from "../../../../../src/assets/Sangeethatex.png";
import tw from "../../../../Utils/tailwind-react-pdf";
import numberToText from "number-to-text";
import { findFromList, getCommonParams, getDateFromDateTimeToDisplay } from "../../../../Utils/helper";
import { useGetBranchByIdQuery } from "../../../../redux/services/BranchMasterService";
import { useGetPartyByIdQuery } from "../../../../redux/services/PartyMasterService";
import { useGetPaytermMasterQuery } from "../../../../redux/services/PayTermMasterServices";
import { useGetTermsAndConditionsQuery } from "../../../../redux/services/TermsAndConditionsService";
import TaxDetails from "./TaxDetails";
import { Loader } from "../../../../Basic/components";

// Font registration
Font.register({
  family: "Roboto",
  src: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,600;1,400;1,600&display=swap",
});

const styles = StyleSheet.create({
  // page: {
  //   fontFamily: "Helvetica",
  //   fontSize: 8,
  //   padding: 10,
  //   border: "1 solid #000",
  // },
  borderBox: { border: "1 solid black", margin: 0, padding: 8, },
  page: {
    // fontFamily: "Helvetica",
    fontSize: 8,
    padding: 0,
    border: "1 solid #000",
  },
  header: {
    alignItems: "center",
    textAlign: "center",
    marginBottom: 7,
    justifyContent: "space-between",
    flexDirection: "row",
    padding: 7,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,

  },
  logo: {
    // width: 60,
    height: 40,
    marginRight: 6,
  },
  companyText: {
    fontSize: 9,
    marginBottom: 1,
    textAlign: "left",
    marginRight : 4
  },
  greenTitle: {
    textAlign: "center",
    fontSize: 15,
    color: "#FFFF",
    backgroundColor: "#1D3A76",
    paddingVertical: 4,
    // borderBottom: "18 solid #1D3A76",

    fontWeight: "500",
    // marginVertical: 4,
    // textDecoration: "underline",
    // marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    border: "1 solid #000",
    justifyContent: "space-between",
    padding: 4,
  },
  infoLeft: { flex: 1 },
  infoRight: {
    width: 80,
    height: 80,
    border: "1 solid #000",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#FFFF",
    // backgroundColor: "#e6ffe6",
    backgroundColor: "#1D3A76",
    padding: 6,
    marginBottom: 2
  },
  boxRow: {
    flexDirection: "row",
    border: "1 solid #000",
    marginTop: 4,
  },
  boxCol: {
    flex: 1,
    borderRight: "1 solid #000",
  },
  boxContent: {
    padding: 4,
    fontSize: 8,
  },
  tableHeader: {
    flexDirection: "row",
    borderTop: "1 solid #000",
    borderBottom: "1 solid #000",
    marginTop: 6,
    backgroundColor: "#1D3A76",
    padding: 3,
    color: "#FFFF"
  },
  th: {
    flex: 1,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    borderRight: "1 solid #000",
    padding: 3,
  },
  td: {
    flex: 1,
    fontSize: 8,
    textAlign: "center",
    borderRight: "1 solid #000",
    borderBottom: "1 solid #000",
    padding: 3,
  },
  totalRow: {
    flexDirection: "row",
    borderTop: "1 solid #000",
  },
  totalLabel: {
    flex: 8,
    textAlign: "center",
    fontSize: 8,
    fontWeight: "bold",
    padding: 3,
  },
  totalValue: {
    flex: 1.2,
    textAlign: "right",
    fontSize: 8,
    padding: 3,
  },
  taxBox: {
    width: 180,
    border: "1 solid #000",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  taxHeader: {
    backgroundColor: "#d1fae5",
    borderBottom: "1 solid #000",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 8,
    padding: 3,
  },
  taxRow: {
    flexDirection: "row",
    borderTop: "1 solid #000",
  },
  taxLabel: { flex: 1, padding: 3, fontSize: 8 },
  taxValue: {
    flex: 1,
    textAlign: "right",
    padding: 3,
    fontSize: 8,
  },
  remarksSection: {
    marginTop: 6,
  },
  footer: {
    marginTop: 10,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  signature: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 8,
  },
  pageNumber: {
    position: "absolute",
    bottom: 10,
    right: 30,
    fontSize: 7,
    color: "#555",
  },
  poDetails: {
    marginTop: 10,
    width: "50%", // adjust as needed
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  label: {
    fontSize: 8,
    fontWeight: "bold",
  },

  value: {
    fontSize: 8,
    textAlign: "right",
    flexShrink: 1, // helps long text wrap properly
  },
});
const YarnPurchaseOrderPrintFormat = ({
  isTaxHookDetailsLoading,
  poNumber,
  poDate,
  deliveryToId,
  dueDate,
  payTermId,
  deliveryType,
  supplierDetails,
  poItems,
  taxTemplateId,
  discountType,
  discountValue,
  remarks,
  poType,
  branchData,
  termsAndCondition,
  taxDetails,
  deliveryTo,
  taxKey,
  taxGroupWise,
  colorList, uomList, yarnList, sizeList, term, termsData, useTaxDetailsHook

}) => {


  const filledPoItems = [
    ...poItems,
    ...Array(Math.max(0, 10 - poItems.length)).fill({}), // empty rows
  ];



  function findAccessoryName(accessoryId, accessoryArray, field) {

    let accessoryObj = accessoryArray?.find(item => parseInt(item.id) == accessoryId)

    if (field == "accessoryItem") {
      return accessoryObj?.accessoryItem?.name
    }
    else if ("accessoryGroup") {
      return accessoryObj?.accessoryItem?.AccessoryGroup?.name
    }

  }



  if (isTaxHookDetailsLoading) return <Loader />



  return (
    <Document>
      <Page size="A4" style={styles.borderBox}>
        <View style={styles.page}>

          <View style={styles.header}>
            <View style={{ width: 125, flexWrap: 'wrap' }}>
              <Text style={styles.companyText}>{branchData.address}</Text>

              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.companyText, { width: 40 }]}>Mobile</Text>
                <Text style={styles.companyText}>: {branchData.contactMobile}</Text>
              </View>

              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.companyText, { width: 40 }]}>Email</Text>
                <Text style={styles.companyText}>: {branchData.contactEmail}</Text>
              </View>

              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.companyText, { width: 40 }]}>GST No</Text>
                <Text style={styles.companyText}>: {branchData.gstNo}</Text>
              </View>
            </View>

            <View style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <Text
                style={{
                  fontSize: 20,
                  color: "#1D3A76",
                  fontWeight: "bold",
                  marginBottom: 4,
                  marginTop: 10,
                  textAlign: "center",
                }}
              >
                {branchData.branchName}
              </Text>
            </View>

            <Image src={Sangeethatex} style={styles.logo} />
          </View>

          <View >
            <Text style={styles.greenTitle }>YARN  PURCHASE ORDER</Text>
            <View style={{ alignItems: "flex-end", marginTop : 5, marginBottom : 3 , marginRight: 7 }}>
              <View style={{}}>
                <View style={{ flexDirection: "row", marginBottom: 3 }}>
                  <Text style={[styles.companyText, { width: 50, textAlign: "left" }]}>PO No</Text>
                  <Text style={styles.companyText}>: {poNumber}</Text>
                </View>

                <View style={{ flexDirection: "row", marginBottom: 3 }}>
                  <Text style={[styles.companyText, { width: 50, textAlign: "left" }]}>PO Date</Text>
                  <Text style={styles.companyText}>: {getDateFromDateTimeToDisplay(poDate)}</Text>
                </View>

                <View style={{ flexDirection: "row", marginBottom: 3 }}>
                  <Text style={[styles.companyText, { width: 50, textAlign: "left" }]}>Due Date</Text>
                  <Text style={styles.companyText}>: {getDateFromDateTimeToDisplay(dueDate)}</Text>
                </View>
              </View>
            </View>




          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 , marginBottom : 6 }}>
            {/* SUPPLIER DETAILS */}
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>SUPPLIER DETAILS</Text>
              <View style={styles.boxContent}>
                <Text
                  style={{
                    fontWeight: "bold",
                    paddingHorizontal: 4,
                    marginBottom: 4,
                    color: "#0F766E",
                  }}
                >
                  {supplierDetails?.name}
                </Text>

                <Text style={{textTransform : "uppercase" , marginBottom : 2}}>{supplierDetails?.address}</Text>

                <View style={{ flexDirection: "row", marginTop: 2 }}>
                  <Text style={[styles.companyText, { width: 70 }]}>Mobile No</Text>
                  <Text style={styles.companyText}>: {supplierDetails?.contactPersonNumber}</Text>
                </View>

                {/* <View style={{ flexDirection: "row" }}>
                  <Text style={[styles.companyText, { width: 70 }]}>PAN No</Text>
                  <Text style={styles.companyText}>: {supplierDetails?.panNo}</Text>
                </View> */}

                <View style={{ flexDirection: "row" }}>
                  <Text style={[styles.companyText, { width: 70 }]}>GST No</Text>
                  <Text style={styles.companyText}>: {supplierDetails?.gstNo}</Text>
                </View>

                <View style={{ flexDirection: "row" }}>
                  <Text style={[styles.companyText, { width: 70 }]}>Email</Text>
                  <Text style={styles.companyText}>: {supplierDetails?.email}</Text>
                </View>
              </View>
            </View>

            {/* DELIVERY TO */}
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>DELIVERY TO</Text>
              <View style={styles.boxContent}>
                <Text
                  style={{
                    fontWeight: "bold",
                    paddingHorizontal: 4,
                    marginBottom: 4,
                    color: "#0F766E",
                  }}
                >
                  {deliveryType === "ToSelf" ? deliveryTo?.branchName : deliveryTo?.name}
                </Text>

                {deliveryTo?.address && <Text style={{ paddingHorizontal: 4 , textTransform : "uppercase" , marginBottom : 2 }}>{deliveryTo.address}</Text>}

                {deliveryTo?.contactMobile && (
                  <View style={{ flexDirection: "row" }}>
                    <Text style={[styles.companyText, { width: 70 }]}>Mobile No</Text>
                    <Text style={styles.companyText}>: {deliveryTo?.contactMobile}</Text>
                  </View>
                )}

                {deliveryType === "ToSelf" ? (
                  <>
                    {deliveryTo?.gstNo && (
                      <View style={{ flexDirection: "row" }}>
                        <Text style={[styles.companyText, { width: 70 }]}>GST No</Text>
                        <Text style={styles.companyText}>: {deliveryTo?.gstNo}</Text>
                      </View>
                    )}
                    {deliveryTo?.contactEmail && (
                      <View style={{ flexDirection: "row" }}>
                        <Text style={[styles.companyText, { width: 70 }]}>Email</Text>
                        <Text style={styles.companyText}>: {deliveryTo?.contactEmail}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    {deliveryTo?.panNo && (
                      <View style={{ flexDirection: "row" }}>
                        <Text style={[styles.companyText, { width: 70 }]}>PAN No</Text>
                        <Text style={styles.companyText}>: {deliveryTo?.panNo}</Text>
                      </View>
                    )}
                    {deliveryTo?.gstNo && (
                      <View style={{ flexDirection: "row" }}>
                        <Text style={[styles.companyText, { width: 70 }]}>GST No</Text>
                        <Text style={styles.companyText}>: {deliveryTo?.gstNo}</Text>
                      </View>
                    )}
                    {deliveryTo?.email && (
                      <View style={{ flexDirection: "row" }}>
                        <Text style={[styles.companyText, { width: 70 }]}>Email</Text>
                        <Text style={styles.companyText}>: {deliveryTo?.email}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          </View>



          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 0.5 }]}>S.No</Text>
            <Text style={[styles.th, { flex: 5 }]}>Item</Text>
            <Text style={[styles.th, { flex: 2 }]}>Color</Text>
            <Text style={[styles.th, { flex: 1 }]}>UOM</Text>
            <Text style={[styles.th, { flex: 1 }]}>Qty</Text>
            <Text style={[styles.th, { flex: 1 }]}>Rate</Text>
            <Text style={[styles.th, { flex: 1 }]}>Tax(%)</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>Amount</Text>
          </View>


          {filledPoItems?.map((val, index) => (
            <View key={index} style={{ flexDirection: "row", borderBottom: "1 solid #d1d5db" }}>
              <Text style={[styles.td, { flex: 0.5 }]}>{index + 1}</Text>
              <Text style={[styles.td, { flex: 5 }]}>
                {findFromList(val.yarnId, yarnList?.data, "name")}
              </Text>
              <Text style={[styles.td, { flex: 2 }]}>
                {findFromList(val.colorId, colorList?.data, "name")}
              </Text>
              <Text style={[styles.td, { flex: 1 }]}>
                {findFromList(val.uomId, uomList?.data, "name")}
              </Text>
              {/* <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                      {parseFloat(val.noOfBags).toFixed(3)}
                    </Text> */}


              <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                {isNaN(val.qty) ? "" : parseFloat(val.qty).toFixed(3)}
              </Text>

              <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                {isNaN(val.price) ? "" : parseFloat(val.price).toFixed(3)}
              </Text>

              <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                {isNaN(val.taxPercent) ? "" : parseFloat(val.taxPercent).toFixed(3)}
              </Text>

              <Text style={[styles.td, { flex: 1.2, textAlign: "right" }]}>
                {val.qty && val.price && !isNaN(val.qty * val.price)
                  ? (val.qty * val.price).toFixed(3)
                  : ""}
              </Text>
            </View>
          ))}



          <View
            style={{
              flexDirection: "row",
              // borderTop: "1 solid #9ca3af",
              borderBottom: "1 solid #9ca3af",
            }}
          >
            <Text
              style={{
                flex: 11.5,
                textAlign: "center",
                fontSize: 8,
                fontWeight: "bold",
                padding: 3,
              }}
            >
              TOTAL
            </Text>
            <Text
              style={{
                flex: 2,
                textAlign: "right",
                fontSize: 8,
                padding: 3,
                borderLeft: "1 solid #9ca3af",
              }}
            >
              {parseFloat(taxDetails.taxableAmount).toFixed(2)}
            </Text>
          </View>


          <View
            style={{
              alignSelf: "flex-end",
              border: "1 solid #9ca3af",
              // marginTop: 4,
              width: 100,
            }}
          >
            <View style={{}}>
              <Text style={{
                fontSize: 8, fontWeight: "bold", textAlign: "center", padding: 2, backgroundColor: "#1D3A76", color: "#FFFF"
              }}>
                TAX DETAILS
              </Text>
            </View>
            <TaxDetails taxGroupWise={taxGroupWise} items={poItems} taxDetails={taxDetails} taxTemplateId={taxTemplateId} discountType={discountType} discountValue={discountValue} useTaxDetailsHook={useTaxDetailsHook} />



            <View style={{ flexDirection: "row", borderTop: "1 solid #9ca3af", backgroundColor: "#1D3A76", color: "#FFFF" }}>
              <Text style={{ flex: 1, fontSize: 8, paddingTop: 3 }}>Net Amount</Text>
              <Text style={{ flex: 1, textAlign: "right", fontSize: 8, padding: 3 }}>
                {parseFloat(taxDetails.netAmount).toFixed(3)}
              </Text>
            </View>
          </View>


          <View >

            <View
              style={{
                marginTop: 6,
                border: "1 solid #9ca3af",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  borderBottom: "1 solid #9ca3af",
                  backgroundColor: "#1D3A76",
                  paddingVertical: 5,
                  paddingHorizontal: 6,
                  marginBottom : 4
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: "bold",
                    color: "#FFFFFF",
                    flexWrap: "wrap",
                  }}
                >
                  Amount in Words: Rs.{" "}
                  {numberToText.convertToText(taxDetails?.netAmount || 0, {
                    language: "en-in",
                    separator: "",
                  })}{" "}
                  Only
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  borderTop: "1 solid #9ca3af",
                  height: 130,
                }}
              >
                <View
                  style={{
                    flex: 0.3,
                    borderRight: "1 solid #9ca3af",
                    backgroundColor: "#f0f4ff",
                    paddingVertical: 5,
                    paddingHorizontal: 6,
                    minHeight: 60,
                    width: 40

                  }}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      fontWeight: "bold",
                      color: "#1D3A76",
                      flexWrap: "wrap"
                    }}
                  >
                    Remarks:
                  </Text>
                  <Text style={{ fontSize: 8, flexWrap: "wrap" }}>
                    {remarks || "—"}
                  </Text>
                </View>


                <View
                  style={{
                    flex: 0.7,
                    paddingVertical: 5,
                    paddingHorizontal: 6,
                    minHeight: 60,
                    width: 100

                  }}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      fontWeight: "bold",
                      color: "#1D3A76",
                      flexWrap: "wrap",
                    }}
                  >
                    Terms & Conditions:
                  </Text>
                  <Text style={{ fontSize: 8, flexWrap: "wrap" }}>
                    {/* {term || "—"}
                        */}
                    {findFromList(term, termsData?.data, "termsAndCondition")}
                  </Text>
                </View>
              </View>
            </View>








          </View>

          <View style={{ marginTop: 20 }}>
            <Text
              style={{ fontSize: 8, textAlign: "right", fontWeight: "bold" }}
            >
              For {branchData.branchName}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              {["Prepared By", "Verified By", "Received By", "Approved By"].map(
                (role) => (
                  <Text
                    key={role}
                    style={{
                      fontSize: 8,
                      textAlign: "center",
                      fontWeight: "bold",
                      flex: 1,
                    }}
                  >
                    {role}
                  </Text>
                )
              )}
            </View>
          </View>







        </View>
        <View style={{
          marginTop: 20, textAlign: "center", fontSize: 8,

        }}>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>



      </Page>
    </Document >
  );
};

export default YarnPurchaseOrderPrintFormat;

