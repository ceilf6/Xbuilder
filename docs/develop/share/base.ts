export type UI = any;
export declare function useModal<T>(
  component: any
): (props?: any) => Promise<T>;
/**
 * Component UIKeyBtn represents a single key button in the keyboard.
 *
 * Sample:
 * ```vue
 * <UIKeyBtn :value="'Q'" />
 * ```
 */
export declare function UIKeyBtn(): UI;
