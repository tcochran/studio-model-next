import Link from 'next/link';
import { getSession } from '@/studio/utils/session';
import { cookiesClient } from '@/shared/utils/amplify-server-utils';
import PortfolioSwitcher from './PortfolioSwitcher';

export default async function StudioHeader() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  // Get user's studio
  const studioUserResult = await cookiesClient.models.StudioUser.list({
    filter: { email: { eq: session.email } },
  });

  const studioUser = studioUserResult.data?.[0];

  if (!studioUser) {
    return null;
  }

  // Get studio details
  const studioResult = await cookiesClient.models.Studio.get({
    id: studioUser.studioId,
  });

  const studio = studioResult.data;

  if (!studio) {
    return null;
  }

  // Get portfolio
  const portfolioResult = await cookiesClient.models.Portfolio.get({
    code: studio.portfolioId,
  });

  const portfolio = portfolioResult.data;

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/portfolios" className="text-xl font-bold text-gray-900 hover:text-gray-700">
          Studio Model
        </Link>

        {/* Right: Portfolio, Studio, User */}
        <div className="flex items-center gap-6">
          {portfolio && (
            <PortfolioSwitcher
              currentPortfolio={portfolio}
            />
          )}
          <span className="text-gray-600 text-sm">{studio.name}</span>
          <span className="text-gray-600 text-sm">{session.email}</span>
        </div>
      </div>
    </header>
  );
}
