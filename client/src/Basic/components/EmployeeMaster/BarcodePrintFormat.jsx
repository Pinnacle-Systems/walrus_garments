import React from "react";
import { Document, Page, View, Text, PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import BarcodeGenerator from "../../../Uniform/Components/BarcodeGenerator";

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
  noOfStickers,
  labelConfig = {
    labelWidth: 50,
    labelHeight: 25,
    stickersPerRow: 2,
    horizontalGap: 1,
    verticalGap: 1,
  },
}) => {


  const allBarcodes = data?.flatMap((item) =>
    Array.from({ length: parseInt(noOfStickers || item?.qty || 1) }, () => ({
      barCode: item.employeeId,
      itemName: item.name,
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

  // ✅ Page size (ONLY 1 ROW)
  const pageWidthPt =
    labelWidthPt * stickersPerRow + gapX * (stickersPerRow - 1);

  const pageHeightPt = labelHeightPt;

  // ✅ 2 stickers per page
  const pages = chunkArray(allBarcodes, stickersPerRow);

  console.log(pages, "pages")

  return (
    <PDFViewer style={tw("w-full h-full")}>
      <Document>
        {pages.map((page, pageIndex) => (
          <Page
            key={pageIndex}
            size={{ width: pageWidthPt, height: pageHeightPt }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: gapX,
              padding: 0,
            }}
          >
            {page.map((code, i) => (
              <View
                key={i}
                style={{
                  width: labelWidthPt,
                  height: labelHeightPt,
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #ccc", // debug
                }}
              >
                <Text style={{ fontSize: 7, textAlign: "center" }}>
                  WALRUS
                </Text>

                <BarcodeGenerator
                  value={`${code.barCode}`}
                  width={labelWidthPt * 0.85}
                  height={labelHeightPt * 0.45}
                />

                <Text style={{ fontSize: 7, textAlign: "center" }}>
                  {code.barCode}
                </Text>

                <Text style={{ fontSize: 7 }}>
                  {code.itemName}
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
