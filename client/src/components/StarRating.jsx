import { HiStar } from 'react-icons/hi';

/**
 * StarRating component — interactive or display-only.
 * @param {Object} props
 * @param {number} props.rating - Current rating value
 * @param {Function} props.onChange - Callback when rating changes (makes it interactive)
 * @param {number} props.size - Star size (default: 20)
 */
const StarRating = ({ rating = 0, onChange, size = 20 }) => {
  const isInteractive = !!onChange;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => isInteractive && onChange(star)}
          className={`${isInteractive ? 'cursor-pointer hover:scale-125' : 'cursor-default'} transition-transform`}
          disabled={!isInteractive}
        >
          <HiStar
            size={size}
            className={`${
              star <= rating ? 'text-amber-400' : 'text-gray-200'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
