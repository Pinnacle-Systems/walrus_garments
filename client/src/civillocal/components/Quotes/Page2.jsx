import React from 'react';
import { Page, Text, View, Image } from '@react-pdf/renderer';
import tw from '../../../Utils/tailwind-react-pdf';

const Page2 = () => {
    return (
        <Page size="A4" style={{ fontFamily: "Times-Roman", ...tw("relative pb-[10px] text-[10px]") }}>
            <View fixed style={tw("w-full p-1")}>
                <View style={tw("w-full h-full  flex flex-row border  border-gray-500 items-left")}>
                    <View style={tw("w-full h-full flex flex-row p-5 items-left")}>
                        <View style={tw("flex-1  p-3 w-full h-full ")}>
                            <View style={tw("flex flex-col w-3/4 gap-2")}>
                                <Text style={[{ fontSize: 15 }, tw("text-sky-800")]}>Terms & Conditions</Text>
                                <Text style={{ fontSize: 12 }}>50% Payment in advance.</Text>
                                <Text style={{ fontSize: 12 }}>25% Payment after 50% work finish.</Text>
                                <Text style={{ fontSize: 12 }}>15% Payment after 75% work finish.</Text>
                                <Text style={{ fontSize: 12 }}>10% After Finishing Work.</Text>
                                <Text style={{ fontSize: 12 }}>Note: For tax bills, an 18% amount is added for untaxed items</Text>
                                <Text style={{ fontSize: 12 }}>** Actual quantity/area/weight(Including Wastage) is taken for final bill</Text>
                                <Text style={{ fontSize: 12 }}>** Civil & Painting work is in the client's scope.</Text>
                                <Text style={{ fontSize: 12 }}>** Electrical & Plumbing are in the client scope.</Text>
                                <Text style={{ fontSize: 12 }}>** Electricity for work will be supplied by the client</Text>
                                <Text style={{ fontSize: 12 }}>** Ladder, Scaffolding & crane are in the client scope.</Text>
                                <Text style={{ fontSize: 12 }}>** Make sure the site is suitable for working conditions in the client's scope.</Text>
                                <Text style={{ fontSize: 12 }}>** Chairs are in the client scope</Text>
                            </View>
                        </View>
                        <View style={tw("w-1/4 ")}>
                            <Image source={require("../../../assets/sign.jpeg")} style={{ width: 138, height: 80 }} />
                            <Text style={{ ...tw("font-bold text-sky-800"), fontSize: 11, textAlign: 'center' }}>Provider's Digital Signature</Text>
                        </View>
                    </View>
                </View>
            </View>
        </Page>

    );
};

export default Page2;
