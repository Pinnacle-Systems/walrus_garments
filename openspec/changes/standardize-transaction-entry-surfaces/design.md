## Context

The sales and purchase transaction module contains multiple independently built entry screens. Purchase Inward has already moved toward the desired workspace model: a fixed-height transaction shell, a collapsible header that surfaces key values when collapsed, a scrollable center area, a visible footer action bar, and a more consistent line-item section. Several related document screens still use older layouts where the page scrolls as a whole, header details remain bulky, footer actions drift off-screen, or tables use unrelated visual treatments.

The design goal is no longer limited to making tables look similar. The goal is to make the full transaction-entry experience feel like one coherent product while preserving each transaction's domain-specific fields and business behavior.

## Goals / Non-Goals

**Goals:**
- Establish the recent Purchase Inward implementation as the reference for the full transaction-entry surface, not only the line-item grid.
- Standardize shared shell concerns: fixed-height workspace, collapsible header card, collapsed summary values, scrollable middle content region, pinned footer actions, and line-item section framing.
- Standardize header-detail presentation inside the shell, including fieldset-like section cards with consistent legend/title treatment delivered through shared presentational helpers while keeping group structure screen-owned.
- Standardize collapsed summary presentation while allowing each screen to choose which values to show and in what order, provided the screen supplies the same visible display strings used in the expanded fields for any summarized value. Optional linked-document values should render as empty when absent rather than using a generic placeholder.
- Standardize transaction-entry typography inside the shared shell, including section headers, field labels, collapsed summary labels and values, footer notes, and footer totals text, so dense transaction layouts still feel like one product family.
- Standardize shared table concerns inside that shell: sticky headers, spacing, row numbering, required markers, read-only behavior, action placement, empty-row handling, and inline-editing feel.
- Allow each in-scope transaction flow to keep its own business-specific header fields, columns, editors, validations, and row-level modals.
- Make the core sales and purchase document screens adopt the same entry-shell pattern through shared layout and presentation primitives.

**Non-Goals:**
- Rework transaction business logic, save flows, routing, or backend payloads.
- Normalize all transaction fields into one universal schema or make all screens structurally identical.
- Redesign reports, print formats, dashboards, inventory utility screens, or unrelated lookup dialogs unless they directly embed the edited transaction-entry surfaces.

## Decisions

1. Standardize the transaction workspace shell in addition to the line-item table.
Purchase Inward should serve as the baseline for the surrounding experience: document title area, collapsible header card, compact collapsed summary, growing scrollable content area, visible footer actions, and consistent line-item treatment. The shared abstraction should therefore cover more than the table wrapper.

Alternative considered: keep the current change narrowly focused on tables only.
This was rejected because the screenshots show that users experience inconsistency at the page-shell level as much as at the row or cell level.

2. Introduce a higher-level transaction-entry primitive.
The shared component strategy should grow from a table section wrapper into a small family of entry-shell primitives, likely including a shell component, a collapsible header/summary component, a mandatory small presentational helper for header-section treatment on every in-scope screen, a line-item section component, and an optional footer bar component.

Alternative considered: copy Purchase Inward layout markup into each screen separately.
This was rejected because it would spread another round of duplication and make later layout refinements expensive.

3. Use configurable collapsed summaries rather than one hardcoded header strip.
Different in-scope transaction types expose different key values. The shared header-summary primitive should accept a configurable set of labeled summary values so screens can map their own document number, date, party, branch, location, linked document, and type fields into a common presentation. Summary selection and ordering should remain flexible per screen.

Alternative considered: hardcode the Purchase Inward collapsed summary fields everywhere.
This was rejected because screens such as quotation, sales delivery, and purchase return do not share exactly the same header semantics.

4. Standardize expanded header groups with shared fieldset-style sections while keeping structure local.
The expanded header area should not remain a collection of unrelated per-screen cards. It should use a shared presentation pattern derived from Purchase Inward: bordered grouped sections with consistent legend-style titles, spacing, and label treatment so transaction headers feel like the same product family even when field content differs. The consuming screen should still decide its own groups, fields, and layout composition.

Alternative considered: only standardize collapse behavior and let each screen keep bespoke expanded header styling.
This was rejected because the expanded header is a major part of the transaction-entry surface, and mismatched section styling leaves the screens visibly inconsistent even after collapse behavior is aligned.

5. Standardize transaction-entry typography by semantic role.
The shared transaction-entry pattern should carry a consistent type scale rather than leaving every screen to choose local sizes. Section headers, grouped-header legends, collapsed summary labels and values, field labels, notes text, and totals text should follow shared tiers so later density adjustments remain centralized and sales and purchase transaction screens continue to move together.

Alternative considered: handle typography as a separate follow-up change outside the transaction-entry standardization work.
This was rejected because the typography choices directly affect whether the shared shell feels coherent and compact, and splitting them out creates another source of drift between the same in-scope screens.

6. Collapsed summaries rely on consumer-provided display strings.
Collapsed header labels should display the same visible values the user sees in the expanded fields, including formatting and label semantics, rather than loosely related aliases or alternate lookup text. Screens may choose which fields to summarize and in what order, but when a field is summarized the consuming screen should pass the same visible display string used by the expanded header. The shared shell should render those values rather than derive alternate ones. For optional linked-document values, both the expanded header and collapsed summary should render nothing when the value is absent.

Alternative considered: allow collapsed summaries to use approximate or differently sourced display values.
This was rejected because it causes trust and comprehension issues when the collapsed strip does not exactly match the editable or read-only header fields above it.

7. Keep the footer pinned and let the body region absorb layout changes.
The content region should scroll independently while footer actions remain visible. When the header collapses, the body region should gain usable vertical space, making line-item entry denser and faster without changing screen-level business behavior.

Alternative considered: let the whole page continue to scroll normally.
This was rejected because it reduces the operational value of a compact collapsed header and makes primary actions harder to keep visible.

8. Roll out by transaction family with verification after each family.
Because layout refactors can disturb keyboard flow, focus order, modals, summary mapping, and action availability, the migration should proceed screen-by-screen or family-by-family with targeted smoke testing.

Alternative considered: perform one broad cosmetic pass over every screen with light verification.
This was rejected because transaction entry screens contain many subtle interactions that can regress even when business logic is untouched.

## Risks / Trade-offs

- [Expanding the scope increases implementation effort] -> Keep the shared shell minimal and configuration-driven so screens can adopt it incrementally.
- [Pinned footers and fixed-height containers can expose hidden overflow bugs] -> Validate scroll regions, sticky headers, and footer visibility on representative wide and dense screens.
- [Collapsed summary fields may become inconsistent or incomplete if configured ad hoc] -> Keep summary selection flexible but standardize the shell rendering and require consumers to pass display-ready values.
- [Expanded header groups may still look inconsistent if styling remains screen-specific] -> Define a mandatory tiny shared fieldset-style presentational helper and migrate every in-scope screen to it.
- [Typography could drift again if some transaction screens keep local one-off text sizing] -> Treat type size as part of the shared transaction-entry contract and update the shared primitives before allowing per-screen overrides.
- [Consumers may pass generic fallback strings that do not match intended empty-state behavior for optional linked documents] -> Treat linked-document absence as blank in both expanded and collapsed states and verify that behavior during rollout.
- [Collapsed values can drift from expanded field values if summary mapping uses alternate sources] -> Require consuming screens to pass the same visible display strings used by the expanded header fields whenever those fields are summarized.
- [Some in-scope screens have unusually tall auxiliary sections or custom modal triggers] -> Standardize the shell while allowing local exceptions inside the scrollable content region.
- [A partial rollout could leave the product mixed for a while] -> Sequence migration by sales and purchase document groups and complete each group's shell and table alignment before moving on.
