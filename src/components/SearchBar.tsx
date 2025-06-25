
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Building, TrendingUp } from 'lucide-react';

interface FundSuggestion {
  schemeCode: string;
  schemeName: string;
  fundHouse?: string;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: FundSuggestion) => {
    setQuery(suggestion.schemeName);
    setShowSuggestions(false);
    onSearch(suggestion.schemeName);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl mx-auto relative">
      <div className="flex-1 relative">
        <Popover open={showSuggestions && suggestions.length > 0} onOpenChange={setShowSuggestions}>
          <PopoverTrigger asChild>
            <Input
              type="text"
              placeholder="Search mutual funds..."
              value={query}
              onChange={handleInputChange}
              className="h-12 text-lg text-black"
              autoComplete="off"
            />
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
      <Button
        type="submit"
        size="lg"
        disabled={loading || !query.trim()}
        className="h-12 px-8"
      >
        <Search className="h-5 w-5 mr-2" />
        Search
      </Button>
    </form>
  );
};

export default SearchBar;
