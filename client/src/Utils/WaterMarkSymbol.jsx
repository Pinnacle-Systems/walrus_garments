import React from 'react'
import { View, Image } from '@react-pdf/renderer';
import logo from '../assets/iknits.png'


import tw from '../Utils/tailwind-react-pdf'
const WaterMarkSymbol = () => {
    return <View fixed style={{
        position: 'absolute',
        top: '50%',
        left: '40%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        width: "200px",
        zIndex: -1,
        opacity: 0.2,
    }}>
        <Image style={tw("h-full w-full")} src={logo} />
    </View>
}

export default WaterMarkSymbol
