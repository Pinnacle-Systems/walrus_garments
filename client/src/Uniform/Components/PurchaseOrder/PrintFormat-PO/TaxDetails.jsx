import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import useTaxDetailsHook from '../../../../CustomHooks/TaxHookDetails'
import { groupBy } from 'lodash'

const TaxDetails = ({ items, taxTemplateId, taxGroupWise, taxDetails }) => {

  console.log(taxDetails,"taxDetailstaxDetails")
    console.log(taxGroupWise,"taxGroupWise")


  return (
    <>
      {Object.keys(taxGroupWise).map(taxKey => {
        // Fetch tax details for each tax group



        return (
          <React.Fragment key={taxKey}>
            <View style={{ flexDirection: "row", borderTop: "1 solid #9ca3af"  , borderRight :  "1 solid #9ca3af"  }}>
              <Text style={{  fontSize: 8, padding: 3 }}>
                CGST @{parseFloat(taxKey) / 2}%
              </Text>
              <Text style={{  textAlign: "right", fontSize: 8, padding: 3 }}>
                {parseFloat(taxDetails.cgstAmount).toFixed(3)}
              </Text>
            </View>

            <View style={{ flexDirection: "row", borderTop: "1 solid #9ca3af" , borderRight :  "1 solid #9ca3af"  }}>
              <Text style={{  fontSize: 8, padding: 3 }}>
                SGST @{parseFloat(taxKey) / 2}%
              </Text>
              <Text style={{  textAlign: "right", fontSize: 8, padding: 3 }}>
                {parseFloat(taxDetails.sgstAmount).toFixed(3)}
              </Text>
            </View>
          </React.Fragment>
        )
      })}
    </>
  )
}

export default TaxDetails
