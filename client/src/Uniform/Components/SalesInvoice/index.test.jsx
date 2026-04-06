import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SalesInvoice from "./index";

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      openTabs: {
        tabs: [{ active: true, name: "SALES INVOICE", projectId: undefined }],
      },
    }),
}));

jest.mock("../../../redux/features/opentabs", () => ({
  push: jest.fn((payload) => payload),
}));

jest.mock("../../../Utils/helper", () => ({
  getCommonParams: () => ({
    branchId: 1,
    userId: 2,
    companyId: 3,
    finYearId: 4,
  }),
  getDateFromDateTime: () => "2026-04-03",
  findFromList: jest.fn(),
}));

jest.mock("sweetalert2", () => ({ fire: jest.fn() }));

jest.mock("../../../redux/services/PartyMasterService", () => ({
  useGetPartyQuery: () => ({ data: { data: [] } }),
}));

jest.mock("../../../redux/uniformService/LocationMasterServices", () => ({
  useGetLocationMasterQuery: () => ({ data: { data: [] } }),
}));

jest.mock("../../../redux/services/BranchMasterService", () => ({
  useGetBranchQuery: () => ({ data: { data: [] } }),
}));

jest.mock("../../../redux/uniformService/YarnMasterServices", () => ({
  useGetYarnMasterQuery: () => ({ data: { data: [] } }),
}));

jest.mock("../../../redux/uniformService/ColorMasterService", () => ({
  useGetColorMasterQuery: () => ({ data: { data: [] } }),
}));

jest.mock("../../../redux/services/UomMasterService", () => ({
  useGetUomQuery: () => ({ data: { data: [] } }),
}));

jest.mock("../../../redux/services/Term&ConditionsMasterService", () => ({
  useGetTermsandCondtionsQuery: () => ({ data: { data: [] } }),
}));

jest.mock("../../../redux/uniformService/saleOrderServices", () => ({
  useGetsaleOrderByIdQuery: () => ({ data: undefined, isFetching: false }),
}));

jest.mock("../../../redux/uniformService/salesInvoiceServices", () => ({
  useDeleteSalesInvoiceMutation: () => [jest.fn()],
}));

jest.mock("../../../CustomHooks/useInvalidateTags", () => () => [jest.fn()]);

jest.mock("./SalesInvoiceForm", () => (props) => (
  <div>
    <div>Sales Invoice Form</div>
    <div data-testid="invoice-form-id">{String(props.id || "")}</div>
  </div>
));

jest.mock("./SalesInvoiceReport", () => (props) => (
  <div>
    <div>Sales Invoice Report</div>
    <button onClick={() => props.onEdit(321)}>Edit Invoice</button>
  </div>
));

describe("SalesInvoice standalone module", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it("shows the standalone report and opens the form for create without requiring conversion context", async () => {
    render(<SalesInvoice />);

    expect(screen.getByText("Sales Invoice Report")).toBeTruthy();
    expect(screen.queryByText("Sales Invoice Form")).toBeNull();

    fireEvent.click(screen.getByText(/Create New/i));

    await waitFor(() => {
      expect(screen.getByText("Sales Invoice Form")).toBeTruthy();
    });
  });

  it("opens the standalone form for edit from the report", async () => {
    render(<SalesInvoice />);

    fireEvent.click(screen.getByText("Edit Invoice"));

    await waitFor(() => {
      expect(screen.getByTestId("invoice-form-id").textContent).toBe("321");
    });
  });
});
