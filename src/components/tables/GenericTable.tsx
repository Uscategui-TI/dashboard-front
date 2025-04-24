import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import React from "react";

type ColumnConfig<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
};

type GenericTableProps<T> = {
  columns: ColumnConfig<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
};

export function GenericTable<T extends { id: string | number }>({
  columns,
  data,
  actions,
}: GenericTableProps<T>) {
  return (
    <Table>
      <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
        <TableRow>
          {columns.map((col, i) => (
            <TableCell key={i} isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400" >
              {col.header}
            </TableCell>
          ))}
          {actions && <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400" >Acciones</TableCell>}
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map(({ key, render }, i) => (
              <TableCell key={i}  className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                {render ? render(row) : String((row as any)[key] ?? "-")}
              </TableCell>
            ))}
            {actions && <TableCell  className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{actions(row)}</TableCell>}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default GenericTable;
