export const bloodList = [
    { show: "A +ve", value: "AP" },
    { show: "A -ve", value: "AN" },
    { show: "B +ve", value: "BP" },
    { show: "B -ve", value: "BN" },
    { show: "AB +ve", value: "ABP" },
    { show: "AB -ve", value: "ABN" },
    { show: "O +ve", value: "OP" },
    { show: "O -ve", value: "ON" }
]

export const genderList = [
    { show: 'MALE', value: 'MALE' },
    { show: 'FEMALE', value: 'FEMALE' },
    { show: 'OTHER', value: 'OTHER' }
]

export const maritalStatusList = [
    { show: 'SINGLE', value: 'SINGLE' },
    { show: 'MARRIED', value: 'MARRIED' },
    { show: 'SEPARATED', value: 'SEPARATED' }
]

export const pageType = [
    { show: 'MASTER', value: 'Masters' },
    { show: 'TRANSACTION', value: 'Transactions' },
    { show: 'REPORTS', value: 'Reports' },
    { show: 'ADMIN CONTROLS', value: 'AdminAccess' },
]

export const accessoryCategoryList = [
    { show: 'STITCHING ACCESSORIES', value: 'STITCHING' },
    { show: 'PACKING ACCESSORIES', value: 'PACKING' }
]

export const prefixCategory = [
    { show: "DEFAULT", value: "Default" },
    { show: "SPECIFIC", value: "Specific" }
]

export const employeeType = [
    { show: "PERMANENT", value: true },
    { show: "TEMPORARY", value: false }
]

export const statusDropdown = [
    { show: "ACTIVE", value: true },
    { show: "INACTIVE", value: false }
]

export const poTypes = [
    { show: "GreyYarn", value: "GreyYarn" },
    { show: "DyedYarn", value: "DyedYarn" },
    { show: "Accessory", value: "Accessory" },

]
export const MaterialType = [
    { show: "DyedYarn", value: "DyedYarn" },
    { show: "GreyYarn", value: "GreyYarn" },
    { show: "Accessory", value: "Accessory" },

]

export const PoTypes = [
    { show: "ORDER", value: "ORDER" },
    // { show: "SAMPLE", value: "SAMPLE" },
    { show: "GENERAL", value: "GENERAL" },

]
export const Generalpurchase = [
    { show: "Grey Yarn", value: "GreyYarn" },
    { show: "Dyed Yarn", value: "DyedYarn" },
    { show: "Grey Fabric", value: "GreyFabric" },
    { show: "DyedFabric", value: "DyedFabric" },
    { show: "Accessory", value: "Accessory" },

]

export const directOrPo = [
    { show: "Direct Inward", value: "DirectInward" },
    { show: "Purchase Inward", value: "PurchaseInward" },

]
export const purchaseType = [
    { show: "General Purchase", value: "General Purchase" },
    { show: "Order Purchase", value: "Order Purchase" },

]
export const directOrPoreturn = [
    { show: "Direct Return", value: "DirectReturn" },
    { show: "Purchase Return", value: "PurchaseReturn" },


]

export const paymentTypes = [
    { show: "Against Bill", value: "AgainstBill" },
    { show: "Advance", value: "Advance" },
]



export const paymentModes = [
    { show: "Check", value: "Check" },
    { show: "Online", value: "Online" },
    { show: "Upi", value: "Upi" },
    { show: "Cash", value: "Cash" },
]

export const discountTypes = [
    { show: "Flat", value: "Flat" },
    { show: "Percentage", value: "Percentage" }
]

export const diaMeasurementList = [
    { show: "CMS", value: "CMS" },
    { show: "Inches", value: "INCHES" },
    { show: "Open Width", value: "OPENWIDTH" },
    { show: "Tubuler", value: "TUBULER" },
]

export const purchasePrPi = [
    { show: "Purchase Inward", value: "PurchaseInward" },
    { show: "Purchase Return", value: "PurchaseReturn" }
]

export const inwardTypeOptions = [
    { show: "Against Po", value: "AgainstPo" },
    { show: "Direct Inward", value: "DirectInward" }
]

export const processDeliveryOrReturn = [
    { show: "Process Delivery", value: "ProcessDelivery" },
    { show: "Process Return", value: "ProcessReturn" }
]

export const ProcessIOOptions = [
    // { show: "GY-GY", value: "GY_GY" },
    // { show: "GY-DY", value: "GY_DY" },
    // { show: "GY-GF", value: "GY_GF" },
    // { show: "DY-DY", value: "DY_DY" },
    // { show: "DY-DF", value: "DY_DF" },
    // { show: "GF-DF", value: "GF_DF" },
    { show: "DF-DF", value: "DF_DF" },
]


export const deliveryTypes = [
    { show: "To Self", value: "ToSelf" },
    { show: "To Party", value: "ToParty" },

]
export const showEntries = [
    { show: "10", value: "10" },
    { show: "25", value: "25" },
    { show: "50", value: "50" },
    { show: "100", value: "100" },
]

export const inHouseOutsideTypes = [
    { show: "IN-HOUSE", value: "INHOUSE" },
    { show: "OUTSIDE", value: "OUTSIDE" },
]

export const packingTypeOption = [
    { show: "Individual", value: "INDIVIDUAL" },
    { show: "Set", value: "SET" },
    { show: "Mixed", value: "MIXED" },
]

export const packingCategoryOption = [
    { show: "ClassWise", value: "CLASSWISE" },
    { show: "SizeWise", value: "SIZEWISE" },
]

export const salesTypes = [
    { show: "WHOLE SALE", value: "WHOLESALE" },
    { show: "RETAIL", value: "RETAIL" },
]


export const salePriceRange = [
    { show: "ECONOMY", value: "ECONOMY" },
    { show: "STANDARD", value: "STANDARD" },
    { show: "PREMIUM", value: "PREMIUM" },
]

export const reference = [
    { show: "CLIENT.REF", value: "CLIENT.REF" },
    { show: "BNI", value: "BNI" },
    { show: "MARKETING", value: "MARKETING" },
    { show: "REGULAR.CUSTOMER", value: "REGULAR.CUSTOMER" },
]

export const leadCancelReason = [
    { show: "PRICE UNMATCH", value: "PRICE UNMATCH" },
    { show: "CUSTOMER NOT RESPON", value: "CUSTOMERNOTRESPON" },
    { show: "NOT SET ", value: "NOTSET" },
]

export const sampleUpdateStage = [
    { show: "CUTTING", value: "CUTTING" },
    { show: "PRINTING", value: "PRINTING" },
    { show: "STITCHING", value: "STITCHING" },
    { show: "IRONING ", value: "IRONING" },
    { show: "PACKING ", value: "PACKING" },
]



export const versionUpdateTypes = [
    { show: "New", value: "New" },
    { show: "Existing", value: "Existing" },
]


export const categoryList = [
    { show: 'EXECUTION', value: 'EXECUTION' },
    { show: 'PURCHASE', value: 'PURCHASE' },

]

export const paymentMethods = [
    { show: "CASH", value: "CASH" },
    { show: "BANK TRANSFER", value: "BANK TRANSFER" },
    { show: "CHEQUE", value: "CHEQUE" },
    { show: "UPI", value: "UPI" },
    { show: "OTHER", value: "OTHER" },
]

export const expenses = [
    { show: "MATERIAL", value: "MATERIAL" },
    { show: "LABOUR", value: "LABOUR" },
    { show: "OTHER", value: "OTHER" },
]

export const formExpenses = [
    { show: "MATERIAL", value: "MATERIAL" },
    { show: "LABOUR", value: "LABOUR" },
    { show: "OTHER", value: "OTHER" },
    { show: "ALL", value: "ALL" },
]

export const WayOfSample = [
    { show: "HANDOVER", value: "HANDOVER" },
    { show: "SEND", value: "SEND" },

]


export const uniformTypes = [
    { show: "NORMAL", value: "NORMAL" },
    { show: "HOUSE", value: "HOUSE" },

]

export const packingCover = [
    { show: "PRINT", value: "PRINT" },
    { show: "PLAIN", value: "PLAIN" },
]

export const Colors = [
    { show: "BLACK", value: "PRINT" },
    { show: "NAVY", value: "PLAIN" },
]


export const stockTransferType = [
    { show: "General To Order", value: "General" },
    { show: "Order To Order", value: "Order" },

]

export const Common = [
    { show: "No", value: "No" },
    { show: "Yes", value: "Yes" },

]