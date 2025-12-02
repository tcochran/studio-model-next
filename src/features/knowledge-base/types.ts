export type KBDocument = {
  id: string;
  title: string;
  content: string;
  portfolioCode: string;
  productCode: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type Product = {
  code: string;
  name: string;
};
