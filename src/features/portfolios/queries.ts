import { cookiesClient } from "@/shared/utils/amplify-server-utils";
import type { Portfolio, Product } from "./types";

export async function listPortfolios(): Promise<{ portfolios: Portfolio[], error: string | null }> {
  try {
    const result = await cookiesClient.models.Portfolio.list();
    const portfolios = (result.data ?? []).map((p) => {
      let products: Product[] = [];
      if (p.products) {
        try {
          products = typeof p.products === "string" ? JSON.parse(p.products) : p.products;
        } catch {
          products = [];
        }
      }
      return {
        code: p.code,
        organizationName: p.organizationName,
        name: p.name,
        owners: (p.owners ?? []).filter((o): o is string => o !== null),
        products,
      };
    });
    return { portfolios, error: null };
  } catch (e) {
    console.error("Error fetching portfolios:", e);
    return {
      portfolios: [],
      error: e instanceof Error ? e.message : "Unknown error fetching portfolios"
    };
  }
}

export async function getPortfolio(code: string): Promise<{ portfolio: Portfolio | null, error: string | null }> {
  try {
    const result = await cookiesClient.models.Portfolio.get({ code });
    if (!result.data) {
      return { portfolio: null, error: "Portfolio not found" };
    }

    let products: Product[] = [];
    if (result.data.products) {
      try {
        products = typeof result.data.products === "string"
          ? JSON.parse(result.data.products)
          : result.data.products;
      } catch {
        products = [];
      }
    }

    const portfolio: Portfolio = {
      code: result.data.code,
      organizationName: result.data.organizationName,
      name: result.data.name,
      owners: (result.data.owners ?? []).filter((o): o is string => o !== null),
      products,
    };

    return { portfolio, error: null };
  } catch (e) {
    console.error("Error fetching portfolio:", e);
    return {
      portfolio: null,
      error: e instanceof Error ? e.message : "Failed to load portfolio"
    };
  }
}
