"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
    getFilteredRowModel,
    ColumnFiltersState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";

interface FilterOption {
    label: string;
    value: string;
}

interface ColumnFilter {
    columnKey: string;
    placeholder: string;
    options: FilterOption[];
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    searchPlaceholder?: string;
    showSearch?: boolean;
    emptyMessage?: string;
    columnFilters?: ColumnFilter[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = "Buscar...",
    showSearch = true,
    emptyMessage = "No se encontraron resultados.",
    columnFilters: customColumnFilters = [],
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    const clearAllFilters = () => {
        setColumnFilters([]);
    };

    const hasActiveFilters = columnFilters.length > 0;

    return (
        <div className="space-y-4">
            {(showSearch && searchKey) || customColumnFilters.length > 0 ? (
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                    {showSearch && searchKey && (
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn(searchKey)?.setFilterValue(event.target.value)
                                }
                                className="pl-8"
                            />
                        </div>
                    )}
                    
                    {customColumnFilters.map((filter) => (
                        <div key={filter.columnKey} className="min-w-[200px]">
                            <Select
                                value={(table.getColumn(filter.columnKey)?.getFilterValue() as string) ?? "all"}
                                onValueChange={(value) =>
                                    table.getColumn(filter.columnKey)?.setFilterValue(value === "all" ? undefined : value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={filter.placeholder} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {filter.options.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                    
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            onClick={clearAllFilters}
                            className="h-9 px-2 lg:px-3"
                        >
                            <X className="h-4 w-4" />
                            Limpiar filtros
                        </Button>
                    )}
                </div>
            ) : null}
            
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef.header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} de{" "}
                    {table.getCoreRowModel().rows.length} registro(s)
                    {hasActiveFilters && " (filtrado)"}
                </div>
                <DataTablePagination table={table} />
            </div>
        </div>
    );
} 