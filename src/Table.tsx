import React, { CSSProperties, Key, ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import TableRow from './Row';
import TableCell from './Cell';
import { Cell, Row } from './types';
import { useViewportRows } from './hooks/useViewportRows';
import { writeText } from './utils/clipboard'
import { getScrollbarWidth } from './utils/browser'

const TableStyle = styled.div`
    border-top: 1px solid var(--rc-table-border-color, #ddd);
    border-right: 1px solid var(--rc-table-border-color, #ddd);
    border-left: 1px solid var(--rc-table-border-color, #ddd);
    border-bottom: 1px solid var(--rc-table-border-color, #ddd);
    border-collapse: collapse;
    position: relative;
    .rc-table-cell-select {
        box-shadow: inset 0 0 0 1.1px var(--rc-table-cell-selection-color, #1890ff);
    }
    
`;

const TableWrapperStyle = styled.div`
    width: 100%;
    contain: style;
`;

const StickyLeftRowWrapper = styled.div`
    position: absolute;
    z-index: 11;
    box-shadow: 2px 0 5px -2px hsl(0deg 0% 53% / 30%);
`

const StickyRightRowWrapper = styled.div`
    position: absolute;
    z-index: 11;
    box-shadow: -2px 0 5px -2px hsl(0deg 0% 53% / 30%);
`

interface RowClickParam {
    event:  React.MouseEvent<HTMLDivElement, MouseEvent>
    row: Row
}

interface TableProps {

    /** 宽度 */
    width: number;

    /** 高度 */
    height: number;

    /** 当前的行信息 */
    rows: Row[];

    /** 调试模式 */
    debug?: boolean

    /** 渲染单元格的事件 */
    onCellRender?: (element: ReactElement,cells: Cell) => ReactElement

    /** 渲染行触发的事件 */
    onRowRender?: (element: ReactElement, row: Row) => ReactElement

    /** 表格单击行触发的事件 */
    onRowClick?: (param: RowClickParam) => void

    /** 表格双击行触发的事件 */
    onRowDoubleClick?: (param: RowClickParam) => void
}

function Table({
    width,
    height,
    rows,
    debug,
    onCellRender,
    onRowRender,
    onRowClick,
    onRowDoubleClick
}: TableProps) {

    const logTime = (label: string) => {
        if (debug) {
            console.time(label)
        }
    }

    const logTimeEnd = (label: string) => {
        if (debug) {
            console.timeEnd(label)
        }
    }

    const tableRef = useRef<HTMLDivElement>(null);
    const [scroll, setScroll] = useState<{
        top: number;
        left: number;
    }>({
        top: 0,
        left: 0,
    });

    logTime('useViewportRows')
    const {
        scrollHeight,
        scrollWidth,
        rows: viewportRows,
        stickyRows: viewportStickyRows,
        stickyRowLeft: viewportStickyRowLeft,
        stickyRowRight: viewportStickyRowRight
    } = useViewportRows({
        rows,
        width,
        height,
        scrollTop: scroll.top,
        scrollLeft: scroll.left,
    });
    logTimeEnd('useViewportRows')


    const scrollRow = viewportRows?.[0]
    const getTransform = () => {
        if (tableRef.current) {
            return `translate3d(${scrollRow?.cells?.[0]?.left || 0}px,${scrollRow?.top || 0}px, 0px)`;
        }
        return undefined;
    };

    const [cellKey, setCellKey] = useState<Key | null>(null)

    const ticking = useRef<boolean>(false);


    const createCellElement = (cell: Cell, cssStyle: CSSProperties = {}, key?: Key) => {
        const isSelect = cell.key === cellKey
        return (
            <TableCell
                className={isSelect ? `rc-table-cell-select ${cell.className || ''}` : cell.className}
                style={{
                    width: cell.width,
                    ...cssStyle,
                }}
                onClick={() => {
                    if (cell.key && cell.selectd !== false) {
                        setCellKey(cell.key)
                    }
                }}
                key={`${cell.key}-${cell.sticky || ''}-${key || ''}`}
                tabIndex={-1}
                onKeyDown={(e) => {
                    const text = e.currentTarget.textContent
                    // ctrl + c copy text
                    if(e.ctrlKey && e.key === 'c' && text) {
                        writeText(text)
                        const element = e.currentTarget
                        element.style.backgroundColor = '#fce4ec'
                        setTimeout(() => {
                            element.style.backgroundColor = 'var(--rc-table-background-color, #fff)'
                        }, 500)
                    }
                }}
            >
                {cell.value}
            </TableCell>
        )
    }

    const createRowElement = (row: Row, cssStyle: CSSProperties, key?: Key) => {
        const rowKey = `${row.key}-${row.sticky || ''}-${key || ''}`
        let rowElement = (
            <TableRow
                className={row.className}
                style={{
                    height: row.height,
                    ['--rc-table-row-height' as any]: `${row.height}px`,
                    ...cssStyle,
                }}
                key={rowKey}
                onClick={(e) => {
                    onRowClick?.({
                        event: e,
                        row,
                    })
                }}
                onDoubleClick={(e) => {
                    onRowDoubleClick?.({
                        event: e,
                        row,
                    })
                }}
            >
                {row.cells.map((cell) => {
                    const cellElement = createCellElement(cell, {}, rowKey)
                    if (onCellRender) {
                        return onCellRender(cellElement, cell)
                    }
                    return cellElement
                })}
            </TableRow>
        )
        if (onRowRender){
            rowElement = onRowRender(rowElement, row)
        }
        return rowElement
    }

    const renderRow = () => {
        const contentRow = viewportRows?.map((row) => {
            const cssStyle: CSSProperties = {
            };

            if (row.key === rows[rows.length -1].key) {
                cssStyle.borderBottom = 'initial'
            }

            if (row.sticky) {
                return <div key={`${row.key}-padding`} style={{ height: row.height }} />
            }

            return createRowElement(row, cssStyle)
        })
        return {
            contentRow,
            stickyRows: viewportStickyRows.map(row => {
                const cssStyle: CSSProperties = {
                    height: row.height,
                    position: 'absolute',
                    top: scroll.top - (scrollRow?.top || 0) + (row.top || 0),
                    zIndex: 10,
                };
                return createRowElement(row, cssStyle)
            })
        }
    }

    logTime('renderRow')
    const { contentRow, stickyRows} = useMemo(() => {
        return renderRow()
    }, [viewportRows, viewportStickyRows])
    logTimeEnd('renderRow')

    useEffect(() => {
        tableRef.current?.addEventListener('scroll', () => {
            if (!ticking.current) {
                requestAnimationFrame(() => {
                    if (tableRef.current) {
                        const { scrollTop, scrollLeft } = tableRef.current;
                        setScroll({
                            top: scrollTop,
                            left: scrollLeft,
                        });
                    }
                    ticking.current = false;
                });
                ticking.current = true;
            }
        }, { passive: true})
    }, [])


    let viewportStickyRowRightWidth = 0

    viewportStickyRowRight?.[0]?.cells?.forEach(cell => {
        viewportStickyRowRightWidth += cell.width
    })

    return (
        <TableStyle
            ref={tableRef}
            style={{
                width,
                height,
                overflow: 'auto',
            }}
        >
            <StickyLeftRowWrapper
                style={{
                    marginLeft: scroll.left,
                    marginTop: scrollRow?.top || 0,
                }}
            >
                {viewportStickyRowLeft.map(row => {
                    if (row.sticky === 'topLeft') {
                        return createRowElement(row, {
                            position: 'absolute',
                            top: scroll.top - (scrollRow?.top || 0) + (row.top || 0),
                        }, 'StickyLeftRowWrapper')
                    }
                    if (row.sticky) {
                        return <div key={`${row.key}-padding-StickyLeftRowWrapper`} style={{ height: row.height }}/>
                    }
                    return createRowElement(row, {
                        height: row.height,
                    }, 'StickyLeftRowWrapper')
                })}
            </StickyLeftRowWrapper>
            <StickyRightRowWrapper
                style={{
                    marginLeft: (scroll.left + width) - viewportStickyRowRightWidth - getScrollbarWidth(),
                    marginTop: scrollRow?.top || 0,
                }}
            >
                {viewportStickyRowRight.map(row => {
                    if (row.sticky === 'topRight') {
                        return createRowElement(row, {
                            position: 'absolute',
                            top: scroll.top - (scrollRow?.top || 0) + (row.top || 0),
                        }, 'StickyRightRowWrapper')
                    }
                    if (row.sticky) {
                        return <div key={`${row.key}-padding-StickyLeftRowWrapper`} style={{ height: row.height }}/>
                    }
                    return createRowElement(row, {
                        height: row.height,
                    }, 'StickyLeftRowWrapper')
                })}
            </StickyRightRowWrapper>
            <div
                style={{
                    height: scrollHeight,
                    width: scrollWidth,
                    minHeight: height,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <TableWrapperStyle
                    style={{
                        transform: getTransform(),
                    }}
                >
                    {stickyRows}
                    {contentRow}
                </TableWrapperStyle>
            </div>
        </TableStyle>
    );
}
export default Table;
