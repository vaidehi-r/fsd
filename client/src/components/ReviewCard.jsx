import StarRating from './StarRating';
import { format } from 'date-fns';

const ReviewCard = ({ review }) => {
  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-start gap-3">
        {/* User avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
          {review.user?.avatar?.url ? (
            <img src={review.user.avatar.url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-white text-sm font-bold">{(review.user?.name || review.user?.fullName || 'U')[0]?.toUpperCase()}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-800 text-sm">{review.user?.name || review.user?.fullName || 'User'}</h4>
            <span className="text-xs text-slate-400">
              {format(new Date(review.createdAt), 'MMM d, yyyy')}
            </span>
          </div>
          <StarRating rating={review.rating} size={16} />
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">{review.comment}</p>

          {/* Owner reply */}
          {review.ownerReply && (
            <div className="mt-3 ml-4 pl-4 border-l-2 border-primary-200 bg-primary-50/50 rounded-r-lg p-3">
              <p className="text-xs font-semibold text-primary-700 mb-1">Owner's Reply</p>
              <p className="text-sm text-slate-600">{review.ownerReply}</p>
              {review.ownerRepliedAt && (
                <p className="text-xs text-slate-400 mt-1">
                  {format(new Date(review.ownerRepliedAt), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
