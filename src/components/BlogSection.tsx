import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Clock, 
  Eye, 
  User, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Filter,
  Share2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BlogPost } from '../types';

export function BlogSection() {
  const { language, isRtl } = useLanguage();
  const { posts: contextPosts, updatePost } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePost, setActivePost] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Derived published posts from DataContext
  const posts = useMemo(() => {
    if (contextPosts && contextPosts.length > 0) {
      return contextPosts.filter((p: any) => p.status === 'published');
    }
    return [];
  }, [contextPosts]);

  // Compute categories
  const categories = useMemo(() => {
    const list = new Set<string>();
    posts.forEach(p => {
      const cat = language === 'en' ? (p.categoryEn || 'General') : (p.categoryAr || 'عام');
      if (cat) list.add(cat);
    });
    return ['all', ...Array.from(list)];
  }, [posts, language]);

  // Handle opening an article and incrementing its view count
  const handleOpenArticle = (post: any) => {
    setActivePost(post);
    if (post && post.id && updatePost) {
      updatePost(post.id, { views: (post.views || 0) + 1 });
    }
  };

  // Copy article link share simulation
  const handleShare = (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/#blog/${post.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Filter posts based on search query and selected category
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const title = language === 'en' ? p.titleEn : p.titleAr;
      const excerpt = language === 'en' ? p.excerptEn : p.excerptAr;
      const author = language === 'en' ? p.authorEn : p.authorAr;
      const category = language === 'en' ? p.categoryEn : p.categoryAr;

      const matchesSearch = 
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory, language]);

  return (
    <section id="blog" className="py-24 bg-white border-b border-slate-200/80 relative overflow-hidden text-slate-900">
      <div className="absolute inset-0 bg-grid-pattern opacity-80 pointer-events-none" />
      {/* Decorative ambient blobs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#5683FC]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-[#F20530]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className={`text-center max-w-3xl mx-auto mb-16 space-y-4`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5683FC]/10 border border-[#5683FC]/20 text-[#5683FC] text-xs font-bold uppercase tracking-wider animate-pulse">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Insights & Press' : 'مقالات وعلوم ريادية'}</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            {language === 'en' ? 'Our Official Hub' : 'المدونة الرسمية ومركز المقالات'}
          </h2>
          
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            {language === 'en' 
              ? 'Stay updated with our latest industry deep-dives, custom cloud architectures, and digital transformations published by our leadership.' 
              : 'تابع أحدث منشوراتنا، التحليلات البرمجية وبنى الاتصال الحديثة المنشورة بكل دقة من قبل الإدارة التقنية للموقع.'}
          </p>
        </div>

        {/* Toolbar: Search & Dynamic Category Filters */}
        <div className="bg-slate-50/80 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 mb-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <span className={`absolute inset-y-0 ${isRtl ? 'right-3.5' : 'left-3.5'} flex items-center pointer-events-none text-slate-400`}>
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={language === 'en' ? 'Search published articles...' : 'ابحث في المقالات المنشورة...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`block w-full ${isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2.5 bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-[#F20530] focus:ring-1 focus:ring-[#F20530] transition-all`}
              dir={isRtl ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Categories Horizontal Scroll */}
          <div className={`flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#F20530]" />
              <span>{language === 'en' ? 'Filters' : 'تصفية'}:</span>
            </div>
            
            <div className="flex items-center gap-1.5 pl-1">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-[#F20530] text-white shadow-md shadow-[#F20530]/20' 
                      : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {cat === 'all' 
                    ? (language === 'en' ? 'All Posts' : 'كل المقالات')
                    : cat
                  }
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Empty State when no articles found */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/20 rounded-2xl border border-white/5 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-white/5 text-slate-500">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {language === 'en' ? 'No Articles Found' : 'لم نجد أي مقالات'}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {language === 'en' 
                ? 'Try adjusting your search criteria or choosing a different category filter.' 
                : 'يرجى تجربة تعديل الكلمات المفتاحية في حقل البحث أو إزالة فلترة الأقسام.'}
            </p>
          </div>
        ) : (
          
          /* Articles Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col group hover:border-[#F20530]/40 hover:shadow-xl hover:shadow-[#F20530]/5 transition-all duration-300"
              >
                {/* Cover Image Container */}
                <div 
                  className="aspect-[16/9.5] sm:aspect-[16/9] w-full overflow-hidden relative cursor-pointer"
                  onClick={() => handleOpenArticle(post)}
                >
                  <img 
                    src={post.img || post.image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80'} 
                    alt={language === 'en' ? (post.titleEn || '') : (post.titleAr || '')} 
                    className="w-full h-full object-cover scale-105 group-hover:scale-115 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-80" />
                  
                  {/* Category Pill */}
                  <span className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-[#F20530] border border-slate-200 shadow-xs`}>
                    {language === 'en' ? (post.categoryEn || 'General') : (post.categoryAr || 'عام')}
                  </span>
                </div>

                {/* Content Area */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Date and Views and Read Time Meta */}
                    <div className={`flex items-center gap-3.5 text-[10px] text-slate-500 font-bold ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#F20530]" />
                        <span>{post.publishDate || post.date || '2026-07-21'}</span>
                      </div>
                      <div className="w-1 h-1 bg-slate-300 rounded-full" />
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#5683FC]" />
                        <span>{language === 'en' ? (post.readTimeEn || '5 min read') : (post.readTimeAr || 'قراءة ٥ دقائق')}</span>
                      </div>
                      <div className="w-1 h-1 bg-slate-300 rounded-full" />
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>{post.views || 100}</span>
                      </div>
                    </div>

                    {/* Post Title */}
                    <h3 
                      onClick={() => handleOpenArticle(post)}
                      className={`text-base sm:text-lg font-bold text-slate-900 hover:text-[#F20530] transition-colors line-clamp-2 cursor-pointer leading-tight ${isRtl ? 'text-right' : 'text-left'}`}
                    >
                      {language === 'en' ? (post.titleEn || '') : (post.titleAr || '')}
                    </h3>

                    {/* Excerpt */}
                    <p className={`text-xs text-slate-600 line-clamp-3 leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>
                      {language === 'en' ? (post.excerptEn || '') : (post.excerptAr || '')}
                    </p>
                  </div>

                  {/* Card Footer: Author and Trigger CTA */}
                  <div className={`pt-4 border-t border-slate-100 flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-[#F20530]" />
                      </div>
                      <div className="leading-none text-left">
                        <span className={`block text-[10px] font-extrabold text-slate-800 ${isRtl ? 'text-right' : 'text-left'}`}>
                          {language === 'en' ? (post.authorEn || post.authorNameEn || 'Admin') : (post.authorAr || post.authorNameAr || 'م. علاء الحربي')}
                        </span>
                        <span className={`block text-[8px] text-slate-500 mt-0.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                          {language === 'en' ? 'Site Administrator' : 'مدير الموقع الرسمي'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Copy Share Icon */}
                      <button 
                        onClick={(e) => handleShare(post, e)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                        title={language === 'en' ? 'Copy Link' : 'نسخ رابط المقال'}
                      >
                        {copiedId === post.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Read More Link */}
                      <button
                        onClick={() => handleOpenArticle(post)}
                        className={`flex items-center gap-1 text-[11px] font-extrabold text-[#F20530] hover:text-[#5683FC] transition-all cursor-pointer ${isRtl ? 'flex-row-reverse' : ''}`}
                      >
                        <span>{language === 'en' ? 'Read' : 'اقرأ'}</span>
                        {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

      </div>

      {/* Full Immersive Article Reader Modal */}
      <AnimatePresence>
        {activePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 sm:p-6 md:p-10"
            onClick={() => setActivePost(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Cover Banner Area */}
              <div className="h-[240px] sm:h-[350px] relative w-full overflow-hidden shrink-0">
                <img 
                  src={activePost.img || activePost.image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80'} 
                  alt={language === 'en' ? (activePost.titleEn || '') : (activePost.titleAr || '')}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/50" />
                
                {/* Floating Top Bar (Close and Share) */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                  <span className="px-2.5 py-1 rounded-md bg-rose-500 text-[10px] font-extrabold text-white border border-rose-600 shadow-md">
                    {language === 'en' ? (activePost.categoryEn || 'General') : (activePost.categoryAr || 'عام')}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleShare(activePost, e)}
                      className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-white/10 cursor-pointer shadow-md transition-all"
                      title={language === 'en' ? 'Copy Link' : 'نسخ رابط المقال'}
                    >
                      {copiedId === activePost.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => setActivePost(null)}
                      className="p-2 rounded-full bg-slate-900/80 hover:bg-rose-600 hover:text-white text-white border border-white/10 cursor-pointer shadow-md transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cover Banner Title Meta overlay */}
                <div className="absolute bottom-6 left-6 right-6 text-left">
                  <div className={`flex flex-wrap items-center gap-3.5 text-[10px] text-slate-300 font-extrabold mb-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      <span>{activePost.publishDate || activePost.date || '2026-07-21'}</span>
                    </div>
                    <span className="text-slate-600">|</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>{language === 'en' ? (activePost.readTimeEn || '5 min read') : (activePost.readTimeAr || 'قراءة ٥ دقائق')}</span>
                    </div>
                    <span className="text-slate-600">|</span>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-rose-400" />
                      <span>{activePost.views || 100} {language === 'en' ? 'views' : 'مشاهدة'}</span>
                    </div>
                  </div>

                  <h3 className={`text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight ${isRtl ? 'text-right' : 'text-left'}`}>
                    {language === 'en' ? (activePost.titleEn || '') : (activePost.titleAr || '')}
                  </h3>
                </div>
              </div>

              {/* Author & Header Metadata details */}
              <div className={`px-6 py-4 bg-slate-950/40 border-b border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-rose-500" />
                  </div>
                  <div className="leading-none text-left">
                    <span className={`block text-xs font-black text-white ${isRtl ? 'text-right' : 'text-left'}`}>
                      {language === 'en' ? (activePost.authorEn || activePost.authorNameEn || 'Admin') : (activePost.authorAr || activePost.authorNameAr || 'م. علاء الحربي')}
                    </span>
                    <span className={`block text-[10px] text-slate-500 mt-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                      {language === 'en' ? 'Official Site Manager & Cloud Architect' : 'مدير الموقع الرسمي ومهندس الحلول السحابية'}
                    </span>
                  </div>
                </div>

                <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[10px] font-extrabold text-slate-500">{language === 'en' ? 'CMS Reference' : 'رقم مرجع النشر'}:</span>
                  <code className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[10px] font-bold text-rose-400">{activePost.id}</code>
                </div>
              </div>

              {/* Scrollable Rich Text Body Content */}
              <div 
                className="p-6 sm:p-8 overflow-y-auto flex-1 bg-[#0b0f19] space-y-6"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                {/* Intro Quote */}
                <div className={`p-4 rounded-xl bg-slate-900/40 border-l-4 border-rose-500 ${isRtl ? 'border-l-0 border-r-4 text-right' : 'text-left'}`}>
                  <span className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1 tracking-wider">
                    {language === 'en' ? 'Abstract / Synopsis' : 'ملخص ومقتطف المقال'}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-300 leading-relaxed italic">
                    {language === 'en' ? (activePost.excerptEn || '') : (activePost.excerptAr || '')}
                  </p>
                </div>

                {/* Formatted body text parser */}
                <div className={`prose prose-invert prose-xs sm:prose-sm max-w-none text-slate-300 leading-relaxed space-y-4 font-medium ${isRtl ? 'text-right' : 'text-left'}`}>
                  {((language === 'en' ? (activePost.contentEn || activePost.excerptEn || '') : (activePost.contentAr || activePost.excerptAr || '')) || '')
                    .split('\n\n')
                    .map((paragraph: string, pIdx: number) => {
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h4 key={pIdx} className="text-sm sm:text-base font-extrabold text-white pt-2 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-[#F20530] rounded-sm" />
                            <span>{paragraph.replace('### ', '')}</span>
                          </h4>
                        );
                      }
                      if (paragraph.startsWith('## ')) {
                        return (
                          <h4 key={pIdx} className="text-base sm:text-lg font-black text-white pt-3 border-b border-white/5 pb-1">
                            {paragraph.replace('## ', '')}
                          </h4>
                        );
                      }
                      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                        return (
                          <ul key={pIdx} className="list-disc list-inside pl-4 text-xs sm:text-sm text-slate-300 space-y-1.5">
                            {paragraph.split('\n').map((item, itemIdx) => (
                              <li key={itemIdx} className="leading-relaxed">
                                {item.replace(/^[-*]\s+/, '')}
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      if (paragraph.match(/^\d+\.\s+/)) {
                        return (
                          <ol key={pIdx} className="list-decimal list-inside pl-4 text-xs sm:text-sm text-slate-300 space-y-1.5">
                            {paragraph.split('\n').map((item, itemIdx) => (
                              <li key={itemIdx} className="leading-relaxed">
                                {item.replace(/^\d+\.\s+/, '')}
                              </li>
                            ))}
                          </ol>
                        );
                      }
                      return (
                        <p key={pIdx} className="text-xs sm:text-sm leading-relaxed text-slate-300 whitespace-pre-line">
                          {paragraph}
                        </p>
                      );
                    })}
                </div>

                {/* Footer Stamp */}
                <div className="pt-8 border-t border-white/5 text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase text-[#F20530] tracking-widest bg-rose-500/5 px-2.5 py-1 rounded-full border border-rose-500/15">
                    <Sparkles className="w-3 h-3" />
                    <span>{language === 'en' ? 'Official Master Link Editorial' : 'منشور رسمي معتمد في ماستر لينك'}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold">
                    {language === 'en' 
                      ? '© 2026 Master Link. All rights reserved. Published for verified stakeholders.' 
                      : '© ٢٠٢٦ ماستر لينك. جميع الحقوق محفوظة لشركة ماستر لينك وعملائها.'}
                  </p>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
