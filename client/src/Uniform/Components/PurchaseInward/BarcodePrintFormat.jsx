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
  itemPriceList,
  labelConfig = {
    labelWidth: 50,
    labelHeight: 25,
    stickersPerRow: 2,
    horizontalGap: 1,
    verticalGap: 1,
  },
}) => {


  const getBarcodeFromList = (itemId, sizeId, colorId) => {
    if (!itemPriceList?.data || !itemId || !sizeId) return null;
    return itemPriceList.data.find(item =>
      String(item.itemId) === String(itemId) &&
      String(item.sizeId) === String(sizeId) &&
      (colorId ? String(item.colorId) === String(colorId) : !item.colorId)
    );
  };


  const allBarcodes = data?.flatMap((item) =>
    Array.from({ length: parseInt(item?.qty || 0) }, () => ({
      barCode: getBarcodeFromList(item.itemId, item.sizeId, item.colorId)?.barcode,
      code: findFromList(item.itemId, itemList?.data, "code"),
      itemName: findFromList(item.itemId, itemList?.data, "name"),
      sizeName: findFromList(item.sizeId, sizeList?.data, "name"),
      price: getBarcodeFromList(item.itemId, item.sizeId, item.colorId)?.salesPrice
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

                <Text style={{ fontSize: 7 }}>
                  Sale Price {code.price}
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
