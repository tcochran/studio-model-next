import { cookiesClient } from "@/shared/utils/amplify-server-utils";
import type { Idea } from "./types";

export async function listIdeas(
  portfolioCode: string,
  productCode: string
): Promise<{ ideas: Idea[]; error: string | null }> {
  try {
    const result = await cookiesClient.models.Idea.list({
      filter: {
        portfolioCode: { eq: portfolioCode },
        productCode: { eq: productCode },
      },
    });

    const ideas = (result.data || []) as Idea[];
    return { ideas, error: null };
  } catch (e) {
    console.error("Error fetching ideas:", e);
    return {
      ideas: [],
      error: e instanceof Error ? e.message : "Unknown error fetching ideas",
    };
  }
}

export async function getIdea(
  portfolioCode: string,
  productCode: string,
  ideaNumber: number
): Promise<{ idea: Idea | null; error: string | null }> {
  try {
    const result = await cookiesClient.models.Idea.list({
      filter: {
        portfolioCode: { eq: portfolioCode },
        productCode: { eq: productCode },
        ideaNumber: { eq: ideaNumber },
      },
    });

    if (!result.data || result.data.length === 0) {
      return { idea: null, error: "Idea not found" };
    }

    const idea = result.data[0] as Idea;
    return { idea, error: null };
  } catch (e) {
    console.error("Error fetching idea:", e);
    return {
      idea: null,
      error: e instanceof Error ? e.message : "Failed to load idea",
    };
  }
}
