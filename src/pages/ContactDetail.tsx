import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Spinner } from "../components/Spinner";
import type { Contact } from "../api/crm";
import { crmApi } from "../api/crm";

type Draft = {
  full_name: string;
  email: string;
  phone: string;
  role: string;
};

export function ContactDetailPage() {
  const { contactId } = useParams();
  if (!contactId) throw new Error("Missing contactId");
  const contactIdValue = contactId as string;

  const navigate = useNavigate();

  const [contact, setContact] = useState<Contact | null>(null);
  const [draft, setDraft] = useState<Draft>({
    full_name: "",
    email: "",
    phone: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const c = await crmApi.getContact(contactIdValue);
      setContact(c);
      setDraft({
        full_name: c.full_name ?? "",
        email: c.email ?? "",
        phone: c.phone ?? "",
        role: c.role ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contact");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  async function onSave(e: FormEvent) {
    e.preventDefault();

    setMutating(true);
    setError(null);
    try {
      const updated = await crmApi.updateContact(contactIdValue, {
        full_name: draft.full_name,
        email: draft.email,
        phone: draft.phone,
        role: draft.role,
      });
      setContact(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save contact");
    } finally {
      setMutating(false);
    }
  }

  async function onDelete() {
    const ok = window.confirm("Delete this contact? (soft delete)");
    if (!ok) return;

    setMutating(true);
    setError(null);
    try {
      await crmApi.deleteContact(contactIdValue);
      if (contact?.company) {
        navigate(`/companies/${contact.company}`, { replace: true });
      } else {
        navigate("/companies", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete contact");
    } finally {
      setMutating(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 520 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>Contact</h2>
        <Link to={contact?.company ? `/companies/${contact.company}` : "/companies"}>
          Back
        </Link>
      </div>

      {error ? <div style={{ color: "crimson" }}>{error}</div> : null}
      {loading || mutating ? <Spinner /> : null}

      <div style={{ color: "#666" }}>{contactId}</div>

      <form onSubmit={onSave} style={{ display: "grid", gap: 8 }}>
        <label>
          Full name
          <input
            required
            value={draft.full_name}
            onChange={(e) => setDraft((d) => ({ ...d, full_name: e.target.value }))}
          />
        </label>
        <label>
          Email
          <input
            required
            type="email"
            value={draft.email}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
          />
        </label>
        <label>
          Phone
          <input
            value={draft.phone}
            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
          />
        </label>
        <label>
          Role
          <input
            value={draft.role}
            onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
          />
        </label>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="submit" disabled={mutating}>
            Save
          </button>
          <button type="button" disabled={mutating} onClick={onDelete}>
            Delete
          </button>
          <button type="button" disabled={mutating} onClick={load}>
            Reload
          </button>
        </div>
      </form>
    </div>
  );
}
