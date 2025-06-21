import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bookmark, BookmarkCheck, ArrowLeft, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { userApi } from '@/lib/api';

interface FundDetailData {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: string;
    scheme_name: string;
  };
  data: Array<{
    date: string;
    nav: string;
  }>;
  status: string;
}

const FundDetail: React.FC = () => {
  const { schemeCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [fundDetail, setFundDetail] = useState<FundDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  useEffect(() => {
    const fetchFundDetail = async () => {
      if (!schemeCode) return;
      
      try {
        const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
        const data = await response.json();
        setFundDetail(data);
      } catch (error) {
        console.error('Error fetching fund details:', error);
        toast({
          title: "Error",
          description: "Failed to fetch fund details.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };    // Check if fund is saved
    const checkIfSaved = async () => {
      if (!schemeCode) return;
      
      if (user) {
        // For logged-in users, check via API
        try {
          const response = await userApi.isFundSaved(schemeCode);
          setIsSaved(response.isSaved);
        } catch (error) {
          console.error('Error checking saved status:', error);
        }
      } else {
        // For non-logged-in users, check localStorage
        const savedFunds = JSON.parse(localStorage.getItem('savedFunds') || '[]');
        setIsSaved(savedFunds.includes(schemeCode));
      }
    };

    fetchFundDetail();
    checkIfSaved();
  }, [schemeCode, user, toast]);
  const toggleSave = async () => {
    if (!user) {
      // For non-logged-in users, use localStorage
      const savedFunds = JSON.parse(localStorage.getItem('savedFunds') || '[]');
      let updatedSavedFunds;

      if (isSaved) {
        updatedSavedFunds = savedFunds.filter((code: string) => code !== schemeCode);
        toast({
          title: "Removed",
          description: "Fund removed from saved list. Login to sync across devices."
        });
      } else {
        updatedSavedFunds = [...savedFunds, schemeCode];
        toast({
          title: "Saved",
          description: "Fund saved locally. Login to sync across devices."
        });
      }

      localStorage.setItem('savedFunds', JSON.stringify(updatedSavedFunds));
      setIsSaved(!isSaved);
      return;
    }

    // For logged-in users, use the backend API
    try {
      if (isSaved) {
        await userApi.removeSavedFund(schemeCode!);
        toast({
          title: "Removed",
          description: "Fund removed from saved list."
        });
      } else {
        if (!fundDetail?.meta) return;
        
        await userApi.saveFund({
          schemeCode: fundDetail.meta.scheme_code,
          schemeName: fundDetail.meta.scheme_name,
          fundHouse: fundDetail.meta.fund_house
        });
        toast({
          title: "Saved",
          description: "Fund added to saved list."
        });
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error toggling fund save status:', error);
      toast({
        title: "Error",
        description: "Failed to update saved status. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!fundDetail || fundDetail.status !== 'SUCCESS') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Fund Not Found</h2>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const latestNav = fundDetail.data[0];
  const monthAgoNav = fundDetail.data[30] || fundDetail.data[fundDetail.data.length - 1];
  const navChange = ((parseFloat(latestNav.nav) - parseFloat(monthAgoNav.nav)) / parseFloat(monthAgoNav.nav)) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Fund Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{fundDetail.meta.scheme_name}</CardTitle>
                    <p className="text-gray-600 mb-4">{fundDetail.meta.fund_house}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">{fundDetail.meta.scheme_type}</Badge>
                      <Badge variant="outline">{fundDetail.meta.scheme_category}</Badge>
                    </div>
                  </div>
                  <Button
                    onClick={toggleSave}
                    variant={isSaved ? "default" : "outline"}
                    className="flex items-center gap-2"
                  >
                    {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    {isSaved ? 'Saved' : 'Save Fund'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Current NAV</p>
                    <p className="text-3xl font-bold text-blue-600">₹{latestNav.nav}</p>
                    <p className="text-xs text-gray-500">as of {latestNav.date}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">1 Month Return</p>
                    <div className="flex items-center justify-center">
                      <TrendingUp className={`h-5 w-5 mr-1 ${navChange >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                      <p className={`text-2xl font-bold ${navChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {navChange >= 0 ? '+' : ''}{navChange.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Scheme Code</p>
                    <p className="text-2xl font-bold text-gray-800">{fundDetail.meta.scheme_code}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* NAV History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent NAV History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {fundDetail.data.slice(0, 10).map((entry, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm text-gray-600">{entry.date}</span>
                      <span className="font-semibold">₹{entry.nav}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundDetail;
