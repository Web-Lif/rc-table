---
nav:
    title: 例子
    path: /components
group:
    path: /components/demo
    title: 使用例子
title: 基础使用
---

```tsx
import React from 'react';

import { Table } from '@weblif/rc-table';

const createRows = () => {
    const rows: Row[] = [];
    for (let i = 0; i < 2000; i += 1) {
        const cells = [];

        let sticky;

        if (i === 0 || i === 1) {
            sticky = 'top';
        }
        for (let c = 0; c < 1000; c += 1) {
            cells.push({
                width: 120,
                value: `${i} - ${c}`,
                key: `${i}-${c}`,
            });
        }

        rows.push({
            height: 36,
            cells,
            sticky,
            key: i,
        });
    }
    return rows;
};

let rows = createRows();

const BaseTable = () => {
    return <Table width={1200} height={600} rows={rows} />;
};

export default BaseTable;
```
