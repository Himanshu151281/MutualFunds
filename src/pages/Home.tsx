
import React, { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import FundCard from '@/components/FundCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface FundData {
  schemeCode: string;
  schemeName: string;
  nav: string;
  date: string;
}

const Home: React.FC = () => {
  const [funds, setFunds] = useState<FundData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const searchFunds = async (query: string) => {
    setLoading(true);
    setSearched(true);
    
    try {
      const response = await fetch('https://api.mfapi.in/mf');
      const allFunds = await response.json();
      
      // Filter funds based on search query
      const filteredFunds = allFunds.filter((fund: FundData) =>
        fund.schemeName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20); // Limit to 20 results
      
      setFunds(filteredFunds);
    } catch (error) {
      console.error('Error fetching funds:', error);
      toast({
        title: "Error",
        description: "Failed to fetch mutual funds. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFundClick = (fund: FundData) => {
    navigate(`/fund/${fund.schemeCode}`, { state: { fund } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Find Your Perfect Mutual Fund</h1>
          <p className="text-xl mb-8 text-blue-100">
            Search, analyze, and save mutual funds that match your investment goals
          </p>
          <SearchBar onSearch={searchFunds} loading={loading} />
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        {loading && <LoadingSpinner />}
        
        {!loading && searched && funds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No mutual funds found. Try a different search term.</p>
          </div>
        )}
        
        {!loading && funds.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Search Results ({funds.length} funds found)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {funds.map((fund) => (
                <FundCard
                  key={fund.schemeCode}
                  fund={fund}
                  onClick={() => handleFundClick(fund)}
                />
              ))}
            </div>
          </>
        )}
        
        {!searched && !loading && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Start Your Investment Journey</h2>
            <p className="text-lg text-gray-600">Search for mutual funds using the search bar above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
