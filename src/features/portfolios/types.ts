export type Product = {
  code: string;
  name: string;
};

export type Portfolio = {
  code: string;
  organizationName: string;
  name: string;
  owners: string[];
  products: Product[];
};
