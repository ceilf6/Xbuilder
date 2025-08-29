/**
 * Valid mobile keyboard zones
 */
export const MOBILE_KEYBOARD_ZONES = [
  "lt",
  "rt",
  "lbUp",
  "lbLeft",
  "lbRight",
  "lbDown",
  "rbA",
  "rbB",
  "rbX",
  "rbY",
] as const;

export type MobileKeyboardZone = (typeof MOBILE_KEYBOARD_ZONES)[number];
/**
 * Zone to key mapping for mobile keyboard
 */
export type MobileKeyboardZoneToKeyMapping = {
  [zone in MobileKeyboardZone]: string | null;
};
export enum MobileKeyboardType {
  NoKeyboard = 1,
  CustomKeyboard = 2,
}
export type KeyboardConfig = {
  type: MobileKeyboardType;
  mapping: MobileKeyboardZoneToKeyMapping;
};
export type UI = any;

export declare function useModal<T>(
  component: any
): (props?: any) => Promise<T>;
