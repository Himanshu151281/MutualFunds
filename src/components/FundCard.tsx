
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface FundData {
  schemeCode: string;
  schemeName: string;
  nav: string;
  date: string;
}

interface FundCardProps {
  fund: FundData;
  onClick: () => void;
}

const FundCard: React.FC<FundCardProps> = ({ fund, onClick }) => {
  const isPositive = Math.random() > 0.5; // Simulate positive/negative performance

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2">
          {fund.schemeName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">₹{fund.nav}</p>
            <p className="text-sm text-gray-500">NAV as of {fund.date}</p>
          </div>
          <div className="text-right">
            <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              <span className="font-semibold">
                {isPositive ? '+' : '-'}{(Math.random() * 5).toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-gray-500">1Y Return</p>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-4" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default FundCard;
