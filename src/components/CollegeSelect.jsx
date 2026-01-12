import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Search, MapPin, ChevronDown, X, Check } from 'lucide-react'
import { kathmanduColleges, collegeAreas, collegeTypes, searchColleges } from '../data/kathmanduColleges'

/**
 * Reusable College Select Component with search, filter, and dropdown
 * 
 * @param {Object} props
 * @param {string} props.value - Selected college name
 * @param {function} props.onChange - Callback when college is selected (receives college name string)
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.label - Label text
 * @param {boolean} props.showLocation - Show location badge
 * @param {boolean} props.required - Is field required
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Disable the select
 * @param {string} props.error - Error message to display
 */
const CollegeSelect = ({
  value = '',
  onChange,
  placeholder = 'Select a college or university',
  label = 'College/University',
  showLocation = true,
  required = false,
  className = '',
  disabled = false,
  error = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Filter colleges based on search and filters
  const filteredColleges = searchColleges(searchQuery, {
    area: selectedArea,
    type: selectedType,
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) => 
          Math.min(prev + 1, filteredColleges.length - 1)
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredColleges[highlightedIndex]) {
          handleSelect(filteredColleges[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex]
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex, isOpen])

  // Reset highlighted index when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0)
  }, [searchQuery, selectedArea, selectedType])

  const handleSelect = (college) => {
    onChange(college.name)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
  }

  const selectedCollege = kathmanduColleges.find(c => c.name === value)

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          <GraduationCap size={16} className="inline mr-2" />
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        className={`
          w-full px-4 py-3 border rounded-lg cursor-pointer transition-all
          flex items-center justify-between gap-2
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-slate-50 hover:bg-white'}
          ${isOpen ? 'ring-2 ring-primary-500 border-transparent' : 'border-slate-200'}
          ${error ? 'border-red-500 ring-red-200' : ''}
        `}
      >
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {value ? (
            <>
              <span className="truncate text-slate-900">{value}</span>
              {showLocation && selectedCollege && (
                <span className="flex-shrink-0 text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full flex items-center gap-1">
                  <MapPin size={10} />
                  {selectedCollege.area}
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X size={16} className="text-slate-400" />
            </button>
          )}
          <ChevronDown 
            size={20} 
            className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search colleges..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Filters */}
            <div className="p-3 border-b border-slate-100 flex gap-2 flex-wrap">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
              >
                <option value="">All Areas</option>
                {collegeAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
              >
                <option value="">All Types</option>
                {collegeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {(selectedArea || selectedType) && (
                <button
                  type="button"
                  onClick={() => { setSelectedArea(''); setSelectedType(''); }}
                  className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Results Count */}
            <div className="px-3 py-2 text-xs text-slate-500 bg-slate-50 border-b border-slate-100">
              {filteredColleges.length} college{filteredColleges.length !== 1 ? 's' : ''} found
            </div>

            {/* College List */}
            <ul 
              ref={listRef}
              className="max-h-64 overflow-y-auto"
            >
              {filteredColleges.length > 0 ? (
                filteredColleges.map((college, index) => (
                  <li
                    key={college.id}
                    onClick={() => handleSelect(college)}
                    className={`
                      px-4 py-3 cursor-pointer transition-colors flex items-start gap-3
                      ${index === highlightedIndex ? 'bg-primary-50' : 'hover:bg-slate-50'}
                      ${value === college.name ? 'bg-primary-50' : ''}
                    `}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center mt-0.5">
                      <GraduationCap size={16} className="text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 truncate">{college.name}</span>
                        {value === college.name && (
                          <Check size={16} className="text-primary-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                        <MapPin size={12} />
                        <span>{college.location}</span>
                      </div>
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                          {college.type}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                          {college.area}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-8 text-center text-slate-500">
                  <GraduationCap size={32} className="mx-auto mb-2 text-slate-300" />
                  <p>No colleges found</p>
                  <p className="text-sm mt-1">Try a different search term or filter</p>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CollegeSelect
