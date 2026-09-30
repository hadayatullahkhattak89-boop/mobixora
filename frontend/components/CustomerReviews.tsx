import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';
import { Review } from '@/types';

interface CustomerReviewsProps {
  reviews: Review[];
}

export function CustomerReviews({ reviews }: CustomerReviewsProps) {
  const displayReviews = reviews.length > 0 ? reviews : [
    {
      id: 1,
      user_id: 1,
      user_name: 'Ahmed Khan',
      product_id: 1,
      rating: 5,
      comment: 'The iPhone 16 Pro Max from Mobixora arrived in immaculate genuine sealed packaging. PTA approval verified instantly via DIRBS. Amazing fast 2-day delivery to Islamabad!',
      is_verified_purchase: true,
      created_at: '2026-09-28T10:00:00Z',
    },
    {
      id: 2,
      user_id: 2,
      user_name: 'Sara Ali',
      product_id: 2,
      rating: 5,
      comment: 'Samsung Galaxy S24 Ultra is a beast of a machine. Titanium build feels super premium. Best camera zoom I have ever experienced. Mobixora customer service is top tier!',
      is_verified_purchase: true,
      created_at: '2026-09-27T14:30:00Z',
    },
    {
      id: 3,
      user_id: 3,
      user_name: 'Hamza Tariq',
      product_id: 16,
      rating: 5,
      comment: 'AirPods Pro 2 USB-C are 100% original. Noise cancellation on flights and in Karachi traffic is pure magic. Thank you Mobixora for honest genuine service!',
      is_verified_purchase: true,
      created_at: '2026-09-25T16:15:00Z',
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 block mb-1">
            Real Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            What Our Customers Say
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Verified feedback from technology enthusiasts across Pakistan who trust Mobixora.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayReviews.map((r) => {
            const dateStr = r.created_at
              ? new Date(r.created_at).toLocaleDateString('en-PK', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent';

            return (
              <div
                key={r.id}
                className="bg-slate-50/80 rounded-3xl p-6 border border-slate-100 relative flex flex-col justify-between hover:border-slate-200 transition-all hover:shadow-lg"
              >
                <Quote className="absolute top-5 right-5 w-8 h-8 text-slate-200 pointer-events-none" />

                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-6">
                    &ldquo;{r.comment}&rdquo;
                  </p>
                </div>

                {/* Reviewer Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {r.user_name ? r.user_name[0] : 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {r.user_name || 'Verified Customer'}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      {r.is_verified_purchase && (
                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" /> Verified Buyer
                        </span>
                      )}
                      <span>&bull;</span>
                      <span>{dateStr}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
