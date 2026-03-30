import { api, unwrap } from "./client";

export type Company = {
  id: string;
  name: string;
  industry: string;
  country: string;
  logo: string | null;
  is_deleted: boolean;
  created_at: string;
};

export type Contact = {
  id: string;
  company: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_deleted: boolean;
  created_at: string;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export const crmApi = {
  listCompanies: (params: { page?: number; search?: string; industry?: string } = {}) =>
    unwrap<Paginated<Company>>(api.get("/companies/", { params })),
  createCompany: (payload: { name: string; industry?: string; country?: string }) =>
    unwrap<Company>(api.post("/companies/", payload)),
  getCompany: (companyId: string) => unwrap<Company>(api.get(`/companies/${companyId}/`)),
  updateCompany: (
    companyId: string,
    payload: Partial<Pick<Company, "name" | "industry" | "country" | "is_deleted">>,
  ) => unwrap<Company>(api.patch(`/companies/${companyId}/`, payload)),
  deleteCompany: (companyId: string) =>
    unwrap<null>(api.delete(`/companies/${companyId}/`)),
  listCompanyContacts: (
    companyId: string,
    params: { page?: number; search?: string } = {},
  ) =>
    unwrap<Paginated<Contact>>(api.get(`/companies/${companyId}/contacts/`, { params })),
  createCompanyContact: (
    companyId: string,
    payload: { full_name: string; email: string; phone?: string; role?: string },
  ) => unwrap<Contact>(api.post(`/companies/${companyId}/contacts/`, payload)),
  getContact: (contactId: string) => unwrap<Contact>(api.get(`/contacts/${contactId}/`)),
  updateContact: (
    contactId: string,
    payload: Partial<
      Pick<Contact, "company" | "full_name" | "email" | "phone" | "role" | "is_deleted">
    >,
  ) => unwrap<Contact>(api.patch(`/contacts/${contactId}/`, payload)),
  deleteContact: (contactId: string) =>
    unwrap<null>(api.delete(`/contacts/${contactId}/`)),
};
