export type UI = any;
export declare function useModal<T>(
  component: any
): (props?: any) => Promise<T>;
//  key UI in Keyboard. provide to MobileKeyboardView and MobileKeyboardEidt
// active is used to indicate whether a button has functionality.
export declare function UIKeyBtn(props: {
  value: string;
  active?: boolean;
}): UI;
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
export type ZoneMapping = Record<ZoneId, string | null>;
