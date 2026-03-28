## Context

The recent transaction-entry standardization made headers collapsible and footers pinned, but the footer itself still uses a relatively tall composition on several screens. Sale Order and Sales Delivery show the issue clearly: terms selection, freeform terms text, remarks, totals, and action buttons are stacked in a way that consumes enough height to reduce the visible table area. Purchase Inward already uses a somewhat simpler footer, but it still relies on independent local markup rather than a compact shared footer pattern.

The goal of this change is to improve density without reducing capability. Users still need quick access to terms, remarks, totals, save actions, edit actions, and print actions, but the presentation should fit into a shorter pinned region so the line-item workspace remains the focus.

## Goals / Non-Goals

**Goals:**
- Reduce the vertical footprint of standardized transaction-entry footers while preserving all existing controls and business behavior.
- Establish a compact footer pattern that transaction forms can share even when their exact actions differ.
- Keep primary actions discoverable and totals readable while allowing more table rows to remain visible above the footer.
- Support both editable and read-only states without introducing layout jumps or overflow problems.

**Non-Goals:**
- Change save, edit, print, barcode, or thermal-print business logic.
- Remove terms, remarks, totals, or transaction-specific footer actions from supported screens.
- Redesign the broader transaction-entry shell, header summary behavior, or line-item table structure beyond what is needed for footer density.

## Decisions

1. Treat footer density as a shared transaction-entry concern.
Standardized transaction screens already share a common shell and similar footer content blocks. This change should continue that direction by defining a compact footer pattern rather than patching one screen at a time.

Alternative considered: shrink only the currently reported screen.
This was rejected because the same tall layout appears across multiple standardized transaction forms and would quickly diverge again.

2. Keep the same footer information architecture, but compress spacing and vertical stacking.
The compact footer should continue to expose four conceptual areas: terms selection/input, remarks, totals, and actions. The height savings should come from tighter paddings, shorter control heights, smaller headings, and grouping actions into a denser bar instead of adding or removing workflow steps.

Alternative considered: hide some fields behind accordions or secondary dialogs.
This was rejected because it saves space by reducing immediacy and would slow down data entry or review.

3. Prefer horizontal grouping and responsive wrap behavior over tall fixed cards.
On wider viewports, footer sections should align in a single compact row or in two short bands rather than multiple tall stacked cards. On narrower widths, sections may wrap, but they should retain compact spacing and avoid expanding textareas to unnecessary default heights.

Alternative considered: force one rigid row for every screen.
This was rejected because different transaction forms carry different action counts, and some responsive wrapping is safer than clipped controls.

4. Preserve screen-owned action sets while standardizing the compact layout contract.
The shared contract should define how sections align and how dense the controls should be, but each form may still provide its own actions such as barcode, print, or thermal print. This keeps the layout reusable without forcing unrelated transaction flows into one exact action list.

Alternative considered: centralize all footer actions into one universal component immediately.
This was rejected because the current forms still have meaningful differences, and this change is intended to stay small and practical.

## Risks / Trade-offs

- [Dense footers could feel cramped or harder to scan] -> Keep typography legible, preserve clear section labels, and compact spacing only where repeated padding is wasteful.
- [Responsive wrapping could produce awkward layouts on medium-width screens] -> Define wrap behavior intentionally and verify representative desktop and laptop widths.
- [Local transaction forms may drift if each one hand-tunes compact spacing] -> Prefer a small shared footer helper or shared class contract for section and action density.
- [Shorter textareas may hide too much text in long notes] -> Preserve scrolling within notes fields and avoid reducing them below a usable minimum height.
