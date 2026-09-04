import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { 
  adminAdminsApi, 
  authApi, 
  LaravelAdminRecord, 
  LaravelAdminPayload 
} from '../../../services/api';
import { getRoleDisplay, AdminRole } from '../../../lib/permissions';
import { AccessDenied403 } from '../../../components/AccessDenied403';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Mail, 
  Lock,
  AlertCircle,
  Clock,
  UserX,
  CheckCircle2,
  Eye,
  X,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Index() {
  const { isRtl } = useLanguage();
  const { currentUser, canPerform, canAccess } = useAuth();
  const { refreshDashboardStats } = useData();

  // State
  const [admins, setAdmins] = useState<LaravelAdminRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<LaravelAdminRecord | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<LaravelAdminRecord | null>(null);
  const [viewingAdmin, setViewingAdmin] = useState<LaravelAdminRecord | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('admin');
  const [isActive, setIsActive] = useState<boolean>(true);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handle401Error = () => {
    authApi.clearToken();
    window.location.hash = '#admin-login';
  };

  // Fetch Admins from Laravel API
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminAdminsApi.getAll();
      setAdmins(response.data || []);
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
        return;
      }
      if (err?.status === 403) {
        setError(isRtl ? 'غير مصرح لك بإدارة حسابات المدراء (مقتصرة على مدير النظام Super Admin).' : 'Unauthorized to manage admin accounts.');
        return;
      }
      setError(err?.message || (isRtl ? 'حدث خطأ أثناء تحميل قائمة المدراء والموظفين.' : 'Failed to load admins list.'));
    } finally {
      setLoading(false);
    }
  }, [isRtl]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleOpenAdd = () => {
    setEditingAdmin(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('admin');
    setIsActive(true);
    setValidationErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (admin: LaravelAdminRecord) => {
    setEditingAdmin(admin);
    setName(admin.name);
    setEmail(admin.email);
    setPassword('');
    setRole(admin.role);
    setIsActive(admin.is_active);
    setValidationErrors({});
    setIsModalOpen(true);
  };

  // Submit Handler for Add / Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setValidationErrors({});

    try {
      if (editingAdmin) {
        const payload: Partial<LaravelAdminPayload> = {
          name,
          email,
          role,
          is_active: isActive
        };
        if (password.trim()) {
          payload.password = password;
        }

        await adminAdminsApi.update(editingAdmin.id, payload);
        triggerToast(isRtl ? 'تم تحديث بيانات وحساب المشرف بنجاح.' : 'Admin updated successfully.', 'success');
      } else {
        const payload: LaravelAdminPayload = {
          name,
          email,
          password,
          role,
          is_active: isActive
        };

        await adminAdminsApi.create(payload);
        triggerToast(isRtl ? 'تم إنشاء حساب المشرف الجديد بنجاح في Laravel API.' : 'Admin created successfully.', 'success');
      }

      setIsModalOpen(false);
      await fetchAdmins();
      refreshDashboardStats();
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
        return;
      }
      if (err?.status === 403) {
        triggerToast(err?.message || (isRtl ? 'ليس لديك صلاحية لتنفيذ هذه العملية.' : 'Forbidden action.'), 'error');
        return;
      }
      if (err?.status === 422 && err?.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(err.errors).forEach(([field, msgs]: [string, any]) => {
          fieldErrors[field] = Array.isArray(msgs) ? msgs[0] : String(msgs);
        });
        setValidationErrors(fieldErrors);
        triggerToast(isRtl ? 'يرجى مراجعة وتصحيح البيانات المدخلة.' : 'Please fix validation errors.', 'error');
        return;
      }
      triggerToast(err?.message || (isRtl ? 'حدث خطأ أثناء حفظ البيانات.' : 'Failed to save admin.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Status Handler
  const handleToggleStatus = async (admin: LaravelAdminRecord) => {
    if (String(admin.id) === String(currentUser?.id)) {
      triggerToast(isRtl ? 'لا يمكنك تعطيل حسابك الشخصي الخالي الحالي.' : 'Cannot deactivate your own logged-in account.', 'error');
      return;
    }

    try {
      await adminAdminsApi.update(admin.id, {
        is_active: !admin.is_active
      });
      triggerToast(
        isRtl 
          ? `تم ${admin.is_active ? 'تعطيل' : 'تفعيل'} حساب المشرف "${admin.name}" بنجاح.` 
          : `Admin status updated.`,
        'success'
      );
      await fetchAdmins();
      refreshDashboardStats();
    } catch (err: any) {
      triggerToast(err?.message || (isRtl ? 'حدث خطأ أثناء تغيير حالة الحساب.' : 'Failed to update status.'), 'error');
    }
  };

  // Delete Confirm Handler
  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;

    if (String(adminToDelete.id) === String(currentUser?.id)) {
      triggerToast(isRtl ? 'لا يمكنك حذف حسابك الشخصي المسجل به حالياً.' : 'Cannot delete yourself.', 'error');
      setIsDeleteModalOpen(false);
      return;
    }

    setDeleting(true);
    try {
      await adminAdminsApi.delete(adminToDelete.id);
      triggerToast(isRtl ? `تم حذف حساب المشرف "${adminToDelete.name}" بنجاح.` : 'Admin deleted successfully.', 'success');
      setIsDeleteModalOpen(false);
      setAdminToDelete(null);
      await fetchAdmins();
      refreshDashboardStats();
    } catch (err: any) {
      triggerToast(err?.message || (isRtl ? 'تعذر حذف الحساب (قد يكون مدير النظام الأخير).' : 'Failed to delete admin.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Guard access to Super Admin section
  if (!canAccess('admins')) {
    return <AccessDenied403 attemptedSection="admins" onReturnToDashboard={() => { window.location.hash = '#admin'; }} />;
  }

  const filteredAdmins = admins.filter(admin => {
    const query = search.toLowerCase();
    const matchSearch = 
      admin.name.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query) ||
      String(admin.id).includes(query);
    
    const matchRole = roleFilter === 'all' || admin.role === roleFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? admin.is_active : !admin.is_active);

    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className={`space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 max-w-md ${
              toast.type === 'error' ? 'bg-rose-950 text-rose-200 border-rose-800' :
              toast.type === 'info' ? 'bg-slate-950 text-slate-200 border-slate-800' :
              'bg-emerald-950 text-emerald-200 border-emerald-800'
            }`}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <span className="text-xs font-bold leading-relaxed">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F20530]/10 border border-[#F20530]/20 text-[#F20530] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {isRtl ? 'إدارة حسابات المدراء والموظفين' : 'Admins & Employees Governance'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {isRtl ? 'تحديد الأدوار، إسناد الصلاحيات، ومتابعة حالة التفعيل عبر Laravel Backend API' : 'Manage roles, permissions, and status synced with Laravel'}
            </p>
          </div>
        </div>

        {canPerform('admins', 'create') && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-black text-white bg-[#F20530] hover:bg-rose-600 transition-all cursor-pointer shadow-lg shadow-[#F20530]/20"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? 'إضافة مسؤول جديد' : 'New Admin'}</span>
          </button>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
              {isRtl ? 'إجمالي المدراء' : 'Total Admins'}
            </span>
            <span className="text-2xl font-black text-slate-900 block">{admins.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
              {isRtl ? 'الحسابات النشطة' : 'Active Accounts'}
            </span>
            <span className="text-2xl font-black text-emerald-600 block">
              {admins.filter(a => a.is_active).length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
              {isRtl ? 'الحسابات المعطلة' : 'Disabled Accounts'}
            </span>
            <span className="text-2xl font-black text-rose-600 block">
              {admins.filter(a => !a.is_active).length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRtl ? 'البحث بالاسم أو البريد الإلكتروني...' : 'Search by name or email...'}
            className={`w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#F20530] transition-colors`}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#F20530]"
          >
            <option value="all">{isRtl ? 'جميع الأدوار' : 'All Roles'}</option>
            <option value="super_admin">المدير العام (Super Admin)</option>
            <option value="admin">مدير تنفيذي (Admin)</option>
            <option value="content_manager">مدير المحتوى (Content Manager)</option>
            <option value="marketing">التسويق (Marketing)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#F20530]"
          >
            <option value="all">{isRtl ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="active">{isRtl ? 'نشط' : 'Active'}</option>
            <option value="inactive">{isRtl ? 'معطل' : 'Disabled'}</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#F20530] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold">
              {isRtl ? 'جاري تحميل قائمة المدراء والموظفين...' : 'Loading admins...'}
            </p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3 px-4">
            <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-xs text-rose-700 font-bold">{error}</p>
            <button
              onClick={fetchAdmins}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-bold">لا يوجد مدراء يطابقون شروط البحث.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-semibold text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4 text-right">المسؤول (Name & Email)</th>
                  <th className="px-6 py-4 text-right">الدور والصلاحيات (Role)</th>
                  <th className="px-6 py-4 text-right">حالة الحساب (Status)</th>
                  <th className="px-6 py-4 text-right">تاريخ التسجيل</th>
                  <th className="px-6 py-4 text-left">التحكم والإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmins.map((admin) => {
                  const isSelf = String(admin.id) === String(currentUser?.id);
                  const roleInfo = getRoleDisplay(admin.role, 'ar');

                  return (
                    <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center uppercase">
                            {admin.name ? admin.name.charAt(0) : 'A'}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 flex items-center gap-2">
                              <span>{admin.name}</span>
                              {isSelf && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-[#F20530] text-[10px] font-bold border border-rose-100">
                                  حسابك الحالي
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{admin.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${roleInfo.badgeClass}`}>
                          {roleInfo.name}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => handleToggleStatus(admin)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-extrabold border transition-all cursor-pointer ${
                            admin.is_active 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          } ${isSelf ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${admin.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span>{admin.is_active ? 'نشط' : 'معطل'}</span>
                        </button>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        {admin.created_at ? new Date(admin.created_at).toLocaleDateString('ar-SA') : '-'}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          {canPerform('admins', 'edit') && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(admin)}
                              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                              title="تعديل الحساب"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {canPerform('admins', 'delete') && (
                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() => {
                                setAdminToDelete(admin);
                                setIsDeleteModalOpen(true);
                              }}
                              className={`p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer ${
                                isSelf ? 'opacity-30 cursor-not-allowed' : ''
                              }`}
                              title={isSelf ? 'لا يمكنك حذف حسابك الشخصي' : 'حذف الحساب'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Admin Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-lg rounded-3xl border border-slate-200/80 shadow-2xl p-6 space-y-6 relative z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingAdmin ? 'تعديل بيانات وصلاحيات المشرف' : 'إضافة مشرف جديد للنظام'}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    {editingAdmin ? 'تعديل البريد والدور وحالة التفعيل في Laravel Backend' : 'إدخال بيانات الاعتماد وتحديد رتبة الوصول'}
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">اسم المسؤول الكامل:</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: عبدالملك السالمي"
                    className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#F20530]"
                  />
                  {validationErrors.name && <p className="text-[11px] font-bold text-rose-600">{validationErrors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">البريد الإلكتروني الرسمي:</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@masterlink.tech"
                    className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#F20530] font-mono"
                  />
                  {validationErrors.email && <p className="text-[11px] font-bold text-rose-600">{validationErrors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {editingAdmin ? 'كلمة المرور الجديدة (اختياري عند التحديث):' : 'كلمة المرور:'}
                  </label>
                  <input
                    type="password"
                    required={!editingAdmin}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#F20530] font-mono"
                  />
                  {validationErrors.password && <p className="text-[11px] font-bold text-rose-600">{validationErrors.password}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">الدور والرتبة (Role):</label>
                    <select
                      disabled={editingAdmin ? String(editingAdmin.id) === String(currentUser?.id) : false}
                      value={role}
                      onChange={(e) => setRole(e.target.value as AdminRole)}
                      className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-white outline-none focus:border-[#F20530] disabled:bg-slate-100 disabled:opacity-70"
                    >
                      <option value="super_admin">المدير العام (Super Admin)</option>
                      <option value="admin">مدير تنفيذي (Admin)</option>
                      <option value="content_manager">مدير المحتوى (Content Manager)</option>
                      <option value="marketing">التسويق (Marketing)</option>
                    </select>
                    {editingAdmin && String(editingAdmin.id) === String(currentUser?.id) && (
                      <p className="text-[10px] text-amber-600 font-semibold">لا يمكنك تغيير دور حسابك الحالي بنفسك.</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">حالة التفعيل:</label>
                    <select
                      disabled={editingAdmin ? String(editingAdmin.id) === String(currentUser?.id) : false}
                      value={isActive ? '1' : '0'}
                      onChange={(e) => setIsActive(e.target.value === '1')}
                      className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-white outline-none focus:border-[#F20530] disabled:bg-slate-100 disabled:opacity-70"
                    >
                      <option value="1">نشط ومفعل</option>
                      <option value="0">معطل</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#F20530] hover:bg-rose-600 cursor-pointer shadow-md shadow-[#F20530]/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingAdmin ? 'حفظ التعديلات' : 'إنشاء الحساب'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && adminToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsDeleteModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl border border-rose-200 shadow-2xl p-6 space-y-4 relative z-10 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">تأكيد حذف حساب المشرف</h3>
                <p className="text-xs text-slate-500 font-semibold">
                  هل أنت تأكد من رغبتك في حذف حساب المسؤول <strong className="text-slate-900">{adminToDelete.name}</strong>؟
                  سيتم إلغاء كافة مفاتيح الوصول الخاصة به نهائياً.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleConfirmDelete}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-md shadow-rose-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>نعم، إتمام الحذف</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Index;
