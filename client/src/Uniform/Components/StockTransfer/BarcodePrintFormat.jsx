import React, { useEffect, useState } from "react";
import { Document, Page, View, Text, PDFViewer, Font, Image } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import BarcodeGenerator from "../BarcodeGenerator";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { findFromList } from "../../../Utils/helper";
import secureLocalStorage from "react-secure-storage";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import QRCode from "qrcode";

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
  toLocationId,
  locationData,
  offersData,
  collectionsData,
  labelConfig = {
    labelWidth: 45, // mm
    labelHeight: 30, // mm
    stickersPerRow: 2,
    horizontalGap: 1, // mm
    verticalGap: 1, // mm
  },
}) => {
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };


  console.log(data, "data for stockItems")

  const allBarcodes = data?.flatMap((item) => {
    const itemObj = itemList?.data?.find((i) => parseInt(i.id) === parseInt(item.itemId));
    const priceObj = itemPriceList?.data?.find(
      (p) =>
        parseInt(p.itemId) === parseInt(item.itemId) &&
        (itemObj?.isLegacy
          ? true
          : parseInt(p.sizeId) === parseInt(item.sizeId) &&
          parseInt(p.colorId) === parseInt(item.colorId))
    );
    console.log(priceObj, "priceObj")
    const isDiscountSection = findFromList(toLocationId, locationData?.data, "storeName") === "DISCOUNT SECTION";
    const getOfferPrice = () => {
      if (!isDiscountSection) return priceObj?.salesPrice || 0;

      const salesPrice = parseFloat(priceObj?.salesPrice || 0);
      const applicableOffer = offersData?.data?.find(offer => {
        if (!offer.applyToClearance) return false;
        if (offer.scopeMode === 'Global') return true;

        return offer.OfferScope?.some(scope => {
          const type = String(scope.type).toLowerCase();
          if (type === 'item' && parseInt(scope.refId) === parseInt(item.itemId)) return true;
          if (type === 'collection') {
            const collection = collectionsData?.data?.find(c => parseInt(c.id) === parseInt(scope.refId));
            return collection?.CollectionItems?.some(ci => parseInt(ci.itemId) === parseInt(item.itemId));
          }
          return false;
        });
      });

      if (applicableOffer) {
        if (applicableOffer.discountType === 'Percentage') {
          return salesPrice * (1 - (applicableOffer.discountValue || 0) / 100);
        } else if (applicableOffer.discountType === 'Fixed') {
          return Math.max(0, salesPrice - (applicableOffer.discountValue || 0));
        } else if (['Override', 'Volume'].includes(applicableOffer.discountType)) {
          const tier = applicableOffer.OfferTier?.[0];
          if (tier) {
            if (tier.type === 'Fixed') return tier.value;
            return salesPrice * (1 - (tier.value || 0) / 100);
          }
        }
      }
      return salesPrice;
    };

    const resolvedPrice = getOfferPrice();


    return Array.from({ length: parseInt(item?.transferQty || 0) }, () => ({
      barCode: isDiscountSection ? item.clearanceBarcode : (item.barcode || item.barCode),
      code: findFromList(item.itemId, itemList?.data, "code"),
      itemName: findFromList(item.itemId, itemList?.data, "name"),
      sizeName: findFromList(item.sizeId, sizeList?.data, "name"),
      price: item.manualClearancePrice || 0,
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
  const gapY = mmToPt(verticalGap);

  const pageWidthPt =
    labelWidthPt * stickersPerRow + gapX * (stickersPerRow - 1);
  const pageHeightPt = labelHeightPt;

  const rows = chunkArray(allBarcodes, stickersPerRow);
  console.log(rows, "rows data")




  return (
    // <PDFViewer style={tw("w-full h-full")}>
    //   <Document>
    //     {rows.map((row, rowIndex) => (
    //       <Page
    //         key={rowIndex}
    //         size={{ width: pageWidthPt, height: pageHeightPt }}
    //         style={{
    //           flexDirection: "row",
    //           justifyContent: "flex-start",
    //           alignItems: "center",
    //           padding: 0,
    //           gap: gapX,
    //         }}
    //       >
    //         {row.map((code, i) => (
    //           <View
    //             key={i}
    //             style={{
    //               width: labelWidthPt,
    //               height: labelHeightPt,
    //               justifyContent: "center",
    //               alignItems: "center",
    //               fontFamily: "Arial Narrow",
    //             }}
    //           >
    //             <Text
    //               style={{
    //                 fontSize: 7,
    //                 marginTop: 1,
    //                 textAlign: "center",
    //               }}
    //             >
    //               WALRUS
    //             </Text>

    //             {/* 🧾 Barcode */}
    //             <BarcodeGenerator
    //               value={`${code.code}${code.sizeName}`}
    //               width={labelWidthPt * 0.85}
    //               height={labelHeightPt * 0.45}
    //             />

    //             <Text
    //               style={{
    //                 fontSize: 7,
    //                 marginTop: 1,
    //                 textAlign: "center",
    //               }}
    //             >
    //               {code.code ? code.code : ""}{code.sizeName ? `${code.sizeName}` : ""}
    //             </Text>
    //             <Text
    //               style={{
    //                 fontSize: 7,
    //                 marginTop: 1,
    //                 textAlign: "left",
    //               }}
    //             >
    //               {code.itemName ? code.itemName : ""}
    //             </Text>

    //             {/* 📏 Size */}
    //             <Text
    //               style={{
    //                 fontSize: 7,
    //                 marginTop: 1,
    //                 textAlign: "left",
    //               }}
    //             >
    //               Sale Price {code.price ? code?.price : ""}
    //             </Text>
    //           </View>
    //         ))}
    //       </Page>
    //     ))}
    //   </Document>
    // </PDFViewer>
    <PDFViewer style={tw("w-full h-full")}>
      <Document>
        {rows.map((page, pageIndex) => (
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
                  paddingTop: 6,
                  paddingBottom: 0,
                  fontFamily: "Arial Narrow",
                }}
              >
                {/* <Text style={{ fontSize: 7, textAlign: "center", fontWeight: "bold" }}>
                  WALRUS
                </Text> */}


                <View style={{ flexDirection: "row", alignItems: "center", width: "100%", gap: 4 }}>
                  <View style={{ flexShrink: 0 }}>
                    <QRCodeImage
                      value={`${code.barCode}`}
                      width={labelHeightPt * 0.70}
                      height={labelHeightPt * 0.70}
                    />
                  </View>
                  <View style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}>
                    <Text style={{ fontSize: 8.5, textAlign: "left", fontWeight: "bold" }}>
                      {code.barCode}
                    </Text>

                    <Text style={{ fontSize: 8.5, textAlign: "left", maxLines: 1, textOverflow: "ellipsis", fontWeight: "bold", marginTop: 1 }}>
                      {code.itemName}
                    </Text>

                    <Text style={{ fontSize: 8.5, textAlign: "left", maxLines: 1, textOverflow: "ellipsis", fontWeight: "bold", marginTop: 1 }}>
                      {code.sizeName ? `${code.sizeName} ` : ''} {code.colorName ? ` | ${code.colorName}  ` : ''}
                    </Text>

                    <Text style={{ fontSize: 10.5, textAlign: "left", fontWeight: "bold", marginTop: 1 }}>
                      Rs.{code.price} /-
                    </Text>
                  </View>
                </View>

              </View>
            ))}
          </Page>
        ))}
      </Document>
    </PDFViewer>
  );
};

export default BarCodePrintFormat;
