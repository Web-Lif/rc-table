import React, { CSSProperties, Key, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import TableRow from './Row';
import TableCell from './Cell';
import { Cell, Row } from './types';
import { useViewportRows } from './hooks/useViewportRows';
import { writeText } from './utils/clipboard'

const TableStyle = styled.div`
    border-top: 1px solid var(--rc-table-border-color, #ddd);
    border-right: 1px solid var(--rc-table-border-color, #ddd);
    border-left: 1px solid var(--rc-table-border-color, #ddd);
    .rc-table-cell-select {
        box-shadow: inset 0 0 0 1.1px var(--rc-table-cell-selection-color, #1890ff);
    }
`;

const TableWrapperStyle = styled.div`
    width: 100%;
    background-color: #fff;
`;

interface RowClickParam {
    event:  React.MouseEvent<HTMLDivElement, MouseEvent>
    row: Row
    index: number
}

interface TableProps {

    /** 宽度 */
    width: number;

    /** 高度 */
    height: number;

    /** 当前的行信息 */
    rows: Row[];

    /** 渲染单元格的事件 */
    onCellRender?: (element: JSX.Element,cells: Cell) => JSX.Element

    /** 渲染行触发的事件 */
    onRowRender?: (element: JSX.Element, row: Row) => JSX.Element

    /** 表格单击行触发的事件 */
    onRowClick?: (param: RowClickParam) => void

    /** 表格双击行触发的事件 */
    onRowDoubleClick?: (param: RowClickParam) => void
}

function Table({
    width,
    height,
    rows,
    onCellRender,
    onRowRender,
    onRowClick,
    onRowDoubleClick
}: TableProps) {
    const tableRef = useRef<HTMLDivElement>(null);
    const [scroll, setScroll] = useState<{
        top: number;
        left: number;
    }>({
        top: 0,
        left: 0,
    });

    const {
        scrollHeight,
        scrollWidth,
        rows: viewportRows,
    } = useViewportRows({
        rows,
        width,
        height,
        scrollTop: scroll.top,
        scrollLeft: scroll.left,
    });

    const getTransform = () => {
        if (tableRef.current) {
            const scrollRow = viewportRows.find((ele) => ele.sticky === undefined);
            return `translate3d(${scrollRow?.cells?.[0].left || 0}px,${scrollRow?.top || 0}px, 0px)`;
        }
        return undefined;
    };

    const scrollRow = useMemo(() => {
        return viewportRows.find((ele) => ele.sticky === undefined);
    }, [viewportRows]);

    const [cellKey, setCellKey] = useState<Key | null>(null)

    return (
        <TableStyle
            ref={tableRef}
            style={{
                width,
                height,
                overflow: 'auto',
                ['--rc-table-row-sticky-top' as any]: `${scroll.top - (scrollRow?.top || 0)}px`,
            }}
            onScroll={() => {
                if (tableRef.current) {
                    const { scrollTop, scrollLeft } = tableRef.current;
                    setScroll({
                        top: scrollTop,
                        left: scrollLeft,
                    });
                }
            }}
        >
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
                    {viewportRows?.map((row, rowIndex) => {
                        const cssStyle: CSSProperties = {
                            height: row.height,
                            ['--rc-table-row-height' as any]: `${row.height}px`,
                        };
                        if (row.sticky) {
                            if (scroll.top !== 0) {
                                cssStyle.transform = `translate3d(0px, var(--rc-table-row-sticky-top), 0px)`;
                            } else {
                                cssStyle.transform = `translate3d(0px, 0px, 0px)`;
                            }
                        }
                        const rowElement = (
                            <TableRow
                                className={row.className}
                                style={cssStyle}
                                key={row.key}
                                onClick={(e) => {
                                    onRowClick?.({
                                        event: e,
                                        row,
                                        index: rowIndex
                                    })
                                }}
                                onDoubleClick={(e) => {
                                    onRowDoubleClick?.({
                                        event: e,
                                        row,
                                        index: rowIndex
                                    })
                                }}
                            >
                                {row.cells.map((cell) => {
                                    const isSelect = cell.key === cellKey
                                    const cellElement = (
                                        <TableCell
                                            className={isSelect ? 'rc-table-cell-select' : undefined}
                                            style={{
                                                width: cell.width,
                                            }}
                                            onClick={() => {
                                                if (cell.key && cell.selectd !== false) {
                                                    setCellKey(cell.key)
                                                }
                                            }}
                                            key={cell.key}
                                            tabIndex={-1}
                                            onKeyDown={(e) => {
                                                const text = e.currentTarget.textContent
                                                // ctrl + c copy text
                                                if(e.ctrlKey && e.key === 'c' && text) {
                                                    writeText(text)
                                                    const element = e.currentTarget
                                                    element.style.backgroundColor = '#fce4ec'
                                                    setTimeout(() => {
                                                        element.style.backgroundColor = 'inherit'
                                                    }, 500)
                                                }
                                            }}
                                        >
                                            {cell.value}
                                        </TableCell>
                                    )
                                    if (onCellRender) {
                                        return onCellRender(cellElement, cell)
                                    }
                                    return cellElement
                                })}
                            </TableRow>
                        )
                        if (onRowRender){
                            return onRowRender(rowElement, row)
                        }
                        return rowElement
                    })}
                </TableWrapperStyle>
            </div>
        </TableStyle>
    );
}
export default Table;
