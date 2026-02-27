import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  SquareArrowOutUpRight,
  MoreVertical,
  Pencil,
  CircleX,
  CircleCheck,
  Trash2,
  X,
  Logs,
} from "lucide-react";
import api from "../api/axios";
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { NavLink } from "react-router-dom";
import { Pagination } from "../utils/Pagination";
import SkeletonTable from "../utils/SkeletonTable";

// Strict error and logging policy for production
const logError = (err) => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

// Main page
export default function SyncJobLogs() {
  const [syncJobLogs, setSyncJobLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Fetch Sync Job Logs
  const fetchSyncJobLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/vendor-sync-runs", { params: { page, size } });
      const data = res.data?.data || {};
      const content = Array.isArray(data.content)
        ? data.content || []
        : data.content || [];
      setSyncJobLogs(content);
      setTotal(data.totalElements ?? (content.length || 0));
    } catch (err) {
      setSyncJobLogs([]);
      setTotal(0);
      logError(err);
      toast.error('Error loading sync job logs');
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchSyncJobLogs();
  }, [page, size, fetchSyncJobLogs]);

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
            <h1 className="text-2xl font-bold text-neutral-900">Vendor Sync Job Logs</h1>
            <p className="text-sm text-neutral-600">Panel to view vendor sync job logs</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm ">
            <thead className="bg-white border-b border-neutral-200">
              <tr className="text-neutral-900 font-medium text-left">
                <th className="px-4 py-3 w-32">ID</th>
                <th className="px-4 py-3">Vendor Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 ">Job Run ID</th>
                <th className="px-4 py-3 ">Items Fetched</th>
                <th className="px-4 py-3 ">Job Started At</th>
                <th className="px-4 py-3 ">Job Finished At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Show multiple skeleton rows (e.g., 7)
                <>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <SkeletonTable key={i} />
                  ))}
                </>
              ) : syncJobLogs.length > 0 ? (
                syncJobLogs.map((syncJobLog, index) => (
                  <tr
                    key={syncJobLog.uuid}
                    className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-4 w-28 font-medium text-neutral-900">{index + 1}</td>
                    <td className="px-4 py-4">
                
                        {syncJobLog.vendorName}
                
                    </td>
                    <td className="px-4 py-4 text-neutral-700">{syncJobLog.status}</td>
                    <td className="px-4 py-4 text-neutral-700">{syncJobLog.runId}</td>
                    <td className="px-4 py-4 text-neutral-700">{syncJobLog.itemsFetched}</td>
                    <td className="px-4 py-4 text-neutral-700">{syncJobLog.startedAt}</td>
                    <td className="px-4 py-4 text-neutral-700">{syncJobLog.finishedAt}</td>
                   
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