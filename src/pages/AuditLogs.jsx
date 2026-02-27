import React, { useEffect, useState, useCallback } from "react";
import {

  ChevronDown,
  Logs,
} from "lucide-react";
import api from "../api/axios";
import toast from 'react-hot-toast';
import { Pagination } from "../utils/Pagination";

// Strict error and logging policy for production
const logError = (err) => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};


// Skeleton row for loading animation
function SkeletonRow() {
  // 5 table cells: ID, Name, Code, Status, Actions
  return (
    <tr>
      <td className="px-4 py-4 w-28">
        <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
      </td>
      <td className="px-4 py-4 flex justify-end items-center">
        <div className="h-8 w-8 bg-neutral-200 rounded-full animate-pulse" />
      </td>
    </tr>
  );
}

// Main page
function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Fetch Sync Job Logs
  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/audit-logs", { params: { page, size } });
      const data = res.data?.data || {};
      const content = Array.isArray(data.content)
        ? data.content || []
        : data.content || [];
      setAuditLogs(content);
      setTotal(data.totalElements ?? (content.length || 0));
    } catch (err) {
      setAuditLogs([]);
      setTotal(0);
      logError(err);
      toast.error('Error loading audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchAuditLogs();
  }, [page, size, fetchAuditLogs]);

  // Total pages for pagination
  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="w-full p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Logs className="text-emerald-700" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Audit Logs</h1>
            <p className="text-sm text-neutral-600">Track all actions and changes in the system</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm ">
            <thead className="bg-white border-b border-neutral-200">
              <tr className="text-neutral-900 font-medium text-left">
               
                <th className="px-4 py-4 align-middle">Entity Name</th>
                <th className="px-4 py-4 align-middle">Action</th>
                <th className="px-4 py-4 align-middle">User</th>
                <th className="px-4 py-4 align-middle">Status</th>
                <th className="px-4 py-4 align-middle">Entity Data</th>
                <th className="px-4 py-4 align-middle">
                  <div className="flex items-center gap-1">
                    Created At
                    <ChevronDown className="w-4" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Show multiple skeleton rows (e.g., 7)
                <>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </>
              ) : auditLogs.length > 0 ? (
                auditLogs.map((auditLog, index) => (
                  <tr
                    key={auditLog.id}
                    className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
              
                    <td className="px-4 py-4">
                    
                        {auditLog.entityName}
                     
                    </td>
                    <td className="px-4 py-4 text-neutral-700">{auditLog.action}</td>
                    <td className="px-4 py-4 text-neutral-700">{auditLog.username}</td>
                    <td className="px-4 py-4 text-neutral-700">{auditLog.status}</td>
                    <td className="px-4 py-4 text-neutral-700">{auditLog.entityData}</td>
                    <td className="px-4 py-4 text-neutral-700">{auditLog.createdAt}</td>
                   
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-4 h-24 text-center text-sm text-neutral-500">
                    No Logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          setPage={setPage}
          total={total}
          totalPages={totalPages}
          size={size}
          setSize={setSize}
          itemLabel="logs"
          pageSizeOptions={[5, 10, 20, 50, 100]}
          className="p-3"
        />
      </div>
    </div>
  );
}

export default AuditLogs;