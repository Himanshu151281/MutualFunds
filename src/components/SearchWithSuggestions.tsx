import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Building, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FundSuggestion {
  schemeCode: string;
  schemeName: string;
  fundHouse?: string;
}

interface SearchWithSuggestionsProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onSuggestionSelect?: (suggestion: FundSuggestion) => void;
  value?: string;
  onChange?: (value: string) => void;
  showSearchButton?: boolean;
  className?: string;
  disabled?: boolean;
}

const SearchWithSuggestions: React.FC<SearchWithSuggestionsProps> = ({
  placeholder = "Search mutual funds...",
  onSearch,
  onSuggestionSelect,
  value,
  onChange,
  showSearchButton = false,
  className = "",
  disabled = false
}) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState<FundSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [allFunds, setAllFunds] = useState<FundSuggestion[]>([]);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load all funds on component mount for suggestions
  useEffect(() => {
    const loadAllFunds = async () => {
      try {
        const response = await fetch('https://api.mfapi.in/mf');
        const funds = await response.json();
        setAllFunds(funds.map((fund: any) => ({
          schemeCode: fund.schemeCode,
          schemeName: fund.schemeName,
          fundHouse: fund.fundHouse || ''
        })));
      } catch (error) {
        console.error('Error loading funds for suggestions:', error);
      }
    };

    loadAllFunds();
  }, []);

  // Sync with external value changes
  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  // Debounced search for suggestions
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        searchSuggestions(query.trim());
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, allFunds]);

  const searchSuggestions = async (searchQuery: string) => {
    if (allFunds.length === 0) return;

    setLoadingSuggestions(true);
    
    try {
      const filtered = allFunds
        .filter(fund => 
          fund.schemeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (fund.fundHouse && fund.fundHouse.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 8); // Limit to 8 suggestions
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } catch (error) {
      console.error('Error filtering suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
    
    if (newValue.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionSelect = (suggestion: FundSuggestion) => {
    setQuery(suggestion.schemeName);
    setShowSuggestions(false);
    onChange?.(suggestion.schemeName);
    onSuggestionSelect?.(suggestion);
  };

  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    onChange?.('');
    setShowSuggestions(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Popover open={showSuggestions && suggestions.length > 0} onOpenChange={setShowSuggestions}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="pr-20"
              autoComplete="off"
              disabled={disabled}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {showSearchButton && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSearch}
                  disabled={!query.trim()}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandList>
              {loadingSuggestions ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading suggestions...
                </div>
              ) : suggestions.length === 0 ? (
                <CommandEmpty>No suggestions found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.schemeCode}
                      onSelect={() => handleSuggestionSelect(suggestion)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-start gap-3 w-full">
                        <TrendingUp className="h-4 w-4 mt-1 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {suggestion.schemeName}
                          </div>
                          {suggestion.fundHouse && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Building className="h-3 w-3" />
                              {suggestion.fundHouse}
                            </div>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchWithSuggestions;
