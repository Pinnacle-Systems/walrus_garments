import React from 'react'
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import tw from '../../../Utils/tailwind-react-pdf'
import { findFromList, getDateFromDateTimeToDisplay, substract } from '../../../Utils/helper';
import { COMPANY_NAME } from '../../../Constants';
import { DOCID } from '../../../Constants';
import moment from 'moment';
import Page2 from '../Quotes/Page2';

const ProformaInvoice = ({ data, isDrawingWeight, isIgst, stateList }) => {
    // const items = data?.DeliveryNoteGroupedDetails || [];
    // const totalWeight = items.reduce((a, groupItem) => a + (
    //     (parseFloat(isDrawingWeight ? (groupItem?.items.reduce((a, c) => a + parseFloat(c.weight), 0)) : (groupItem?.physical_weight)) * parseFloat(groupItem?.items.reduce((a, c) => a + parseFloat(c.qty), 0)))
    // ), 0);
    // const totalQty = items.reduce((a, c) => a + parseFloat(c?.items.reduce((a, c) => a + parseFloat(c.qty), 0)), 0);


    const calculateGst = (index) => {
        let quoteData = data?.InvoiceItems
        return quoteData[index]["taxPercent"]?.replace("%", "")

    }
    const calGst = (id) => {
        let taxPercent = data?.InvoiceItems?.find(val => parseInt(val.id) === parseInt(id))?.taxPercent

        return taxPercent.replace("%", "")

    }


    function findTaxableAmount() {
        return data.InvoiceItems?.reduce((a, b) => a + (parseInt(b.qty) * parseInt(b.price)), 0)

    }

    function findIgstAmount() {
        return data?.InvoiceItems?.reduce((a, b) => a + ((parseFloat(b.qty) * parseFloat(b.price)) * (calGst(b.id) / 100)), 0)

    }

    function findCgstAmount() {
        return data?.InvoiceItems?.reduce((a, b) => a + ((parseFloat(b.qty) * parseFloat(b.price)) * ((calGst(b.id) / 2) / 100)), 0)

    }

    function findTotalAmount() {
        return data?.InvoiceItems?.reduce((a, b) => a + (substract(parseFloat(b.qty) * parseFloat(b.price), parseFloat(b?.discount || 0)) + ((parseFloat(b.qty) * parseFloat(b.price)) * (calGst(b.id) / 100))), 0)

    }


    return (
        <Document style={tw("w-full h-full")}>
            <Page size="A4" style={{ fontFamily: "Times-Roman", ...tw("relative pb-[50px] px-8") }}>
                <View fixed style={tw("w-full")}>
                    <View style={tw("flex flex-row justify-around items-center p-1")}>
                        <View style={tw("w-1/4")}>
                            <Image source={require("../../../assets/uniass.jpeg")} style={{ width: 55, height: 55 }} />

                        </View>
                        <View style={tw("w-2/4  rounded-md text-center p-2")}>
                            <Text style={{ fontSize: 16 }}>Proforma Invoice</Text>
                        </View>
                        <View style={tw("w-1/4")}>
                            <Text style={{ fontSize: 16 }}>{DOCID}</Text>
                        </View>
                    </View>
                </View>


                <View style={tw("flex flex-row justify-between   w-full")}>

                    <View style={tw("w-1/2  rounded-md text-center p-2")}>
                        {/* <Text style={[tw("text-sky-800"), { fontSize: 16, fontWeight: "bold", }]}>Universal Associates</Text> */}
                    </View>
                    <View style={tw("w-1/2 bg-sky-800 text-white pt-1")}>
                        <View style={tw("flex flex-row justify-around")}>
                            <Text style={{ fontSize: 16 }}>Amount Due :</Text>
                            <Text style={{ fontSize: 16 }}>  {parseFloat(findTotalAmount()).toFixed(2)}</Text>

                        </View>
                    </View>
                </View>


                <View fixed style={tw("w-full")}>
                    <View style={tw("flex flex-row justify-between p-1")}>
                        <View style={tw("w-2/4 -mt-5 gap-y-0.5")}>
                            <Text style={[tw("text-sky-800"), { fontSize: 16, fontWeight: "bold", }]}>Universal Associates</Text>

                            <Text style={{ fontSize: 10, marginBottom: 5 }}>
                                148 Nataraj Layout
                                15 Velamapalayam,
                                Tiruppur,{'\n'} TN (33) 641652
                            </Text>
                            <Text style={{ fontSize: 10, marginBottom: 5 }}>+919597639777</Text>
                            <Text style={{ fontSize: 10, marginBottom: 5 }}>1universalassociates@gmail.com</Text>
                            <View style={tw("flex flex-row gap-x-3")}>
                                <Text style={[tw("font-bold"), { fontSize: 10, fontWeight: 900, fontFamily: "Times-Bold" }]}>GSTIN :</Text>
                                <Text style={{ fontSize: 10, marginBottom: 3 }}> 33BIIPS8122C1ZF</Text>

                            </View>
                            <View style={tw("flex flex-row gap-x-3")}>
                                <Text style={[tw("font-bold"), { fontSize: 10, fontWeight: 900, fontFamily: "Times-Bold" }]}>Website:</Text>
                                <Text style={{ fontSize: 10, marginBottom: 3 }}> universalassociates.co.in</Text>

                            </View>
                            <View style={tw("flex flex-row gap-x-3")}>
                                <Text style={[tw("font-bold"), { fontSize: 10, fontWeight: 900, fontFamily: "Times-Bold" }]}>Contact Name:</Text>
                                <Text style={{ fontSize: 10, marginBottom: 3 }}> Universal Associates</Text>

                            </View>

                        </View>

                        <View style={tw("flex flex-row justify-around w-1/2 mt-1")}>
                            <View style={tw("w-1/2 gap-y-2")}>
                                <Text style={{ fontSize: 10 }}>Issue Date:</Text>
                                <Text style={{ fontSize: 10 }}>Valid Until:</Text>
                                {/* <Text style={{ fontSize: 10 }}>Place of Supply:</Text> */}

                            </View>
                            <View style={tw("w-1/2 gap-y-2")}>
                                <Text style={{ fontSize: 10 }}>{moment(data?.createdAt).format("YYYY-MM-DD")}</Text>
                                <Text style={{ fontSize: 10 }}>{moment(data?.validDate).format("YYYY-MM-DD")}</Text>
                                {/* <Text style={{ fontSize: 11 }}>{findFromList(data?.placeOfSupplyId, stateList?.data, "name")}</Text> */}
                            </View>
                        </View>

                    </View>
                </View>
                <View fixed style={tw("w-full")}>
                    <View style={tw("flex flex-row justify-between p-1")}>
                        <View style={tw("w-2/4")}>
                            <Text style={[tw("text-sky-800"), { fontSize: 13 }]}>Bill To</Text>

                            <Text style={[tw("text-sky-800"), { fontSize: 13 }]}>
                                Sri Sakthi Hotel
                            </Text>
                            <Text style={{ fontSize: 10, marginBottom: 5 }}>Old Bustand , Tiruppur, TN (33), IN </Text>
                        </View>

                        <View style={tw("w-2/4  pr-3")}>
                            <Text style={[tw("text-sky-800"), { fontSize: 13 }]}>Ship To</Text>

                            <Text style={{ fontSize: 10 }}>Old Bustand , Tiruppur, TN (33), IN</Text>

                        </View>

                    </View>

                </View>
                <View style={tw("w-full text-sm bg-sky-800 text-white  border border-gray-500 text-center flex flex-row")}>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[5%]")}>
                        <Text>S.No</Text>
                    </View>
                    <View style={tw(" border-r border-gray-500 justify-center items-center w-[40%]")}>
                        <Text>Item Description</Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[5%]")}>
                        <Text>HSN</Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[5%]")}>
                        <Text>Qty </Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[5%]")}>
                        <Text> UoM</Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[8%]")}>
                        <Text>Price <span>&#8377;</span></Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[10%]")}>
                        <Text>Tax.Value <span>&#8377;</span></Text>
                    </View>
                    {
                        isIgst ?
                            <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[12%]")}>
                                <Text>CGST <span>&#8377;</span></Text>
                            </View>
                            :
                            <>
                                <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[6%]")}>
                                    <Text>CGST <span>&#8377;</span></Text>
                                </View>
                                <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[6%]")}>
                                    <Text>SGST <span>&#8377;</span></Text>
                                </View>
                            </>

                    }

                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[15%]")}>
                        <Text>Amount <span>&#8377;</span></Text>
                    </View>
                </View>
                {(data?.InvoiceItems || []).map((item, index) =>
                    <View key={index} style={tw("w-full text-xs border-x border-b border-gray-500 text-center flex flex-row ")}>
                        <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[5%]")}>
                            <Text>
                                {index + 1}
                            </Text>
                        </View>
                        <View style={tw("py-1 border-r border-gray-500  w-[40%] gap-y-2 overflow-auto")}>
                            <Text>
                                {item?.Product?.name}

                            </Text>
                            <Text>
                                {item?.Product?.description}
                            </Text>
                        </View>
                        <View style={tw(" border-r border-gray-500 justify-around text-right px-1 w-[5%]")}>
                            <Text>
                                {item?.Product?.hsnCode}

                            </Text>
                        </View>
                        <View style={tw("border-r border-gray-500 border-r justify-around text-right px-1  w-[5%]")}>
                            <Text>
                                {item?.qty}
                            </Text>
                        </View>
                        <View style={tw(" border-r border-gray-500 justify-center text-left px-1 w-[5%]")}>
                            <Text>
                                {item?.Uom?.name}
                            </Text>
                        </View>
                        <View style={tw(" border-r border-gray-500 justify-center text-right px-1 w-[8%]")}>
                            <Text>
                                {parseFloat(item?.price).toFixed(2)}
                            </Text>
                        </View>
                        <View style={tw(" border-r border-gray-500 justify-center  text-right px-1 w-[10%]")}>
                            <Text>
                                {(!item.qty || !item.price) ? 0 : parseFloat((parseFloat(item.qty) * parseFloat(item.price))).toFixed(2) || 0}
                            </Text>
                        </View>

                        {
                            isIgst ?
                                <View style={tw(" border-r border-gray-500 justify-center text-right px-1 w-[12%]")}>

                                    <Text>
                                        {(!item.qty || !item.price) ? 0 : parseFloat(((parseFloat(item.qty) * parseFloat(item.price)) * (calculateGst(index) / 100))).toFixed(2) || 0}
                                    </Text>
                                </View>
                                :
                                <>
                                    <View style={tw(" border-r border-gray-500 justify-center text-right px-1 w-[6%]")}>

                                        <Text>
                                            {(!item.qty || !item.price) ? 0 : parseFloat(((parseFloat(item.qty) * parseFloat(item.price)) * ((calculateGst(index) / 2) / 100))).toFixed(2) || 0}

                                        </Text>
                                    </View>
                                    <View style={tw(" border-r border-gray-500 justify-center text-right px-1 w-[6%]")}>

                                        <Text>
                                            {(!item.qty || !item.price) ? 0 : parseFloat(((parseFloat(item.qty) * parseFloat(item.price)) * ((calculateGst(index) / 2) / 100))).toFixed(2) || 0}

                                        </Text>
                                    </View>
                                </>


                        }


                        <View style={tw(" border-r border-gray-500 justify-center text-right px-1 w-[15%]")}>
                            <Text>
                                {(!item.qty || !item.price) ? 0 : parseFloat((substract(parseFloat(item.qty) * parseFloat(item.price), parseFloat(item?.discount || 0)) + ((parseFloat(item.qty) * parseFloat(item.price)) * (calculateGst(index) / 100)))).toFixed(2) || 0}
                            </Text>
                        </View>
                    </View>
                )}
                <View style={tw("w-full text-sm border-x text-sky-800 font-bold  border-b border-gray-500 text-center flex flex-row h-[20px]")}>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[68%]")}>
                        <Text>
                            Total @ 0%
                        </Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-end items-center w-[10%]")}>
                        <Text>
                            {parseFloat(findTaxableAmount()).toFixed(2)}
                        </Text>
                    </View>

                    {
                        isIgst ?

                            <View style={tw("flex flex-row border-r border-gray-500 justify-end items-center w-[12%]")}>
                                <Text>
                                    {parseFloat(findIgstAmount()).toFixed(2)}
                                </Text>
                            </View>
                            :
                            <>
                                <View style={tw("flex flex-row border-r border-gray-500 justify-end items-center w-[6%]")}>
                                    <Text>
                                        {parseFloat(findCgstAmount()).toFixed(2)}
                                    </Text>
                                </View>
                                <View style={tw("flex flex-row border-r border-gray-500 justify-end items-center w-[6%]")}>
                                    <Text>
                                        {parseFloat(findCgstAmount()).toFixed(2)}
                                    </Text>
                                </View>
                            </>

                    }


                    <View style={tw("flex flex-row border-r border-gray-500 justify-end items-center w-[15%]")}>
                        <Text>
                            {parseFloat(findTotalAmount()).toFixed(2)}
                        </Text>
                    </View>

                </View>

                <View fixed style={tw("absolute bottom-5")}>
                    <View style={tw("text-center w-full pb-1 pt-1 px-2 text-xs ")}>
                        <Text render={({ pageNumber, totalPages }) => (
                            `Page ${pageNumber} / ${totalPages}`
                        )} fixed />
                    </View>
                </View>
                <View fixed style={tw("w-full")}>
                    <View style={tw("flex flex-row justify-between pb-20 pt-5")}>
                        <View style={tw("w-2/4")}>
                            <Text style={{ fontSize: 12, marginBottom: 5 }}>
                                Bank Name: <Text style={tw("text-sky-800")}>Karur Vysya Bank</Text>
                            </Text>
                            <Text style={{ fontSize: 12, marginBottom: 5 }}>
                                Account Number: <Text style={tw("text-sky-800")}>1779135000004779</Text>
                            </Text>
                            <Text style={{ fontSize: 12, marginBottom: 5 }}>
                                Branch Name: <Text style={tw("text-sky-800")}>Velampalayam</Text>
                            </Text>
                            <Text style={{ fontSize: 12, marginBottom: 5 }}>
                                IFSC Code: <Text style={tw("text-sky-800")}>KVBL0001779</Text>
                            </Text>
                        </View>

                        <View style={tw("w-1/2 pr-3")}>
                            <Text style={{ fontSize: 11 }}>Total Taxable Value</Text>
                            <Text style={{ fontSize: 11 }}>Total Tax Amount</Text>
                            <Text style={{ fontSize: 11 }}>Total Value (in figure)</Text>
                            <Text style={{ fontSize: 11 }}>Total Value (in words)</Text>

                        </View>
                        <View style={tw("w-1/3")}>
                            <Text style={[tw("text-sky-800"), { fontSize: 11 }]}><span>&#8377;</span>     {parseFloat(findTaxableAmount()).toFixed(2)}</Text>
                            <Text style={[tw("text-sky-800"), { fontSize: 11 }]}><span>&#8377;</span> {parseFloat(findIgstAmount()).toFixed(2)}</Text>
                            <Text style={[tw("text-sky-800"), { fontSize: 11 }]}><span>&#8377;</span> {parseFloat(findTotalAmount()).toFixed(2)}</Text>
                            <Text style={[tw("text-sky-800"), { fontSize: 11 }]}><span>&#8377;</span>
                            </Text>

                        </View>
                    </View>
                </View>


            </Page>
            <Page2 />

        </Document>


    )
}

export default ProformaInvoice