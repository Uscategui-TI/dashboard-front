import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/shared/ui/table";
import Checkbox from "../../form/input/Checkbox";

type ColumnConfig<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
};

type GenericTableProps<T> = {
  columns: ColumnConfig<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  searchableColumns?: (keyof T)[];
  filterableColumns?: (keyof T)[];
  onSearchChange?: (value: string) => void;
};

export function GenericTable<T extends { id: string | number }>({
  columns,
  data,
  actions,
  selectable = false,
  onSelectionChange,
  searchableColumns,
  filterableColumns,
  onSearchChange,
}: GenericTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  // ✅ Mover filteredData arriba para evitar uso previo
  const filteredData: T[] = onSearchChange
  ? data // si es búsqueda remota, no filtramos nada localmente
  : data.filter((row) => {
      const matchesSearch =
        !searchableColumns || searchableColumns.some((key) =>
          String(row[key] ?? "").toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        return !value || String((row as any)[key]) === value;
      });

      return matchesSearch && matchesFilters;
    });

  const isSelected = (id: string | number) => selectedIds.includes(id);
  const isAllSelected = filteredData.length > 0 && selectedIds.length === filteredData.length;

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
    } else {
      setSelectedIds(filteredData.map((item) => item.id));
    }
  };

  return (
    <div className="w-full">
      {/* Busqueda + Filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4 rounded-md">
        { searchableColumns ? (
          <div className="flex items-center gap-3">
            <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = (e.target as HTMLInputElement).value;
                    if (onSearchChange) {
                      onSearchChange(value);
                    }
                  }
                }}
                /* onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  if (onSearchChange) {
                    onSearchChange(value); // búsqueda remota
                  }
                }} */
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />

            {searchTerm && (
              <button
              onClick={() => {
                setSearchTerm("");         // limpia el campo visualmente
                if (onSearchChange) {
                  onSearchChange("");      // 🔁 recarga los datos completos
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
                Limpiar
              </button>
            )}
          </div>
        ) : null}

        {filterableColumns?.map((key) => {
          const uniqueValues = Array.from(new Set(data.map((row) => row[key])));
          return (
            <select
              key={String(key)}
              value={filters[String(key)] || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, [String(key)]: e.target.value }))
              }
              className="px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
            >
              <option value="">Filtrar por {String(key)}</option>
              {uniqueValues.map((val, idx) => (
                <option key={idx} value={String(val)}>
                  {String(val)}
                </option>
              ))}
            </select>
          );
        })}
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
            {columns.map((col, i) => (
              <TableCell key={i} isHeader className="py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                {col.header}
              </TableCell>
            ))}
            {actions && <TableCell isHeader className="py-4 px-10 font-medium text-gray-500 text-start dark:text-gray-400">Acciones</TableCell>}
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
                <TableCell key={i} className="py-3 text-gray-500 dark:text-gray-400 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
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