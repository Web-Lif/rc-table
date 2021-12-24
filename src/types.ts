export interface Cell {
    /** 单元格的宽度 */
    width: number
    /** 单元格的值信息 */
    value: string
    /** 跨行合并 */
    rowSpan?: number
    /** 跨列合并 */
    colSpan?: number
    /** 内部使用属性 */
    left?: number
}

export interface Row {
    /** 表格的高度 */
    height: number
    /** 表格的单元格信息 */
    cells: Cell[]
    /** 内部使用属性 */
    top?: number
    /** 是否固定行 */
    sticky?: 'top'
}
