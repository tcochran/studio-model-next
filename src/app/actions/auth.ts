'use server';

import { redirect } from 'next/navigation';
import { createSession, destroySession } from '@/studio/utils/session';
import { cookiesClient } from '@/shared/utils/amplify-server-utils';

export async function handleLogout() {
  await destroySession();
  redirect('/login');
}

export async function handleLogin(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  // Verify user exists in a studio
  const result = await cookiesClient.models.StudioUser.list({
    filter: { email: { eq: normalizedEmail } },
  });

  if (!result.data || result.data.length === 0) {
    throw new Error('No studio found for this email');
  }

  // User exists in at least one studio, create session
  await createSession(normalizedEmail);

  // Get the user's studio and portfolio
  const studioUser = result.data[0];
  const studioResult = await cookiesClient.models.Studio.get({ id: studioUser.studioId });

  if (studioResult.data?.portfolioId) {
    const portfolioResult = await cookiesClient.models.Portfolio.get({
      code: studioResult.data.portfolioId
    });

    if (portfolioResult.data) {
      // Get first product if it exists
      const products = portfolioResult.data.products
        ? (typeof portfolioResult.data.products === 'string'
          ? JSON.parse(portfolioResult.data.products)
          : portfolioResult.data.products)
        : [];

      if (products.length > 0) {
        redirect(`/${portfolioResult.data.code}/${products[0].code}/ideas`);
      }
    }
  }

  // Fallback to portfolios page
  redirect('/portfolios');
}
