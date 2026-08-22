import { TestimonialModel } from '../types';

export const testimonialsData: TestimonialModel[] = [
  {
    id: 'testi-1',
    media_id: 'med-avatar-1',
    display_name: 'Eng. Khalid Al-Mansoor',
    display_name_ar: 'م. خالد المنصور',
    message: 'MasterLink transformed our digital infrastructure with unmatched speed and engineering excellence. Their team delivered a seamless cloud architecture.',
    message_ar: 'قامت ماستر لينك بتطوير بنيتنا التحتية الرقمية بسرعة استثنائية وجودة هندسية فائقة. قدم فريقهم حلولاً سحابية متكاملة ومستقرة تتصدر المنافسة.',
    sort_order: 1,
    is_active: true,
    created_at: '2026-02-15 10:30:00',
    updated_at: '2026-07-01 14:20:00',
    deleted_at: null,
    media: {
      id: 'med-avatar-1',
      file_path: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      file_name: 'khalid-mansoor.jpg',
      alt_text: 'Eng. Khalid Al-Mansoor'
    }
  },
  {
    id: 'testi-2',
    media_id: 'med-avatar-2',
    display_name: 'Sara Al-Otaibi',
    display_name_ar: 'سارة العتيبي',
    message: 'Working with MasterLink on our e-commerce platform and mobile apps exceeded our growth targets by 280%. Professionalism at its finest.',
    message_ar: 'العمل مع ماستر لينك في منصتنا للتجارة الإلكترونية وتطبيقات الجوال تجاوز أهداف النمو بنسبة 280٪. احترافية مطلقة وتجربة عميل استثنائية.',
    sort_order: 2,
    is_active: true,
    created_at: '2026-03-10 11:15:00',
    updated_at: '2026-07-05 09:45:00',
    deleted_at: null,
    media: {
      id: 'med-avatar-2',
      file_path: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      file_name: 'sara-otaibi.jpg',
      alt_text: 'Sara Al-Otaibi'
    }
  },
  {
    id: 'testi-3',
    media_id: 'med-avatar-3',
    display_name: 'Fahad Al-Dossary',
    display_name_ar: 'فهد الدوسري',
    message: 'The marketing campaigns and high-production commercial videos created by MasterLink elevated our brand position across the Gulf region.',
    message_ar: 'الحملات التسويقية ومقاطع الفيديو الإعلانية الاحترافية التي أنتجتها ماستر لينك رفعت من مكانة علامتنا التجارية وعززت مبيعاتنا في جميع الأسواق.',
    sort_order: 3,
    is_active: true,
    created_at: '2026-04-01 16:00:00',
    updated_at: '2026-07-10 12:10:00',
    deleted_at: null,
    media: {
      id: 'med-avatar-3',
      file_path: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      file_name: 'fahad-dossary.jpg',
      alt_text: 'Fahad Al-Dossary'
    }
  }
];
