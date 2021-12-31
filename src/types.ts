import { Key, ReactNode } from "react";

export interface Cell {
    /** 单元格的宽度 */
    width: number;
    /** 单元格的值信息 */
    value: ReactNode;
    /** 跨行合并 */
    rowSpan?: number;
    /** 跨列合并 */
    colSpan?: number;
    /** 内部使用属性 */
    left?: number;
    /** 单元格是否可以选中 */
    selectd?: boolean;
    /** 单元格是否固定 */
    sticky?:  'left' ;
    /** 单元格的高度 */
    height?: number;
    /** 单元格的类名 */
    className?: string;
    /** 所在的真实的索引 */
    key?: Key
}

export interface Row {
    /** 表格的高度 */
    height: number;
    /** 表格的单元格信息 */
    cells: Cell[];
    /** 内部使用属性 */
    top?: number;
    /** 是否固定行 */
    sticky?: 'top' | 'topLeft';
    /** 行的的类名 */
    className?: string;
    /** 所在的真实的索引 */
    key?: Key
}
