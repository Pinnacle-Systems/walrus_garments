
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
import useTaxDetailsHook from "../../../../CustomHooks/TaxHookDetails";
import TaxDetails from "./TaxDetails";
import { Loader } from "../../../../Basic/components";
import QRCode from "react-qr-code";

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
    marginBottom: 4,
    borderBottom: "1 solid #000",
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
    fontSize: 8,
    textAlign: "left",
  },
  greenTitle: {
    textAlign: "center",
    fontSize: 11,
    color: "green",
    fontWeight: "bold",
    marginVertical: 4,
    // textDecoration: "underline",
    marginBottom: 6,
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
    color: "green",
    // backgroundColor: "#e6ffe6",
    borderBottom: "1 solid #000",
    padding: 6,
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
    // backgroundColor: "#d1fae5",
    borderTop: "1 solid #000",
    borderBottom: "1 solid #000",
    marginTop: 6,
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
const AccessoryPurchaseOrderPrintFormat = ({
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
  colorList, uomList, accessoryList, sizeList, term

}) => {



  console.log(taxDetails, "taxDetails", taxKey)



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
        {/* Header */}
        <View style={styles.page}>

          <View style={styles.header}>
            <Text style={{ fontSize: 12, color: "green", fontWeight: "bold", marginBottom: 4, marginTop: 10 }}>
              {branchData.branchName}
            </Text>
            <View style={styles.logoRow}>
              <Image src={Sangeethatex} style={styles.logo} />
              <View>
                <Text style={styles.companyText}>{branchData.address}</Text>
                <Text style={styles.companyText}>Mobile: {branchData.mobile}</Text>
                <Text style={styles.companyText}>PAN No: {branchData.panNo}</Text>
                <Text style={styles.companyText}>GST No: {branchData.gstNo}</Text>
              </View>
            </View>
          </View>
          <View >
            <Text style={styles.greenTitle}>ACCESSORY  PURCHASE ORDER </Text>
            <Text style={{ marginBottom: 4, borderBottom: "1 solid #000", }}></Text>

          </View>
          <View style={{
            justifyContent: "space-between", flexDirection: "row", marginTop: 4, paddingHorizontal: 4
          }}  >
            <View style={styles.poDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.label}>PO No :</Text>
                <Text style={styles.value}>{poNumber}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>PO Date :</Text>
                <Text style={styles.value}>{getDateFromDateTimeToDisplay(poDate)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Due Date :</Text>
                <Text style={styles.value}>{getDateFromDateTimeToDisplay(dueDate)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Payment Terms :</Text>
                <Text style={styles.value}>{"-"}</Text>
              </View>
            </View>

            <View style={styles.infoRight}>
              <QRCode value={poNumber} size={80} />
            </View>
          </View>

          {/* Vendor & Delivery */}
          <View style={styles.boxRow}>
            <View style={styles.boxCol}>
              <Text style={styles.sectionTitle}>SUPPLIER DETAILS :</Text>
              <View style={styles.boxContent}>
                <Text style={{ fontWeight: "bold", marginBottom: 4, paddingHorizontal: 4, }}>{supplierDetails?.name}</Text>
                <Text>{supplierDetails?.address}</Text>
                <Text>Mobile No: {supplierDetails?.mobile}</Text>
                <Text>PAN No: {supplierDetails?.panNo}</Text>
                <Text>GST No: {supplierDetails?.gstNo}</Text>
                <Text>Email: {supplierDetails?.email}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>DELIVERY TO :</Text>
              <View style={styles.boxContent}>
                <Text style={{ fontWeight: "bold", paddingHorizontal: 4, marginBottom: 4 }}>{branchData.branchName}</Text>
                <Text>{branchData.address}</Text>
                <Text>Mobile No: {branchData.mobile}</Text>
                <Text>GST No: {branchData.gstNo}</Text>
              </View>
            </View>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 0.7 }]}>S.No</Text>
            <Text style={[styles.th, { flex: 6 }]}>Accessory Name</Text>
            <Text style={[styles.th, { flex: 4 }]}>Accessory Item</Text>
            <Text style={[styles.th, { flex: 4 }]}>Accessory Group</Text>
            <Text style={[styles.th, { flex: 3 }]}>Color</Text>
            <Text style={[styles.th, { flex: 1 }]}>Size</Text>
            <Text style={[styles.th, { flex: 1 }]}>Uom</Text>
            <Text style={[styles.th, { flex: 2 }]}>Qty</Text>

            <Text style={[styles.th, { flex: 2 }]}>Price</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>Tax(%)</Text>

            <Text style={[styles.th, { flex: 3 }]}>Gross</Text>
          </View>

          {poItems.map((val, index) => (
            <View key={index} style={{ flexDirection: "row", borderBottom: "1 solid #d1d5db" }}>
              <Text style={[styles.td, { flex: 0.7 }]}>{index + 1}</Text>
              <Text style={[styles.td, { flex: 6 }]}>
                {findFromList(val.accessoryId, accessoryList?.data, "aliasName")}
              </Text>
              <Text style={[styles.td, { flex: 4 }]}>
                {findAccessoryName(val.accessoryId, accessoryList?.data, "accessoryItem")} </Text>
              <Text style={[styles.td, { flex: 4 }]}>
                {findAccessoryName(val.accessoryId, accessoryList?.data, "accessoryGroup")}
              </Text>
              <Text style={[styles.td, { flex: 3, textAlign: "right" }]}>
                {findFromList(val.colorId, colorList?.data, "name")}
              </Text>
              <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                {findFromList(val.sizeId, sizeList?.data, "name")}

              </Text>
              <Text style={[styles.td, { flex: 1 }]}>
                {findFromList(val.uomId, uomList?.data, "name")}
              </Text>
              <Text style={[styles.td, { flex: 2 }]}>
                {parseFloat(val.qty).toFixed(3)}

              </Text>
              <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>
                {parseFloat(val.price).toFixed(3)}
              </Text>
              <Text style={[styles.td, { flex: 1.5, textAlign: "right" }]}>
                {parseFloat(val.taxPercent).toFixed(3)}
              </Text>
              <Text style={[styles.td, { flex: 3, textAlign: "right" }]}>
                {parseFloat(val.qty * val.price).toFixed(3)}
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
                flex: 25.2,
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
                flex: 3,
                textAlign: "right",
                fontSize: 8,
                padding: 3,
                borderLeft: "1 solid #9ca3af",
              }}
            >
              {parseFloat(taxDetails.taxableAmount).toFixed(3)}
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
              <Text style={{ fontSize: 8, fontWeight: "bold", textAlign: "center", padding: 2 }}>
                TAX DETAILS
              </Text>
            </View>
            <TaxDetails taxGroupWise={taxGroupWise} items={poItems} taxDetails={taxDetails} taxTemplateId={taxTemplateId} discountType={discountType} discountValue={discountValue} />



            <View style={{ flexDirection: "row", borderTop: "1 solid #9ca3af", backgroundColor: "#d1fae5" }}>
              <Text style={{ flex: 1, fontSize: 8, padding: 3 }}>Net Amount</Text>
              <Text style={{ flex: 1, textAlign: "right", fontSize: 8, padding: 3 }}>
                {parseFloat(taxDetails.netAmount).toFixed(3)}
              </Text>
            </View>
          </View>


          <View style={{ marginTop: 6, borderLeft: "1 solid #9ca3af", borderTop: "1 solid #9ca3af", borderRight: "1 solid #9ca3af", borderBottom: "1 solid #9ca3af" }}>
            {/* Amount in Words */}
            <View style={{ borderBottom: "1 solid #9ca3af", padding: 5 }}>
              <Text style={{ fontSize: 10, fontWeight: "bold" }}>Amount in Words:  Rs.{" "}
                {numberToText.convertToText(taxDetails?.netAmount, {
                  language: "en-in",
                  separator: "",
                })}{" "}
                Only</Text>

            </View>

            {/* Remarks */}
            <View style={{ borderBottom: "1 solid #9ca3af", padding: 5, height: 40 }}>
              <Text style={{ fontSize: 8, fontWeight: "bold" }}>Remarks: {remarks}</Text>
              {/* <Text style={{ fontSize: 8 }}></Text> */}
            </View>

            {/* Terms and Conditions */}
            <View style={{ padding: 5, height: 40 }}>
              <Text style={{ fontSize: 8, fontWeight: "bold" }}>
                Terms and Conditions: {term}
              </Text>
              {/* {termsAndCondition?.data
                ?.filter((v) => v.isPurchaseOrder)
                ?.map((v) => (
                  <Text key={v.id} style={{ fontSize: 7 }}>
                    {v.description}
                  </Text>
                ))} */}
            </View>
          </View>






          <View style={{ marginTop: 10, }}>
            <Text
              style={{ fontSize: 8, textAlign: "right", fontWeight: "bold" }}
            >
              For {branchData.branchName}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 30,
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
          <View style={{ alignItems: "center" }}>
            <Text style={{ marginTop: 10 }}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} / ${totalPages}`
              }
            />
          </View>
        </View>
      </Page>
    </Document >
  );
};

export default AccessoryPurchaseOrderPrintFormat;
