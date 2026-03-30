import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Pagination } from "../components/Pagination";
import { Spinner } from "../components/Spinner";
import { Company, crmApi } from "../api/crm";

export function CompaniesPage() {
  const [items, setItems] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [newName, setNewName] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load(pageValue = page) {
    setLoading(true);
    setError(null);
    try {
      const data = await crmApi.listCompanies({
        page: pageValue,
        search: search || undefined,
        industry: industry || undefined,
      });
      setItems(data.results);
      setCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function onFilterSubmit(e: FormEvent) {
    e.preventDefault();
    if (page === 1) {
      await load(1);
      return;
    }
    setPage(1);
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await crmApi.createCompany({
        name: newName,
        industry: newIndustry || undefined,
        country: newCountry || undefined,
      });
      setNewName("");
      setNewIndustry("");
      setNewCountry("");
      if (page === 1) {
        await load(1);
      } else {
        setPage(1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h2>Companies</h2>
        <form
          onSubmit={onFilterSubmit}
          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
        >
          <input
            placeholder="search name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            placeholder="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
          <button type="submit">Apply</button>
        </form>
      </div>

      <div>
        <h3>Create company</h3>
        <form onSubmit={onCreate} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            required
            placeholder="name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            placeholder="industry"
            value={newIndustry}
            onChange={(e) => setNewIndustry(e.target.value)}
          />
          <input
            placeholder="country"
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
          />
          <button type="submit">Create</button>
        </form>
      </div>

      {error ? <div style={{ color: "crimson" }}>{error}</div> : null}
      {loading ? <Spinner /> : null}

      <table width="100%" cellPadding={6} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
            <th>Name</th>
            <th>Industry</th>
            <th>Country</th>
            <th>Contacts</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td>
                <Link to={`/companies/${c.id}`}>{c.name}</Link>
              </td>
              <td>{c.industry}</td>
              <td>{c.country}</td>
              <td>
                <Link to={`/companies/${c.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination page={page} totalCount={count} onPageChange={setPage} />
    </div>
  );
}
