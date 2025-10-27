import React from "react";
import { View, Text } from "@react-pdf/renderer";
import useTaxDetailsHook from "../../../../CustomHooks/TaxHookDetails";
import { groupBy } from "lodash";

const styles = {
    container: {
        marginTop: 8,
        borderTop: "1pt solid #888",
        paddingTop: 4,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottom: "1pt solid #888",
        paddingBottom: 2,
        marginBottom: 2,
    },
    headerText: {
        fontSize: 9,
        fontWeight: "bold",
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 2,
    },
    label: {
        fontSize: 9,
    },
    value: {
        fontSize: 9,
        textAlign: "right",
    },
};

const TaxDetail = ({ items, taxTemplateId, discountType, discountValue, taxKey ,taxDetails }) => {



    return (
        <>
            <View style={styles.detailRow}>
                <Text style={styles.label}>CGST @{parseFloat(taxKey) / 2}%</Text>
                <Text style={styles.value}>{parseFloat(taxDetails.cgstAmount).toFixed(3)}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.label}>SGST @{parseFloat(taxKey) / 2}%</Text>
                <Text style={styles.value}>{parseFloat(taxDetails.sgstAmount).toFixed(3)}</Text>
            </View>
        </>
    );
};

const TaxDetails = ({  items, taxTemplateId, discountType, discountValue ,taxDetails }) => {
    const taxGroupWise = groupBy(taxDetails, "taxDetails");

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.headerText}>Tax Description</Text>
                <Text style={styles.headerText}>Amount</Text>
            </View>

            {Object.keys(taxGroupWise).map((taxKey, index) => (
                <TaxDetail
                    key={index}
                    taxKey={taxKey}
                    items={taxGroupWise[taxKey]}
                    discountType={discountType}
                    taxTemplateId={taxTemplateId}
                    discountValue={discountValue}
                    taxDetails={taxDetails}
                />
            ))}
        </View>
    );
};

export default TaxDetails;
