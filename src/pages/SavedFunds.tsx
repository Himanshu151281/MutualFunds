import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { userApi } from '@/lib/api';
import { Trash2, Search, TrendingUp, Calendar, Building } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface SavedFund {
  _id: string;
  schemeCode: string;
  schemeName: string;
  fundHouse: string;
  category?: string;
  subCategory?: string;
  nav?: number;
  notes?: string;
  savedAt: string;
}

const SavedFunds: React.FC = () => {
  const [savedFunds, setSavedFunds] = useState<SavedFund[]>([]);
  const [filteredFunds, setFilteredFunds] = useState<SavedFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      // Show locally saved funds for non-logged users
      fetchLocalSavedFunds();
    } else {
      // Fetch from database for logged-in users
      fetchSavedFunds();
    }
  }, [user, navigate]);

  useEffect(() => {
    // Filter funds based on search term
    if (searchTerm.trim() === '') {
      setFilteredFunds(savedFunds);
    } else {
      const filtered = savedFunds.filter(fund =>
        fund.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fund.fundHouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fund.schemeCode.includes(searchTerm) ||
        (fund.category && fund.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredFunds(filtered);
    }
  }, [searchTerm, savedFunds]);
  const fetchSavedFunds = async () => {
    try {
      setLoading(true);
      const response = await userApi.getSavedFunds();
      setSavedFunds(response.savedFunds || []);
    } catch (error) {
      console.error('Error fetching saved funds:', error);
      toast({
        title: "Error",
        description: "Failed to fetch saved funds. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLocalSavedFunds = async () => {
    try {
      setLoading(true);
      const localSavedFunds = JSON.parse(localStorage.getItem('savedFunds') || '[]');
      
      if (localSavedFunds.length === 0) {
        setSavedFunds([]);
        setLoading(false);
        return;
      }

      // Fetch details for each locally saved fund
      const fundPromises = localSavedFunds.map(async (schemeCode: string) => {
        try {
          const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
          const data = await response.json();
          
          if (data.status === 'SUCCESS' && data.meta) {
            return {
              _id: schemeCode, // Use schemeCode as temporary ID
              schemeCode: data.meta.scheme_code,
              schemeName: data.meta.scheme_name,
              fundHouse: data.meta.fund_house,
              category: data.meta.scheme_category,
              nav: data.data?.[0] ? parseFloat(data.data[0].nav) : undefined,
              savedAt: new Date().toISOString(), // Placeholder date
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching fund ${schemeCode}:`, error);
          return null;
        }
      });

      const funds = await Promise.all(fundPromises);
      const validFunds = funds.filter((fund): fund is SavedFund => fund !== null);
      setSavedFunds(validFunds);
    } catch (error) {
      console.error('Error fetching local saved funds:', error);
      toast({
        title: "Error",
        description: "Failed to fetch saved funds from local storage.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleRemoveFund = async (schemeCode: string, schemeName: string) => {
    try {
      setRemoving(schemeCode);
      
      if (user) {
        // Remove from database for logged-in users
        await userApi.removeSavedFund(schemeCode);
      } else {
        // Remove from localStorage for non-logged-in users
        const localSavedFunds = JSON.parse(localStorage.getItem('savedFunds') || '[]');
        const updatedFunds = localSavedFunds.filter((code: string) => code !== schemeCode);
        localStorage.setItem('savedFunds', JSON.stringify(updatedFunds));
      }
      
      setSavedFunds(prev => prev.filter(fund => fund.schemeCode !== schemeCode));
      
      toast({
        title: "Success",
        description: `${schemeName} removed from saved funds`
      });
    } catch (error) {
      console.error('Error removing fund:', error);
      toast({
        title: "Error",
        description: "Failed to remove fund. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRemoving(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Funds</h1>
          <p className="text-gray-600">
            {user 
              ? "Manage your saved mutual funds and track your investment interests"
              : "Your locally saved funds. Login to sync across devices and access more features."
            }
          </p>
          {!user && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm">
                💡 <strong>Tip:</strong> Login or register to sync your saved funds across all your devices and never lose your list!
              </p>
              <div className="mt-2">
                <Button asChild size="sm" className="mr-2">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by fund name, house, code, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Saved</p>
                  <p className="text-2xl font-bold">{savedFunds.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Fund Houses</p>
                  <p className="text-2xl font-bold">
                    {new Set(savedFunds.map(fund => fund.fundHouse)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Latest Added</p>
                  <p className="text-sm font-medium">
                    {savedFunds.length > 0 
                      ? formatDate(savedFunds[savedFunds.length - 1].savedAt)
                      : 'None'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && savedFunds.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Saved Funds Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start exploring mutual funds and save the ones that interest you
              </p>
              <Button asChild>
                <Link to="/">Explore Funds</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No Search Results */}
        {!loading && savedFunds.length > 0 && filteredFunds.length === 0 && (
          <Card className="text-center py-8">
            <CardContent>
              <Search className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No funds found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms
              </p>
            </CardContent>
          </Card>
        )}

        {/* Funds Grid */}
        {!loading && filteredFunds.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFunds.map((fund) => (
              <Card key={fund._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-medium text-gray-900 line-clamp-2">
                        {fund.schemeName}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {fund.fundHouse}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFund(fund.schemeCode, fund.schemeName)}
                      disabled={removing === fund.schemeCode}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      {removing === fund.schemeCode ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Scheme Code */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Code:</span>
                      <Badge variant="outline" className="text-xs">
                        {fund.schemeCode}
                      </Badge>
                    </div>

                    {/* Category */}
                    {fund.category && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Category:</span>
                        <Badge variant="secondary" className="text-xs">
                          {fund.category}
                        </Badge>
                      </div>
                    )}

                    {/* NAV */}
                    {fund.nav && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">NAV:</span>
                        <span className="text-xs font-medium">₹{fund.nav.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Saved Date */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Saved:</span>
                      <span className="text-xs text-gray-700">
                        {formatDate(fund.savedAt)}
                      </span>
                    </div>

                    {/* Notes */}
                    {fund.notes && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          {fund.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        asChild
                        size="sm"
                        className="flex-1"
                      >
                        <Link to={`/fund/${fund.schemeCode}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Search Results Info */}
        {!loading && searchTerm && filteredFunds.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Showing {filteredFunds.length} of {savedFunds.length} saved funds
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedFunds;
