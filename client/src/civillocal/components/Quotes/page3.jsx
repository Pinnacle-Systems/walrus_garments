import React from 'react';
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import tw from '../../../Utils/tailwind-react-pdf';
import { COMPANY_NAME } from '../../../Constants';
import { DOCID } from '../../../Constants';

const Page3 = ({ data, isDrawingWeight }) => {
    const items = data?.DeliveryNoteGroupedDetails || [];
    const totalWeight = items.reduce((a, groupItem) => a + (
        (parseFloat(isDrawingWeight ? (groupItem?.items.reduce((a, c) => a + parseFloat(c.weight), 0)) : (groupItem?.physical_weight)) * parseFloat(groupItem?.items.reduce((a, c) => a + parseFloat(c.qty), 0)))
    ), 0);
    const totalQty = items.reduce((a, c) => a + parseFloat(c?.items.reduce((a, c) => a + parseFloat(c.qty), 0)), 0);

    return (
        <Document style={tw("w-full h-full")}>
            <Page size="A4" style={{ fontFamily: "Times-Roman", ...tw("relative pb-[50px] p-2") }}>
                <View fixed style={tw("w-full")}>
                    <View style={tw("flex flex-row justify-between items-center p-1")}>
                        <View style={tw("w-2/8")}>
                            <Image source={require("../../../assets/uniass.jpeg")} style={{ width: 55, height: 55 }} />
                        </View>
                        <View style={tw("w-1/2 rounded-md text-center pl-10")}>
                            <Text style={{ fontSize: 16 }}>{COMPANY_NAME}</Text>
                        </View>
                        <View style={tw("w-1/4 pl-10")}>
                            <Text style={{ fontSize: 16 }}>{DOCID}</Text>
                        </View>
                    </View>
                </View>

                <View fixed style={tw("w-full")}>
                    <View style={tw("flex flex-row justify-between p-1")}>
                        <View style={tw("w-2/4")}>

                        </View>
                        <View style={tw("flex flex-row justify-between p-1 bg-sky-800 text-white h-[20px]]")}>
                            <View style={tw("w-1/2 pl-7")}>
                                <Text style={{ fontSize: 11 }}>Amount Due:</Text>

                            </View>
                            <View style={tw("w-1/3")}>
                                <Text style={{ fontSize: 11 }}>32,577.00</Text>

                            </View>
                        </View>
                    </View>
                </View>

                <View fixed style={tw("w-full")}>
                    <View style={tw("flex flex-row justify-between p-1")}>
                        <View style={tw("w-2/4")}>
                            <Text style={{ fontSize: 12, marginBottom: 5 }}>
                                148 Nataraj Layout
                                15 Velamapalayam,
                                Tiruppur,{'\n'} TN (33) 641652
                            </Text>
                            <Text style={{ fontSize: 12, marginBottom: 5 }}>+919597639777</Text>
                            <Text style={{ fontSize: 12, marginBottom: 5 }}>1universalassociates@gmail.com</Text>
                            <Text style={{ fontSize: 12, marginBottom: 5 }}>GSTIN: 33BIIPS8122C1ZF</Text>
                            <Text style={{ fontSize: 12, marginBottom: 5 }}>Website: universalassociates.co.in</Text>
                            <Text style={{ fontSize: 12, marginBottom: 5 }}>Contact Name: Universal Associates</Text>
                        </View>
                        <View style={tw("w-1/2 pl-7")}>
                            <Text style={{ fontSize: 11 }}>Issue Date:</Text>
                            <Text style={{ fontSize: 11 }}>Valid Until:</Text>
                            <Text style={{ fontSize: 11 }}>Place of Supply:</Text>
                        </View>
                        <View style={tw("w-1/3 pl-10")}>
                            <Text style={{ fontSize: 11 }}>14 - May - 2024</Text>
                            <Text style={{ fontSize: 11 }}>29 - May - 2024</Text>
                            <Text style={{ fontSize: 11 }}>TN (33)</Text>
                        </View>

                    </View>
                </View>
                <View fixed style={tw("w-full")}>
                    <View style={tw("flex flex-row justify-between p-1")}>
                        <View style={tw("w-2/4")}>
                            <Text style={[tw("text-sky-800 pb-5"), { fontSize: 13 }]}>
                                Bill To
                                MODERN TESTING SERVICES (INDIA) PRIVATE
                                LIMITED
                            </Text>
                            <Text style={{ fontSize: 12, marginBottom: 5 }}>Old Bustand, Tiruppur, TN (33), IN</Text>
                        </View>
                        <View style={tw("w-1/2 pl-8")}>
                            <Text style={[tw("text-sky-800"), { fontSize: 13 }]}>Ship To</Text>
                            <Text style={{ fontSize: 11 }}>1 st Floor, 16-C, 80 Feet Road, Ramraj Nagar, Gandhi Nagar (P.O),,
                                Tiruppur, TN (33) 641603, IN</Text>
                        </View>
                        <View style={tw("w-1/3 pr-3")}></View>
                    </View>
                </View>
                <View style={tw("w-full text-sm bg-sky-800 text-white  border border-gray-500 text-center flex flex-row h-[30px]")}>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[10%]")}>
                        <Text>S.No</Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[31%]")}>
                        <Text>Item Description</Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[15%]")}>
                        <Text>HSN/SAC</Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[12%]")}>
                        <Text>Qty UoM</Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[20%]")}>
                        <Text>Price <span>&#8377;</span></Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[25%]")}>
                        <Text>Taxable Value <span>&#8377;</span></Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[12%]")}>
                        <Text>CGST <span>&#8377;</span></Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[12%]")}>
                        <Text>SGST <span>&#8377;</span></Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[30%]")}>
                        <Text>Amount <span>&#8377;</span></Text>
                    </View>
                </View>
                {Array.from({ length: 5 }).map((i, index) =>
                    <View key={index} style={tw("w-full text-xs border-x border-b border-gray-500 text-center flex flex-row h-[20px]")}>
                        <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[10%]")}>
                            <Text>
                            </Text>
                        </View>
                        <View style={tw("flex flex-col border-r border-gray-500 justify-around items-center w-[31%]")}>
                        </View>
                        <View style={tw("flex flex-col border-r border-gray-500 justify-around items-center w-[15%]")}>
                        </View>
                        <View style={tw("flex flex-col last:border-r border-gray-500 justify-around text-center items-center w-[12%]")}>
                            <Text>
                            </Text>
                        </View>
                        <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[20%]")}>
                            <Text>
                            </Text>
                        </View>
                        <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[25%]")}>
                            <Text>
                            </Text>
                        </View>
                        <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[12%]")}>
                            <Text>

                            </Text>
                        </View>
                        <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[12%]")}>
                            <Text>

                            </Text>
                        </View>
                        <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[30%]")}>
                            <Text>

                            </Text>
                        </View>
                    </View>
                )}
                <View style={tw("w-full text-sm border-x text-sky-800 font-bold  border-b border-gray-500 text-center flex flex-row h-[20px]")}>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[88%]")}>
                        <Text>
                            Total @0%
                        </Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[25%]")}>
                        <Text>
                            12,000.00
                        </Text>
                    </View>

                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[12%]")}>
                        <Text>
                            0.00
                        </Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[12%]")}>
                        <Text>
                            0.00
                        </Text>
                    </View>
                    <View style={tw("flex flex-row border-r border-gray-500 justify-center items-center w-[30%]")}>
                        <Text>
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
                            <Text style={[tw("text-sky-800"), { fontSize: 11 }]}><span>&#8377;</span>12,000.00</Text>
                            <Text style={[tw("text-sky-800"), { fontSize: 11 }]}><span>&#8377;</span>0.00</Text>
                            <Text style={[tw("text-sky-800"), { fontSize: 11 }]}><span>&#8377;</span>12,000</Text>
                            <Text style={[tw("text-sky-800"), { fontSize: 11 }]}><span>&#8377;</span> Twelve Thousand Only
                            </Text>

                        </View>
                    </View>
                </View>
                <View style={tw("w-full   flex flex-row  border-t border-gray-500 items-left")}>
                    <View style={tw("w-full  flex flex-row p-5 items-left")}>
                        <View style={tw("flex-1  p-3 w-full h-full ")}>
                            <View style={tw("flex flex-col w-3/4 gap-2")}>
                                <Text style={[{ fontSize: 15 }, tw("text-sky-800")]}>Terms & Conditions</Text>
                                <Text style={{ fontSize: 11 }}>50% Payment in advance.</Text>
                                <Text style={{ fontSize: 11 }}>25% Payment after 50% work finish.</Text>
                                <Text style={{ fontSize: 11 }}>15% Payment after 75% work finish.</Text>
                                <Text style={{ fontSize: 11 }}>10% After Finishing Work.</Text>
                                <Text style={{ fontSize: 11 }}>Note: For tax bills, an 18% amount is added for untaxed items</Text>
                                <Text style={{ fontSize: 11 }}>** Actual quantity/area/weight(Including Wastage) is taken for final bill</Text>
                                <Text style={{ fontSize: 11 }}>** Civil & Painting work is in the client's scope.</Text>
                                <Text style={{ fontSize: 11 }}>** Electrical & Plumbing are in the client scope.</Text>
                                <Text style={{ fontSize: 11 }}>** Electricity for work will be supplied by the client</Text>
                                <Text style={{ fontSize: 11 }}>** Ladder, Scaffolding & crane are in the client scope.</Text>
                                <Text style={{ fontSize: 11 }}>** Make sure the site is suitable for working conditions in the client's scope.</Text>
                                <Text style={{ fontSize: 11 }}>** Chairs are in the client scope</Text>
                            </View>
                        </View>
                        <View style={tw("w-1/4 ")}>
                            <Image source={require("../../../assets/sign.jpeg")} style={{ width: 138, height: 80 }} />
                            <Text style={{ ...tw("font-bold text-sky-800"), fontSize: 11, textAlign: 'center' }}>Provider's Digital Signature</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default Page3;
