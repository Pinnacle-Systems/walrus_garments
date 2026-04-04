import React from "react";
import fs from "fs";
import path from "path";
import { fireEvent, render, screen } from "@testing-library/react";
import CommonFormFooter from "./CommonFormFooter";

describe("CommonFormFooter", () => {
  it("preserves shared notes, totals, actions, and compact footer typography", () => {
    const { container } = render(
      <CommonFormFooter
        remarks="Handle with care"
        setRemarks={jest.fn()}
        terms="No returns after cutting."
        setTerms={jest.fn()}
        readOnly={false}
        totalQty={2}
        subtotal={100}
        taxAmount={5}
        netAmount={105}
        chargeOptions={[
          {
            key: "packing",
            label: "Packing",
            checked: true,
            onToggle: jest.fn(),
          },
        ]}
        leftActions={<button type="button">Save</button>}
        rightActions={<button type="button">Print</button>}
      />
    );

    expect(screen.getByText("Terms & Conditions").className).toContain("text-[12px]");
    expect(screen.getByText("Remarks").className).toContain("text-[12px]");
    expect(screen.getByText("Packing").closest("label").className).toContain("text-[11px]");
    expect(screen.getByText("Total Quantity")).toBeTruthy();
    expect(screen.getByText("Gross Amount")).toBeTruthy();
    expect(screen.getByText("GST Amount")).toBeTruthy();
    expect(screen.getByText("Net Amount").className).toContain("font-semibold");
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Print" })).toBeTruthy();

    const actionsWrapper = screen.getByRole("button", { name: "Save" }).closest("div").parentElement;
    expect(actionsWrapper.className).toContain("mt-0.5 flex flex-col justify-between gap-1.5 md:flex-row md:items-center");
  });

  it("supports editable packing and shipping charge combinations without merging the rows", () => {
    const onPackingToggle = jest.fn();
    const onShippingToggle = jest.fn();

    const { rerender } = render(
      <CommonFormFooter
        remarks=""
        setRemarks={jest.fn()}
        terms=""
        setTerms={jest.fn()}
        readOnly={false}
        totalsRows={[
          { key: "totalQty", label: "Total Qty", value: "2", summaryColumn: "left" },
          { key: "gross", label: "Gross Amount", value: "100.00", summaryColumn: "right" },
          { key: "gst", label: "GST Amount", value: "5.00", summaryColumn: "right" },
          { key: "net", label: "Net Amount", value: "105.00", emphasized: true, summaryColumn: "right" },
        ]}
        chargeOptions={[
          { key: "packingChargeToggle", label: "Packing", checked: false, onToggle: onPackingToggle },
          { key: "shippingChargeToggle", label: "Shipping", checked: false, onToggle: onShippingToggle },
        ]}
      />
    );

    expect(screen.getByLabelText("Packing").checked).toBe(false);
    expect(screen.getByLabelText("Shipping").checked).toBe(false);
    expect(screen.queryByDisplayValue("12.00")).toBeNull();
    expect(screen.queryByDisplayValue("8.00")).toBeNull();

    fireEvent.click(screen.getByLabelText("Packing"));
    fireEvent.click(screen.getByLabelText("Shipping"));
    expect(onPackingToggle).toHaveBeenCalledWith(true);
    expect(onShippingToggle).toHaveBeenCalledWith(true);

    rerender(
      <CommonFormFooter
        remarks=""
        setRemarks={jest.fn()}
        terms=""
        setTerms={jest.fn()}
        readOnly={false}
        totalsRows={[
          { key: "totalQty", label: "Total Qty", value: "2", summaryColumn: "left" },
          { key: "gross", label: "Gross Amount", value: "100.00", summaryColumn: "right" },
          {
            key: "packingCharge",
            label: "Packing Charge",
            summaryColumn: "right",
            renderValue: () => <input aria-label="Packing Charge" value="12.00" readOnly />,
          },
          {
            key: "shippingCharge",
            label: "Shipping Charge",
            summaryColumn: "right",
            renderValue: () => <input aria-label="Shipping Charge" value="8.00" readOnly />,
          },
          { key: "gst", label: "GST Amount", value: "5.00", summaryColumn: "right" },
          { key: "net", label: "Net Amount", value: "125.00", emphasized: true, summaryColumn: "right" },
        ]}
        chargeOptions={[
          { key: "packingChargeToggle", label: "Packing", checked: true, onToggle: onPackingToggle },
          { key: "shippingChargeToggle", label: "Shipping", checked: true, onToggle: onShippingToggle },
        ]}
      />
    );

    expect(screen.getByLabelText("Packing").checked).toBe(true);
    expect(screen.getByLabelText("Shipping").checked).toBe(true);
    expect(screen.getByDisplayValue("12.00")).toBeTruthy();
    expect(screen.getByDisplayValue("8.00")).toBeTruthy();
    expect(screen.getByText("Net Amount").parentElement.textContent).toContain("125.00");
  });

  it("shows only applied charges in read-only mode and keeps the compact responsive footer layout", () => {
    const { container } = render(
      <CommonFormFooter
        remarks="Saved note"
        setRemarks={jest.fn()}
        terms="Saved terms"
        setTerms={jest.fn()}
        readOnly
        totalsRows={[
          { key: "totalQty", label: "Total Qty", value: "2", summaryColumn: "left" },
          {
            key: "packingCharge",
            label: "Packing Charge",
            summaryColumn: "right",
            renderValue: () => <input aria-label="Packing Charge" value="15.00" readOnly />,
          },
          { key: "net", label: "Net Amount", value: "120.00", emphasized: true, summaryColumn: "right" },
        ]}
        chargeOptions={[
          { key: "packingChargeToggle", label: "Packing", checked: true, onToggle: jest.fn() },
          { key: "shippingChargeToggle", label: "Shipping", checked: false, onToggle: jest.fn() },
        ]}
      />
    );

    expect(screen.getByLabelText("Packing").checked).toBe(true);
    expect(screen.queryByLabelText("Shipping")).toBeNull();
    expect(screen.getByDisplayValue("15.00").readOnly).toBe(true);
    expect(screen.getByText("Net Amount").parentElement.textContent).toContain("120.00");
    expect(screen.getByText("Packing").closest("label").className).toContain("text-[11px]");
    expect(container.querySelector(".md\\:grid-cols-12").className).toContain("md:grid-cols-12");
  });

  it("treats templates as prefill helpers and confirms before replacing existing terms text", () => {
    const setTerms = jest.fn();
    const onTermChange = jest.fn();
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => false);

    const termOptions = [
      { value: "1", label: "Standard", templateText: "Standard template text" },
      { value: "2", label: "Replacement", templateText: "Replacement template text" },
    ];

    const { rerender } = render(
      <CommonFormFooter
        remarks=""
        setRemarks={jest.fn()}
        terms=""
        setTerms={setTerms}
        readOnly={false}
        showTermSelect
        termValue=""
        onTermChange={onTermChange}
        termOptions={termOptions}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Apply template" }));
    fireEvent.click(screen.getByRole("button", { name: /Standard/ }));

    expect(setTerms).toHaveBeenCalledWith("Standard template text");
    expect(onTermChange).toHaveBeenCalledWith("1", expect.objectContaining({ label: "Standard" }));
    expect(window.confirm).not.toHaveBeenCalled();

    setTerms.mockClear();
    onTermChange.mockClear();
    window.confirm.mockClear();

    rerender(
      <CommonFormFooter
        remarks=""
        setRemarks={jest.fn()}
        terms="Custom saved terms"
        setTerms={setTerms}
        readOnly={false}
        showTermSelect
        termValue=""
        onTermChange={onTermChange}
        termOptions={termOptions}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Apply template" }));
    fireEvent.click(screen.getByRole("button", { name: /Replacement/ }));

    expect(window.confirm).toHaveBeenCalledWith("Replace current terms with the selected template?");
    expect(setTerms).not.toHaveBeenCalled();
    expect(onTermChange).not.toHaveBeenCalled();

    window.confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: /Replacement/ }));

    expect(setTerms).toHaveBeenCalledWith("Replacement template text");
    expect(onTermChange).toHaveBeenCalledWith("2", expect.objectContaining({ label: "Replacement" }));

    window.confirm = originalConfirm;
  });

  it("shows saved transaction terms text directly in read-only mode without template helper controls", () => {
    render(
      <CommonFormFooter
        remarks=""
        setRemarks={jest.fn()}
        terms="Saved transaction terms snapshot"
        setTerms={jest.fn()}
        readOnly
        showTermSelect
        termValue="1"
        onTermChange={jest.fn()}
        termOptions={[{ value: "1", label: "Template A", templateText: "Live master text" }]}
      />
    );

    expect(screen.queryByRole("button", { name: "Apply template" })).toBeNull();
    expect(screen.getByDisplayValue("Saved transaction terms snapshot").disabled).toBe(true);
    expect(screen.queryByText("Live master text")).toBeNull();
  });
});

describe("sales footer charge wiring", () => {
  const salesFormFiles = [
    "client/src/Uniform/Components/Quotation/QuotationFormUI.jsx",
    "client/src/Uniform/Components/SaleOrder/SaleOrderForm.jsx",
    "client/src/Uniform/Components/SalesDelivery/SalesDeliveryForm.jsx",
    "client/src/Uniform/Components/SalesInvoice/SalesInvoiceForm.jsx",
    "client/src/Uniform/Components/SalesReturn/SalesReturnForm.jsx",
  ];

  it.each(salesFormFiles)("%s keeps separate packing/shipping state, rows, and persistence wiring", (relativeFile) => {
    const absoluteFile = path.resolve(process.cwd(), "..", relativeFile);
    const source = fs.readFileSync(absoluteFile, "utf8");

    expect(source).toContain("const [packingChargeEnabled, setPackingChargeEnabled] = useState(false);");
    expect(source).toContain('const [packingCharge, setPackingCharge] = useState("");');
    expect(source).toContain("const [shippingChargeEnabled, setShippingChargeEnabled] = useState(false);");
    expect(source).toContain('const [shippingCharge, setShippingCharge] = useState("");');
    expect(source).toContain("packingChargeEnabled,");
    expect(source).toContain("shippingChargeEnabled,");
    expect(source).toContain('label: "Packing Charge"');
    expect(source).toContain('label: "Shipping Charge"');
    expect(source).toContain('key: "packingChargeToggle"');
    expect(source).toContain('key: "shippingChargeToggle"');
    expect(source).toContain("const extraCharges = (packingChargeEnabled ? parseChargeAmount(packingCharge) : 0) + (shippingChargeEnabled ? parseChargeAmount(shippingCharge) : 0);");
  });
});

describe("sales terms prefill wiring", () => {
  const salesTermsFiles = [
    {
      file: "client/src/Uniform/Components/Quotation/QuotationFormUI.jsx",
      loadSnippet: 'setTerms(data?.termsAndCondition || "");',
      saveSnippet: "termsAndCondition: terms,",
    },
    {
      file: "client/src/Uniform/Components/SaleOrder/SaleOrderForm.jsx",
      loadSnippet: 'setTerms(data?.terms || "");',
      saveSnippet: "terms,",
    },
    {
      file: "client/src/Uniform/Components/SalesDelivery/SalesDeliveryForm.jsx",
      loadSnippet: 'setTerms(data?.terms ? data?.terms : "")',
      saveSnippet: "terms,",
    },
    {
      file: "client/src/Uniform/Components/SalesInvoice/SalesInvoiceForm.jsx",
      loadSnippet: 'setTerms(data?.terms ? data?.terms : "")',
      saveSnippet: "terms,",
    },
    {
      file: "client/src/Uniform/Components/SalesReturn/SalesReturnForm.jsx",
      loadSnippet: 'setTerms(data?.terms ? data?.terms : "")',
      saveSnippet: "terms,",
    },
  ];

  it.each(salesTermsFiles)("%s loads saved text snapshots and keeps template selection as helper state", ({ file, loadSnippet, saveSnippet }) => {
    const absoluteFile = path.resolve(process.cwd(), "..", file);
    const source = fs.readFileSync(absoluteFile, "utf8");

    expect(source).toContain('const [terms, setTerms] = useState("")');
    expect(source).toContain('const [term, setTerm] = useState("")');
    expect(source).toContain(loadSnippet);
    expect(source).toContain(saveSnippet);
    expect(source).toContain("terms={terms}");
    expect(source).toContain("termValue={term}");
    expect(source).toContain("onTermChange={handleTermTemplateChange}");
    expect(source).toContain('templateText: blend?.termsAndCondition || blend?.description || ""');
  });
});
