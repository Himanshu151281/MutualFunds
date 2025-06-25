import React from 'react';
import SearchWithSuggestions from '@/components/SearchWithSuggestions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const SearchDemo: React.FC = () => {
  const { toast } = useToast();

  const handleSearch = (query: string) => {
    toast({
      title: "Search Triggered",
      description: `Searching for: "${query}"`,
    });
  };

  const handleSuggestionSelect = (suggestion: any) => {
    toast({
      title: "Suggestion Selected",
      description: `Selected: ${suggestion.schemeName}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search with Suggestions Demo
          </h1>
          <p className="text-gray-600">
            Try typing at least 2 characters to see search suggestions
          </p>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Search with Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SearchWithSuggestions
                placeholder="Type 'HDFC' or 'SBI' to see suggestions..."
                onSearch={handleSearch}
                onSuggestionSelect={handleSuggestionSelect}
              />
              <p className="text-sm text-gray-600">
                Start typing to see live suggestions from mutual funds database
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search with Button</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SearchWithSuggestions
                placeholder="Search with search button..."
                onSearch={handleSearch}
                onSuggestionSelect={handleSuggestionSelect}
                showSearchButton={true}
              />
              <p className="text-sm text-gray-600">
                This version includes a search button for explicit searches
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">1.</span>
                  <span>Type at least 2 characters to trigger suggestions</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">2.</span>
                  <span>Suggestions are fetched from the MF API and filtered locally</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">3.</span>
                  <span>Click on a suggestion to select it</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">4.</span>
                  <span>Press Enter or click search button to search</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">5.</span>
                  <span>Use the X button to clear the search</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SearchDemo;
