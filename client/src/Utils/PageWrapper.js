import { Page, Text, View, Image, Font } from '@react-pdf/renderer'
import React from 'react'
import WaterMarkSymbol from './WaterMarkSymbol'
import tw from './tailwind-react-pdf'
import Header from './Header'
import FactoryAddress from './FactoryAddress'

const PageWrapper = ({ heading, singleData, DeliveryNo, DeliveryDate, children, styles }) => {
    return (
        <Page size={"A4"} wrap style={[tw("px-2 pb-[75px] text-sm flex flex-col h-full relative  "), { fontFamily: "Times-Roman" }]} >

            <WaterMarkSymbol />
            <View fixed>
                <Header heading={heading} singleData={singleData} DeliveryNo={DeliveryNo} DeliveryDate={DeliveryDate} styles={styles} />
            </View>
            <View>
                {children}
            </View>
            <View fixed style={tw("pr-2 pb-2 mt-[50px] absolute bottom-3  ")}>
                <View style={tw("")}>
                <FactoryAddress />

                </View>
                <View style={tw("text-right w-full pb-1 pt-1")}>
                    <Text render={({ pageNumber, totalPages }) => (
                        `Page No :${pageNumber} / ${totalPages}`
                    )} fixed />
                </View>
            </View>

        </Page>
    )
}

export default PageWrapper