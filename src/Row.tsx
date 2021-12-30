import React, { FC, HTMLAttributes } from 'react'
import styled from 'styled-components'


const RowStyled = styled.div`
    width: 100%;
    box-sizing: border-box;
    white-space: nowrap;
    &:hover {
        background-color: var(--rc-table-row-hover-background-color, #f5f5f5);
    }
`

interface RowProps extends HTMLAttributes<HTMLDivElement>{
}

const Row: FC<RowProps> = ({
    ...restProps
}) => {
    return (
        <RowStyled {...restProps}/>
    )
}

export default Row
