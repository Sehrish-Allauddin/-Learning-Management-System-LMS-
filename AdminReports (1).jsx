import React, { useState, useEffect, useMemo } from "react";
import { fetchApi } from "../../lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Download, AlertCircle, FileText, Filter, X } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Full list of regions used across the org. Keep this in sync with
// whatever list is used elsewhere (e.g. user creation forms).
const REGIONS = [
  "RHO Islamabad",
  "RHO Sargodha",
  "RHO Lahore",
  "RHO Multan",
  "RHO Sukkur",
  "RHO Karachi",
  "RHO Quetta",
  "RHO Peshawar",
  "RHO Gawader",
  "RHO AJK",
  "RHO Gilgit Baltistan",
];

// Green palette used consistently across every chart on this page.
const GREEN_SHADES = [
  "#166534", // green-800
  "#15803d", // green-700
  "#16a34a", // green-600
  "#22c55e", // green-500
  "#4ade80", // green-400
  "#86efac", // green-300
  "#bbf7d0", // green-200
  "#065f46", // emerald-800
  "#059669", // emerald-600
  "#10b981", // emerald-500
  "#34d399", // emerald-400
];

export default function AdminReports() {
  const [missingAssessments, setMissingAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Filter state -------------------------------------------------
  const [filterName, setFilterName] = useState("");
  const [filterErp, setFilterErp] = useState("");
  const [filterRegion, setFilterRegion] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await fetchApi("/api/admin/reports/missing-assessments");
        setMissingAssessments(Array.isArray(data) ? data : data.missingAssessments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  // --- Filtering logic ------------------------------------------------
  const filteredAssessments = useMemo(() => {
    return missingAssessments.filter((record) => {
      const name = (record.user?.name || "").toLowerCase();
      const erpId = (record.user?.erpId || "").toString().toLowerCase();
      const region = record.user?.region || record.region || "";

      const nameMatch = filterName.trim() === "" || name.includes(filterName.trim().toLowerCase());
      const erpMatch = filterErp.trim() === "" || erpId.includes(filterErp.trim().toLowerCase());
      const regionMatch = filterRegion === "" || region === filterRegion;

      return nameMatch && erpMatch && regionMatch;
    });
  }, [missingAssessments, filterName, filterErp, filterRegion]);

  const hasActiveFilters = filterName !== "" || filterErp !== "" || filterRegion !== "";

  const clearFilters = () => {
    setFilterName("");
    setFilterErp("");
    setFilterRegion("");
  };

  // --- Chart data (derived from the filtered records) ------------------
  // Missing assessments grouped by course
  const courseCompletionData = useMemo(() => {
    const counts = {};
    filteredAssessments.forEach((record) => {
      const course = record.course?.title || "Unknown Course";
      counts[course] = (counts[course] || 0) + 1;
    });
    return Object.entries(counts).map(([course, count]) => ({ course, count }));
  }, [filteredAssessments]);

  // Missing assessments grouped by region (based on full REGIONS list so
  // every region shows up even with a count of 0)
  const regionPerformanceData = useMemo(() => {
    const counts = {};
    REGIONS.forEach((r) => (counts[r] = 0));
    filteredAssessments.forEach((record) => {
      const region = record.user?.region || record.region || "Unspecified";
      counts[region] = (counts[region] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([region, count]) => ({ region, count }))
      .filter((r) => r.count > 0 || REGIONS.includes(r.region));
  }, [filteredAssessments]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reports</h1>
          <p className="text-gray-500">Generate and view system reports.</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export All Reports
        </Button>
      </div>

      {/* ------------------------- Filters ------------------------- */}
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Employee Name
              </label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Search by name..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                ERP Number
              </label>
              <input
                type="text"
                value={filterErp}
                onChange={(e) => setFilterErp(e.target.value)}
                placeholder="Search by ERP..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Region
              </label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
              >
                <option value="">All Regions</option>
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---------------------- Missing Assessments table ---------------------- */}
      <Card className="border-amber-200 shadow-sm bg-white">
        <CardHeader className="bg-amber-50/50 border-b border-amber-100 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="h-5 w-5" />
            Missing Assessments Report
          </CardTitle>
          <p className="text-sm text-amber-700 mt-1">
            Employees who have completed the course modules but have not yet taken the final assessment.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed On</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    Loading reports...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-red-500">
                    Failed to load reports: {error}
                  </td>
                </tr>
              )}
              {!loading && !error && filteredAssessments.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    {hasActiveFilters
                      ? "No records match the selected filters."
                      : "No missing assessments found!"}
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                filteredAssessments.map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.user?.name || "Unknown"}</div>
                      <div className="text-sm text-gray-500">ERP: {record.user?.erpId || "Unknown"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.course?.title || "Unknown Course"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">-</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="outline" size="sm">Remind User</Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ---------------------------- Charts ---------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Course Completion Rates
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              Number of employees with a missing assessment, grouped by course.
            </p>
          </CardHeader>
          <CardContent>
            {courseCompletionData.length === 0 ? (
              <div className="h-64 flex items-center justify-center bg-gray-50 border border-dashed rounded-lg text-gray-400">
                No data to display for the current filters.
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseCompletionData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5f5e9" />
                    <XAxis
                      dataKey="course"
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      height={60}
                      tick={{ fontSize: 11, fill: "#166534" }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#166534" }} />
                    <Tooltip
                      contentStyle={{ borderColor: "#16a34a" }}
                      cursor={{ fill: "#f0fdf4" }}
                    />
                    <Bar dataKey="count" name="Missing Assessments" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Regional Performance
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              Distribution of missing assessments across RHO regions.
            </p>
          </CardHeader>
          <CardContent>
            {regionPerformanceData.length === 0 ? (
              <div className="h-64 flex items-center justify-center bg-gray-50 border border-dashed rounded-lg text-gray-400">
                No data to display for the current filters.
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regionPerformanceData}
                      dataKey="count"
                      nameKey="region"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ region, count }) => (count > 0 ? `${region}: ${count}` : "")}
                    >
                      {regionPerformanceData.map((entry, index) => (
                        <Cell key={entry.region} fill={GREEN_SHADES[index % GREEN_SHADES.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
