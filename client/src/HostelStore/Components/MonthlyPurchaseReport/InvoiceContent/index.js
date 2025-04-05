import { Text } from '@react-pdf/renderer'
import React from 'react'
import PageWrapper from './PageWrapper'
import { Page, View,StyleSheet} from '@react-pdf/renderer'
import tw from '../../../../Utils/tailwind-react-pdf'
import moment from 'moment'
import { getDateFromDateTimeToDisplay } from '../../../../Utils/helper'


const InvoiceContent = ({totalAmount,startDate,endDate,salesList}) => {
  const numericFields = ["Qty", "Amount"];
 
   

  const styles = StyleSheet.create({
    textRight: {
      textAlign:"right",
      width:24
    },
    textLeft: {
      textAlign:"left",
      width:"40%"
    },
    
  });

  

  return (
    <>{console.log(salesList,"saleslistttpurchasee")}
    

        <PageWrapper startDate={startDate} endDate={endDate}>
          <View style={tw("mt-5 w-full")}>
          {(salesList.length > 0) &&
            <View style={tw("flex flex-row flex-wrap border border-gray-600 w-3/4 m-auto")}>
                                   <Text style={tw('w-1/6 border-r text-center p-1 border-gray-500')}>S.No</Text>

              {/* {Object.keys(salesList[0]).map((heading, i) =>
                <Text style={[tw(`${numericFields.includes(heading) ? "w-1/4": "w-2/4"}`) ,tw("text-center p-1  border-r  border-gray-500")]} key={i}>
                  {heading.replace(/_+/g, ' ')}
                </Text>
              )} */}
                     <Text  style={tw("w-1/6 text-center p-1  border-r  border-gray-500")}>
                              Date
                              </Text>
                              <Text  style={tw(" w-2/6 text-center p-1  border-r  border-gray-500")}>
                             Party Name
                              </Text>
                              <Text  style={tw(" w-1/6 text-center p-1  border-r  border-gray-500")}>
                             Party Dc.No
                              </Text>
                              <Text  style={tw("w-1/6  p-1 text-center border-r  border-gray-500")}>
                              Amount
                              </Text>

            </View>
          }

                 {salesList?.map((data, i) =>
                      <>

                               <View style={tw("flex flex-row flex-wrap border border-gray-600 w-3/4 m-auto")}>

                               <Text style={tw('w-1/6 border-r p-1 text-center  border-gray-500')}>{i + 1}</Text>
                              
                              <Text  style={tw("w-1/6 text-left p-1  border-r  border-gray-500")}>
                              {getDateFromDateTimeToDisplay(data?.createdAt)}
                              </Text>
                              <Text  style={tw("w-2/6 text-left p-1  border-r  border-gray-500")}>
                              {data?.supplier?.name}
                              </Text>
                              <Text  style={tw(" w-1/6 text-right p-1  border-r  border-gray-500")}>
                              {(data?.supplierDcNo
                  )}
                              </Text>
                              <Text  style={tw("w-1/6  p-1 text-right border-r  border-gray-500")}>
                              {parseFloat(data?.netBillValue ? data.netBillValue : 0).toFixed(2)}
                              </Text>
                       
                       </View>

        
                      </>
                    )}

<View style={tw("flex flex-row justify-between border border-gray-600 w-3/4 m-auto")}>

                      <Text colSpan={3} style={tw('text-center  font-bold text-sm p-3')}>Total</Text>
                      <Text style={tw('  w-1/6 p-3 border-l border-gray-700 font-bold text-sm text-center')}>{parseFloat(totalAmount).toFixed(2)}</Text>

                    </View>
          </View>
        
        </PageWrapper>
    </>
  )
}

export default InvoiceContent