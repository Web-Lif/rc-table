import React, { useRef, useState } from 'react'
import styled from 'styled-components'

import TableRow from './Row' 
import TableCell from './Cell' 
import { Row } from './types'
import { useViewportRows } from './hooks/useViewportRows'


const TableStyle = styled.div`
    width: '100%';
    border-top: 1px solid var(--rc-table-border-color, #ddd);
    border-right: 1px solid var(--rc-table-border-color, #ddd);
`

interface TableProps<R> {
    /** 宽度 */
    width: number
    /** 高度 */
    height: number
    /** 当前的行信息 */
    rows: Row[]
}

function Table<R> ({
    width,
    height,
    rows
}: TableProps<R>) {
    
    const tableRef = useRef<HTMLDivElement>(null)
    const [scroll, setScroll] = useState<{
        top: number,
        left: number
    }>({
        top: 0,
        left: 0
    });
    
    const {
        scrollHeight,
        scrollWidth,
        rows: viewportRows
    } = useViewportRows({
        rows,
        width,
        height,
        scrollTop: scroll.top,
        scrollLeft: scroll.left
    })

    const getTransform = () => {
        if (tableRef.current) {
            
            return `translate3d(${viewportRows?.[0].cells?.[0].left || 0}px,${viewportRows?.[0].top || 0}px, 0px)`
        }
        return undefined
    }

    return (
        <div
            ref={tableRef}
            style={{
                width,
                height,
                overflow: 'auto'
            }}
            onScroll={() => {
                if (tableRef.current) {
                    const { scrollTop, scrollLeft } = tableRef.current
                    setScroll({
                        top: scrollTop,
                        left: scrollLeft
                    })
                }
            }}
        >
            <div
                style={{
                    height: scrollHeight,
                    width: scrollWidth,
                    minHeight: height,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <TableStyle
                    style={{
                        transform: getTransform(),
                    }}
                >
                    {viewportRows?.map((row) => (
                        <TableRow
                            style={{
                                height: row.height,
                                [('--rc-table-row-height') as any]: `${row.height}px`
                            }}
                        >
                            {row.cells.map(cell => (
                                <TableCell
                                    style={{
                                        width: cell.width
                                    }}
                                >
                                    {cell.value}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableStyle>
            </div>
        </div>
    )
}
export default Table