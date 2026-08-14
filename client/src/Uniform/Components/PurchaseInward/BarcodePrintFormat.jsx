import React, { useEffect, useState } from "react";
import { Document, Page, View, Text, PDFViewer, Font, Image } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import BarcodeGenerator from "../BarcodeGenerator";
import QRCode from "qrcode";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { findFromList } from "../../../Utils/helper";
import secureLocalStorage from "react-secure-storage";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";

// Register Arial Narrow / Narrow Condensed Font for Barcode Print
Font.register({
  family: "Arial Narrow",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/pt-sans-narrow/files/pt-sans-narrow-latin-400-normal.woff",
      fontWeight: "normal",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/pt-sans-narrow/files/pt-sans-narrow-latin-700-normal.woff",
      fontWeight: "bold",
    },
  ],
});

const mmToPt = (mm) => (mm / 25.4) * 72; // mm → pt
const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const QRCodeImage = ({ value, width = 40, height = 40 }) => {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let isMounted = true;
    if (!value) {
      setSrc("");
      return () => {
        isMounted = false;
      };
    }

    QRCode.toDataURL(String(value), {
      margin: 1,
      width: 200,
      color: { dark: "#000000", light: "#FFFFFF" },
    })
      .then((dataUrl) => {
        if (isMounted) {
          setSrc(dataUrl);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSrc("");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value]);

  if (!src) return null;

  return <Image src={src} style={{ width, height }} />;
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
    if (!itemPriceList?.data || !itemId) return null;
    const found = itemPriceList.data.find(item =>
      String(item.itemId) === String(itemId) &&
      String(item.sizeId) === String(sizeId) &&
      (colorId ? String(item.colorId) === String(colorId) : !item.colorId)
    );

    if (found) {
      const regularBarcode = found.ItemBarcodes?.find(b => b.barcodeType === "REGULAR")?.barcode ||
        found.ItemBarcodes?.[0]?.barcode ||
        found.barcode || "";
      return { ...found, barcode: regularBarcode };
    }
    return null;
  };


  const allBarcodes = data?.flatMap((item) => {
    const priceRow = getBarcodeFromList(item.itemId, item.sizeId, item.colorId);
    return Array.from({ length: parseInt(item?.qty || 0) }, () => ({
      barCode: priceRow?.barcode || item?.barcode || item?.barCode || "",
      code: findFromList(item.itemId, itemList?.data, "code"),
      itemName: item?.itemName || findFromList(item.itemId, itemList?.data, "name") || "",
      sizeName: item?.sizeName || findFromList(item.sizeId, sizeList?.data, "name") || "",
      price: Math.trunc(item?.salesPrice) || Math.trunc(item?.price || 0),
      isLegacy: item?.isLegacy
    }));
  });

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
  console.log(data, "data")

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
                  paddingLeft: 4,
                  paddingRight: 12, // Space for right pre-printed WALRUS logo
                  paddingVertical: 2,
                  fontFamily: "Arial Narrow",
                }}
              >
                <Text style={{ fontSize: 7, textAlign: "center", fontWeight: "bold" }}>
                  WALRUS
                </Text>

                {code.isLegacy ? (
                  <>
                    <BarcodeGenerator
                      value={`${code.barCode}`}
                      width={labelWidthPt * 0.50}
                      height={labelHeightPt * 0.30}
                    />

                    <Text style={{ fontSize: 7.5, textAlign: "center", marginTop: 1, fontWeight: "bold" }}>
                      {code.barCode}
                    </Text>

                    <Text style={{ fontSize: 7.5, textAlign: "center", maxLines: 1, textOverflow: "ellipsis", fontWeight: "bold" }}>
                      {code.itemName}
                    </Text>

                    <Text style={{ fontSize: 7.5, textAlign: "center", fontWeight: "bold" }}>
                      Sale Price {code.price}
                    </Text>
                  </>
                ) : (
                  <>
                    <QRCodeImage
                      value={`${code.barCode}`}
                      width={labelHeightPt * 0.40}
                      height={labelHeightPt * 0.30}
                    />

                    <Text style={{ fontSize: 7.5, textAlign: "center", marginTop: 1, fontWeight: "bold" }}>
                      {code.barCode}
                    </Text>

                    <Text style={{ fontSize: 7.5, textAlign: "center", maxLines: 1, textOverflow: "ellipsis", fontWeight: "bold" }}>
                      {code.itemName} {" "} {code.sizeName ? ` ${code.sizeName}` : ''}
                    </Text>



                    <Text style={{ fontSize: 7.5, textAlign: "center", fontWeight: "bold" }}>
                      Sale Price {code.price}
                    </Text>
                  </>
                )}
              </View>
            ))}
          </Page>
        ))}
      </Document>
    </PDFViewer>
  );
};

export default BarCodePrintFormat;

