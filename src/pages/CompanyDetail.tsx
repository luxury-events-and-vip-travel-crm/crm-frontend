import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Pagination } from "../components/Pagination";
import { Spinner } from "../components/Spinner";
import type { Company, Contact } from "../api/crm";
import { crmApi } from "../api/crm";

type EditContactDraft = {
  full_name: string;
  email: string;
  phone: string;
  role: string;
};

export function CompanyDetailPage() {
  const { companyId } = useParams();
  if (!companyId) throw new Error("Missing companyId");
  const companyIdValue = companyId as string;

  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [companyDraft, setCompanyDraft] = useState({
    name: "",
    industry: "",
    country: "",
  });

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [contactPage, setContactPage] = useState(1);
  const [contactCount, setContactCount] = useState(0);

  const [loadingCompany, setLoadingCompany] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newContact, setNewContact] = useState<EditContactDraft>({
    full_name: "",
    email: "",
    phone: "",
    role: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<EditContactDraft | null>(null);

  const canSaveCompany = companyDraft.name.trim().length > 0;

  async function loadCompany() {
    setLoadingCompany(true);
    setError(null);
    try {
      const c = await crmApi.getCompany(companyIdValue);
      setCompany(c);
      setCompanyDraft({
        name: c.name ?? "",
        industry: c.industry ?? "",
        country: c.country ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load company");
    } finally {
      setLoadingCompany(false);
    }
  }

  async function loadContacts() {
    setLoadingContacts(true);
    setError(null);
    try {
      const data = await crmApi.listCompanyContacts(companyIdValue, {
        page: contactPage,
        search: contactSearch || undefined,
      });
      setContacts(data.results);
      setContactCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contacts");
    } finally {
      setLoadingContacts(false);
    }
  }

  useEffect(() => {
    void loadCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    void loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactPage]);

  async function onContactsFilterSubmit(e: FormEvent) {
    e.preventDefault();
    if (contactPage === 1) {
      await loadContacts();
      return;
    }
    setContactPage(1);
  }

  async function onUpdateCompany(e: FormEvent) {
    e.preventDefault();
    if (!canSaveCompany) return;

    setMutating(true);
    setError(null);
    try {
      const updated = await crmApi.updateCompany(companyIdValue, {
        name: companyDraft.name,
        industry: companyDraft.industry,
        country: companyDraft.country,
      });
      setCompany(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update company");
    } finally {
      setMutating(false);
    }
  }

  async function onDeleteCompany() {
    const ok = window.confirm("Delete this company? (soft delete)");
    if (!ok) return;

    setMutating(true);
    setError(null);
    try {
      await crmApi.deleteCompany(companyIdValue);
      navigate("/companies", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete company");
    } finally {
      setMutating(false);
    }
  }

  async function onCreateContact(e: FormEvent) {
    e.preventDefault();

    setMutating(true);
    setError(null);
    try {
      await crmApi.createCompanyContact(companyIdValue, {
        full_name: newContact.full_name,
        email: newContact.email,
        phone: newContact.phone || undefined,
        role: newContact.role || undefined,
      });
      setNewContact({ full_name: "", email: "", phone: "", role: "" });
      if (contactPage === 1) {
        await loadContacts();
      } else {
        setContactPage(1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contact");
    } finally {
      setMutating(false);
    }
  }

  const startEdit = (c: Contact) => {
    setEditingId(c.id);
    setEditingDraft({
      full_name: c.full_name ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      role: c.role ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingDraft(null);
  };

  async function onSaveEdit(contactId: string) {
    if (!editingDraft) return;

    setMutating(true);
    setError(null);
    try {
      await crmApi.updateContact(contactId, {
        full_name: editingDraft.full_name,
        email: editingDraft.email,
        phone: editingDraft.phone,
        role: editingDraft.role,
      });
      cancelEdit();
      await loadContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update contact");
    } finally {
      setMutating(false);
    }
  }

  async function onDeleteContact(contactId: string) {
    const ok = window.confirm("Delete this contact? (soft delete)");
    if (!ok) return;

    setMutating(true);
    setError(null);
    try {
      await crmApi.deleteContact(contactId);
      await loadContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete contact");
    } finally {
      setMutating(false);
    }
  }

  const showSpinner = loadingCompany || loadingContacts || mutating;

  const title = useMemo(() => {
    if (company?.name) return company.name;
    return "Company";
  }, [company?.name]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <div style={{ color: "#666" }}>{companyId}</div>
        </div>
        <Link to="/companies">Back to companies</Link>
      </div>

      {error ? <div style={{ color: "crimson" }}>{error}</div> : null}
      {showSpinner ? <Spinner /> : null}

      <section style={{ border: "1px solid #eee", padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Company details</h3>
        <form
          onSubmit={onUpdateCompany}
          style={{ display: "grid", gap: 8, maxWidth: 520 }}
        >
          <label>
            Name
            <input
              required
              value={companyDraft.name}
              onChange={(e) => setCompanyDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </label>
          <label>
            Industry
            <input
              value={companyDraft.industry}
              onChange={(e) =>
                setCompanyDraft((d) => ({ ...d, industry: e.target.value }))
              }
            />
          </label>
          <label>
            Country
            <input
              value={companyDraft.country}
              onChange={(e) =>
                setCompanyDraft((d) => ({ ...d, country: e.target.value }))
              }
            />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={!canSaveCompany || mutating}>
              Save
            </button>
            <button type="button" onClick={onDeleteCompany} disabled={mutating}>
              Delete
            </button>
            <button type="button" onClick={loadCompany} disabled={mutating}>
              Reload
            </button>
          </div>
        </form>
      </section>

      <section style={{ border: "1px solid #eee", padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Contacts</h3>

        <form
          onSubmit={onContactsFilterSubmit}
          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
        >
          <input
            placeholder="search name/email"
            value={contactSearch}
            onChange={(e) => setContactSearch(e.target.value)}
          />
          <button type="submit" disabled={mutating}>
            Apply
          </button>
        </form>

        <div style={{ marginTop: 12 }}>
          <h4 style={{ margin: 0, marginBottom: 8 }}>Add contact</h4>
          <form
            onSubmit={onCreateContact}
            style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
          >
            <input
              required
              placeholder="full name"
              value={newContact.full_name}
              onChange={(e) =>
                setNewContact((d) => ({ ...d, full_name: e.target.value }))
              }
            />
            <input
              required
              type="email"
              placeholder="email"
              value={newContact.email}
              onChange={(e) => setNewContact((d) => ({ ...d, email: e.target.value }))}
            />
            <input
              placeholder="phone"
              value={newContact.phone}
              onChange={(e) => setNewContact((d) => ({ ...d, phone: e.target.value }))}
            />
            <input
              placeholder="role"
              value={newContact.role}
              onChange={(e) => setNewContact((d) => ({ ...d, role: e.target.value }))}
            />
            <button type="submit" disabled={mutating}>
              Add
            </button>
          </form>
        </div>

        <table
          width="100%"
          cellPadding={6}
          style={{ borderCollapse: "collapse", marginTop: 12 }}
        >
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => {
              const isEditing = editingId === c.id;
              const draft = isEditing ? editingDraft : null;

              return (
                <tr key={c.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td>
                    {isEditing ? (
                      <input
                        value={draft?.full_name ?? ""}
                        onChange={(e) =>
                          setEditingDraft((d) =>
                            d ? { ...d, full_name: e.target.value } : d,
                          )
                        }
                      />
                    ) : (
                      <Link to={`/contacts/${c.id}`}>{c.full_name}</Link>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="email"
                        value={draft?.email ?? ""}
                        onChange={(e) =>
                          setEditingDraft((d) =>
                            d ? { ...d, email: e.target.value } : d,
                          )
                        }
                      />
                    ) : (
                      c.email
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        value={draft?.phone ?? ""}
                        onChange={(e) =>
                          setEditingDraft((d) =>
                            d ? { ...d, phone: e.target.value } : d,
                          )
                        }
                      />
                    ) : (
                      c.phone
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        value={draft?.role ?? ""}
                        onChange={(e) =>
                          setEditingDraft((d) => (d ? { ...d, role: e.target.value } : d))
                        }
                      />
                    ) : (
                      c.role
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          disabled={mutating}
                          onClick={() => onSaveEdit(c.id)}
                        >
                          Save
                        </button>
                        <button type="button" disabled={mutating} onClick={cancelEdit}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          disabled={mutating}
                          onClick={() => startEdit(c)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={mutating}
                          onClick={() => onDeleteContact(c.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ marginTop: 12 }}>
          <Pagination
            page={contactPage}
            totalCount={contactCount}
            onPageChange={(p) => setContactPage(p)}
          />
        </div>
      </section>
    </div>
  );
}
