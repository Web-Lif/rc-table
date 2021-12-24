import React, { MutableRefObject, useRef } from 'react'
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
    const getRowState = (
        rowStartTop: number,
        rowEndBottom: number,
        outletHeight: number
    ) : 'outlet' | 'viewpor' | 'virtual'  =>{
        if (
            (scrollTop - rowStartTop > outletHeight) || 
            (rowEndBottom - scrollTop - height > outletHeight)
        ) {
            return 'virtual'
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
    let scrollHeight = 0

    const resRows: Row[] = []

    rows.forEach((row, index) => {

        if (row.sticky === undefined) {
            scrollHeight += row.height
        }

        // 开始的 Y 坐标点
        const rowStartTop = scrollHeight - row.height
        // 结束的 Y 坐标点
        const rowEndBottom = scrollHeight

        let rowState = 'viewpor'
        if (rowStartTop < scrollTop + height) {
            rowState = getRowState(rowStartTop, rowEndBottom, index > 0 ? rows[index - 1].height : 0)
        } else {
            rowState = getRowState(rowStartTop, rowEndBottom, index < rows.length - 1 ? rows[index + 1].height : 0)
        }

        if (index === 0) {
            row.cells.forEach(cell => {
                scrollWidth += cell.width
            })
        }
        if (rowState === 'viewpor' || rowState === 'outlet' || row.sticky) {
            const resCell: Cell[] = []

            let cellEndRight = 0
            row.cells.forEach((cell, cellIndex) => {
                cellEndRight += cell.width
                const cellStartLeft = cellEndRight - cell.width
                let cellState = 'viewpor'
                if (cellStartLeft < scrollLeft + width) {
                    cellState = getCellState(cellStartLeft, cellEndRight, cellIndex > 0 ? row.cells[cellIndex - 1].width : 0)
                } else {
                    cellState = getCellState(cellStartLeft, cellEndRight, cellIndex < row.cells.length - 1 ? row.cells[cellIndex + 1].width : 0)
                }
                if (cellState === 'viewpor' || cellState === 'outlet') {
                    resCell.push({
                        ...cell,
                        left: cellStartLeft,
                    })
                }
            })

            resRows.push({
                top: rowStartTop,
                height: row.height,
                sticky: row.sticky, 
                cells: resCell
            })
        }
    })

    return {
        rows: resRows,
        scrollWidth,
        scrollHeight
    }
}

