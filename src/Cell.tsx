import React, { FC, HTMLAttributes } from 'react'
import styled from 'styled-components'


const CellStyled = styled.div`
    display: inline-block;
    border-left: 1px solid var(--rc-table-border-color, #ddd);
    padding: 0 8px;
    text-overflow: ellipsis;
    height: 100%;
    line-height: var(--rc-table-row-height);
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