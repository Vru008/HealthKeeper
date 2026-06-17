import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../api";
import { useCatalog } from "../../context/CatalogContext";
import { useToast } from "../../context/ToastContext";

const STATUS_LABEL = { unread: "Unread", read: "Read", replied: "Replied" };

const Messages = ({ role, onUnread }) => {
  const { hospitals } = useCatalog();
  const { show } = useToast();
  const [inbox, setInbox] = useState([]);
  const [archived, setArchived] = useState([]);
  const [box, setBox] = useState("inbox");
  const [selectedId, setSelectedId] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    Promise.all([
      api.get("/messages/incoming?box=inbox"),
      api.get("/messages/incoming?box=archived"),
    ])
      .then(([a, b]) => {
        setInbox(a.data);
        setArchived(b.data);
        const unread = a.data.filter((m) => m.status === "unread").length;
        onUnread?.(unread);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [onUnread]);

  useEffect(load, [load]);

  // The three boxes, derived from the two fetched lists.
  const lists = useMemo(
    () => ({
      inbox,
      sent: [...inbox, ...archived]
        .filter((m) => m.status === "replied")
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      archived,
    }),
    [inbox, archived]
  );
  const current = lists[box] || [];
  const selected =
    [...inbox, ...archived].find((m) => m._id === selectedId) || null;

  const open = async (msg) => {
    setSelectedId(msg._id);
    setReply("");
    if (msg.status === "unread") {
      try {
        await api.patch(`/messages/${msg._id}/read`);
        load();
      } catch {
        /* ignore */
      }
    }
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    try {
      await api.patch(`/messages/${selected._id}/reply`, { reply });
      setReply("");
      show("Reply saved ✓");
      load();
    } catch (err) {
      show(err.response?.data?.error || "Couldn't save reply", "error");
    }
  };

  const archive = async (msg, value) => {
    try {
      await api.patch(`/messages/${msg._id}/archive`, { archived: value });
      show(value ? "Archived" : "Moved to inbox");
      if (selectedId === msg._id && value) setSelectedId(null);
      load();
    } catch {
      show("Action failed", "error");
    }
  };

  const remove = async (msg) => {
    if (!window.confirm("Delete this message permanently?")) return;
    try {
      await api.delete(`/messages/${msg._id}`);
      show("Message deleted");
      if (selectedId === msg._id) setSelectedId(null);
      load();
    } catch {
      show("Delete failed", "error");
    }
  };

  const assign = async (msg, department) => {
    try {
      await api.patch(`/messages/${msg._id}/assign`, { department });
      show(department ? `Assigned to ${department}` : "Assignment cleared");
      load();
    } catch {
      show("Couldn't assign", "error");
    }
  };

  // Hospital department options come from the receiving hospital's catalog entry.
  const departments = useMemo(() => {
    if (role !== "hospital" || !selected) return [];
    const h = hospitals.find((x) => x.id === selected.receiverId);
    return h?.specialities || [];
  }, [role, selected, hospitals]);

  return (
    <div className="msg-module">
      <div className="msg-tabs">
        {["inbox", "sent", "archived"].map((b) => (
          <button
            key={b}
            className={`msg-tab ${box === b ? "active" : ""}`}
            onClick={() => {
              setBox(b);
              setSelectedId(null);
            }}
          >
            {b[0].toUpperCase() + b.slice(1)}
            {b === "inbox" &&
              inbox.filter((m) => m.status === "unread").length > 0 && (
                <span className="msg-tab-dot">
                  {inbox.filter((m) => m.status === "unread").length}
                </span>
              )}
          </button>
        ))}
      </div>

      <div className="msg-layout">
        {/* List */}
        <div className="msg-list">
          {loading && <div className="dash-skeleton" />}
          {!loading && current.length === 0 && (
            <p className="ctable-empty">No messages in {box}.</p>
          )}
          {current.map((m) => (
            <button
              key={m._id}
              className={`msg-row ${m._id === selectedId ? "active" : ""} ${
                m.status === "unread" ? "unread" : ""
              }`}
              onClick={() => open(m)}
            >
              <div className="msg-row-top">
                <strong>{m.senderName}</strong>
                <span className={`msg-status st-${m.status}`}>
                  {STATUS_LABEL[m.status]}
                </span>
              </div>
              <span className="msg-row-subject">{m.subject}</span>
              <span className="msg-row-date">
                {new Date(m.createdAt).toLocaleString()}
              </span>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="msg-detail">
          {!selected ? (
            <div className="msg-empty-detail">
              <span>✉️</span>
              <p>Select a message to read it.</p>
            </div>
          ) : (
            <>
              <div className="msg-detail-head">
                <h3>{selected.subject}</h3>
                <span className={`msg-status st-${selected.status}`}>
                  {STATUS_LABEL[selected.status]}
                </span>
              </div>
              <div className="msg-meta">
                <span>
                  <strong>{selected.senderName}</strong> ·{" "}
                  <a href={`mailto:${selected.senderEmail}`}>
                    {selected.senderEmail}
                  </a>
                </span>
                <span className="msg-meta-sub">
                  {new Date(selected.createdAt).toLocaleString()}
                  {selected.senderType === "patient" && " · registered patient"}
                </span>
              </div>

              <div className="msg-body">{selected.message}</div>

              {/* Replies thread */}
              {selected.replies?.length > 0 && (
                <div className="msg-thread">
                  {selected.replies.map((r, i) => (
                    <div key={i} className="msg-reply">
                      <span className="msg-reply-tag">You replied</span>
                      <p>{r.text}</p>
                      <span className="msg-reply-date">
                        {new Date(r.at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Hospital: assign to department */}
              {role === "hospital" && (
                <div className="msg-assign">
                  <label>Assign to department</label>
                  <select
                    value={selected.assignedDepartment || ""}
                    onChange={(e) => assign(selected, e.target.value)}
                  >
                    <option value="">— Unassigned —</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reply box */}
              <div className="msg-replybox">
                <textarea
                  rows={3}
                  placeholder={`Reply to ${selected.senderName}…`}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <button className="msg-btn primary" onClick={sendReply}>
                  Send reply
                </button>
              </div>

              {/* Actions */}
              <div className="msg-actions">
                {selected.archived ? (
                  <button
                    className="msg-btn"
                    onClick={() => archive(selected, false)}
                  >
                    ↩ Move to inbox
                  </button>
                ) : (
                  <button
                    className="msg-btn"
                    onClick={() => archive(selected, true)}
                  >
                    🗄 Archive
                  </button>
                )}
                <button
                  className="msg-btn danger"
                  onClick={() => remove(selected)}
                >
                  🗑 Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
