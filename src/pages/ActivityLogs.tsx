import { FormEvent, useEffect, useState } from "react";

import { Pagination } from "../components/Pagination";
import { Spinner } from "../components/Spinner";
import { ActivityLog, activityApi } from "../api/activity";

export function ActivityLogsPage() {
  const [items, setItems] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(pageValue = page) {
    setLoading(true);
    setError(null);
    try {
      const data = await activityApi.list({
        page: pageValue,
        search: search || undefined,
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

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2>Activity Logs</h2>
      <form
        onSubmit={onFilterSubmit}
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <input
          placeholder="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Apply</button>
      </form>

      {error ? <div style={{ color: "crimson" }}>{error}</div> : null}
      {loading ? <Spinner /> : null}

      <table width="100%" cellPadding={6} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
            <th>Time</th>
            <th>User</th>
            <th>Action</th>
            <th>Model</th>
            <th>Object</th>
          </tr>
        </thead>
        <tbody>
          {items.map((l) => (
            <tr key={l.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td>{new Date(l.timestamp).toLocaleString()}</td>
              <td>{l.user_username ?? "(system)"}</td>
              <td>{l.action}</td>
              <td>{l.model_name}</td>
              <td>{l.object_id}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination page={page} totalCount={count} onPageChange={setPage} />
    </div>
  );
}
