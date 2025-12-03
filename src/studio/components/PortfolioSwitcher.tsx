'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Schema } from '@/amplify/data/resource';

type Portfolio = Schema['Portfolio']['type'];

interface PortfolioSwitcherProps {
  currentPortfolio: Portfolio;
}

export default function PortfolioSwitcher({ currentPortfolio }: PortfolioSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handlePortfolioChange = (portfolioCode: string) => {
    setIsOpen(false);
    // Navigate to the portfolios page which will show the selected portfolio
    router.push(`/portfolios`);
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded bg-white hover:bg-gray-50"
      >
        <span>{currentPortfolio.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                Current Portfolio
              </div>
              <div className="px-4 py-2 text-sm text-gray-900 bg-gray-50">
                {currentPortfolio.name}
              </div>
              <div className="border-t border-gray-200 my-1" />
              <button
                onClick={() => handlePortfolioChange('portfolios')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                View All Portfolios
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
