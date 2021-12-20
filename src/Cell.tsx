import React, { FC, HTMLAttributes } from 'react'
import styled from 'styled-components'


const CellStyled = styled.div`
    display: inline-block;
    height: 100%;
`

interface CellProps extends HTMLAttributes<HTMLDivElement>{
}

const Cell: FC<CellProps> = ({
    ...restProps
}) => {
    return (
        <CellStyled {...restProps}/>
    )
}

export default Cell