## Context

The Opening Stock screen supports spreadsheet import but currently assumes users already know the required column names and format. The import logic reads the first row as headers and maps them directly to keys, so template accuracy matters. The user explicitly wants guidance to be discoverable on hover with an icon and does not want informational text consuming vertical space in the layout.

## Goals / Non-Goals

**Goals:**
- Add a clear download action for a sample CSV template within the Opening Stock import controls.
- Keep the template aligned with the parser's required headers so downloaded files work without manual header correction.
- Present usage guidance through a hover-only tooltip attached to an icon near the template action.
- Fit the new affordances into the existing toolbar without adding extra rows or persistent helper copy.

**Non-Goals:**
- Redesign the overall Opening Stock screen.
- Change backend import APIs or introduce server-generated templates.
- Expand the import schema beyond the currently supported columns.
- Add large modal-based onboarding or always-visible instructional panels.

## Decisions

Use a frontend-generated template download rather than a backend-served file.
Rationale: The template is static, derived from the current parser headers, and can be generated directly in the client with no API or deployment coupling. This keeps the change fast and low risk.
Alternative considered: Store a static file in public assets. Rejected because it can drift from parser expectations unless manually maintained.

Place the template action inside the existing Excel import control row.
Rationale: Users need the template at the moment they prepare or upload a file, so colocating it with `Browse` and `Upload` improves discoverability without changing page flow.
Alternative considered: Put the action in the screen header. Rejected because it weakens the connection to the import workflow.

Use a hover-triggered icon tooltip for helper text.
Rationale: This satisfies the requirement to avoid vertical space usage while keeping short instructions available on demand. The codebase already uses simple hover tooltip patterns, so the UI can stay consistent without new dependencies.
Alternative considered: Inline helper text below the controls. Rejected because it consumes space and conflicts with the requested interaction.

Drive the template headers from the same header definition used by the import table when practical.
Rationale: Sharing the header source reduces the chance of template/parser mismatch over time.
Alternative considered: Hardcode template columns separately. Rejected because it creates avoidable drift risk.

## Risks / Trade-offs

- [Header drift between template and parser] -> Derive the template columns from the same header array or central constant used by the import component.
- [Tooltip discoverability may be weaker than inline copy] -> Use a recognizable help icon immediately adjacent to the template download action.
- [CSV files may be edited and saved back as XLSX by users] -> Keep upload support compatible with both CSV and Excel file flows and validate the downloaded template with the existing parser behavior.
- [Toolbar crowding on smaller screens] -> Reuse the existing compact button sizing and place the tooltip as an overlay rather than inline content.
