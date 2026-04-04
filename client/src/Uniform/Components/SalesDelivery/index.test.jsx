import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import SalesDelivery from "./index";

const mockDispatch = jest.fn();
const mockSaleOrderQueryResult = {
  data: {
    data: {
      id: 42,
      customerId: 88,
      payTermId: 9,
      branchId: 5,
      storeId: 7,
      totalReceivedAmount: 1000,
      remainingPaymentCapacity: 550,
      remainingSaleOrderItems: [
        { id: 501, saleOrderItemId: 501, itemId: 11, qty: "2.000", price: "100.00" },
      ],
    },
  },
};

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      openTabs: {
        tabs: [{ active: true, name: "SALES DELIVERY", projectId: 42 }],
      },
    }),
}));

jest.mock("../../../Utils/helper", () => ({
  getCommonParams: () => ({
    branchId: 1,
    userId: 2,
    companyId: 3,
    finYearId: 4,
  }),
  getDateFromDateTime: () => "2026-04-03",
}));

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

jest.mock("../../../redux/services/HsnMasterServices", () => ({
  useGetHsnMasterQuery: () => ({ data: { data: [] } }),
}));

jest.mock("../../../redux/services/Term&ConditionsMasterService", () => ({
  useGetTermsandCondtionsQuery: () => ({ data: { data: [] } }),
}));

jest.mock("../../../redux/uniformService/salesDeliveryServices", () => ({
  useDeleteSalesDeliveryMutation: () => [jest.fn()],
}));

jest.mock("../../../redux/uniformService/saleOrderServices", () => ({
  useGetsaleOrderByIdQuery: () => mockSaleOrderQueryResult,
}));

jest.mock("../../../CustomHooks/useInvalidateTags", () => () => [jest.fn()]);
jest.mock("sweetalert2", () => ({ fire: jest.fn() }));

jest.mock("./SalesDeliveryReport", () => () => <div>Sales Delivery Report</div>);

jest.mock("./SalesDeliveryForm", () => (props) => (
  <div>
    <div>Sales Delivery Form</div>
    <div data-testid="customer-id">{String(props.customerId)}</div>
    <div data-testid="delivery-items">{String(props.deliveryItems?.length || 0)}</div>
    <div data-testid="source-line-id">{String(props.deliveryItems?.[0]?.saleOrderItemId || "")}</div>
    <div data-testid="remaining-payment-capacity">{String(props.remainingPaymentCapacity)}</div>
    <div data-testid="total-received-amount">{String(props.totalReceivedAmount)}</div>
  </div>
));

describe("SalesDelivery conversion flow", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it("prefills delivery conversion from sale order values and remaining items", async () => {
    render(<SalesDelivery />);

    await waitFor(() => {
      expect(screen.getByText("Sales Delivery Form")).toBeTruthy();
    });

    expect(screen.getByTestId("customer-id").textContent).toBe("88");
    expect(screen.getByTestId("delivery-items").textContent).toBe("1");
    expect(screen.getByTestId("source-line-id").textContent).toBe("501");
    expect(screen.getByTestId("remaining-payment-capacity").textContent).toBe("550");
    expect(screen.getByTestId("total-received-amount").textContent).toBe("1000");
  });
});
