/**
 * Whether the current request may see items in the draft state: true only for a signed-in admin.
 * The composition root supplies it to the repositories, so a draft never leaves the data layer for
 * anyone else.
 */
export type CanSeeDrafts = () => Promise<boolean>
