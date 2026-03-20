'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useFilterPresetsStore } from '@/store/filter-presets'
import type { FilterState } from '@/store/filter-presets'

interface FilterBarProps {
  features: Array<{ status: string; priority: string; kind: string; assignee: string }>
  onFilterChange: (filters: FilterState) => void
  currentFilters: FilterState
}

const selectStyle: React.CSSProperties = {
  background: 'var(--color-bg-alt)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  padding: '6px 12px',
  fontSize: 13,
  color: 'var(--color-fg)',
  cursor: 'pointer',
  appearance: 'none' as const,
  backgroundImage:
    'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\'%3E%3Cpath d=\'M0 0l5 6 5-6z\' fill=\'%23888\'/%3E%3C/svg%3E")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  paddingRight: 28,
}

const inputStyle: React.CSSProperties = {
  ...selectStyle,
  width: 200,
  backgroundImage: 'none',
  paddingRight: 12,
}

const chipStyle: React.CSSProperties = {
  fontSize: 11,
  padding: '4px 10px',
  borderRadius: 100,
  background: 'var(--color-bg-active)',
  border: '1px solid var(--color-border)',
  cursor: 'pointer',
  color: 'var(--color-fg)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
}

const chipDeleteStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-fg)',
  cursor: 'pointer',
  fontSize: 12,
  padding: 0,
  lineHeight: 1,
  opacity: 0.6,
}

export function FilterBar({ features, onFilterChange, currentFilters }: FilterBarProps) {
  const [searchValue, setSearchValue] = useState(currentFilters.search ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { presets, addPreset, removePreset } = useFilterPresetsStore()

  const uniqueStatuses = Array.from(new Set(features.map((f) => f.status).filter(Boolean))).sort()
  const uniqueAssignees = Array.from(new Set(features.map((f) => f.assignee).filter(Boolean))).sort()

  const hasActiveFilter =
    !!currentFilters.status ||
    !!currentFilters.priority ||
    !!currentFilters.kind ||
    !!currentFilters.assignee ||
    !!currentFilters.search

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onFilterChange({ ...currentFilters, search: value || undefined })
      }, 300)
    },
    [currentFilters, onFilterChange]
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  useEffect(() => {
    setSearchValue(currentFilters.search ?? '')
  }, [currentFilters.search])

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...currentFilters, [key]: value || undefined })
  }

  const clearFilters = () => {
    setSearchValue('')
    onFilterChange({})
  }

  const handleSavePreset = () => {
    const name = prompt('Preset name:')
    if (name && name.trim()) {
      addPreset(name.trim(), currentFilters)
    }
  }

  const applyPreset = (preset: { filters: FilterState }) => {
    setSearchValue(preset.filters.search ?? '')
    onFilterChange(preset.filters)
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 10,
          padding: '10px 0',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Search features..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={inputStyle}
        />

        <SearchableSelect
          value={currentFilters.status ?? ''}
          onChange={(val) => updateFilter('status', val)}
          style={selectStyle}
          placeholder="All statuses"
          options={uniqueStatuses.map((s) => ({ value: s, label: s }))}
        />

        <SearchableSelect
          value={currentFilters.priority ?? ''}
          onChange={(val) => updateFilter('priority', val)}
          style={selectStyle}
          placeholder="All priorities"
          options={[
            { value: 'P0', label: 'P0' },
            { value: 'P1', label: 'P1' },
            { value: 'P2', label: 'P2' },
            { value: 'P3', label: 'P3' },
          ]}
        />

        <SearchableSelect
          value={currentFilters.kind ?? ''}
          onChange={(val) => updateFilter('kind', val)}
          style={selectStyle}
          placeholder="All kinds"
          options={[
            { value: 'feature', label: 'feature' },
            { value: 'bug', label: 'bug' },
            { value: 'hotfix', label: 'hotfix' },
            { value: 'chore', label: 'chore' },
          ]}
        />

        <SearchableSelect
          value={currentFilters.assignee ?? ''}
          onChange={(val) => updateFilter('assignee', val)}
          style={selectStyle}
          placeholder="All assignees"
          options={uniqueAssignees.map((a) => ({ value: a, label: a }))}
        />

        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-fg)',
              cursor: 'pointer',
              fontSize: 13,
              opacity: 0.7,
              padding: '6px 8px',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {(presets.length > 0 || hasActiveFilter) && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
            paddingBottom: 8,
          }}
        >
          {presets.map((preset) => (
            <span
              key={preset.id}
              style={chipStyle}
              onClick={() => applyPreset(preset)}
            >
              {preset.name}
              <button
                style={chipDeleteStyle}
                onClick={(e) => {
                  e.stopPropagation()
                  removePreset(preset.id)
                }}
              >
                x
              </button>
            </span>
          ))}

          {hasActiveFilter && (
            <button
              onClick={handleSavePreset}
              style={{
                ...chipStyle,
                background: 'transparent',
                opacity: 0.7,
              }}
            >
              + Save current
            </button>
          )}
        </div>
      )}
    </div>
  )
}
