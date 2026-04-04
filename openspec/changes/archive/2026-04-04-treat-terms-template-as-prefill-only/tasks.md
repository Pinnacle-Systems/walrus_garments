## 1. Align the transaction terms contract

- [x] 1.1 Audit the supported sales transaction forms and their service payloads to identify which screens currently save or load template ids versus final transaction terms text.
- [x] 1.2 Update the affected save/load mappings so supported transactions persist only the final terms text and no longer depend on stored template ids as transaction state.

## 2. Update the shared footer interaction

- [x] 2.1 Refine the shared footer copy and control behavior so the template selector is presented as a prefill helper and the terms textarea is presented as the final saved value.
- [x] 2.2 Implement template-apply behavior so selecting a template fills an empty terms field immediately but requires explicit confirmation before replacing existing terms text.
- [x] 2.3 Ensure read-only and edit-mode behavior load saved transaction terms text directly without reconstructing terms from the template master.

## 3. Verify supported transaction behavior

- [x] 3.1 Smoke test quotation, sale order, sales invoice, sales delivery, and sales return to confirm templates prefill terms correctly and saved transactions reopen with their saved text snapshot.
- [x] 3.2 Verify that changing templates after manual edits does not silently discard existing terms text and that the replacement confirmation behaves correctly.
- [x] 3.3 Verify that printed and read-only transaction views continue to show the saved final transaction terms text rather than live template-master content.
