import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import Sangeethatex from "../../../../../src/assets/Sangeethatex.png";
import tw from "../../../../Utils/tailwind-react-pdf";
import { findFromList, substract } from "../../../../Utils/helper";





const PrintFormat = ({
  lineItems,
  productList,
  uomList,
  docId,
  date,
  party,
  ewayBillNo,
  transportTax,
  transportCost,
  shippingAddress,
}) => {

  const getProductName = (item) => {
    if (item?.Product?.name) return item.Product.name;
    const found = productList?.find(
      (p) => parseInt(p.id) === parseInt(item.productId)
    );
    return found?.name || "";
  };
  const getUomName = (item, uomList) => {
    // If it's saved data (API returned Uom.name)
    if (item?.Uom?.name) return item.Uom.name;
    // If unsaved, find from uomList
    return findFromList(item.uomId, uomList, "name");
  };
  const calculateGst = (index) => {
    return lineItems[index]["taxPercent"]?.replace("%", "");
  };

  const calGst = (id) => {
    let taxPercent = lineItems?.find(
      (val) => parseInt(val.id) === parseInt(id)
    )?.taxPercent;

    return taxPercent ? taxPercent.replace("%", "") : 0;
  };
  const grandTotal = lineItems?.reduce((acc, item, index) => {
    const taxableAmount =
      !item.qty || !item.price
        ? 0
        : parseFloat(item.qty) * parseFloat(item.price);

    const gstAmount = taxableAmount * (calculateGst(index) / 100);
    const totalAmount =
      taxableAmount - parseFloat(item?.discount || 0) + gstAmount;

    return acc + totalAmount;
  }, 0);
  const styles = StyleSheet.create({
    table: {
      // borderStyle: "solid",
      // borderWidth: 1,
      // borderColor: "#D1D5DB",
      marginTop: 20,
      flexDirection: "column",
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#303030",
      borderLeftWidth: 1,
      borderLeftColor: "#D1D5DB",
      // paddingTop: 10,
      // paddingBottom: 5,
    },

    headerCell: {
      flex: 1,
      padding: 3,
      fontSize: 9,
      color: "white",
      textAlign: "center",
      fontWeight: "bold",
      borderRightWidth: 1,
      borderRightColor: "#D1D5DB",
    },

    // table

    tableRow: {
      flexDirection: "row",
      alignItems: "stretch",
    },
    tableCell: {
      flex: 1,
      borderRightWidth: 1,
      borderRightColor: "#D1D5DB",
      borderLeftWidth: 1,
      borderLeftColor: "#D1D5DB",
      borderBottomWidth: 1,
      borderBottomColor: "#D1D5DB",
      padding: 3,
      fontSize: 9,
      flexWrap: "wrap",
    },
  });

  const headers = [
    { label: "S.No", flex: 0.5, align: "center" },
    // { label: "Product Name", flex: 2, align: "center" },
    { label: "Description", flex: 2.5, align: "center" },
    { label: "HSN", flex: 1, align: "center" },
    { label: "UOM", flex: 1, align: "center" },
    { label: "Qty", flex: 1, align: "center" },
    { label: "Price", flex: 1, align: "center" },
    { label: "Taxable Amount", flex: 1.5, align: "center" },
    { label: "CGST", flex: 1.2, align: "center" },
    { label: "SGST", flex: 1.2, align: "center" },
    { label: "Discount", flex: 1, align: "center" },
    { label: "Amount", flex: 1.5, align: "center" },
  ];
  // Calculate totals before rendering
  
  // let grandTotalInWords = numberToWords.toWords(Math.round(grandTotal));

  // grandTotalInWords =
  //   grandTotalInWords.charAt(0).toUpperCase() + grandTotalInWords.slice(1);



  return (
    <>
      <Document>
        <Page
          size="A4"
          style={{
            fontFamily: "Roboto",
            ...tw("relative pb-[50px] px-8 mt-6"),
          }}
          wrap
        >
          <Image
            // source={headerBg}
            style={{
              marginLeft: 20,
              width: "100%",
              height: 134,
              position: "absolute",
              top: 20,
              left: 2,
              zIndex: 100,
            }}
          />
          <View
            style={tw(
              "flex flex-row justify-between  items-center relative z-100"
            )}
          >
            <View style={tw("flex-1 mt-7 ml-3 ")}>
              <Image
                source={Sangeethatex}
                style={{ width: 70, height: 50, marginLeft: 15, marginTop: 4 }}
              />
              <Text
                style={[
                  tw("mt-2 font-bold tracking-wide"),
                  {
                    fontSize: 8,
                    color: "white",
                    textShadowColor: "#00000050",
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 2,
                  },
                ]}
              >
                SANGEETHA TEX
              </Text>
              <Text
                style={[
                  tw("    tracking-wide"),
                  {
                    fontSize: 10,
                    color: "white",
                  },
                ]}
              >
                
              </Text>
            </View>

            <View style={tw("flex-2 items-center")}>
              <Text
                style={{ fontSize: 14, fontWeight: "bold", color: "white" }}
              >
                PURCHASE ORDER
              </Text>
            </View>
            <View style={tw("flex-1 items-end mr-3")}>
              <Text style={{ fontSize: 14, color: "white" }}>{docId}</Text>
            </View>
          </View>

          {/* content below the top image  */}
          <View>
            <View style={tw("w-full")}>
              <View
                style={tw("flex flex-row justify-between p-1 mt-3 mb-3 mt-10")}
              >
                <View style={tw("w-2/4 gap-y-0.5")}>
                  <Text
                    style={[
                      tw("text-gray-900 tracking-wide"),
                      {
                        fontSize: 16,
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                      },
                    ]}
                  >
                    Sangeethe TexTile
                  </Text>

                  <Text style={{ fontSize: 10, marginBottom: 5 }}>
                   36192, 2/99 Sangitha Textiles Palla Thottam Kaliyapuram Annur Tk,{"\n"} TN (33)
                    Coimbatore, Kamanaikenpalayam Annur Road, Annur-641653
                  </Text>
                  <Text style={{ fontSize: 10, marginBottom: 5 }}>
                    +9042762263
                  </Text>
                  <Text style={{ fontSize: 10, marginBottom: 5 }}>
                    sangithatextile@ssgroups.in 
                  </Text>
                  <View style={tw("flex flex-row gap-x-2")}>
                    <Text
                      style={[
                        tw("font-bold"),
                        {
                          fontSize: 10,
                          fontWeight: 900,
                          fontFamily: "Times-Bold",
                        },
                      ]}
                    >
                      GSTIN :
                    </Text>
                    <Text style={{ fontSize: 10, marginBottom: 3 }}>
                      33BIIPS8122C1ZF
                    </Text>
                  </View>
                  <View style={tw("flex flex-row gap-x-2")}>
                    <Text
                      style={[
                        tw("font-bold"),
                        {
                          fontSize: 10,
                          fontWeight: 900,
                          fontFamily: "Times-Bold",
                        },
                      ]}
                    >
                      Website:
                    </Text>
                    <Text style={{ fontSize: 10, marginBottom: 3 }}>
                      www.sagaaclothing.com , www.sockscart.in
                    </Text>
                  </View>
                  <View style={tw("flex flex-row gap-x-2")}>
                    <Text
                      style={[
                        tw("font-bold"),
                        {
                          fontSize: 10,
                          fontWeight: 900,
                          fontFamily: "Times-Bold",
                        },
                      ]}
                    >
                      Contact Name:
                    </Text>
                    <Text style={{ fontSize: 10, marginBottom: 3 }}>
                      Sangeetha Tex
                    </Text>
                  </View>
                </View>
                <View style={tw("flex flex-row justify-end w-1/2 mt-4")}>
                  <View style={tw("w-1/2 gap-y-2")}>
                    <Text style={{ fontSize: 10 }}>Po No:</Text>
                    <Text style={{ fontSize: 10 }}>Po Date:</Text>
                    {/* <Text style={{ fontSize: 10 }}>E-Way Bill No:</Text> */}
                  </View>
                  <View style={tw("w-1/3  gap-y-2")}>
                    <Text style={{ fontSize: 10 }}> {docId}</Text>
                    <Text style={{ fontSize: 10 }}> {date}</Text>
                    {/* <Text style={{ fontSize: 10 }}>{ewayBillNo}</Text> */}
                  </View>
                </View>
              </View>
            </View>
          </View>

        


          

          {/* Totals Section */}
       

          {/* <Page2 /> */}

          <View fixed style={tw("pr-2 pb-2 mt-[50px] absolute bottom-3  ")}>
            <View style={tw("text-right text-sm w-full ml-10 pb-1 pt-1")}>
              <Text
                render={({ pageNumber, totalPages }) =>
                  `Page No :  ${pageNumber} / ${totalPages}`
                }
                fixed
              />
            </View>
          </View>
        </Page>
      </Document>
    </>
  );
};

export default PrintFormat;
