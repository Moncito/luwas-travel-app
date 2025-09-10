export type User = {
  id: string;
  name?: string;
  email: string;
  phoneNumber?: string;
  age?: number;
  gender?: "Male" | "Female" | "Other";
  address?: string;
  occupation?: string;
  incomeLevel?: "Low" | "Medium" | "High";
  createdAt?: string;
};
