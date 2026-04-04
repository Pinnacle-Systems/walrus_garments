export function shouldDisableLinkedRecordField({ childRecord = 0, isLegacyItem = false }) {
  return childRecord > 0 && !isLegacyItem;
}
