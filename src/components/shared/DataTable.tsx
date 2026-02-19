import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Search, Filter, Download, Printer, Eye, Edit,
  Trash2, Copy, MoreVertical, Check, X, Star,
  ArrowUpDown, ArrowUp, ArrowDown, Grid, List,
  Maximize2, Minimize2, RefreshCw, Settings,
  Columns, FileText, Mail, Share2, Tag
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useDebounce } from '../../hooks/useDebounce'
import { useClickOutside } from '../../hooks/useClickOutside'

// ============================================================================
// TYPES
// ============================================================================

export type SortDirection = 'asc' | 'desc' | null
export type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in' | 'notIn'

export interface Column<T = any> {
  id: string
  header: string | React.ReactNode
  accessor: keyof T | ((row: T) => any)
  cell?: (value: any, row: T, index: number) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  searchable?: boolean
  width?: number | string
  minWidth?: number
  maxWidth?: number
  align?: 'left' | 'center' | 'right'
  hidden?: boolean
  frozen?: boolean
  className?: string
  headerClassName?: string
  cellClassName?: string
  format?: (value: any) => string
  aggregate?: 'sum' | 'avg' | 'min' | 'max' | 'count'
}

export interface SortConfig {
  columnId: string
  direction: SortDirection
}

export interface FilterConfig {
  columnId: string
  operator: FilterOperator
  value: any
  value2?: any // For between operator
}

export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  pageSizes?: number[]
}

export interface SelectionConfig {
  enabled: boolean
  selectedRows: Set<string | number>
  onSelectionChange?: (selectedRows: Set<string | number>) => void
  selectable?: (row: any) => boolean
}

export interface ExportConfig {
  enabled: boolean
  filename?: string
  formats?: ('csv' | 'excel' | 'pdf')[]
  onExport?: (format: string) => void
}

export interface Action<T = any> {
  icon?: React.ElementType
  label: string
  onClick: (rows: T | T[]) => void
  condition?: (row: T) => boolean
  variant?: 'default' | 'primary' | 'danger' | 'success'
  multiple?: boolean
}

export interface DataTableProps<T = any> {
  // Data
  data: T[]
  columns: Column<T>[]
  keyExtractor: (row: T) => string | number

  // Features
  sortable?: boolean
  filterable?: boolean
  searchable?: boolean
  paginated?: boolean
  selectable?: boolean
  expandable?: boolean
  virtualized?: boolean

  // Configs
  initialSort?: SortConfig
  initialFilters?: FilterConfig[]
  initialPagination?: Partial<PaginationConfig>
  selection?: SelectionConfig
  export?: ExportConfig
  actions?: Action<T>[]

  // Styling
  className?: string
  tableClassName?: string
  headerClassName?: string
  rowClassName?: string | ((row: T, index: number) => string)
  cellClassName?: string | ((column: Column<T>, row: T, index: number) => string)
  emptyClassName?: string
  loadingClassName?: string

  // Behavior
  onRowClick?: (row: T) => void
  onRowDoubleClick?: (row: T) => void
  onSortChange?: (sort: SortConfig | null) => void
  onFilterChange?: (filters: FilterConfig[]) => void
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onSelectionChange?: (selectedRows: Set<string | number>) => void
  onRefresh?: () => void

  // States
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  loadingMessage?: string

  // Custom renderers
  renderExpandable?: (row: T) => React.ReactNode
  renderEmpty?: () => React.ReactNode
  renderLoading?: () => React.ReactNode
  renderError?: (error: string) => React.ReactNode

  // Performance
  rowHeight?: number
  overscan?: number
  debounceSearch?: number
}

// ============================================================================
// COLUMN HEADER COMPONENT
// ============================================================================

interface ColumnHeaderProps<T> {
  column: Column<T>
  sort: SortConfig | null
  onSort: (columnId: string) => void
  onFilter: (columnId: string) => void
  filterActive: boolean
}

function ColumnHeader<T>({
  column,
  sort,
  onSort,
  onFilter,
  filterActive
}: ColumnHeaderProps<T>) {
  const isSorted = sort?.columnId === column.id
  const sortDirection = isSorted ? sort.direction : null

  return (
    <div
      className={`flex items-center space-x-2 ${
        column.align === 'right' ? 'justify-end' :
        column.align === 'center' ? 'justify-center' :
        'justify-start'
      }`}
    >
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        {column.header}
      </span>
      
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {column.sortable && (
          <button
            onClick={() => onSort(column.id)}
            className="p-0.5 hover:bg-dark-hover rounded transition-colors"
          >
            {sortDirection === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-cosmic-purple" />
            ) : sortDirection === 'desc' ? (
              <ArrowDown className="w-3.5 h-3.5 text-cosmic-purple" />
            ) : (
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
            )}
          </button>
        )}
        
        {column.filterable && (
          <button
            onClick={() => onFilter(column.id)}
            className={`p-0.5 hover:bg-dark-hover rounded transition-colors ${
              filterActive ? 'text-cosmic-purple' : 'text-gray-500'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// FILTER POPOVER COMPONENT
// ============================================================================

interface FilterPopoverProps {
  column: Column
  filter?: FilterConfig
  onApply: (filter: FilterConfig) => void
  onClear: () => void
  onClose: () => void
  anchorEl: HTMLElement | null
}

function FilterPopover({
  column,
  filter,
  onApply,
  onClear,
  onClose,
  anchorEl
}: FilterPopoverProps) {
  const [operator, setOperator] = useState<FilterOperator>(filter?.operator || 'contains')
  const [value, setValue] = useState<any>(filter?.value || '')
  const [value2, setValue2] = useState<any>(filter?.value2 || '')
  const popoverRef = useRef<HTMLDivElement>(null)

  useClickOutside(popoverRef, () => onClose(), [anchorEl])

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
    { value: 'gt', label: 'Greater than' },
    { value: 'gte', label: 'Greater than or equal' },
    { value: 'lt', label: 'Less than' },
    { value: 'lte', label: 'Less than or equal' },
    { value: 'between', label: 'Between' },
    { value: 'in', label: 'In list' },
    { value: 'notIn', label: 'Not in list' }
  ]

  const handleApply = () => {
    onApply({
      columnId: column.id,
      operator,
      value,
      ...(operator === 'between' && { value2 })
    })
    onClose()
  }

  if (!anchorEl) return null

  const rect = anchorEl.getBoundingClientRect()

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 glass-card p-4 rounded-xl shadow-2xl"
      style={{
        top: rect.bottom + 8,
        left: rect.left,
        minWidth: 280
      }}
    >
      <h4 className="text-white text-sm font-medium mb-3">
        Filter by {String(column.header)}
      </h4>

      <div className="space-y-3">
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value as FilterOperator)}
          className="w-full bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-sm text-white"
        >
          {operators.map(op => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>

        {operator !== 'between' ? (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Value..."
            className="w-full bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-sm text-white"
          />
        ) : (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Min"
              className="flex-1 bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-sm text-white"
            />
            <span className="text-gray-400">to</span>
            <input
              type="text"
              value={value2}
              onChange={(e) => setValue2(e.target.value)}
              placeholder="Max"
              className="flex-1 bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-end space-x-2 mt-4">
        <button
          onClick={onClear}
          className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Clear
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-1.5 bg-cosmic-purple text-white text-sm rounded-lg hover:bg-electric-blue transition-colors"
        >
          Apply Filter
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// PAGINATION COMPONENT
// ============================================================================

interface PaginationProps {
  config: PaginationConfig
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

function Pagination({ config, onPageChange, onPageSizeChange }: PaginationProps) {
  const { page, pageSize, total, pageSizes = [10, 25, 50, 100] } = config
  const totalPages = Math.ceil(total / pageSize)

  const getPageNumbers = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-dark-border">
      <div className="flex items-center space-x-4">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="bg-dark-hover border border-dark-border rounded-lg px-3 py-1.5 text-sm text-white"
        >
          {pageSizes.map(size => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>
        
        <span className="text-sm text-gray-400">
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} results
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 hover:bg-dark-hover rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((pageNum, index) => (
          <button
            key={index}
            onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
            className={`min-w-[32px] h-8 px-2 rounded-lg text-sm transition-colors ${
              pageNum === page
                ? 'bg-cosmic-purple text-white'
                : typeof pageNum === 'number'
                ? 'text-gray-400 hover:text-white hover:bg-dark-hover'
                : 'text-gray-600 cursor-default'
            }`}
            disabled={typeof pageNum !== 'number'}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 hover:bg-dark-hover rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN DATA TABLE COMPONENT
// ============================================================================

export function DataTable<T extends Record<string, any>>({
  // Data
  data,
  columns,
  keyExtractor,

  // Features
  sortable = true,
  filterable = true,
  searchable = true,
  paginated = true,
  selectable = false,
  expandable = false,
  virtualized = false,

  // Configs
  initialSort,
  initialFilters = [],
  initialPagination = { page: 1, pageSize: 20, total: 0 },
  selection,
  export: exportConfig,
  actions = [],

  // Styling
  className = '',
  tableClassName = '',
  headerClassName = '',
  rowClassName = '',
  cellClassName = '',
  emptyClassName = '',
  loadingClassName = '',

  // Behavior
  onRowClick,
  onRowDoubleClick,
  onSortChange,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
  onSelectionChange,
  onRefresh,

  // States
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  loadingMessage = 'Loading...',

  // Custom renderers
  renderExpandable,
  renderEmpty,
  renderLoading,
  renderError,

  // Performance
  rowHeight = 48,
  overscan = 5,
  debounceSearch = 300
}: DataTableProps<T>) {
  // ==========================================================================
  // STATE
  // ==========================================================================

  const [sort, setSort] = useState<SortConfig | null>(initialSort || null)
  const [filters, setFilters] = useState<FilterConfig[]>(initialFilters)
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: initialPagination.page || 1,
    pageSize: initialPagination.pageSize || 20,
    total: initialPagination.total || data.length,
    pageSizes: initialPagination.pageSizes || [10, 25, 50, 100]
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set(selection?.selectedRows || [])
  )
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set())
  const [activeFilter, setActiveFilter] = useState<{
    columnId: string
    anchorEl: HTMLElement | null
  } | null>(null)
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    columns.reduce((acc, col) => ({ ...acc, [col.id]: !col.hidden }), {})
  )
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const [showColumnSelector, setShowColumnSelector] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, debounceSearch)
  const tableRef = useRef<HTMLDivElement>(null)
  const columnSelectorRef = useRef<HTMLDivElement>(null)

  // ==========================================================================
  // DERIVED DATA
  // ==========================================================================

  const processedData = useMemo(() => {
    let result = [...data]

    // Apply search
    if (debouncedSearch) {
      const searchableColumns = columns.filter(col => col.searchable !== false)
      result = result.filter(row =>
        searchableColumns.some(col => {
          const value = typeof col.accessor === 'function'
            ? col.accessor(row)
            : row[col.accessor]
          return String(value).toLowerCase().includes(debouncedSearch.toLowerCase())
        })
      )
    }

    // Apply filters
    if (filters.length > 0) {
      result = result.filter(row => {
        return filters.every(filter => {
          const column = columns.find(c => c.id === filter.columnId)
          if (!column) return true

          const value = typeof column.accessor === 'function'
            ? column.accessor(row)
            : row[column.accessor]

          switch (filter.operator) {
            case 'equals':
              return value === filter.value
            case 'contains':
              return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
            case 'startsWith':
              return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase())
            case 'endsWith':
              return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase())
            case 'gt':
              return value > filter.value
            case 'gte':
              return value >= filter.value
            case 'lt':
              return value < filter.value
            case 'lte':
              return value <= filter.value
            case 'between':
              return value >= filter.value && value <= filter.value2
            case 'in':
              return filter.value.includes(value)
            case 'notIn':
              return !filter.value.includes(value)
            default:
              return true
          }
        })
      })
    }

    // Apply sort
    if (sort) {
      const column = columns.find(c => c.id === sort.columnId)
      if (column) {
        result.sort((a, b) => {
          const aVal = typeof column.accessor === 'function'
            ? column.accessor(a)
            : a[column.accessor]
          const bVal = typeof column.accessor === 'function'
            ? column.accessor(b)
            : b[column.accessor]

          if (aVal === bVal) return 0
          
          const modifier = sort.direction === 'asc' ? 1 : -1
          return aVal > bVal ? modifier : -modifier
        })
      }
    }

    return result
  }, [data, columns, debouncedSearch, filters, sort])

  // Apply pagination
  const paginatedData = useMemo(() => {
    if (!paginated) return processedData
    const start = (pagination.page - 1) * pagination.pageSize
    return processedData.slice(start, start + pagination.pageSize)
  }, [processedData, pagination, paginated])

  // Update total count
  useEffect(() => {
    if (paginated) {
      setPagination(prev => ({ ...prev, total: processedData.length }))
    }
  }, [processedData.length, paginated])

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleSort = (columnId: string) => {
    if (!sortable) return

    let newSort: SortConfig | null = null

    if (!sort || sort.columnId !== columnId) {
      newSort = { columnId, direction: 'asc' }
    } else if (sort.direction === 'asc') {
      newSort = { columnId, direction: 'desc' }
    }

    setSort(newSort)
    onSortChange?.(newSort)
  }

  const handleFilter = (columnId: string, anchorEl: HTMLElement) => {
    if (!filterable) return
    setActiveFilter({ columnId, anchorEl })
  }

  const handleFilterApply = (filter: FilterConfig) => {
    setFilters(prev => {
      const existing = prev.findIndex(f => f.columnId === filter.columnId)
      if (existing >= 0) {
        const newFilters = [...prev]
        newFilters[existing] = filter
        return newFilters
      }
      return [...prev, filter]
    })
    onFilterChange?.(filters)
  }

  const handleFilterClear = (columnId: string) => {
    setFilters(prev => prev.filter(f => f.columnId !== columnId))
    onFilterChange?.(filters)
  }

  const handleSelectAll = () => {
    if (!selectable) return

    if (selectedRows.size === paginatedData.length) {
      const newSelected = new Set<string | number>()
      setSelectedRows(newSelected)
      onSelectionChange?.(newSelected)
      selection?.onSelectionChange?.(newSelected)
    } else {
      const newSelected = new Set(paginatedData.map(row => keyExtractor(row)))
      setSelectedRows(newSelected)
      onSelectionChange?.(newSelected)
      selection?.onSelectionChange?.(newSelected)
    }
  }

  const handleSelectRow = (rowId: string | number) => {
    if (!selectable) return

    const newSelected = new Set(selectedRows)
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId)
    } else {
      newSelected.add(rowId)
    }
    setSelectedRows(newSelected)
    onSelectionChange?.(newSelected)
    selection?.onSelectionChange?.(newSelected)
  }

  const handleExpandRow = (rowId: string | number) => {
    if (!expandable) return

    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId)
    } else {
      newExpanded.add(rowId)
    }
    setExpandedRows(newExpanded)
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
    onPageChange?.(page)
  }

  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }))
    onPageSizeChange?.(pageSize)
  }

  const handleExport = (format: string) => {
    if (exportConfig?.onExport) {
      exportConfig.onExport(format)
    } else {
      // Default export logic
      const csv = paginatedData.map(row => 
        columns.map(col => {
          const value = typeof col.accessor === 'function'
            ? col.accessor(row)
            : row[col.accessor]
          return `"${value}"`
        }).join(',')
      ).join('\n')
      
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = exportConfig?.filename || 'export.csv'
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success(`Exported as ${format.toUpperCase()}`)
    }
  }

  // ==========================================================================
  // RENDER CELL
  // ==========================================================================

  const renderCell = (column: Column<T>, row: T, index: number) => {
    const value = typeof column.accessor === 'function'
      ? column.accessor(row)
      : row[column.accessor]

    if (column.cell) {
      return column.cell(value, row, index)
    }

    if (column.format) {
      return column.format(value)
    }

    return value
  }

  // ==========================================================================
  // RENDER LOADING
  // ==========================================================================

  if (loading) {
    if (renderLoading) {
      return renderLoading()
    }

    return (
      <div className={`glass-card p-8 ${loadingClassName}`}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-cosmic-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  // ==========================================================================
  // RENDER ERROR
  // ==========================================================================

  if (error) {
    if (renderError) {
      return renderError(error)
    }

    return (
      <div className={`glass-card p-8 ${emptyClassName}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-red/10 flex items-center justify-center">
            <X className="w-8 h-8 text-error-red" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Error Loading Data</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-electric-blue transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  // ==========================================================================
  // RENDER EMPTY
  // ==========================================================================

  if (paginatedData.length === 0) {
    if (renderEmpty) {
      return renderEmpty()
    }

    return (
      <div className={`glass-card p-8 ${emptyClassName}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Data Available</h3>
          <p className="text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  const visibleColumns = columns.filter(col => columnVisibility[col.id])

  return (
    <div className={`glass-card overflow-hidden ${className}`} ref={tableRef}>
      {/* Toolbar */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {searchable && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-dark-hover border border-dark-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-cosmic-purple focus:outline-none"
                />
              </div>
            )}

            {filters.length > 0 && (
              <div className="flex items-center space-x-2">
                {filters.map(filter => {
                  const column = columns.find(c => c.id === filter.columnId)
                  if (!column) return null
                  return (
                    <div
                      key={filter.columnId}
                      className="flex items-center space-x-1 px-2 py-1 bg-cosmic-purple/20 rounded-lg"
                    >
                      <span className="text-xs text-cosmic-purple">
                        {String(column.header)}: {filter.value}
                      </span>
                      <button
                        onClick={() => handleFilterClear(filter.columnId)}
                        className="p-0.5 hover:bg-cosmic-purple/30 rounded"
                      >
                        <X className="w-3 h-3 text-cosmic-purple" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Column selector */}
            <div className="relative" ref={columnSelectorRef}>
              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <Columns className="w-4 h-4 text-gray-400" />
              </button>

              <AnimatePresence>
                {showColumnSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 glass-card rounded-xl p-2 z-50"
                  >
                    <p className="text-xs text-gray-400 px-2 py-1">Toggle Columns</p>
                    {columns.map(col => (
                      <label
                        key={col.id}
                        className="flex items-center space-x-2 px-2 py-1.5 hover:bg-dark-hover rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={columnVisibility[col.id]}
                          onChange={() => setColumnVisibility(prev => ({
                            ...prev,
                            [col.id]: !prev[col.id]
                          }))}
                          className="rounded border-dark-border bg-dark-hover text-cosmic-purple"
                        />
                        <span className="text-sm text-white">{String(col.header)}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Export */}
            {exportConfig?.enabled && (
              <button
                onClick={() => handleExport('csv')}
                className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            )}

            {/* Refresh */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className={`w-full ${tableClassName}`}>
          {/* Header */}
          <thead className="bg-dark-hover/50">
            <tr className="border-b border-dark-border">
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length}
                    onChange={handleSelectAll}
                    className="rounded border-dark-border bg-dark-hover text-cosmic-purple"
                  />
                </th>
              )}
              
              {expandable && (
                <th className="px-4 py-3 w-10" />
              )}

              {visibleColumns.map(column => (
                <th
                  key={column.id}
                  className={`group px-4 py-3 text-left ${headerClassName} ${column.headerClassName || ''}`}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                    textAlign: column.align || 'left'
                  }}
                >
                  <ColumnHeader
                    column={column}
                    sort={sort}
                    onSort={handleSort}
                    onFilter={(id) => handleFilter(id, document.activeElement as HTMLElement)}
                    filterActive={filters.some(f => f.columnId === column.id)}
                  />
                </th>
              ))}

              {actions.length > 0 && (
                <th className="px-4 py-3 w-20 text-right">Actions</th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {paginatedData.map((row, index) => {
              const rowId = keyExtractor(row)
              const isSelected = selectedRows.has(rowId)
              const isExpanded = expandedRows.has(rowId)

              return (
                <React.Fragment key={rowId}>
                  <tr
                    className={`border-b border-dark-border hover:bg-dark-hover/50 transition-colors cursor-pointer ${
                      typeof rowClassName === 'function'
                        ? rowClassName(row, index)
                        : rowClassName
                    }`}
                    onClick={() => onRowClick?.(row)}
                    onDoubleClick={() => onRowDoubleClick?.(row)}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        {(!selection?.selectable || selection.selectable(row)) && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(rowId)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-dark-border bg-dark-hover text-cosmic-purple"
                          />
                        )}
                      </td>
                    )}

                    {expandable && (
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExpandRow(rowId)
                          }}
                          className="p-1 hover:bg-dark-hover rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                    )}

                    {visibleColumns.map(column => {
                      const className = typeof cellClassName === 'function'
                        ? cellClassName(column, row, index)
                        : cellClassName

                      return (
                        <td
                          key={column.id}
                          className={`px-4 py-3 text-sm ${className} ${column.cellClassName || ''}`}
                          style={{ textAlign: column.align || 'left' }}
                        >
                          {renderCell(column, row, index)}
                        </td>
                      )
                    })}

                    {actions.length > 0 && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end space-x-2">
                          {actions
                            .filter(action => !action.condition || action.condition(row))
                            .map((action, i) => {
                              const Icon = action.icon
                              const variantClasses = {
                                default: 'text-gray-400 hover:text-white',
                                primary: 'text-cosmic-purple hover:text-electric-blue',
                                danger: 'text-error-red hover:text-error-red/80',
                                success: 'text-success-green hover:text-success-green/80'
                              }

                              return (
                                <button
                                  key={i}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    action.multiple
                                      ? action.onClick(selectedRows.size > 0 ? Array.from(selectedRows).map(id => data.find(d => keyExtractor(d) === id)!) : [row])
                                      : action.onClick(row)
                                  }}
                                  className={`p-1 hover:bg-dark-hover rounded-lg transition-colors ${
                                    variantClasses[action.variant || 'default']
                                  }`}
                                >
                                  {Icon && <Icon className="w-4 h-4" />}
                                </button>
                              )
                            })}
                        </div>
                      </td>
                    )}
                  </tr>

                  {/* Expanded row */}
                  {expandable && isExpanded && renderExpandable && (
                    <tr className="border-b border-dark-border bg-dark-hover/30">
                      <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
                        <div className="p-4">
                          {renderExpandable(row)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && (
        <Pagination
          config={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Filter popover */}
      <AnimatePresence>
        {activeFilter && (
          <FilterPopover
            column={columns.find(c => c.id === activeFilter.columnId)!}
            filter={filters.find(f => f.columnId === activeFilter.columnId)}
            onApply={handleFilterApply}
            onClear={() => handleFilterClear(activeFilter.columnId)}
            onClose={() => setActiveFilter(null)}
            anchorEl={activeFilter.anchorEl}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// TABLE ACTIONS
// ============================================================================

export const TableActions = {
  Edit: ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      className="p-1 hover:bg-dark-hover rounded-lg transition-colors text-blue-400"
      title="Edit"
    >
      <Edit className="w-4 h-4" />
    </button>
  ),

  Delete: ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      className="p-1 hover:bg-dark-hover rounded-lg transition-colors text-error-red"
      title="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  ),

  View: ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      className="p-1 hover:bg-dark-hover rounded-lg transition-colors text-cosmic-purple"
      title="View"
    >
      <Eye className="w-4 h-4" />
    </button>
  ),

  Copy: ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      className="p-1 hover:bg-dark-hover rounded-lg transition-colors text-gray-400"
      title="Copy"
    >
      <Copy className="w-4 h-4" />
    </button>
  ),

  More: ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      className="p-1 hover:bg-dark-hover rounded-lg transition-colors text-gray-400"
      title="More actions"
    >
      <MoreVertical className="w-4 h-4" />
    </button>
  )
}

// ============================================================================
// TABLE COLUMN HELPERS
// ============================================================================

export const createColumn = <T,>(
  id: string,
  header: string,
  accessor: keyof T | ((row: T) => any),
  options?: Partial<Column<T>>
): Column<T> => ({
  id,
  header,
  accessor,
  sortable: true,
  filterable: true,
  searchable: true,
  ...options
})

export const createTextColumn = <T,>(
  id: string,
  header: string,
  accessor: keyof T | ((row: T) => any)
): Column<T> => createColumn(id, header, accessor)

export const createNumberColumn = <T,>(
  id: string,
  header: string,
  accessor: keyof T | ((row: T) => number),
  options?: Partial<Column<T>>
): Column<T> => createColumn(id, header, accessor, {
  align: 'right',
  format: (value) => value?.toLocaleString?.(),
  ...options
})

export const createCurrencyColumn = <T,>(
  id: string,
  header: string,
  accessor: keyof T | ((row: T) => number),
  currency: string = 'USD'
): Column<T> => createColumn(id, header, accessor, {
  align: 'right',
  format: (value) => {
    if (value == null) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(value)
  }
})

export const createDateColumn = <T,>(
  id: string,
  header: string,
  accessor: keyof T | ((row: T) => Date | string),
  format: 'short' | 'medium' | 'long' = 'medium'
): Column<T> => createColumn(id, header, accessor, {
  align: 'center',
  format: (value) => {
    if (!value) return '-'
    const date = new Date(value)
    switch (format) {
      case 'short':
        return date.toLocaleDateString()
      case 'medium':
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      case 'long':
        return date.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
    }
  }
})

export const createBooleanColumn = <T,>(
  id: string,
  header: string,
  accessor: keyof T | ((row: T) => boolean),
  options?: { trueLabel?: string; falseLabel?: string }
): Column<T> => createColumn(id, header, accessor, {
  align: 'center',
  cell: (value) => (
    <div className="flex justify-center">
      {value ? (
        <Check className="w-4 h-4 text-success-green" />
      ) : (
        <X className="w-4 h-4 text-error-red" />
      )}
    </div>
  ),
  ...options
})

export const createStatusColumn = <T,>(
  id: string,
  header: string,
  accessor: keyof T | ((row: T) => string),
  statusMap: Record<string, { label: string; color: string }>
): Column<T> => createColumn(id, header, accessor, {
  align: 'center',
  cell: (value) => {
    const status = statusMap[value] || { label: value, color: 'gray' }
    const colorClasses = {
      success: 'bg-success-green/10 text-success-green',
      warning: 'bg-warning-orange/10 text-warning-orange',
      error: 'bg-error-red/10 text-error-red',
      info: 'bg-electric-blue/10 text-electric-blue',
      gray: 'bg-gray-500/10 text-gray-400'
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colorClasses[status.color as keyof typeof colorClasses] || colorClasses.gray}`}>
        {status.label}
      </span>
    )
  }
})

export const createImageColumn = <T,>(
  id: string,
  header: string,
  accessor: keyof T | ((row: T) => string)
): Column<T> => createColumn(id, header, accessor, {
  align: 'center',
  cell: (src) => src ? (
    <img src={src} alt="" className="w-8 h-8 rounded-full object-cover" />
  ) : null
})

export const createRatingColumn = <T,>(
  id: string,
  header: string,
  accessor: keyof T | ((row: T) => number)
): Column<T> => createColumn(id, header, accessor, {
  align: 'center',
  cell: (rating) => (
    <div className="flex items-center justify-center">
      <span className="text-sm font-medium text-white mr-1">{rating?.toFixed(1)}</span>
      <Star className="w-3 h-3 text-gold fill-current" />
    </div>
  )
})

export default DataTable
