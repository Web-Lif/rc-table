import React, { CSSProperties, Key, ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { debounce } from 'underscore'
import TableRow from './Row';
import TableCell from './Cell';
import { Cell, Row } from './types';
import { useViewportRows } from './hooks/useViewportRows';
import { writeText } from './utils/clipboard'

const EmptyStyle = styled.div`
    position: sticky;
    left: 0px;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
`

const TableStyle = styled.div`
    border-top: 1px solid var(--rc-table-border-color, #ddd);
    border-right: 1px solid var(--rc-table-border-color, #ddd);
    border-left: 1px solid var(--rc-table-border-color, #ddd);
    border-bottom: 1px solid var(--rc-table-border-color, #ddd);
    border-collapse: collapse;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    will-change: scroll-position;
    .rc-table-cell-select {
        box-shadow: inset 0 0 0 1.1px var(--rc-table-cell-selection-color, #1890ff);
    }

`;

const TableWrapperStyle = styled.div`
    width: 100%;
    contain: style;
    box-sizing: border-box;
`;

const StickyLeftRowWrapper = styled.div`
    position: absolute;
    z-index: 11;
    box-shadow: 2px 0 5px -2px hsl(0deg 0% 53% / 30%);
    box-sizing: border-box;
`

const StickyRightRowWrapper = styled.div`
    position: absolute;
    z-index: 11;
    box-shadow: -2px 0 5px -2px hsl(0deg 0% 53% / 30%);
    box-sizing: border-box;
`

const ScrollBar = styled.div`
    z-index: 20;
`

const ScrollBarThumb = styled.div`
    background: #00000080;
    border-radius: 99px;
    cursor: pointer;
    user-select: none;
`

interface RowClickParam<T> {
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
    row: Row<T>
}

export interface TableProps<T> {

    /** 宽度 */
    width: number;

    /** 高度 */
    height: number;

    /** 当前的行信息 */
    rows: Row<T>[];

    /** 调试模式 */
    debug?: boolean

    /** 空数据的时候渲染的信息 */
    onEmptyRowsRenderer?: () => ReactElement

    /** 渲染单元格的事件 */
    onCellRender?: (element: ReactElement, cells: Cell) => ReactElement

    /** 渲染行触发的事件 */
    onRowRender?: (element: ReactElement, row: Row<T>) => ReactElement

    /** 表格单击行触发的事件 */
    onRowClick?: (param: RowClickParam<T>) => void

    /** 表格双击行触发的事件 */
    onRowDoubleClick?: (param: RowClickParam<T>) => void

    /** 鼠标移动到行触发的事件 */
    onRowMouseEnter?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, div: HTMLDivElement) => void

    /** 鼠标移出到行触发的事件 */
    onRowMouseLeave?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, div: HTMLDivElement) => void

    /** 鼠标移入到表格触发的事件 */
    onMouseMove?: React.MouseEventHandler<HTMLDivElement>

    /** 鼠标抬起事件 */
    onMouseUp?: React.MouseEventHandler<HTMLDivElement>
}

function Table<T>({
    width,
    height,
    rows,
    debug,
    onCellRender,
    onRowRender,
    onRowClick,
    onRowDoubleClick,
    onRowMouseEnter,
    onRowMouseLeave,
    onMouseMove,
    onMouseUp,
    onEmptyRowsRenderer
}: TableProps<T>) {

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
    } = useViewportRows<T>({
        rows,
        width,
        height,
        scrollTop: scroll.top,
        scrollLeft: scroll.left,
    });
    logTimeEnd('useViewportRows')

    const scrollRow = viewportRows?.[0]

    const translateY = scrollRow?.top || 0
    const translateX = scrollRow?.cells?.[0]?.left || 0

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
                    if (e.ctrlKey && e.key === 'c' && text) {
                        writeText(text)
                        const element = e.currentTarget
                        element.style.backgroundColor = '#fce4ec'
                        setTimeout(() => {
                            element.style.backgroundColor = 'var(--rc-table-background-color, #fff)'
                        }, 500)
                    } else if (e.key === 'Escape') {
                        setCellKey(null)
                    }
                }}
            >
                {cell.value}
            </TableCell>
        )
    }

    const createRowElement = (row: Row<T>, cssStyle: CSSProperties, key?: Key) => {
        const rowKey = `${row.key}-${row.sticky || ''}-${key || ''}`
        let rowElement = (
            <TableRow
                className={`${row.className || ''} rc-table-row rc-table-row-${row.key}`}
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
                onMouseEnter={(e) => {
                    onRowMouseEnter?.(e, tableRef.current!);
                }}
                onMouseLeave={(e) => {
                    onRowMouseLeave?.(e, tableRef.current!)
                }}

                onDoubleClick={(e) => {
                    onRowDoubleClick?.({
                        event: e,
                        row,
                    })
                }}
            >
                {row.cells.map((cell) => {
                    if (cell.sticky && key === undefined) {
                        return (
                            <div
                                style={{
                                    width: cell.width,
                                    display: 'inline-block',
                                    height: '100%'
                                }}
                                key={`${rowKey}-padding-${cell.key}`}
                            />
                        )
                    }
                    const cellElement = createCellElement(cell, {}, rowKey)
                    if (onCellRender) {
                        return onCellRender(cellElement, cell)
                    }
                    return cellElement
                })}
            </TableRow>
        )
        if (onRowRender) {
            rowElement = onRowRender(rowElement, row)
        }
        return rowElement
    }

    const getTransform = () => {
        return `translate3d(${translateX}px,${translateY}px, 0px)`;
    };


    const renderRow = () => {
        const contentRow = viewportRows?.map((row) => {
            const cssStyle: CSSProperties = {
            };

            if (row.key === rows[rows.length - 1].key) {
                cssStyle.borderBottom = 'initial'
            }

            if (row.sticky) {
                return <div key={`${row.key}-padding`} style={{ height: row.height }} />
            }

            return createRowElement(row, cssStyle)
        })
        return {
            contentRow,
            stickyRows: viewportStickyRows.map((row, index) => {
                const cssStyle: CSSProperties = {
                    height: row.height,
                };
                return createRowElement(row, cssStyle)
            })
        }
    }


    logTime('renderRow')
    const { contentRow, stickyRows } = useMemo(() => {
        return renderRow()
    }, [viewportRows, viewportStickyRows])
    logTimeEnd('renderRow')

    let viewportStickyRowRightWidth = 0

    viewportStickyRowRight?.[0]?.cells?.forEach(cell => {
        viewportStickyRowRightWidth += cell.width || 0
    })

    const isEmptyRows = contentRow.filter(row => (row.key as string).indexOf('-padding') === -1).length === 0

    const renderEmptyRowsRenderer = () => {
        if (isEmptyRows) {
            return (
                <EmptyStyle>
                    {onEmptyRowsRenderer?.()}
                </EmptyStyle>
            )
        }
        return null
    }


    const lastMouseMove = useRef<{
        x: number
        y: number
    }>({
        x: -1,
        y: -1
    })


    const yScale = scrollHeight > height ? height / scrollHeight : 0
    const xScale = scrollWidth > width ? width / scrollWidth : 0
    const lastScroll = useRef<{
        top: number
        left: number
    }>({
        top: 0,
        left: 0
    })
    const mouseMoveTicking = useRef<boolean>(false);

    useEffect(() => {
        const onWheel = (event: WheelEvent) => {
            event.preventDefault()
            if (!mouseMoveTicking.current) {
                requestAnimationFrame(() => {
                    const { deltaX, deltaY } = event
                    if (
                        tableRef.current
                    ) {

                        if (tableRef.current.scrollLeft + deltaX >= scrollWidth - width) {
                            tableRef.current.scrollLeft = scrollWidth - width
                        } else {
                            tableRef.current.scrollLeft += deltaX
                        }

                        if (tableRef.current.scrollTop + deltaY >= scrollHeight - height) {
                            tableRef.current.scrollTop = scrollHeight - height + 1
                        } else {
                            tableRef.current.scrollTop += deltaY
                        }

                        setScroll({
                            top: tableRef.current.scrollTop,
                            left: tableRef.current.scrollLeft,
                        });
                    }
                    mouseMoveTicking.current = false;
                });
                mouseMoveTicking.current = true;
            }
        }

        tableRef.current?.addEventListener('wheel', onWheel, { passive: false })

        const onMouseMove = (e: MouseEvent) => {
            if (!ticking.current) {
                requestAnimationFrame(() => {
                    if (tableRef.current && (lastMouseMove.current.x !== -1 || lastMouseMove.current.y !== -1)) {
                        const moveX = Math.ceil((e.pageX - lastMouseMove.current.x) / xScale)
                        if (lastScroll.current.left !== -1) {
                            if ( lastScroll.current.left + moveX >= scrollWidth - width ) {
                                tableRef.current!.scrollLeft = scrollWidth - width
                            } else {
                                tableRef.current!.scrollLeft = lastScroll.current.left + moveX
                            }
                        }

                        const moveY = Math.ceil((e.pageY - lastMouseMove.current.y) / yScale)
                        if (lastScroll.current.top !== -1) {
                            if (lastScroll.current.top + moveY >= scrollHeight - height ) {
                                tableRef.current!.scrollTop = scrollHeight - height
                            } else {
                                tableRef.current!.scrollTop = lastScroll.current.top + moveY
                            }
                        }

                        setScroll({
                            top: tableRef.current!.scrollTop,
                            left: tableRef.current!.scrollLeft,
                        })
                    }
                    ticking.current = false;
                });
                ticking.current = true;
            }

        }

        const onMouseUp = (_e: MouseEvent) => {
            lastMouseMove.current = {
                x: -1,
                y: -1
            }
            lastScroll.current = {
                top: 0,
                left: 0
            }
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
        return () => {
            tableRef.current?.removeEventListener('wheel', onWheel)
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }
    }, [])



    return (
        <div
            style={{
                position: 'relative'
            }}
        >
            <ScrollBar
                style={{
                    position: 'absolute',
                    left: width - 8,
                    width: 8,
                    height,
                }}
            >
                <ScrollBarThumb
                    style={{
                        position: 'absolute',
                        height: yScale * height,
                        top:  yScale * scroll.top,
                        width: '100%'
                    }}
                    onMouseDown={(e) => {
                        if (e.button === 0) {
                            lastMouseMove.current.y = e.pageY
                            lastScroll.current.top = (tableRef.current?.scrollTop || 0)
                            lastScroll.current.left = -1
                        }
                    }}
                />
            </ScrollBar>

            <ScrollBar
                style={{
                    position: 'absolute',
                    top: height - 8,
                    height: 8,
                    width,
                }}
            >
                <ScrollBarThumb
                    style={{
                        position: 'absolute',
                        width: xScale * width,
                        left:  xScale * scroll.left,
                        height: '100%',
                    }}
                    onMouseDown={(e) => {
                        if (e.button === 0) {
                            lastMouseMove.current.x = e.pageX
                            lastScroll.current.left = (tableRef.current?.scrollLeft || 0)
                            lastScroll.current.top = -1
                        }
                    }}
                />
            </ScrollBar>
            <TableStyle
                ref={tableRef}
                style={{
                    width,
                    height,
                }}
                onMouseMove={(event) => {
                    onMouseMove?.(event)
                }}
                onMouseUp={(event) => {
                    onMouseUp?.(event)
                }}
            >
                <StickyLeftRowWrapper
                    style={{
                        transform: `translate3d(${scroll.left || 0}px,${scrollRow?.top || 0}px, 0px)`
                    }}
                >
                    {viewportStickyRowLeft.map((row) => {
                        if (row.sticky === 'topLeft') {
                            return createRowElement(row, {
                                position: 'absolute',
                                top: scroll.top - (scrollRow?.top || 0) + (row.top || 0),
                                zIndex: 15,
                            }, 'StickyLeftRowWrapper')
                        }
                        if (row.sticky) {
                            return <div key={`${row.key}-padding-StickyLeftRowWrapper`} style={{ height: row.height }} />
                        }
                        return createRowElement(row, {
                            height: row.height,
                        }, 'StickyLeftRowWrapper')
                    })}
                </StickyLeftRowWrapper>
                <StickyRightRowWrapper
                    style={{
                        transform: `translate3d(${(scroll.left + width) - viewportStickyRowRightWidth}px,${scrollRow?.top || 0}px, 0px)`
                    }}
                >
                    {viewportStickyRowRight.map((row) => {
                        if (row.sticky === 'topRight') {
                            return createRowElement(row, {
                                position: 'absolute',
                                top: scroll.top - (scrollRow?.top || 0) + (row.top || 0),
                                zIndex: 15,
                            }, 'StickyRightRowWrapper')
                        }
                        if (row.sticky) {
                            return <div key={`${row.key}-padding-StickyLeftRowWrapper`} style={{ height: row.height }} />
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
                        position: 'absolute',
                        overflow: 'hidden',
                    }}
                >
                    <TableWrapperStyle
                        style={{
                            transform: getTransform(),
                        }}
                    >
                        {contentRow}
                    </TableWrapperStyle>
                </div>
                <TableWrapperStyle
                    style={{
                        position: 'sticky',
                        transform: `translate3d(${translateX}px, 0px, 0px)`,
                        top: 0,
                        zIndex: 10
                    }}
                >
                    {stickyRows}
                </TableWrapperStyle>
                {renderEmptyRowsRenderer()}
            </TableStyle>
        </div>
    );
}
export default Table;
