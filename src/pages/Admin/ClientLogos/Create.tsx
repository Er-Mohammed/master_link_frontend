import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useData } from '../../../context/DataContext';
import { ClientLogo } from '../../../types';
import { Building2, ArrowLeft, ArrowRight, Save, Image as ImageIcon } from 'lucide-react';

export default function ClientLogosCreate({ onBack }: { onBack?: () => void }) {
  const { isRtl } = useLanguage();
  const { addClientLogo, triggerToast } = useData();

  const [formData, setFormData] = useState({
    company_name: '',
    website_url: '',
    sort_order: 1,
    is_active: true,
    media_id: 'med-aramco',
    media_path: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    alt_text: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name.trim()) return;

    const newLogo: ClientLogo = {
      id: `logo-${Date.now()}`,
      media_id: formData.media_id,
      company_name: formData.company_name,
      website_url: formData.website_url || null,
      sort_order: Number(formData.sort_order),
      is_active: formData.is_active,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      deleted_at: null,
      media: {
        id: formData.media_id,
        file_path: formData.media_path,
        file_name: `${formData.company_name.toLowerCase().replace(/\s+/g, '-')}-logo.png`,
        alt_text: formData.alt_text || `${formData.company_name} Logo`
      }
    };

    if (addClientLogo) addClientLogo(newLogo);
    if (triggerToast) triggerToast(isRtl ? 'تم إضافة شعار العميل بنجاح' : 'Client logo created successfully', 'success');
    if (onBack) onBack();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>
        )}
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            {isRtl ? 'إضافة شعار عميل جديد' : 'Create Client Logo'}
          </h1>
          <p className="text-xs text-slate-500 font-semibold">
            {isRtl ? 'ربط الوسائط وتعيين معلومات الشركة' : 'Form for adding a new client logo record'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {isRtl ? 'اسم الشركة *' : 'Company Name *'}
            </label>
            <input
              type="text"
              required
              value={formData.company_name}
              onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {isRtl ? 'رابط الموقع (nullable)' : 'Website URL (nullable)'}
            </label>
            <input
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isRtl ? 'ترتيب العرض (sort_order)' : 'Sort Order'}
              </label>
              <input
                type="number"
                min={1}
                value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isRtl ? 'مسار الصورة' : 'Image URL'}
              </label>
              <input
                type="text"
                value={formData.media_path}
                onChange={(e) => setFormData(prev => ({ ...prev, media_path: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[#F20530] text-white rounded-xl text-xs font-extrabold cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{isRtl ? 'حفظ الشعار' : 'Save Logo'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
