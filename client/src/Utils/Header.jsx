import { Image, Text, View } from '@react-pdf/renderer'
import React from 'react'
import tw from './tailwind-react-pdf'
import logo from '../assets/iknits.png'

import { getImageUrlPath } from '../helper'
import moment from 'moment'

const Header = ({ heading, singleData, DeliveryNo, DeliveryDate, styles }) => {




    return (
       <>
       
       
         <View style={tw("flex flex-row  gap-x-12  justify-between    w-full h-[80px]  border-b border-teal-800 ")}>
             <View style={tw("")}>
                <Image style={tw("w-[70px] h-[70px]")} src={logo} />
             </View>
        
                <View style={tw("flex flex-row text-xl    mt-1 item-center ml-[90px]  mt-[35px] text-teal-500 ")}>
                <Text  >{heading}</Text>
                </View>
                <View style={tw(" mt-4")}>
                    <Text style={tw(" ml-[90px]  text-lg underline text-teal-500")}>
                        INTRO KNITS
                    </Text>
                    <Text style={tw("ml-[60px]  text-xs")} >
                        14/12, SAAMAKKADU THOTTAM,
                    </Text>
                    <Text style={tw("ml-[40px]  text-xs p-1 ")}>
                        New Extension Street, 
                        Kaikaatiputhur,  Avinasi-641654.
                    </Text>
                    {/* <Text style={tw("ml-[40px]  text-sm ")}>
                    Avinasi-641654.
                    </Text> */}
                    <Text style={tw(" ml-[50px]  text-xs")}>
                        Ph: 9659897473 GSTIN:33AAFFI6878K1ZV
                    </Text>
              </View>
         
           



        </View> 
        
        </>


















        // <View style={tw("flex flex-row w-full justify-between gap-4 items-center  border-b-2 w-full h-24 mt-5 p-2 mb-5")}>
        //     <View>
        //         <Image style={tw("w-32")} src={logo} />
        //     </View>
        //     <View style={tw("flex flex-col items-center justify-center text-center")}>
        //         <Text style={tw("font-bold text-xl")}>
        //             {heading}
        //         </Text>

        //     </View>

        // </View>
    )
}

export default Header
