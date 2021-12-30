import React, { FC, HTMLAttributes } from 'react'
import styled from 'styled-components'


const CellStyled = styled.div`
    display: inline-block;
    border-right: 1px solid var(--rc-table-border-color, #ddd);
    border-bottom: 1px solid var(--rc-table-border-color, #ddd);
    padding: 0 8px;
    text-overflow: ellipsis;
    height: 100%;
    line-height: var(--rc-table-row-height);
    white-space: nowrap;
    overflow: hidden;
    user-select: none;
    box-sizing: border-box;
    background-color: var(--rc-table-background-color, #fff);
`

interface CellProps extends HTMLAttributes<HTMLDivElement>{
}

const Cell: FC<CellProps> = ({
    ...restProps
}) => {
    return (
        <CellStyled
            {...restProps}
        />
    )
}

export default Cell
