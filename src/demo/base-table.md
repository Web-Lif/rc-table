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
    for (let i = 0; i < 100; i += 1) {
        const cells = [];

        let sticky;
        let selectd;

        if (i === 0 || i === 1) {
            sticky = 'top';
            selectd = false;
        }
        if (i === 99) {
            sticky = 'bottom';
            selectd = false;
        }
        for (let c = 0; c < 20; c += 1) {
            let stickyCell;
            let width = 120;
            if (c === 0) {
                stickyCell = 'left';
            }

            cells.push({
                width,
                value: `${i} - ${c}`,
                key: `${i}-${c}`,
                sticky: stickyCell,
                selectd,
            });
        }

        rows.push({
            height: 35,
            cells,
            key: i,
            sticky,
        });
    }
    return rows;
};

let rows = createRows();

const BaseTable = () => {
    return (
        <Table
            width={1200}
            debug
            height={600}
            rows={rows}
            onRowMouseOver={(e, table) => {
                const classNames = e.currentTarget.className.split(' ');
                const className = classNames.find((className) =>
                    className.includes('rc-table-row-'),
                );
                const elements = table.querySelectorAll(`.${className}`);
                table.querySelectorAll(`.rc-table-row`).forEach((element) => {
                    (element as HTMLElement).style.removeProperty('--rc-table-background-color');
                });

                elements.forEach((element) => {
                    (element as HTMLElement).style.setProperty(
                        '--rc-table-background-color',
                        '#f5f5f5',
                    );
                });
            }}
        />
    );
};

export default BaseTable;
```

```tsx
import React from 'react';

import { Table } from '@weblif/rc-table';

const createRows = () => {
    const rows: Row[] = [];
    for (let i = 0; i < 1; i += 1) {
        const cells = [];

        let sticky;
        let selectd;

        if (i === 0 || i === 1) {
            sticky = 'top';
            selectd = false;
        }
        for (let c = 0; c < 5; c += 1) {
            let stickyCell;
            let width = 120;
            if (c === 0) {
                stickyCell = 'left';
            }
            if (c === 19 || c === 18) {
                stickyCell = 'right';
            } else if (c === 1) {
                width = 240;
            }
            cells.push({
                width,
                value: `${i} - ${c}`,
                key: `${i}-${c}`,
                sticky: stickyCell,
                selectd,
            });
        }

        rows.push({
            height: 35,
            cells,
            key: i,
            sticky,
        });
    }

    return rows;
};

let rows = createRows();

const BaseTable = () => {
    return (
        <Table
            width={1200}
            debug
            height={600}
            rows={rows}
            onEmptyRowsRenderer={() => <div> 数据为空 </div>}
            onRowMouseOver={(e, table) => {
                const classNames = e.currentTarget.className.split(' ');
                const className = classNames.find((className) =>
                    className.includes('rc-table-row-'),
                );
                const elements = table.querySelectorAll(`.${className}`);
                table.querySelectorAll(`.rc-table-row`).forEach((element) => {
                    (element as HTMLElement).style.removeProperty('--rc-table-background-color');
                });

                elements.forEach((element) => {
                    (element as HTMLElement).style.setProperty(
                        '--rc-table-background-color',
                        '#f5f5f5',
                    );
                });
            }}
        />
    );
};

export default BaseTable;
```
