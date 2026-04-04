import { shouldDisableLinkedRecordField } from "./legacyEditPermissions";

describe("shouldDisableLinkedRecordField", () => {
  test("keeps linked legacy items editable on the simplified correction surface", () => {
    expect(
      shouldDisableLinkedRecordField({
        childRecord: 4,
        isLegacyItem: true,
      })
    ).toBe(false);
  });

  test("locks linked canonical items to preserve existing structural protections", () => {
    expect(
      shouldDisableLinkedRecordField({
        childRecord: 4,
        isLegacyItem: false,
      })
    ).toBe(true);
  });

  test("does not disable new or unlinked items", () => {
    expect(
      shouldDisableLinkedRecordField({
        childRecord: 0,
        isLegacyItem: false,
      })
    ).toBe(false);
  });
});
