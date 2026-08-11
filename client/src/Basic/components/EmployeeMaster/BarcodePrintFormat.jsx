import React, { useEffect, useState } from "react";
import { Document, Page, View, Text, PDFViewer, Image } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import QRCode from "qrcode";

const mmToPt = (mm) => (mm / 25.4) * 72; // mm → pt
const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const QRCodeImage = ({ value, width, height }) => {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (!value) {
      setSrc("");
      return () => {
        isMounted = false;
      };
    }

    QRCode.toDataURL(value, {
      margin: 1,
      width: 320,
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
  noOfStickers,
  labelConfig = {
    labelWidth: 50,
    labelHeight: 25,
    stickersPerRow: 2,
    horizontalGap: 1,
    verticalGap: 1,
    qrCount: 3,
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
    qrCount = 3,
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
                  flexDirection: "row",
                  justifyContent: "space-around",
                  alignItems: "center",
                  paddingHorizontal: 2,
                  border: "1px solid #ccc", // debug
                }}
              >
                {Array.from({ length: qrCount }).map((_, qrIndex) => (
                  <View
                    key={`${code.barCode}-${qrIndex}`}
                    style={{
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 5.5, textAlign: "center" }}>
                      WALRUS
                    </Text>

                    <QRCodeImage
                      value={`${code.barCode}`}
                      width={Math.min((labelWidthPt / qrCount) * 0.7, 26)}
                      height={Math.min(labelHeightPt * 0.45, 26)}
                    />

                    <Text style={{ fontSize: 5.5, textAlign: "center" }}>
                      {code.barCode}
                    </Text>

                    <Text style={{ fontSize: 5.5, textAlign: "center" }}>
                      {code.itemName}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </Page>
        ))}
      </Document>
    </PDFViewer>
  );
};

export default BarCodePrintFormat;
