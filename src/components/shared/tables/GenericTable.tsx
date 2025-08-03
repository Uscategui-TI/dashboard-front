import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/shared/ui/table";
import Checkbox from "../../form/input/Checkbox";
import * as Popover from "@radix-ui/react-popover";
import { Funnel } from "lucide-react";

export type ColumnConfig<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  filterType?: "text" | "select" | "range";
};

type GenericTableProps<T> = {
  columns: ColumnConfig<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  searchableColumns?: (keyof T)[];
  onSearchChange?: (value: string) => void;
  onFilterChange?: (filters: Record<string, string>) => void;
  onSelectAll?: (select: boolean) => void;
};

export function GenericTable<T extends { id: string | number }>({
  columns,
  data,
  actions,
  selectable = false,
  onSelectionChange,
  searchableColumns,
  onSearchChange,
  onFilterChange,
  onSelectAll,
}: GenericTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedGlobalIds, setSelectedGlobalIds] = useState<(string | number)[]>([]);
  const [selectAllActive, setSelectAllActive] = useState(false);
  

  // Emitir cambios de filtros hacia el padre
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters]);

  const isSelected = (id: string | number) => selectedIds.includes(id);
  const isAllSelected = data.length > 0 && selectedIds.length === data.length;

  const filteredData: T[] = onSearchChange
    ? data
    : data.filter((row) => {
        const matchesSearch =
          !searchableColumns || searchableColumns.some((key) =>
            String(row[key] ?? "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );

        const matchesFilters = Object.entries(filters).every(([key, value]) => {
          const column = columns.find((c) => String(c.key) === key);
          const rowValue = (row as any)[key];

          if (!column?.filterType) return true;

          if (column.filterType === "text") {
            return String(rowValue ?? "")
              .toLowerCase()
              .includes(String(value).toLowerCase());
          }

          if (column.filterType === "select") {
            return !value || rowValue === value;
          }

          if (column.filterType === "range") {
            try {
              const { min, max } = JSON.parse(value || "{}");
              if (min && Number(rowValue) < Number(min)) return false;
              if (max && Number(rowValue) > Number(max)) return false;
              return true;
            } catch {
              return true;
            }
          }

          return true;
        });

        return matchesSearch && matchesFilters;
      });

  useEffect(() => {
    if (onSelectionChange) {
      const selected = data.filter((item) => selectedIds.includes(item.id));
      onSelectionChange(selected);
    }
  }, [selectedIds]);

  const toggleSelect = (row: T) => {
    setSelectedIds((prev) =>
      prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
      onSelectAll?.(false); // Notifica al padre que se deseleccionó todo
    } else {
      const ids = filteredData.map((item) => item.id);
      setSelectedIds(ids);
      onSelectAll?.(true); // Notifica al padre que se seleccionó todo
    }
  };



  return (
    <div className="w-full">
      {/* Busqueda + Filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
        {searchableColumns ? (
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && onSearchChange) {
                  onSearchChange(searchTerm);
                }
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  if (onSearchChange) onSearchChange("");
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                Limpiar
              </button>
            )}
          </div>
        ) : null}

      </div>

      {/* Tabla */}
      <Table>
        <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
          <TableRow>
            {selectable && (
              <TableCell isHeader className="p-3">
                <Checkbox checked={isAllSelected} onChange={toggleSelectAll} label="" />
              </TableCell>
            )}
            {columns.map((col, i) => {
            const key = String(col.key);
            const value = filters[key] || "";

            return (
              <TableCell
                key={i}
                isHeader
                className="py-3 font-medium text-gray-500 text-start dark:text-gray-400 relative"
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.filterType && (
                    <Popover.Root>
                      <Popover.Trigger asChild>
                        <button className="ml-1 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                          <Funnel className="w-4 h-4" />
                        </button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content
                          side="bottom"
                          align="start"
                          className="z-50 rounded border border-gray-200 bg-white p-3 shadow-md dark:border-gray-700 dark:bg-gray-800 w-56"
                        >
                          {col.filterType === "text" && (
                            <input
                              type="text"
                              value={value}
                              placeholder={`Filtrar ${col.header}`}
                              onChange={(e) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }))
                              }
                              className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                            />
                          )}

                          {col.filterType === "range" && (() => {
                            const range = value ? JSON.parse(value) : { min: "", max: "" };
                            return (
                              <div className="flex gap-2 mt-1">
                                <input
                                  type="number"
                                  placeholder="Min"
                                  value={range.min}
                                  onChange={(e) =>
                                    setFilters((prev) => ({
                                      ...prev,
                                      [key]: JSON.stringify({
                                        ...range,
                                        min: e.target.value,
                                      }),
                                    }))
                                  }
                                  className="w-1/2 px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                  type="number"
                                  placeholder="Max"
                                  value={range.max}
                                  onChange={(e) =>
                                    setFilters((prev) => ({
                                      ...prev,
                                      [key]: JSON.stringify({
                                        ...range,
                                        max: e.target.value,
                                      }),
                                    }))
                                  }
                                  className="w-1/2 px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                            );
                          })()}

                          <div className="mt-2 text-right">
                            <button
                              onClick={() =>
                                setFilters((prev) => {
                                  const newFilters = { ...prev };
                                  delete newFilters[key];
                                  return newFilters;
                                })
                              }
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Limpiar filtro
                            </button>
                          </div>
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  )}
                </div>
              </TableCell>
              );
            })}
            {actions && (
              <TableCell
                isHeader
                className="py-4 px-10 font-medium text-gray-500 text-start dark:text-gray-400"
              >
                Acciones
              </TableCell>
            )}
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {filteredData.map((row) => (
            <TableRow key={row.id}>
              {selectable && (
                <TableCell className="p-3">
                  <Checkbox checked={isSelected(row.id)} onChange={() => toggleSelect(row)} label="" />
                </TableCell>
              )}
              {columns.map(({ key, render }, i) => (
                <TableCell
                  key={i}
                  className="py-3 text-gray-500 dark:text-gray-400 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {render ? render(row) : String((row as any)[key] ?? "-")}
                </TableCell>
              ))}
              {actions && (
                <TableCell className="py-3 text-gray-500 dark:text-gray-400">
                  {actions(row)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default GenericTable;
