import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';
import moment from 'moment';
// import numWords from 'num-words';
import logo from '../../../../assets/iknits.png'
import PageWrapper from '../../../../Utils/PageWrapper';
import tw from '../../../../Utils/tailwind-react-pdf';

export default function Order({ data, singleData, styles, orderDetails, tempOrderDetails }) {



  const findAmount = (qty, price, tax, discountType, disAmount) => {
    let taxAmount = 0;
    let grossAmount = parseFloat((parseFloat(qty) * parseFloat(price)) || 0).toFixed(2);
    let dicountAmount = 0;


    if (tax !== "") {
      let percentage = parseFloat(tax) / 100

      taxAmount = parseFloat(parseFloat(grossAmount) * percentage).toFixed(2)
    }

    if (discountType == "Flat") {
      dicountAmount = parseFloat(disAmount).toFixed(2)
    }
    else if (discountType == "Percentage") {
      let percentage = parseFloat(disAmount) / 100
      dicountAmount = parseFloat(parseFloat(grossAmount) * percentage).toFixed(2)
    }


    return (((parseFloat(grossAmount || 0) + parseFloat(taxAmount || 0)) - parseFloat(dicountAmount || 0)) || 0)

  }
  function getTotals(field) {
    const total = singleData?.CuttingDeliveryDetails?.reduce((accumulator, current) => {
      return accumulator + parseFloat(current[field] ? current[field] : 0)
    }, 0)
    return parseFloat(total)
  }

  function getGross(field1, field2) {
    const total = singleData?.CuttingDeliveryDetails?.reduce((accumulator, current) => {
      return accumulator + parseFloat(current[field1] || current[field2] ? current[field1] * current[field2] : 0)
    }, 0)
    return parseFloat(total)
  }





  function getTotalAmount(qty, price, tax, discountType, disAmount) {
    const total = singleData?.PoItems?.reduce((accumulator, current) => {
      return accumulator + parseFloat(current[qty] || current[price] ? findAmount(current[qty], current[price], current[tax], current[discountType], current[disAmount]) : 0)
    }, 0)
    return parseFloat(total)
  }
  return (
    <>

      <PageWrapper heading={"ORDER"} singleData={singleData} DeliveryNo={"CuttingOrder.No :"} DeliveryDate={"CuttingOrder.Date :"} >

        <View style={styles.container}>
    
        <View style={tw("flex gap-y-3 p-2")}>

<View style={tw("flex flex-row justify-start w-full  ")} >
    <View style={tw("flex flex-row gap-x-2 w-1/2 -ml-1")}>
        <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}> Order No : </Text>
        <Text style={tw("text-xs")}>  {singleData?.docId || ""} </Text>
    </View>
    <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1")}>
        <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Customer :</Text>
        <Text style={tw("text-xs")}>{singleData?.Party?.name}</Text>
    </View>
</View>


<View style={tw("flex flex-row  justify-start w-full ")} >

    <View style={tw("flex flex-row gap-x-2 w-1/2")}>
        <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Phone No :  </Text>
        <Text style={tw("text-xs")}>{singleData?.phone || 'N/A'}</Text>
    </View>
    <View style={tw("flex flex-row gap-x-2 w-1/2")}>
        <Text style={[tw("text-xs font-bold "), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Con.person Name :</Text>
        <Text style={tw("text-xs")}>{singleData?.contactPersonName}</Text>
    </View>
</View>
<View style={tw("flex flex-row  justify-start w-full  ")} >
<View style={tw("flex flex-row gap-x-2 w-1/2")}>
        <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Delivery date :</Text>
        <Text style={tw("text-xs")}>{moment(singleData?.validDate).format("DD-MM-YYYY") || ""} </Text>
    </View>


    <View style={tw("flex flex-row gap-x-2 w-1/2")}>
    <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Address :</Text>
    <Text style={tw("text-xs")}>{singleData?.address} </Text>
    </View>

    </View>
    <View style={tw("flex flex-row  justify-start w-full  ")} >
 

  

    </View>
          </View>

          <View style={styles.divider} />
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              {(singleData?.transType === "Accessory"
                ? [
                  "S.No",
                  "Accessory Group",
                  "Accessory Item",
                  "Alias Name",
                  "Color",
                  "Size",
                  "UOM",
                  "Qty",
                  "stockPrice",
                  "Total",
                  "Tax",
                  "Discount Type",
                  "Discount Value",
                  "Final Amount",
                ]
                : [
                  "S.No",
                  "Type of Uniform",
                  "ItemType",
                  "Class",
                  "Male Item",
                  "Male Color",
                  "Male No.of.Set",
                  "Female Item",
                  "Female Color",
                  "Female No.of.Set",

                ]
              ).map((header, index) => (
                <Text key={index} style={styles.headerCell}>{header}</Text>
              ))}
            </View>

            {/* Table Rows */}
            {(tempOrderDetails || []).map((item, index, self) => (
              <View key={index} style={[styles.tableRow, index % 2 !== 0 && styles.tableRowOdd]}>
                {(singleData?.singleData?.transType === "Accessory"
                  ? [
                    parseInt(index) + 1,
                    item?.ItemType?.name,
                    item?.orderDetailsSubGrid?.map(item => item.uniformType),
                    item?.Accessory?.aliasName,
                    item?.Color?.name,
                    item?.Size?.name,
                    item?.Uom?.name,
                    item?.qty,
                    item?.price,
                    (parseFloat(item?.qty) * parseFloat(item?.price)).toFixed(2),
                    item?.tax,
                    item?.discountType,
                    item?.discountValue,
                    findAmount(item.qty, item.price, item.tax, item.discountType, item.discountAmount),
                  ]
                  : [
                    parseInt(index) + 1,
                    item?.typeOfUniform,
                    item?.itemType,
                    item?.classIds,
                    item?.maleItem,
                    item?.maleColor ? item?.maleColor : item?.maleColorIds,
                    item?.maleSet,
                    item?.femaleItem,
                    item?.femaleColor ? item?.femaleColor : item?.femaleColorsIds,
                    item?.femaleSet,


                  ]
                ).map((cell, i) => (
                  <Text key={i} style={{ ...styles.tableCell, ...tw(" w-28 ") }}>{cell || "N/A"}</Text>
                ))}
              </View>
            ))}
            {/* <View style={styles.totalRow}>
              {[...Array(singleData?.transType === "Accessory" ? 5 : 8)].map((_, i) => (
                <Text key={i} style={styles.totalCell}></Text>
              ))}

              <Text style={styles.totalCell}>Total:</Text>

              <Text style={styles.totalCell}></Text>
              <Text style={styles.totalCell}></Text>
              <Text style={styles.totalCell}></Text>
              <Text style={styles.totalCell}></Text>
              <Text style={styles.totalCell}></Text>
              <Text style={styles.totalCell}>{getTotals("delQty").toFixed(3)}</Text>
            
            </View> */}

          </View>



        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business!</Text>
          <Text style={styles.footerText}>Contact us:  iKnits@gmail.com</Text>
        </View>
      </PageWrapper>

    </>
  )
}

