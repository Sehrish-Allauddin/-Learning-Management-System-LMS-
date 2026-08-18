import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Search, Filter, Shield, User, MoreVertical, Trash2, Upload } from "lucide-react";
import Papa from "papaparse";
import { useTranslation } from "react-i18next";

export default function AdminUsers() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [erpFilter, setErpFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const regions = [
    "RHO Islamabad", "RHO Peshawar", "RHO Quetta", "RHO Lahore",
    "RHO Karachi", "RHO Multan", "RHO Sargodha", "RHO Sukkur",
    "RHO Gwadar", "RHO Gilgit-Baltistan (GB)", "RHO Azad Jammu & Kashmir"
  ];
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchApi("/api/admin/users");
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchName = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchErp = erpFilter ? user.erpId.includes(erpFilter) : true;
    const matchRegion = regionFilter ? user.region === regionFilter : true;
    return matchName && matchErp && matchRegion;
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const formattedUsers = results.data.map(row => ({
            name: row['Name'],
            erpId: row['ERP ID'] || row['ERPID'] || row['erpId'],
            designation: row['Designation'],
            region: row['Region']
          }));
          const res = await fetchApi("/api/admin/users/bulk", {
            method: 'POST',
            body: JSON.stringify({ users: formattedUsers })
          });
          alert(res.message);
          window.location.reload();
        } catch (err) {
          alert(t("adminUsers.alert_import_failed", { message: err.message }));
        } finally {
          setUploading(false);
          e.target.value = null;
        }
      },
      error: (error) => {
        alert(t("adminUsers.alert_csv_parse_failed", { message: error.message }));
        setUploading(false);
      }
    });
  };

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("adminUsers.title")}</h1>
          <p className="text-gray-500">{t("adminUsers.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            <div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4 bg-white text-gray-700">
              <Upload className="me-2 h-4 w-4" />
              {uploading ? t("adminUsers.importing") : t("adminUsers.import_csv_button")}
            </div>
          </label>
          <Button>{t("adminUsers.add_new_employee_button")}</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("adminUsers.search_placeholder")}
                className="pl-9 rtl:pl-3 rtl:pr-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Input
                placeholder={t("adminUsers.filter_erp_placeholder")}
                value={erpFilter}
                onChange={(e) => setErpFilter(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </div>
            <div className="w-full sm:w-64">
              <div className="relative">
                <select
                  className="flex h-10 w-full appearance-none rounded-md border border-border bg-surface px-3 py-2 text-sm ring-offset-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 pr-8 rtl:pr-3 rtl:pl-8"
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                >
                  <option value="">{t("adminUsers.all_regions")}</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="rounded-md border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t("adminUsers.employee_col")}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t("adminUsers.designation_col")}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t("adminUsers.region_col")}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t("adminUsers.role_col")}</th>
                  <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">{t("adminUsers.actions_col")}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ms-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ERP: {user.erpId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{user.designation}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{user.region}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className="text-sm rounded-md border-gray-300 py-1 ps-2 pe-6"
                        value={user.role}
                        onChange={async (e) => {
                          try {
                            const newRole = e.target.value;
                            await fetchApi(`/api/admin/users/${user.id}/role`, {
                              method: 'PUT',
                              body: JSON.stringify({ role: newRole })
                            });
                            setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                          } catch (err) {
                            alert(err.message);
                          }
                        }}
                      >
                        <option value="USER">{t("adminUsers.role_user")}</option>
                        <option value="MODERATOR">{t("adminUsers.role_moderator")}</option>
                        <option value="ADMIN">{t("adminUsers.role_admin")}</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={async () => {
                          if (window.confirm(t("adminUsers.confirm_delete_user", { name: user.name }))) {
                            try {
                              await fetchApi(`/api/admin/users/${user.id}`, { method: 'DELETE' });
                              setUsers(users.filter(u => u.id !== user.id));
                            } catch (err) {
                              alert(err.message);
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {loading && (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">{t("adminUsers.loading")}</td></tr>
                )}
                {!loading && filteredUsers.length === 0 && (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">{t("adminUsers.no_employees_found")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}