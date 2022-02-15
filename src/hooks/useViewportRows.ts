import React, { MutableRefObject, useMemo, useRef } from 'react'
import { Cell, Row } from '../types'



interface CellPatch {
    width: number
    height: number
    left: number
    top: number
}
interface ViewportRowsArgs<T> {
    rows: Row<T>[]
    scrollTop: number
    scrollLeft: number
    width: number
    height: number
}


export function useViewportRows<T>({
    rows,
    height,
    width,
    scrollTop,
    scrollLeft,
}: ViewportRowsArgs<T>) {

    const cacheScrollHeight = useRef<number>(-1)

    useMemo(() => {
        cacheScrollHeight.current = -1
    }, [rows.length])

    const getRowState = (
        rowStartTop: number,
        rowEndBottom: number,
        outletHeight: number
    ) : 'outlet' | 'viewpor' | 'virtual-top' | 'virtual-bottom'  =>{
        if (
            (scrollTop - rowStartTop > outletHeight) 
           
        ) {
            return 'virtual-top'
        }

        if (rowEndBottom - scrollTop - height > outletHeight) {
            return 'virtual-bottom'
        }

        if (
            (scrollTop - rowStartTop > 0 && scrollTop - rowStartTop < outletHeight) ||
            (rowEndBottom - scrollTop - height > 0 && rowEndBottom - scrollTop - height < outletHeight)
        ) {
            return 'outlet'
        }

        return 'viewpor'
    }

    const getCellState = (
        cellStartLeft: number,
        cellEndRight: number,
        outletWidth: number
    ): 'outlet' | 'viewpor' | 'virtual' => {
        if (
            (scrollLeft - cellStartLeft > outletWidth) ||
            (cellEndRight - scrollLeft - width > outletWidth)
        ) {
            return 'virtual'
        }
        if (
            (scrollLeft - cellStartLeft > 0 && scrollLeft - cellStartLeft < outletWidth) ||
            (cellEndRight - scrollTop - width > 0 && cellEndRight - scrollTop - width < outletWidth)
        ) {
            return 'outlet'
        }

        return 'viewpor'
    }

    let scrollWidth = 0
    let scrollHeight = useMemo(() => {
        let scrollHeightTemp = 0
        rows.forEach(row => {
            scrollHeightTemp += row.height
        })
        return scrollHeightTemp
    }, [rows.length])

    const resRows: Row<T>[] = []

    const stickyRows: Row<T>[] = []

    let scrollHeightTop = 0

    const getViewportCells = (row: Row<T>, callback?: (cell: Cell) => void) => {
        const resCell: Cell[] = []
        let cellEndRight = 0
        row.cells.forEach((cell, cellIndex) => {
            cellEndRight += cell.width
            const cellStartLeft = cellEndRight - cell.width
            let cellState = 'viewpor'
            const newCell: Cell = {
                ...cell,
                height: row.height,
                left: cellStartLeft,
            }
            if (cellStartLeft < scrollLeft + width) {
                cellState = getCellState(cellStartLeft, cellEndRight, cellIndex > 0 ? row.cells[cellIndex - 1].width + 120 : row.cells[0].width)
            } else {
                cellState = getCellState(cellStartLeft, cellEndRight, cellIndex < row.cells.length - 1 ? row.cells[cellIndex + 1].width + 120 : 0)
            }
            if (cellState === 'viewpor' || cellState === 'outlet') {
              
                resCell.push(newCell)
            }
            callback?.(newCell)
        })
        return resCell
    }

    // 固定单元格
    const stickyRowLeft: Row<T>[] = []
    const stickyRowRight: Row<T>[] = []

    rows.some((row, index) => {
        if (row.sticky) {
            const stickyRow = {
                ...row,
                top: scrollHeightTop,
            }
            const stickyLeftCells: Cell[] = []
            const stickyRightCells: Cell[] = []
            let stickyDirection: 'left' | 'right' | undefined = undefined;
            stickyRows.push({
                ...stickyRow,
                cells: getViewportCells(stickyRow, (current) => {
                    if (current.sticky) {
                        stickyDirection = current.sticky
                        if (current.sticky === 'left') {
                            stickyLeftCells.push({
                                ...current,
                            }) 
                        } else if (current.sticky === 'right') {
                            stickyRightCells.push({
                                ...current
                            })
                        }
                    }
                })
            })


            if (stickyLeftCells.length > 0) {
                stickyRowLeft.push({
                    ...stickyRow,
                    cells: stickyLeftCells,
                    sticky: 'topLeft'
                })
            }
            if (stickyRightCells.length > 0) {
                stickyRowRight.push({
                    ...stickyRow,
                    cells: stickyRightCells,
                    sticky: 'topRight'
                })
            }
        }

        scrollHeightTop += row.height
      
        // 开始的 Y 坐标点
        const rowStartTop = scrollHeightTop - row.height
        // 结束的 Y 坐标点
        const rowEndBottom = scrollHeightTop

        let rowState = 'viewpor'
        if (rowStartTop < scrollTop + height) {
            rowState = getRowState(rowStartTop, rowEndBottom, index > 0 ? rows[index - 1].height : row.height)
        } else {
            rowState = getRowState(rowStartTop, rowEndBottom, index < rows.length - 1 ? rows[index + 1].height : 0)
        }

        if (index === 0) {
            row.cells.forEach(cell => {
                scrollWidth += cell.width
            })
        }

        if (rowState === 'viewpor' || rowState === 'outlet') {
            const newRow = {
                ...row,
                top: rowStartTop,
            }

            const stickyLeftCells: Cell[] = []
            const stickyRightCells: Cell[] = []
            resRows.push({
                ...newRow,
                cells: getViewportCells(newRow, (current) => {
                    if (current.sticky) {
                        if (current.sticky === 'left') {
                            stickyLeftCells.push({
                                ...current,
                            }) 
                        } else if (current.sticky === 'right') {
                            stickyRightCells.push({
                                ...current
                            })
                        }
                    }
                }),
            })

            if (stickyLeftCells.length > 0) {
                stickyRowLeft.push({
                    ...newRow,
                    cells: stickyLeftCells
                })
            }
            if (stickyRightCells.length > 0) {
                stickyRowRight.push({
                    ...newRow,
                    cells: stickyRightCells
                })
            }
        }
        if (rowState === 'virtual-bottom') {
            return true
        }
        return false
    })

    return {
        rows: resRows,
        stickyRows,
        stickyRowLeft,
        stickyRowRight,
        scrollWidth,
        scrollHeight
    }
}

