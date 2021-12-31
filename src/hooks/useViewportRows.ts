import React, { MutableRefObject, useMemo, useRef } from 'react'
import { Cell, Row } from '../types'



interface CellPatch {
    width: number
    height: number
    left: number
    top: number
}
interface ViewportRowsArgs {
    rows: Row[]
    scrollTop: number
    scrollLeft: number
    width: number
    height: number
}


export const useViewportRows = ({
    rows,
    height,
    width,
    scrollTop,
    scrollLeft,
}: ViewportRowsArgs) => {

    const cacheScrollHeight = useRef<number>(-1)

    useMemo(() => {
        cacheScrollHeight.current = -1
    }, [rows])

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
    }, [rows])

    const resRows: Row[] = []

    const stickyRows: Row[] = []

    let scrollHeightTop = 0

    const getViewportCells = (row: Row, callback?: (cell: Cell) => void) => {
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
                cellState = getCellState(cellStartLeft, cellEndRight, cellIndex > 0 ? row.cells[cellIndex - 1].width : row.cells[0].width)
            } else {
                cellState = getCellState(cellStartLeft, cellEndRight, cellIndex < row.cells.length - 1 ? row.cells[cellIndex + 1].width : 0)
            }
            if (cellState === 'viewpor' || cellState === 'outlet') {
              
                resCell.push(newCell)
            }
            callback?.(newCell)
        })
        return resCell
    }

    // 固定单元格
    const stickyRowLeft: Row[] = []

    rows.some((row, index) => {
        if (row.sticky) {
            const stickyRow = {
                ...row,
                top: scrollHeightTop,
            }
            const stickyCells: Cell[] = []
            stickyRows.push({
                ...stickyRow,
                cells: getViewportCells(stickyRow, (current) => {
                    if (current.sticky) {
                        stickyCells.push({
                            ...current,
                        }) 
                    }
                })
            })
            stickyRowLeft.push({
                ...stickyRow,
                cells: stickyCells,
                sticky: 'topLeft'
            })
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

            const stickyCells: Cell[] = []
            resRows.push({
                ...newRow,
                cells: getViewportCells(newRow, (current) => {
                    if (current.sticky) {
                        stickyCells.push(current) 
                    }
                }),
            })

            stickyRowLeft.push({
                ...newRow,
                cells: stickyCells
            })
        }
        if (rowState === 'virtual-bottom') {
            return true
        }
        return false
    })

    console.log(stickyRowLeft)
    return {
        rows: resRows,
        stickyRows,
        stickyRowLeft,
        scrollWidth,
        scrollHeight
    }
}

