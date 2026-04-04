import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import TransactionEntryShell from "./TransactionEntryShell";

describe("TransactionEntryShell", () => {
  it("renders blank optional summary values and keeps a pinned footer/body shell structure", () => {
    const { container } = render(
      <TransactionEntryShell
        title="Sales Delivery"
        onClose={jest.fn()}
        headerOpen={false}
        setHeaderOpen={jest.fn()}
        summaryItems={[
          { label: "No", value: "SD-001" },
          { label: "Sale Order", value: "" },
        ]}
        headerContent={<div>Header Content</div>}
        footer={<div>Footer Actions</div>}
      >
        <div data-testid="body-child">Line Items</div>
      </TransactionEntryShell>
    );

    expect(container.firstChild.className).toContain("flex h-full min-h-0 flex-col gap-2 overflow-hidden");
    expect(screen.getByText("Header Details")).toBeTruthy();
    expect(screen.getByText("No")).toBeTruthy();

    const saleOrderSummaryLabel = screen.getByText("Sale Order");
    const saleOrderSummaryRow = saleOrderSummaryLabel.parentElement;
    expect(saleOrderSummaryRow).toBeTruthy();
    expect(saleOrderSummaryRow.lastChild.textContent).toBe("");

    const bodyRegion = screen.getByTestId("body-child").parentElement;
    expect(bodyRegion.className).toContain("min-h-0 flex-1 overflow-hidden");

    const footerWrapper = screen.getByText("Footer Actions").parentElement;
    expect(footerWrapper.className).toContain("shrink-0 rounded-md border border-slate-200 bg-white");
  });

  it("toggles the header with the shared disclosure control", () => {
    const setHeaderOpen = jest.fn();

    render(
      <TransactionEntryShell
        title="Quotation"
        onClose={jest.fn()}
        headerOpen
        setHeaderOpen={setHeaderOpen}
        summaryItems={[]}
        headerContent={<div>Header Content</div>}
      >
        <div>Body</div>
      </TransactionEntryShell>
    );

    fireEvent.click(screen.getByRole("button", { name: /header details/i }));
    expect(setHeaderOpen).toHaveBeenCalledTimes(1);
  });
});
