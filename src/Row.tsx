import React, { FC, HTMLAttributes } from 'react'
import styled from 'styled-components'


const RowStyled = styled.div`
    border-bottom: 1px solid var(--rc-table-border-color, #ddd);
    width: 100%;
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