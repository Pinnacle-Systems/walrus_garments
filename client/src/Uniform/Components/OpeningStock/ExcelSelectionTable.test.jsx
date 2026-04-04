import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ExcelSelectionTable from "./ExcelSelectionTable";

const mockAddOpeningStock = jest.fn();
const mockAddItem = jest.fn();
const mockUpdateItem = jest.fn();
const mockAddSize = jest.fn();
const mockAddColor = jest.fn();
const mockAddUom = jest.fn();
const mockToastWarning = jest.fn();
const mockToastError = jest.fn();
const mockSwalFire = jest.fn();
const mockSwalShowLoading = jest.fn();

jest.mock("../../../Utils/helper", () => ({
  getCommonParams: () => ({
    branchId: 1,
    companyId: 10,
    finYearId: 20,
    userId: 30,
  }),
  getConfiguredStockDrivenFields: () => [],
  getStockMaintenanceConfig: () => ({
    trackItem: true,
    trackSize: true,
    trackColor: true,
  }),
  normalizeMasterValue: (value) => (value || "").toString().trim().toUpperCase(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    warning: (...args) => mockToastWarning(...args),
    error: (...args) => mockToastError(...args),
  },
}));

jest.mock("sweetalert2", () => ({
  fire: (...args) => mockSwalFire(...args),
  showLoading: (...args) => mockSwalShowLoading(...args),
}));

jest.mock("react-select", () => (props) => (
  <select
    data-testid={props.placeholder}
    value={props.value?.value || ""}
    onChange={(e) => {
      const next = props.options.find((option) => String(option.value) === e.target.value) || null;
      props.onChange(next);
    }}
  >
    <option value="">--</option>
    {props.options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
));

jest.mock("../../../UiComponents/Modal", () => ({ isOpen, children }) =>
  isOpen ? <div>{children}</div> : null
);

jest.mock("../ReusableComponents/TransactionLineItemsSection", () => {
  const MockSection = ({ children }) => <div>{children}</div>;
  return {
    __esModule: true,
    default: MockSection,
    transactionTableActionButtonClassName: "",
    transactionTableActionCellClassName: "",
    transactionTableClassName: "",
    transactionTableFocusCellClassName: "",
    transactionTableHeadClassName: "",
    transactionTableHeaderCellClassName: "",
    transactionTableIndexCellClassName: "",
    transactionTableNumberInputClassName: "",
    transactionTableSelectInputClassName: "",
  };
});

jest.mock("../../../redux/uniformService/ItemMasterService", () => ({
  useGetItemMasterQuery: () => ({
    data: {
      data: [
        {
          id: 101,
          name: "SHIRT",
          code: "",
          active: true,
          isLegacy: true,
          ItemPriceList: [{ id: 1001, salesPrice: "", offerPrice: 0, barcode: "" }],
        },
        {
          id: 102,
          name: "PANTS",
          code: "PANTS-001",
          active: true,
          isLegacy: true,
          ItemPriceList: [{ id: 1002, salesPrice: 150, offerPrice: 0, barcode: "PANTS-001" }],
        },
      ],
    },
  }),
  useAddItemMasterMutation: () => [mockAddItem],
  useUpdateItemMasterMutation: () => [mockUpdateItem],
}));

jest.mock("../../../redux/uniformService/SizeMasterService", () => ({
  useGetSizeMasterQuery: () => ({
    data: {
      data: [{ id: 201, name: "M" }],
    },
  }),
  useAddSizeMasterMutation: () => [mockAddSize],
}));

jest.mock("../../../redux/uniformService/ColorMasterService", () => ({
  useGetColorMasterQuery: () => ({
    data: {
      data: [{ id: 301, name: "RED", code: "RED" }],
    },
  }),
  useAddColorMasterMutation: () => [mockAddColor],
}));

jest.mock("../../../redux/uniformService/UnitOfMeasurementServices", () => ({
  useGetUnitOfMeasurementMasterQuery: () => ({
    data: {
      data: [{ id: 401, name: "PCS" }],
    },
  }),
  useAddUnitOfMeasurementMasterMutation: () => [mockAddUom],
}));

jest.mock("../../../redux/services/BranchMasterService", () => ({
  useGetBranchQuery: () => ({
    data: {
      data: [{ id: 1, branchName: "Main Branch" }],
    },
  }),
}));

jest.mock("../../../redux/uniformService/LocationMasterServices", () => ({
  useGetLocationMasterQuery: () => ({
    data: {
      data: [{ id: 2, storeName: "Main Store" }],
    },
  }),
}));

jest.mock("../../../redux/uniformService/StockReportControl.Services", () => ({
  useGetStockReportControlQuery: () => ({
    data: {
      data: [{}],
    },
  }),
}));

jest.mock("../../../redux/services/StockService", () => ({
  useAddOpeningStockMutation: () => [mockAddOpeningStock],
}));

const defaultProps = {
  file: null,
  setFile: jest.fn(),
  pres: [],
  setPres: jest.fn(),
  params: { branchId: 1, companyId: 10, finYearId: 20, userId: 30 },
};

const createMutationResult = (data) => ({
  unwrap: jest.fn().mockResolvedValue(data),
});

const TestHarness = ({ initialStockItems }) => {
  const [stockItems, setStockItems] = React.useState(initialStockItems);
  return <ExcelSelectionTable {...defaultProps} stockItems={stockItems} setStockItems={setStockItems} />;
};

describe("Opening stock bulk import color review", () => {
  beforeEach(() => {
    mockAddOpeningStock.mockReset();
    mockAddItem.mockReset();
    mockUpdateItem.mockReset();
    mockAddSize.mockReset();
    mockAddColor.mockReset();
    mockAddUom.mockReset();
    mockToastWarning.mockReset();
    mockToastError.mockReset();
    mockSwalFire.mockReset();
    mockSwalShowLoading.mockReset();
    jest.spyOn(window, "confirm").mockReturnValue(true);

    mockAddOpeningStock.mockReturnValue(createMutationResult({ statusCode: 0, data: { id: 1 } }));
    mockAddItem.mockReturnValue(createMutationResult({ data: { id: 900 } }));
    mockUpdateItem.mockReturnValue(createMutationResult({ statusCode: 0, data: { id: 101 } }));
    mockAddSize.mockReturnValue(createMutationResult({ data: { id: 901 } }));
    mockAddColor
      .mockReturnValueOnce(createMutationResult({ data: { id: 902 } }))
      .mockReturnValueOnce(createMutationResult({ data: { id: 903 } }));
    mockAddUom.mockReturnValue(createMutationResult({ data: { id: 401 } }));
  });

  afterEach(() => {
    window.confirm.mockRestore();
  });

  const selectLocation = () => {
    fireEvent.change(screen.getByTestId("Location..."), { target: { value: "2" } });
  };

  it("blocks save when no rows have been added", async () => {
    render(<TestHarness initialStockItems={[]} />);

    selectLocation();
    fireEvent.click(screen.getByText("Save Stock"));

    expect(mockToastWarning).toHaveBeenCalledWith("Please add at least one row before saving.");
    expect(mockAddOpeningStock).not.toHaveBeenCalled();
  });

  it("saves directly when no colors are missing", async () => {
    render(
      <TestHarness
        initialStockItems={[
          {
            _rowId: 1,
            item_name: "SHIRT",
            itemId: 101,
            item_code: "SHIRT-001",
            size: "M",
            sizeId: 201,
            color: "RED",
            colorId: 301,
            uom: "PCS",
            uomId: 401,
            qty: "5",
            price: "100",
          },
        ]}
      />
    );

    selectLocation();
    fireEvent.click(screen.getByText("Save Stock"));

    await waitFor(() => {
      expect(mockAddOpeningStock).toHaveBeenCalledTimes(1);
    });

    expect(mockUpdateItem).toHaveBeenCalledTimes(1);
    expect(mockUpdateItem).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 101,
        code: "SHIRT-001",
        itemPriceList: [
          expect.objectContaining({
            id: 1001,
            barcode: "SHIRT-001",
            salesPrice: "100",
          }),
        ],
      })
    );

    const payload = mockAddOpeningStock.mock.calls[0][0];
    expect(payload.stockItems[0].barcode).toBe("SHIRT-001");
    expect(screen.queryByText("Review Missing Masters")).toBeNull();
  });

  it("uses the lightweight review path when only sizes are missing", async () => {
    render(
      <TestHarness
        initialStockItems={[
          {
            _rowId: 1,
            item_name: "SHIRT",
            itemId: 101,
            item_code: "SHIRT-001",
            size: "L",
            sizeId: "",
            color: "RED",
            colorId: 301,
            uom: "PCS",
            uomId: 401,
            qty: "3",
            price: "100",
          },
        ]}
      />
    );

    selectLocation();
    fireEvent.click(screen.getByText("Save Stock"));

    expect(screen.getByText("Review Missing Masters")).toBeTruthy();
    expect(screen.getByText("Missing Sizes")).toBeTruthy();
    expect(screen.queryByText("Missing Colors")).toBeNull();

    fireEvent.click(screen.getByText("Create & Continue"));

    await waitFor(() => {
      expect(mockAddSize).toHaveBeenCalledTimes(1);
      expect(mockAddOpeningStock).toHaveBeenCalledTimes(1);
    });
  });

  it("does not block legacy opening stock when size and color are blank", async () => {
    render(
      <TestHarness
        initialStockItems={[
          {
            _rowId: 1,
            item_name: "SHIRT",
            itemId: 101,
            item_code: "SHIRT-001",
            size: "",
            sizeId: "",
            color: "",
            colorId: "",
            uom: "PCS",
            uomId: 401,
            qty: "3",
            price: "100",
          },
        ]}
      />
    );

    selectLocation();
    fireEvent.click(screen.getByText("Save Stock"));

    await waitFor(() => {
      expect(mockAddOpeningStock).toHaveBeenCalledTimes(1);
    });

    expect(mockToastWarning).not.toHaveBeenCalledWith("Size is required at row 1");
    expect(mockToastWarning).not.toHaveBeenCalledWith("Color is required at row 1");
  });

  it("requires color codes, rejects duplicates, creates reviewed colors, and reuses created ids in stock rows", async () => {
    render(
      <TestHarness
        initialStockItems={[
          {
            _rowId: 1,
            item_name: "SHIRT",
            itemId: 101,
            item_code: "SHIRT-001",
            size: "M",
            sizeId: 201,
            color: "BLUE",
            colorId: "",
            uom: "PCS",
            uomId: 401,
            qty: "2",
            price: "100",
          },
          {
            _rowId: 2,
            item_name: "PANTS",
            itemId: 102,
            item_code: "PANTS-001",
            size: "M",
            sizeId: 201,
            color: "GREEN",
            colorId: "",
            uom: "PCS",
            uomId: 401,
            qty: "1",
            price: "120",
          },
        ]}
      />
    );

    selectLocation();
    fireEvent.click(screen.getByText("Save Stock"));

    expect(screen.getByText("Missing Colors")).toBeTruthy();
    expect(screen.getAllByText("BLUE").length).toBeGreaterThan(0);
    expect(screen.getAllByText("GREEN").length).toBeGreaterThan(0);

    expect(screen.getByText("Create & Continue").disabled).toBe(true);

    const codeInputs = screen.getAllByPlaceholderText("Enter color code");
    fireEvent.change(codeInputs[0], { target: { value: "dup" } });
    fireEvent.change(codeInputs[1], { target: { value: "dup" } });

    expect(screen.getAllByText("Color code must be unique within this batch.").length).toBeGreaterThan(0);
    expect(screen.getByText("Create & Continue").disabled).toBe(true);

    fireEvent.change(codeInputs[0], { target: { value: "blu" } });
    fireEvent.change(codeInputs[1], { target: { value: "grn" } });

    await waitFor(() => {
      expect(screen.getByText("Create & Continue").disabled).toBe(false);
    });

    fireEvent.click(screen.getByText("Create & Continue"));

    await waitFor(() => {
      expect(mockAddColor).toHaveBeenCalledTimes(2);
      expect(mockAddOpeningStock).toHaveBeenCalledTimes(1);
    });

    expect(mockAddColor).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ name: "BLUE", code: "BLU" })
    );
    expect(mockAddColor).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ name: "GREEN", code: "GRN" })
    );

    const payload = mockAddOpeningStock.mock.calls[0][0];
    expect(payload.stockItems[0].colorId).toBe(902);
    expect(payload.stockItems[1].colorId).toBe(903);
  });

  it("creates missing legacy items using item code as barcode identity and row price as sales price", async () => {
    render(
      <TestHarness
        initialStockItems={[
          {
            _rowId: 1,
            item_name: "NEW SHIRT",
            item_code: "NEW-001",
            size: "M",
            sizeId: 201,
            color: "RED",
            colorId: 301,
            uom: "PCS",
            uomId: 401,
            qty: "2",
            price: "220",
          },
        ]}
      />
    );

    selectLocation();
    fireEvent.click(screen.getByText("Save Stock"));

    expect(screen.getByText("Review Missing Masters")).toBeTruthy();
    expect(screen.getByText("NEW SHIRT")).toBeTruthy();
    expect(screen.getByText("NEW-001")).toBeTruthy();

    fireEvent.click(screen.getByText("Create & Continue"));

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledTimes(1);
      expect(mockAddOpeningStock).toHaveBeenCalledTimes(1);
    });

    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "NEW SHIRT",
        code: "NEW-001",
        itemPriceList: [
          expect.objectContaining({
            barcode: "NEW-001",
            salesPrice: 220,
          }),
        ],
      })
    );

    const payload = mockAddOpeningStock.mock.calls[0][0];
    expect(payload.stockItems[0].barcode).toBe("NEW-001");
    expect(payload.stockItems[0].itemId).toBe(900);
  });

  it("highlights actionable cells directly instead of showing a status column", () => {
    const { container } = render(
      <TestHarness
        initialStockItems={[
          {
            _rowId: 1,
            item_name: "NEW SHIRT",
            item_code: "",
            size: "M",
            sizeId: 201,
            color: "RED",
            colorId: 301,
            uom: "PCS",
            uomId: 401,
            qty: "2",
            price: "220",
          },
        ]}
      />
    );

    expect(screen.queryByText("Status")).toBeNull();

    const itemNameInput = screen.getByDisplayValue("NEW SHIRT");
    expect(itemNameInput.getAttribute("title")).toBe("Item NEW SHIRT will be created during save");
    expect(itemNameInput.closest("td")?.className).toContain("bg-amber-50");
    expect(screen.getByDisplayValue("2").getAttribute("title")).toBe("");

    const itemCodeInput = container.querySelector('input[title="Item Code is required"]');
    expect(itemCodeInput).not.toBeNull();
    expect(itemCodeInput.closest("td")?.className).toContain("bg-red-50");
  });

  it("uses one shared review flow for a mixed batch with existing and newly added rows", async () => {
    const { container } = render(
      <TestHarness
        initialStockItems={[
          {
            _rowId: 1,
            item_name: "SHIRT",
            itemId: 101,
            item_code: "SHIRT-001",
            size: "M",
            sizeId: 201,
            color: "RED",
            colorId: 301,
            uom: "PCS",
            uomId: 401,
            qty: "5",
            price: "100",
          },
        ]}
      />
    );

    fireEvent.click(screen.getByText("Add Row"));

    const tableInputs = container.querySelectorAll("tbody input");
    fireEvent.change(tableInputs[6], { target: { value: "MIX ITEM" } });
    fireEvent.change(tableInputs[7], { target: { value: "XL" } });
    fireEvent.change(tableInputs[8], { target: { value: "BLUE" } });
    fireEvent.change(tableInputs[9], { target: { value: "MIX-001" } });
    fireEvent.change(tableInputs[10], { target: { value: "250" } });
    fireEvent.change(tableInputs[11], { target: { value: "4" } });

    selectLocation();
    fireEvent.click(screen.getByText("Save Stock"));

    expect(screen.getByText("Review Missing Masters")).toBeTruthy();
    expect(screen.getByText("Missing Items")).toBeTruthy();
    expect(screen.getByText("Missing Sizes")).toBeTruthy();
    expect(screen.getByText("Missing Colors")).toBeTruthy();
    expect(screen.getByText("MIX ITEM")).toBeTruthy();
  });
});
