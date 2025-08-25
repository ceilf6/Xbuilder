export type ZoneId =
  | "lt"
  | "rt"
  | "lbUp"
  | "lbLeft"
  | "lbRight"
  | "lbDown"
  | "rbA"
  | "rbB"
  | "rbX"
  | "rbY";

export type key = string | null;

export type MobileKeyboard = {
  /** Adaptation type: 1 = no keyboard needed, 2 = custom keyboard */
  adaptationType: 1 | 2;
  /** Zone to key mapping, only present when adaptationType is 2 */
  zoneToKey?: Partial<Record<ZoneId, key>>;
};
export interface MobileKeyboardSevervice {
  MobileKeyboardEdit(
    owner: string,
    name: string,
    description: MobileKeyboard
  ): Promise<MobileKeyboard>;
  MobileKeyboardView(owner: string, name: string): Promise<MobileKeyboard>;
}
