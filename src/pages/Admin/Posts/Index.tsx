import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  adminPostsApi, 
  authApi, 
  LaravelPost 
} from '../../../services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Loader2, 
  AlertCircle, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Star, 
  Calendar, 
  User, 
  ChevronRight, 
  ChevronLeft,
  X,
  FileText,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Create } from './Create';
import { Edit } from './Edit';

export function Index() {
  const { isRtl } = useLanguage();
  const { canPerform } = useAuth();

  // State
  const [posts, setPosts] = useState<LaravelPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search Params
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured'>('all');
  const [page, setPage] = useState<number>(1);
  const [perPage] = useState<number>(10);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<LaravelPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<LaravelPost | null>(null);
  const [postToPreview, setPostToPreview] = useState<LaravelPost | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handle401Error = () => {
    authApi.clearToken();
    window.location.hash = '#admin-login';
  };

  // Fetch Posts
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        page,
        per_page: perPage,
        sort: 'created_at',
        direction: 'desc',
      };

      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (featuredFilter === 'featured') params.is_featured = true;

      const response = await adminPostsApi.getAll(params);
      setPosts(response.data || []);
      if (response.meta) {
        setMeta({
          current_page: response.meta.current_page,
          last_page: response.meta.last_page,
          total: response.meta.total,
        });
      }
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
        return;
      }
      if (err?.status === 403) {
        setError(isRtl ? 'غير مصرح لك بعرض المقالات.' : 'Unauthorized to view posts.');
        return;
      }
      setError(err?.message || (isRtl ? 'حدث خطأ أثناء تحميل المقالات.' : 'Failed to load posts.'));
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, statusFilter, featuredFilter, isRtl]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    setDeleteLoading(true);

    try {
      await adminPostsApi.delete(postToDelete.id);
      setPostToDelete(null);
      fetchPosts();
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
        return;
      }
      alert(err?.message || (isRtl ? 'حدث خطأ أثناء حذف المقال.' : 'Failed to delete post.'));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F20530]/10 border border-[#F20530]/20 text-[#F20530] flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {isRtl ? 'إدارة المقالات والأخبار' : 'Articles & News Management'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {isRtl ? 'إدارة المقالات والمدونات وتحديث المحتوى عبر Laravel API' : 'Manage blog posts, news, and publishing workflows'}
            </p>
          </div>
        </div>

        {canPerform('posts', 'create') && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-3 bg-[#F20530] hover:bg-[#d00428] text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-[#F20530]/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? 'إضافة مقال جديد' : 'Add New Article'}</span>
          </button>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={isRtl ? 'بحث في العنوان أو المحتوى...' : 'Search articles by title or text...'}
            className={`w-full bg-slate-50 border border-slate-200 focus:border-[#F20530] focus:bg-white text-slate-900 text-xs font-semibold rounded-2xl py-2.5 outline-none transition-colors ${
              isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'
            }`}
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl px-3.5 py-2.5 outline-none cursor-pointer focus:border-[#F20530]"
          >
            <option value="all">{isRtl ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="published">{isRtl ? 'منشور (Published)' : 'Published'}</option>
            <option value="draft">{isRtl ? 'مسودة (Draft)' : 'Draft'}</option>
          </select>

          {/* Featured Filter */}
          <select
            value={featuredFilter}
            onChange={(e) => {
              setFeaturedFilter(e.target.value as any);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl px-3.5 py-2.5 outline-none cursor-pointer focus:border-[#F20530]"
          >
            <option value="all">{isRtl ? 'كل المقالات' : 'All Articles'}</option>
            <option value="featured">{isRtl ? 'المميزة فقط (Featured)' : 'Featured Only'}</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => fetchPosts()}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl border border-slate-200 transition-colors cursor-pointer"
            title={isRtl ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table / Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#F20530] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold">
              {isRtl ? 'جاري تحميل المقالات من Laravel API...' : 'Loading articles from Laravel...'}
            </p>
          </div>
        ) : posts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className={`w-full text-xs font-semibold text-slate-700 ${isRtl ? 'text-right' : 'text-left'}`}>
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">#</th>
                  <th className="py-4 px-6">{isRtl ? 'الغلاف والعنوان' : 'Cover & Title'}</th>
                  <th className="py-4 px-6">{isRtl ? 'الكاتب' : 'Author'}</th>
                  <th className="py-4 px-6">{isRtl ? 'تاريخ النشر' : 'Published At'}</th>
                  <th className="py-4 px-6 text-center">{isRtl ? 'الحالة' : 'Status'}</th>
                  <th className="py-4 px-6 text-center">{isRtl ? 'مميز' : 'Featured'}</th>
                  <th className="py-4 px-6 text-center">{isRtl ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* ID */}
                    <td className="py-4 px-6 font-mono text-slate-400 font-bold">
                      #{post.id}
                    </td>

                    {/* Image & Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200/80 shrink-0">
                          {post.media?.url ? (
                            <img
                              src={post.media.url}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <BookOpen className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <h4 className="font-bold text-slate-900 truncate text-xs leading-snug">
                            {post.title}
                          </h4>
                          <p className="text-[11px] font-mono text-slate-400 truncate">
                            /{post.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-xs">{post.admin?.name || (isRtl ? 'مسؤول' : 'Admin')}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 font-mono text-slate-500 text-xs">
                      {post.published_at ? (
                        new Date(post.published_at).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      ) : (
                        <span className="text-slate-400 font-sans italic">{isRtl ? 'غير محدد' : 'Not Set'}</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        post.published_at && new Date(post.published_at) <= new Date()
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          post.published_at && new Date(post.published_at) <= new Date() ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                        {post.published_at && new Date(post.published_at) <= new Date()
                          ? (isRtl ? 'منشور' : 'Published')
                          : (isRtl ? 'مسودة' : 'Draft')}
                      </span>
                    </td>

                    {/* Featured */}
                    <td className="py-4 px-6 text-center">
                      {post.is_featured ? (
                        <span className="inline-flex items-center justify-center p-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-200" title="Featured">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Preview */}
                        <button
                          onClick={() => setPostToPreview(post)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title={isRtl ? 'معاينة' : 'Preview'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        {canPerform('posts', 'edit') && (
                          <button
                            onClick={() => {
                              setPostToEdit(post);
                              setIsEditOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-[#F20530] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={isRtl ? 'تعديل' : 'Edit'}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        {canPerform('posts', 'delete') && (
                          <button
                            onClick={() => setPostToDelete(post)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={isRtl ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-bold">
              {isRtl ? 'لا توجد مقالات مطابقة للبحث.' : 'No articles match your query.'}
            </p>
          </div>
        )}

        {/* Pagination Footer */}
        {meta && meta.last_page > 1 && (
          <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">
              {isRtl ? `الصفحة ${meta.current_page} من ${meta.last_page} (${meta.total} مقال)` : `Page ${meta.current_page} of ${meta.last_page} (${meta.total} posts)`}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer bg-white hover:bg-slate-50"
              >
                {isRtl ? 'السابق' : 'Previous'}
              </button>
              <button
                disabled={page >= meta.last_page}
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer bg-white hover:bg-slate-50"
              >
                {isRtl ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Create
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchPosts()}
      />

      {/* Edit Modal */}
      <Edit
        post={postToEdit}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setPostToEdit(null);
        }}
        onSuccess={() => fetchPosts()}
      />

      {/* Preview Modal */}
      <AnimatePresence>
        {postToPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-white border border-slate-200 rounded-3xl w-full max-w-2xl my-8 shadow-2xl overflow-hidden ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  {isRtl ? 'معاينة المقال' : 'Article Preview'}
                </h3>
                <button
                  onClick={() => setPostToPreview(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {postToPreview.media?.url && (
                <div className="h-56 bg-slate-100 overflow-hidden">
                  <img
                    src={postToPreview.media.url}
                    alt={postToPreview.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <h2 className="text-lg font-black text-slate-900">{postToPreview.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold border-b border-slate-100 pb-3">
                  <span>{isRtl ? 'الكاتب:' : 'Author:'} <strong>{postToPreview.admin?.name || 'Admin'}</strong></span>
                  <span>•</span>
                  <span>{postToPreview.published_at ? new Date(postToPreview.published_at).toLocaleDateString() : 'Draft'}</span>
                </div>

                {postToPreview.short_description && (
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700 leading-relaxed">
                    {postToPreview.short_description}
                  </div>
                )}

                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {postToPreview.content}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {postToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 text-center ${isRtl ? 'rtl' : 'ltr'}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-[#F20530] flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isRtl ? 'حذف المقال' : 'Delete Article'}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  {isRtl ? `هل أنت متأكد من حذف المقال "${postToDelete.title}"؟ لا يمكن التراجع عن هذا الإجراء.` : `Are you sure you want to delete "${postToDelete.title}"?`}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPostToDelete(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 bg-[#F20530] hover:bg-[#d00428] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#F20530]/20 flex items-center justify-center gap-2 transition-all"
                >
                  {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{isRtl ? 'حذف المقال' : 'Delete'}</span>}
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
