import React from "react";
import { render, screen } from "@testing-library/react";
import TransactionLineItemsSection, {
  transactionTableHeadClassName,
  transactionTableHeaderCellClassName,
} from "./TransactionLineItemsSection";

describe("TransactionLineItemsSection", () => {
  it("provides the shared framed table surface with independent overflow", () => {
    const { container } = render(
      <TransactionLineItemsSection title="List Of Items" actions={<button type="button">Add Row</button>}>
        <div data-testid="table-content">Rows</div>
      </TransactionLineItemsSection>
    );

    expect(screen.getByText("List Of Items").className).toContain("font-medium text-slate-700");
    expect(screen.getByRole("button", { name: "Add Row" })).toBeTruthy();
    expect(container.firstChild.className).toContain("rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden");
    expect(screen.getByTestId("table-content").parentElement.className).toContain("min-h-0 flex-1 overflow-auto");
    expect(transactionTableHeadClassName).toContain("sticky top-0");
    expect(transactionTableHeaderCellClassName).toContain("text-[12px]");
  });
});
