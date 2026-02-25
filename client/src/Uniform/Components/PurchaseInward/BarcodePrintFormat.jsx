import React, { useEffect } from "react";
import { Document, Page, View, Text, PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import BarcodeGenerator from "../BarcodeGenerator";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { findFromList } from "../../../Utils/helper";
import secureLocalStorage from "react-secure-storage";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";

const mmToPt = (mm) => (mm / 25.4) * 72; // mm → pt
const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const BarCodePrintFormat = ({
  data,
  sizeList,
  itemList,
  labelConfig = {
    labelWidth: 45, // mm
    labelHeight: 30, // mm
    stickersPerRow: 2,
    horizontalGap: 1, // mm
    verticalGap: 1, // mm
  },
}) => {
  console.log(data, "Barcode data")
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };



  // 🔁 Generate labels per quantity
  const allBarcodes = data.flatMap((item) =>
    Array.from({ length: parseInt(item?.qty || 0) }, () => ({
      barCode: item.barCode,
      code: findFromList(item.itemId, itemList?.data, "code"),
      itemName: findFromList(item.itemId, itemList?.data, "name"),
      sizeName: findFromList(item.sizeId, sizeList?.data, "name"),
      price : item.price
    }))
  );

  const {
    labelWidth,
    labelHeight,
    stickersPerRow,
    horizontalGap,
    verticalGap,
  } = labelConfig;

  const labelWidthPt = mmToPt(labelWidth);
  const labelHeightPt = mmToPt(labelHeight);
  const gapX = mmToPt(horizontalGap);
  const gapY = mmToPt(verticalGap);

  const pageWidthPt =
    labelWidthPt * stickersPerRow + gapX * (stickersPerRow - 1);
  const pageHeightPt = labelHeightPt;

  const rows = chunkArray(allBarcodes, stickersPerRow);

  return (
    <PDFViewer style={tw("w-full h-full")}>
      <Document>
        {rows.map((row, rowIndex) => (
          <Page
            key={rowIndex}
            size={{ width: pageWidthPt, height: pageHeightPt }}
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              padding: 0,
              gap: gapX,
            }}
          >
            {row.map((code, i) => (
              <View
                key={i}
                style={{
                  width: labelWidthPt,
                  height: labelHeightPt,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 7,
                    marginTop: 1,
                    textAlign: "center",
                  }}
                >
                  WALRUS
                </Text>

                {/* 🧾 Barcode */}
                <BarcodeGenerator
                  value={`${code.code}${code.sizeName}`}
                  width={labelWidthPt * 0.85}
                  height={labelHeightPt * 0.45}
                />

                <Text
                  style={{
                    fontSize: 7,
                    marginTop: 1,
                    textAlign: "center",
                  }}
                >
                  {code.code ? code.code : ""}{code.sizeName ? `${code.sizeName}` : ""}
                </Text>
                <Text
                  style={{
                    fontSize: 7,
                    marginTop: 1,
                    textAlign: "left",
                  }}
                >
                  {code.itemName ? code.itemName : ""}
                </Text>

                {/* 📏 Size */}
                <Text
                  style={{
                    fontSize: 7,
                    marginTop: 1,
                    textAlign: "left",
                  }}
                >
                 Sale Price {code.price ? code?.price : ""}
                </Text>
              </View>
            ))}
          </Page>
        ))}
      </Document>
    </PDFViewer>
  );
};

export default BarCodePrintFormat;
