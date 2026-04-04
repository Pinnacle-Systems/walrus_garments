## 1. Extend the shared sales footer

- [x] 1.1 Update `client/src/Uniform/Components/ReusableComponents/CommonFormFooter.jsx` to support separate packing and shipping charge checkboxes in the total-quantity summary area.
- [x] 1.2 Add conditional right-hand totals rows for Packing Charge and Shipping Charge, including editable numeric inputs and read-only display behavior.
- [x] 1.3 Ensure the shared footer can render net amount using the existing net total plus selected packing and shipping charges without changing gross or tax rows.

## 2. Wire charge state through the in-scope sales screens

- [x] 2.1 Add separate packing and shipping enabled states and amount values to Quotation, Sale Order, Sales Delivery, Sales Invoice, and Sales Return footer wiring.
- [x] 2.2 Update each in-scope sales screen's totals mapping so footer net amount includes only the selected packing and shipping amounts.
- [x] 2.3 Update transaction save/load mapping so supported sales records persist and restore packing and shipping charge state separately.

## 3. Verify sales-footer behavior

- [x] 3.1 Smoke test editable footer behavior on Quotation, Sale Order, Sales Delivery, Sales Invoice, and Sales Return for packing-only, shipping-only, both-selected, and both-cleared cases.
- [x] 3.2 Verify read-only and reopened records show the saved packing and shipping rows correctly and preserve the same net amount.
- [x] 3.3 Check compact-footer responsiveness so the new checkboxes and charge rows remain usable without clipping on representative desktop and laptop widths.
