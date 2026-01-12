import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Clock, X, ArrowRight } from 'lucide-react'
import api from '../api/axios'

const SearchSuggestions = ({ 
  value = '', 
  onChange, 
  onSelect, 
  placeholder = 'Search properties by name, location...',
  className = '',
  disableHistory = false
}) => {
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const debounceTimerRef = useRef(null)

  // Load recent searches from localStorage (only if history is enabled)
  useEffect(() => {
    if (!disableHistory) {
      const recent = localStorage.getItem('recentSearches')
      if (recent) {
        setRecentSearches(JSON.parse(recent))
      }
    }
  }, [disableHistory])

  // Handle selection - defined early so it can be used in handleKeyDown
  const handleSelect = useCallback((selectedItem) => {
    console.log('[SearchSuggestions] handleSelect called with:', selectedItem, 'type:', typeof selectedItem)
    
    // Save search text for recent searches (only if history is enabled)
    const searchText = typeof selectedItem === 'string' 
      ? selectedItem 
      : selectedItem?.title || selectedItem?.location || 'Search'
    
    console.log('[SearchSuggestions] Extracted search text:', searchText, 'length:', searchText.length)
    
    if (!disableHistory) {
      const updated = [searchText, ...recentSearches.filter(s => s !== searchText)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    }

    // Callback with full data
    console.log('[SearchSuggestions] Calling onSelect with:', selectedItem)
    onSelect?.(selectedItem)
    
    // Keep the search text in input, just close dropdown
    setIsOpen(false)
    setSelectedIndex(-1)
  }, [disableHistory, recentSearches, onSelect])

  // Fetch suggestions with debouncing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // If input is empty, don't fetch suggestions
    if (value.trim().length === 0) {
      setSuggestions([])
      return
    }

    // If input too short, don't fetch
    if (value.trim().length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await api.get(`/listings/suggest?q=${encodeURIComponent(value)}`)
        console.log('[SearchSuggestions] Response status:', response.status)
        
        if (response.status === 200 && response.data) {
          const data = response.data
          console.log('[SearchSuggestions] API Response received:', data)
          console.log('[SearchSuggestions] Suggestions count:', Array.isArray(data) ? data.length : 0)
          setSuggestions(Array.isArray(data) ? data.slice(0, 8) : [])
          setIsOpen(true)
          setSelectedIndex(-1)
        } else {
          console.error('[SearchSuggestions] Unexpected response:', response)
          setSuggestions([])
          setIsOpen(true)
        }
      } catch (error) {
        console.error('[SearchSuggestions] Fetch Error:', error)
        setSuggestions([])
        setIsOpen(true)
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce for suggestions
  }, [value])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    const itemCount = suggestions.length + recentSearches.length

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % itemCount)
        setIsOpen(true)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + itemCount) % itemCount)
        break
      case 'Enter':
        e.preventDefault()
        
        // Clear any pending debounce timers to prevent race conditions
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
        
        // Get the actual current value from the input element (most reliable)
        const currentValue = inputRef.current?.value || value
        
        console.log('[SearchSuggestions] Enter pressed - currentValue:', currentValue, 'length:', currentValue.length)
        
        // PRIORITY: If user typed text, always use the typed text (not dropdown selection)
        if (currentValue.trim().length > 0) {
          // User has typed text - use it regardless of dropdown selection
          console.log('[SearchSuggestions] Enter with typed text:', currentValue.trim())
          handleSelect(currentValue.trim())
        } else if (selectedIndex >= 0) {
          // User selected an item from dropdown without typing
          const selectedItem = selectedIndex < suggestions.length
            ? suggestions[selectedIndex]
            : recentSearches[selectedIndex - suggestions.length]
          
          if (selectedItem) {
            // Pass full listing object or search text
            console.log('[SearchSuggestions] Enter with dropdown selection:', selectedItem)
            handleSelect(selectedItem)
          }
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
      default:
        break
    }
  }, [suggestions, recentSearches, selectedIndex, value, handleSelect])

  const clearRecentSearch = (text) => {
    if (!disableHistory) {
      const updated = recentSearches.filter(s => s !== text)
      setRecentSearches(updated)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    }
  }

  const displaySuggestions = value.trim().length >= 2 ? suggestions : []
  const displayRecent = value.trim().length === 0 ? recentSearches : []
  const showDropdown = isOpen && (displaySuggestions.length > 0 || displayRecent.length > 0 || (loading && value.trim().length >= 2))

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input with Search Button */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            const newValue = e.target.value
            console.log('[SearchSuggestions] onChange input:', newValue)
            onChange?.(newValue)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all"
        />
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              onClick={() => {
                console.log('[SearchSuggestions] Clear button clicked')
                onChange?.('')
                inputRef.current?.focus()
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
          {value && (
            <button
              onClick={() => {
                console.log('[SearchSuggestions] Search button clicked with text:', value)
                handleSelect(value.trim())
              }}
              className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
              title="Search"
            >
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          >
            {loading && displaySuggestions.length === 0 ? (
              <div className="p-4 text-center">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                </div>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {/* Suggestions */}
                {displaySuggestions.length > 0 && (
                  <div>
                    {displaySuggestions.map((suggestion, index) => {
                      const isSelected = selectedIndex === index
                      return (
                        <motion.button
                          key={index}
                          onClick={() => handleSelect(suggestion)}
                          className={`w-full px-3 py-2 text-left text-sm flex items-center gap-3 transition-colors border-b border-gray-100 ${
                            isSelected ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          whileHover={{ backgroundColor: 'rgb(243, 244, 246)' }}
                        >
                          {/* Property Image */}
                          {suggestion.images && suggestion.images.length > 0 ? (
                            <img
                              src={
                                suggestion.images[0].startsWith('http') 
                                  ? suggestion.images[0] 
                                  : `http://localhost:5000${suggestion.images[0]}`
                              }
                              alt={suggestion.title}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = 'https://images.unsplash.com/photo-1570129477488-c70a256a7356?q=80&w=100&h=100&auto=format&fit=crop'
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <MapPin size={24} className="text-gray-400" />
                            </div>
                          )}
                          
                          {/* Property Details */}
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium text-gray-900">{suggestion.title}</p>
                            <div className="flex gap-2 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin size={12} />
                                {suggestion.location}
                              </span>
                              {suggestion.price && (
                                <span className="font-semibold text-primary-600">
                                  Rs. {suggestion.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {(suggestion.bedrooms || suggestion.bathrooms) && (
                              <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                {suggestion.bedrooms && <span>{suggestion.bedrooms} bed</span>}
                                {suggestion.bathrooms && <span>{suggestion.bathrooms} bath</span>}
                                {suggestion.type && <span className="capitalize">{suggestion.type}</span>}
                              </div>
                            )}
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                )}

                {/* Recent Searches */}
                {displayRecent.length > 0 && (
                  <div>
                    {displaySuggestions.length > 0 && (
                      <div className="border-t border-gray-200"></div>
                    )}
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Previous Searches
                    </div>
                    {displayRecent.map((search, index) => {
                      const isSelected = selectedIndex === suggestions.length + index
                      return (
                        <motion.div
                          key={index}
                          className={`px-4 py-2.5 text-left text-sm flex items-center justify-between group transition-colors ${
                            isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'
                          }`}
                          onMouseMove={() => setSelectedIndex(suggestions.length + index)}
                          whileHover={{ backgroundColor: 'rgb(243, 244, 246)' }}
                        >
                          <button
                            onClick={() => handleSelect(search)}
                            className="flex-1 flex items-center gap-3 text-gray-700 text-left"
                          >
                            <Clock size={14} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{search}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              clearRecentSearch(search)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                          >
                            <X size={14} className="text-gray-500" />
                          </button>
                        </motion.div>
                      )
                    })}
                  </div>
                )}

                {displaySuggestions.length === 0 && displayRecent.length === 0 && !loading && (
                  <div className="p-6 text-center">
                    <p className="text-gray-500 text-sm">No suggestions found</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchSuggestions
