import React from 'react';
import { Document, Page, Text, View, Image, Font } from '@react-pdf/renderer';
import tw from '../../../Utils/tailwind-react-pdf';
import { findFromList, getDateFromDateTimeToDisplay, substract } from '../../../Utils/helper';
import { COMPANY_NAME } from '../../../Constants';
import { DOCID } from '../../../Constants';
import Page2 from './Page2';
import moment from 'moment';
import numWords from 'num-words';

import buildingLogo from "../../../assets/logo-universal.png"
import headerBg from "../../../assets/h.jpg";

const PrintFormat = ({ data, isDrawingWeight, isIgst, stateList, quoteVersion, party, shippingAddress }) => {
    const items = data?.DeliveryNoteGroupedDetails || [];
    const totalWeight = items.reduce((a, groupItem) => a + (
        (parseFloat(isDrawingWeight ? (groupItem?.items.reduce((a, c) => a + parseFloat(c.weight), 0)) : (groupItem?.physical_weight)) * parseFloat(groupItem?.items.reduce((a, c) => a + parseFloat(c.qty), 0)))
    ), 0);
    const totalQty = items.reduce((a, c) => a + parseFloat(c?.items.reduce((a, c) => a + parseFloat(c.qty), 0)), 0);
    Font.register({
        family: "Roboto",
        fonts: [
            {
                src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf", // Regular
            },

        ],
    });
    const calculateGst = (index) => {
        let quoteData = data?.QuotesItems
        return quoteData[index]["taxPercent"]?.replace("%", "")

    }
    const calGst = (id) => {
        let taxPercent = data?.QuotesItems?.find(val => parseInt(val.id) === parseInt(id))?.taxPercent

        return taxPercent.replace("%", "")

    }

    console.log(data, 'item?.Product?.name')

    function findTaxableAmount() {
        return data?.QuotesItems?.reduce((a, b) => a + (parseInt(b.qty) * parseInt(b.price)), 0)

    }

    function findIgstAmount() {
        return data?.QuotesItems?.reduce((a, b) => a + ((parseFloat(b.qty) * parseFloat(b.price)) * (calGst(b.id) / 100)), 0)

    }
    const amount = parseFloat(findTotalAmount()).toFixed(2);

    let amountInWords = "";
    try {
        const roundedAmount = Math.round(parseFloat(amount)); // ✅ Ensure it's a real number
        if (!Number.isFinite(roundedAmount)) {
            throw new Error("Amount is not a valid number");
        }
        if (roundedAmount > 999999999) {
            throw new Error("Amount too large");
        }
        amountInWords = numWords(roundedAmount).toUpperCase();
    } catch (e) {
        console.error("Failed to convert number to words:", e.message);
        amountInWords = "AMOUNT TOO LARGE TO DISPLAY";
    }


    function findCgstAmount() {
        return data?.QuotesItems?.reduce((a, b) => a + ((parseFloat(b.qty) * parseFloat(b.price)) * ((calGst(b.id) / 2) / 100)), 0)

    }

    function findTotalAmount() {
        const transportCost = parseFloat(data?.transportCost) || 0;
        const transportTax = data?.transportTax && data?.transportCost
            ? (parseFloat(data.transportTax) * transportCost) / 100
            : 0;

        const itemsTotal = data.QuotesItems?.filter(item => item.quoteVersion == quoteVersion)
            ?.reduce((total, item) => {
                const qty = parseFloat(item.qty) || 0;
                const price = parseFloat(item.price) || 0;
                const discount = parseFloat(item?.discount || 0);
                const gst = calGst(item.id) / 100;

                const itemTotal = (qty * price) - discount + (qty * price * gst);
                return total + itemTotal;
            }, 0) || 0;

        return itemsTotal + transportCost + transportTax;
    }

    console.log(party, 'party');
    console.log(data, '96');

    return (
        <Document style={tw("w-full h-full")}>
            <Page
                size="A4"
                style={{
                    fontFamily: "Roboto",
                    ...tw("relative pb-[50px] px-8 border border-gray-300"),
                }}
            >
                <Image
                    source={headerBg}
                    style={{
                        marginLeft: 20,
                        width: '100%',
                        height: 130,
                        position: "absolute",
                        top: 20,
                        left: 2,
                        zIndex: 100,
                    }}
                />
                <View style={tw("flex flex-row justify-between  items-center relative z-100")}>
                    <View style={tw("flex-1 mt-12 ml-3 ")}>
                        <Image
                            source={buildingLogo}
                            style={{ width: 70, height: 50, marginLeft: 15, }}
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

                                }
                            ]}
                        >
                            UNIVERSAL ASSOCIATES
                        </Text>
                        <Text
                            style={[
                                tw("    tracking-wide"),
                                {
                                    fontSize: 6,
                                    color: "white",

                                }
                            ]}
                        >
                            ARCHITECTURE. INTERIORS. STRUCTURE
                        </Text>


                    </View>

                    <View style={tw("flex-2 items-center")}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}>{COMPANY_NAME}</Text>
                    </View>
                    <View style={tw("flex-1 items-end mr-3")}>
                        <Text style={{ fontSize: 14, color: 'white' }}>{data.docId}</Text>
                    </View>
                </View>

                <View fixed style={tw("w-full  ")}>
                    <View style={tw("flex flex-row justify-between p-1 mt-3 mb-3 mt-10 ")}>
                        <View style={tw("w-2/4 gap-y-0.5")}>
                            <Text
                                style={[
                                    tw(
                                        "text-gray-900  tracking-wide"
                                    ),
                                    {
                                        fontSize: 16,
                                        fontWeight: "bold",
                                        textTransform: "uppercase",
                                        letterSpacing: 1.2,

                                    },
                                ]}
                            >
                                Universal Associates
                            </Text>

                            <Text style={{ fontSize: 10, marginBottom: 5 }}>
                                148 Nataraj Layout
                                15 Velamapalayam,
                                Tiruppur,{'\n'} TN (33) 641652
                            </Text>
                            <Text style={{ fontSize: 10, marginBottom: 5 }}>+919597639777</Text>
                            <Text style={{ fontSize: 10, marginBottom: 5 }}>1universalassociates@gmail.com</Text>
                            <View style={tw("flex flex-row gap-x-2 ")}>
                                <Text style={[tw("font-bold"), { fontSize: 10, fontWeight: 900, fontFamily: "Times-Bold" }]}>GSTIN :</Text>
                                <Text style={{ fontSize: 10, marginBottom: 3 }}> 33BIIPS8122C1ZF</Text>

                            </View>
                            <View style={tw("flex flex-row gap-x-2 ")}>
                                <Text style={[tw("font-bold"), { fontSize: 10, fontWeight: 900, fontFamily: "Times-Bold" }]}>Website:</Text>
                                <Text style={{ fontSize: 10, marginBottom: 3 }}> universalassociates.co.in</Text>

                            </View>
                            <View style={tw("flex flex-row gap-x-2 ")}>
                                <Text style={[tw("font-bold"), { fontSize: 10, fontWeight: 900, fontFamily: "Times-Bold" }]}>Contact Name:</Text>
                                <Text style={{ fontSize: 10, marginBottom: 3 }}> Universal Associates</Text>

                            </View>

                        </View>
                        <View style={tw("flex flex-row justify-end w-1/2 mt-1")}>
                            <View style={tw("w-1/2 gap-y-2")}>
                                <Text style={{ fontSize: 10 }}>Issue Date:</Text>
                                <Text style={{ fontSize: 10 }}>Valid Until:</Text>
                                <Text style={{ fontSize: 10 }}>Place of Supply:</Text>
                            </View>
                            <View style={tw("w-1/3  gap-y-2")}>
                                <Text style={{ fontSize: 10 }}>{moment(data?.createdAt).format("YYYY-MM-DD")}</Text>
                                <Text style={{ fontSize: 10 }}>{moment(data?.validDate).format("YYYY-MM-DD")}</Text>
                                <Text style={{ fontSize: 10 }}>{findFromList(data?.placeOfSupplyId, stateList?.data, "name")}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={tw("w-full")}>
                    <View style={tw("flex flex-row justify-between")}>
                        <View style={tw("w-2/4")}>
                            <Text
                                style={[
                                    tw("text-black text-center p-2 "),
                                    {
                                        fontSize: 12,
                                        backgroundColor: "#F7C252",
                                        fontWeight: "bold",
                                        elevation: 2,
                                        shadowColor: "#000",
                                        shadowOffset: { width: 1, height: 1 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3
                                    }
                                ]}
                            >
                                BILL TO
                            </Text>


                            <Text style={[tw("text-gray-800"), { fontSize: 10 }]}>
                                {party.name}
                            </Text>
                            <Text style={{ fontSize: 10, marginBottom: 5 }}>
                                {party.address.split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                    .join(' ')}{" "}
                            </Text>
                            <Text style={{ fontSize: 10, marginBottom: 5 }}>
                                PinCode: {party.pincode}{" "}
                            </Text>

                            <Text style={{ fontSize: 10, marginBottom: 5 }}>
                                Contact: {party.contactMobile}{" "}
                            </Text>
                            <Text style={{ fontSize: 10, marginBottom: 5 }}>
                                GSTIN: {party.gstNo}{" "}
                            </Text>
                        </View>


                        <View style={tw("w-2/4 ")}>
                            <Text
                                style={[
                                    tw("text-black text-center p-2 "),
                                    {
                                        fontSize: 12,
                                        backgroundColor: "#333134",
                                        fontWeight: "bold",
                                        elevation: 2,
                                        shadowColor: "#000",
                                        shadowOffset: { width: 1, height: 1 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                        color: "white"
                                    }
                                ]}
                            >
                                SHIP TO
                            </Text>
                            <Text style={[tw("text-gray-800"), { fontSize: 10 }]}>
                                {party.name}
                            </Text>
                            <Text style={{ fontSize: 10, marginBottom: 5 }}>
                                {shippingAddress.split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                    .join(' ')}{" "}
                            </Text>
                            <Text style={{ fontSize: 10, marginBottom: 5 }}>
                                PinCode: {party.pincode}{" "}
                            </Text>

                            <Text style={{ fontSize: 10, marginBottom: 5 }}>
                                Contact: {party.contactMobile}{" "}
                            </Text>
                            <Text style={{ fontSize: 10, marginBottom: 5 }}>
                                GSTIN: {party.gstNo}{" "}
                            </Text>
                        </View>
                    </View>
                </View>
                <View fixed style={[tw("w-full text-sm capitalize text-white border border-gray-300 text-center flex flex-row h-8"), { backgroundColor: "#333134" }]}>
                    <View style={tw("flex justify-center items-center w-[32%] border-r border-gray-300")}>
                        <Text style={tw("font-semibold text-sm capitalize text-[10px]")}>Item Description</Text>
                    </View>
                    <View style={tw("flex justify-center items-center w-[8%] border-r border-gray-300")}>
                        <Text style={tw("font-semibold capitalize text-[10px]")}>Qty</Text>
                    </View>

                    <View style={tw("flex justify-center items-center w-[8%] border-r border-gray-300")}>
                        <Text style={tw("font-semibold capitalize text-[10px]")}>UOM</Text>
                    </View>

                    <View style={tw("flex justify-center items-center w-[13%] border-r border-gray-300")}>
                        <Text style={tw("font-semibold capitalize text-[10px]")}>Price </Text>
                    </View>

                    <View style={tw("flex justify-center items-center w-[13%] border-r border-gray-300")}>
                        <Text style={tw("font-semibold capitalize text-[10px]")}>Tax Value </Text>
                    </View>

                    {isIgst ? (
                        <View style={tw("flex justify-center items-center w-[13%] border-r border-gray-300")}>
                            <Text style={tw("font-semibold capitalize text-[10px]")}>IGST </Text>
                        </View>
                    ) : (
                        <>
                            <View style={tw("flex justify-center items-center w-[13%] border-r border-gray-300")}>
                                <Text style={tw("font-semibold capitalize text-[10px]")}>CGST </Text>
                            </View>
                            <View style={tw("flex justify-center items-center w-[13%] border-r border-gray-300")}>
                                <Text style={tw("font-semibold capitalize text-[10px]")}>SGST </Text>
                            </View>
                        </>
                    )}

                    {/* Amount Column */}
                    <View style={tw("flex justify-center items-center w-[12%] border-r border-gray-300")}>
                        <Text style={tw("font-semibold capitalize text-[10px]")}>Amount </Text>
                    </View>
                </View>

                {data?.QuotesItems.map((item, index) =>
                    <View
                        key={index}
                        style={tw(
                            `w-full text-xs border-x text-[10px] border-b border-gray-300 text-center flex flex-row ${index % 2 === 0 ? "bg-gray-100" : "bg-white"
                            }`
                        )}
                    >
                        <View wrap={false} style={tw("flex flex-col py-2 border-r border-gray-300 w-[32%] space-y-3")}>

                            <Text style={tw("text-sm font-bold text-sky-800")} numberOfLines={2} ellipsizeMode="tail">
                                {item?.Product?.name
                                    .split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                    .join(' ')}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 10,
                                    color: "black",
                                    padding: 3,
                                    textAlign: "justify",
                                    letterSpacing: 0.7,
                                    wordSpacing: 3,
                                    lineHeight: 1.2,

                                }}
                            >
                                {item?.description}
                            </Text>



                        </View>
                        <View style={tw("border-r border-gray-300 border-r justify-around text-right px-1  w-[8%]")}>
                            <Text>
                                {item?.qty}
                            </Text>
                        </View>
                        <View style={tw(" border-r border-gray-300 justify-center text-left px-1 w-[8%]")}>
                            <Text>
                                {item?.Uom?.name}
                            </Text>
                        </View>
                        <View style={tw(" border-r border-gray-300 justify-center text-right px-1 w-[13%]")}>
                            <Text>
                                {new Intl.NumberFormat('en-IN', {
                                    style: 'currency',
                                    currency: 'INR',
                                }).format(parseFloat(item?.price))}
                            </Text>
                        </View>
                        <View style={tw(" border-r border-gray-300 justify-center  text-right px-1 w-[13%]")}>
                            <Text>
                                {(!item.qty || !item.price)
                                    ? "₹0"
                                    : new Intl.NumberFormat('en-IN', {
                                        style: 'currency',
                                        currency: 'INR',
                                    }).format(parseFloat(item.qty) * parseFloat(item.price))}
                            </Text>

                        </View>

                        {
                            isIgst ?
                                <View style={tw(" border-r border-gray-300 justify-center text-right px-1 w-[13%]")}>

                                    <Text>
                                        {(!item.qty || !item.price) ? 0 : parseFloat(((parseFloat(item.qty) * parseFloat(item.price)) * (calculateGst(index) / 100))).toFixed(2) || 0}
                                    </Text>
                                </View>
                                :
                                <>
                                    <View style={tw(" border-r border-gray-300 justify-center text-right px-1 w-[13%]")}>


                                        <Text>
                                            {(!item.qty || !item.price)
                                                ? "₹0"
                                                : new Intl.NumberFormat('en-IN', {
                                                    style: 'currency',
                                                    currency: 'INR',
                                                }).format(
                                                    parseFloat(item.qty) * parseFloat(item.price) * (calculateGst(index) / 2) / 100
                                                )}
                                        </Text>


                                    </View>
                                    <View style={tw(" border-r border-gray-300 justify-center text-right px-1 w-[13%]")}>

                                        <Text>
                                            {(!item.qty || !item.price)
                                                ? "₹0"
                                                : new Intl.NumberFormat('en-IN', {
                                                    style: 'currency',
                                                    currency: 'INR',
                                                }).format(
                                                    parseFloat(
                                                        ((parseFloat(item.qty) * parseFloat(item.price)) *
                                                            ((calculateGst(index) / 2) / 100))
                                                    ) || 0
                                                )}
                                        </Text>

                                    </View>
                                </>


                        }


                        <View style={tw(" border-r border-gray-300 justify-center text-right px-1 w-[12%]")}>
                            <Text>
                                {(!item.qty || !item.price)
                                    ? "₹0"
                                    : new Intl.NumberFormat('en-IN', {
                                        style: 'currency',
                                        currency: 'INR',
                                    }).format(
                                        parseFloat(
                                            substract(
                                                parseFloat(item.qty) * parseFloat(item.price),
                                                parseFloat(item?.discount || 0)
                                            ) +
                                            (parseFloat(item.qty) * parseFloat(item.price)) *
                                            (calculateGst(index) / 100)
                                        ) || 0
                                    )}
                            </Text>

                        </View>
                    </View>
                )}
                <View style={[tw("w-full text-sm border-x text-black font-bold  border-b border-gray-300 text-center flex flex-row h-[20px]"), { backgroundColor: "#F7C252", }]}>
                    <View style={tw("flex flex-row border-r border-gray-300 justify-center items-center w-[64%]")}>
                        <Text>
                            Total @ 0%
                        </Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-300 justify-end items-center w-[13%]")}>
                        <Text>
                            {parseFloat(findTaxableAmount()).toFixed(2)}
                        </Text>
                    </View>

                    {
                        isIgst ?

                            <View style={tw("flex flex-row border-r border-gray-300 justify-end items-center w-[12%]")}>
                                <Text>
                                    {parseFloat(findIgstAmount()).toFixed(2)}
                                </Text>
                            </View>
                            :
                            <>
                                <View style={tw("flex flex-row border-r border-gray-300 justify-end items-center w-[8%]")}>
                                    <Text>
                                        {parseFloat(findCgstAmount()).toFixed(2)}
                                    </Text>
                                </View>
                                <View style={tw("flex flex-row border-r border-gray-300 justify-end items-center w-[8%]")}>
                                    <Text>
                                        {parseFloat(findCgstAmount()).toFixed(2)}
                                    </Text>
                                </View>
                            </>

                    }


                    <View style={tw("flex flex-row border-r border-gray-300 justify-end items-center w-[12%]")}>
                        <Text>
                            <Text>
                                {new Intl.NumberFormat('en-IN', {
                                    style: 'currency',
                                    currency: 'INR',
                                }).format(parseFloat(findTotalAmount()))}
                            </Text>

                        </Text>
                    </View>

                </View>


                <View style={[tw("w-full align-center text-white p-1 mt-10"), { backgroundColor: "#333134", }]}>
                    <Text style={{ fontSize: 10, textAlign: 'left' }}>
                        AMOUNT IN WORDS: {amountInWords} RUPEES
                    </Text>
                </View>
                <View style={tw("w-full bg-gray-100 p-5 rounded-lg shadow-md")}>
                    <View style={tw("flex flex-row justify-between pb-10 pt-5")}>
                        <View style={tw("w-1/2 pr-3 bg-yellow-100 p-3 rounded-lg border border-gray-200")}>
                            <Text style={[tw("font-bold text-gray-800 mb-2"), { fontSize: 10, textDecoration: "underline" }]}>Bank Details</Text>

                            <View style={tw("flex flex-row justify-between mb-2")}>
                                <Text style={{ fontSize: 10 }}>Bank Name:</Text>
                                <Text style={tw("text-gray-800 font-medium text-[10px]")}>Karur Vysya Bank</Text>
                            </View>

                            <View style={tw("flex flex-row justify-between mb-2")}>
                                <Text style={{ fontSize: 10 }}>Account Number:</Text>
                                <Text style={tw("text-gray-800 font-medium text-[10px]")}>1779135000004779</Text>
                            </View>

                            <View style={tw("flex flex-row justify-between mb-2")}>
                                <Text style={{ fontSize: 10 }}>Branch Name:</Text>
                                <Text style={tw("text-gray-800 font-medium text-[10px]")}>Velampalayam</Text>
                            </View>

                            <View style={tw("flex flex-row justify-between")}>
                                <Text style={{ fontSize: 10 }}>IFSC Code:</Text>
                                <Text style={tw("text-gray-800 font-medium text-[10px]")}>KVBL0001779</Text>
                            </View>
                        </View>

                        <View style={tw("w-1/2 bg-gray-100 p-5 rounded-lg border border-gray-200 shadow-sm")}>
                            <Text style={[tw("font-bold text-gray-800 mb-2"), { fontSize: 10, textDecoration: "underline" }]}>Totals</Text>

                            <View style={tw("flex flex-row justify-between")}>

                                <View style={tw("w-1/2 pr-4")}>
                                    <Text style={{ fontSize: 10, marginBottom: 5 }}>Total Taxable Value</Text>
                                    <Text style={{ fontSize: 10, marginBottom: 5 }}>Total Tax Amount</Text>
                                    <Text style={{ fontSize: 10, marginBottom: 5 }}>Transport Charge</Text>
                                    <Text style={{ fontSize: 10, marginBottom: 5 }}>Transport Tax</Text>

                                    <Text style={{ fontSize: 10, marginBottom: 5 }}>Total Value (in figure)</Text>
                                </View>

                                <View style={tw("w-1/2")}>
                                    <Text style={[tw("text-gray-800 font-semibold"), { fontSize: 10, marginBottom: 5 }]}>
                                        {new Intl.NumberFormat('en-IN', {
                                            style: 'currency',
                                            currency: 'INR',
                                        }).format(parseFloat(findTaxableAmount()))}
                                    </Text>
                                    <Text style={[tw("text-gray-800 font-semibold"), { fontSize: 10, marginBottom: 5 }]}>
                                        {parseFloat(findIgstAmount()).toFixed(2)}
                                    </Text>
                                    <Text style={[tw("text-gray-800 font-semibold"), { fontSize: 10, marginBottom: 5 }]}>
                                        {parseFloat(data?.transportCost).toFixed(2)}
                                    </Text>
                                    <Text style={[tw("text-gray-800 font-semibold"), { fontSize: 10, marginBottom: 5 }]}>
                                        {data?.transportTax && data?.transportCost
                                            ? `${((parseFloat(data.transportTax) * data.transportCost) / 100).toFixed(2)}`
                                            : parseFloat(0).toFixed(2)}
                                    </Text>



                                    <Text style={[tw("text-gray-800 font-semibold"), { fontSize: 10, marginBottom: 5 }]}>
                                        <Text>
                                            {new Intl.NumberFormat('en-IN', {
                                                style: 'currency',
                                                currency: 'INR',
                                            }).format(parseFloat(findTotalAmount()))}
                                        </Text>
                                    </Text>

                                </View>
                            </View>
                        </View>



                    </View>
                </View>

                <View fixed style={tw("absolute bottom-5")}>
                    <View style={tw("text-center w-full pb-1 pt-1 px-2 text-xs ")}>
                        <Text render={({ pageNumber, totalPages }) => (
                            `Page ${pageNumber} / ${totalPages}`
                        )} fixed />
                    </View>
                </View>

            </Page>
            <Page2 />
        </Document>
    );
};

export default PrintFormat;