import React from "react";
import { render, screen } from "@testing-library/react";
import SalesDeliveryItems from "./SalesDeliveryItems";

jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
  useSelector: (selector) =>
    selector({
      openTabs: {
        tabs: [{ active: true, name: "SALES DELIVERY" }],
      },
    }),
}));

jest.mock("../../../redux/features/opentabs", () => ({
  push: jest.fn(),
}));

jest.mock("../../../redux/features/openModel", () => ({
  setLastTab: jest.fn(),
  setOpenPartyModal: jest.fn(),
}));

jest.mock("../../../redux/uniformService/UnitOfMeasurementServices", () => ({
  useGetUnitOfMeasurementMasterQuery: () => ({
    data: {
      data: [{ id: 1, name: "PCS", active: true }],
    },
  }),
}));

jest.mock("../../../redux/uniformService/ColorMasterService", () => ({
  useGetColorMasterQuery: () => ({
    data: {
      data: [{ id: 10, name: "RED" }],
    },
  }),
}));

jest.mock("../../../redux/services/HsnMasterServices", () => ({
  useGetHsnMasterQuery: () => ({
    data: {
      data: [{ id: 1, name: "HSN-1", tax: 5 }],
    },
  }),
}));

jest.mock("../ReusableComponents/TransactionLineItemsSection", () => {
  const MockSection = ({ children }) => <div>{children}</div>;
  return {
    __esModule: true,
    default: MockSection,
    standardTransactionPlaceholderRowCount: 5,
    transactionTableClassName: "",
    transactionTableCellClassName: "",
    transactionTableFocusCellClassName: "",
    transactionTableHeadClassName: "",
    transactionTableHeaderCellClassName: "",
    transactionTableIndexCellClassName: "",
    transactionTableNumberInputClassName: "",
    transactionTableRowClassName: "",
    transactionTableSelectInputClassName: "",
  };
});

describe("SalesDeliveryItems hybrid visible shape", () => {
  it("does not show stock-only size or color columns when the sellable item is flat", () => {
    render(
      <SalesDeliveryItems
        id=""
        transType="DyedYarn"
        deliveryItems={[
          {
            itemId: 1,
            sizeId: "",
            colorId: "",
            hsnId: 1,
            uomId: 1,
            qty: "1.000",
            price: "100.00",
            taxPercent: 5,
            taxMethod: "Inclusive",
          },
        ]}
        setDeliveryItems={jest.fn()}
        readOnly={false}
        params={{ branchId: 1, companyId: 1, userId: 1, finYearId: 1 }}
        greyFilter={false}
        contextMenu={false}
        handleCloseContextMenu={jest.fn()}
        handleRightClick={jest.fn()}
        setInwardItemSelection={jest.fn()}
        itemList={{ data: [{ id: 1, name: "FLAT ITEM", isLegacy: false, hsnId: 1, sectionId: 1 }] }}
        sizeList={{ data: [{ id: 5, name: "M" }] }}
        taxMethod="WithoutTax"
        setTaxMethod={jest.fn()}
        isHeaderOpen={true}
        itemPriceList={{ data: [{ itemId: 1, sizeId: null, colorId: null, salesPrice: 100 }] }}
        priceTemplateList={{ data: [] }}
      />
    );

    expect(screen.queryByText("Size")).toBeNull();
    expect(screen.queryByText("Color")).toBeNull();
    expect(screen.getByText("Item")).toBeTruthy();
    expect(screen.getByText("Quantity")).toBeTruthy();
  });
});
