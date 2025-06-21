
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl mx-auto">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Search mutual funds..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 text-lg text-black"
        />
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
