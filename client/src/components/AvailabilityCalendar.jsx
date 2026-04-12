import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths, isBefore, startOfDay } from 'date-fns';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

/**
 * AvailabilityCalendar — shows booked/unavailable dates.
 */
const AvailabilityCalendar = ({ bookedDates = [], onDateSelect, selectedStart, selectedEnd }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfDay(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startPadding = getDay(startOfMonth(currentMonth));
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const checkBookedStatus = (date) => {
    const startOfD = startOfDay(date);
    const endOfD = new Date(startOfD.getTime() + 24 * 60 * 60 * 1000 - 1);
    
    let partial = false;
    for (const b of bookedDates) {
      const bStart = new Date(b.start);
      const bEnd = new Date(b.end);

      // full coverage
      if (bStart <= startOfD && bEnd >= endOfD) {
        return 'full';
      }
      // partial coverage
      if (startOfD < bEnd && endOfD > bStart) {
        partial = true;
      }
    }
    return partial ? 'partial' : 'none';
  };

  const isPast = (date) => isBefore(date, today);

  const isSelected = (date) => {
    if (selectedStart && isSameDay(date, selectedStart)) return true;
    if (selectedEnd && isSameDay(date, selectedEnd)) return true;
    return false;
  };

  const isInRange = (date) => {
    if (!selectedStart || !selectedEnd) return false;
    return date > selectedStart && date < selectedEnd;
  };

  const handleDateClick = (date) => {
    if (isPast(date) || checkBookedStatus(date) === 'full') return;
    if (onDateSelect) onDateSelect(date);
  };

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <HiChevronLeft className="text-lg text-slate-600" />
        </button>
        <h3 className="font-semibold text-slate-800">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <HiChevronRight className="text-lg text-slate-600" />
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-slate-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Padding for start */}
        {[...Array(startPadding)].map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {days.map((date) => {
          const status = checkBookedStatus(date);
          const past = isPast(date);
          const selected = isSelected(date);
          const inRange = isInRange(date);
          const disabled = status === 'full' || past;

          return (
            <button
              key={date.toString()}
              onClick={() => handleDateClick(date)}
              disabled={disabled}
              className={`
                h-9 rounded-lg text-sm font-medium transition-all relative overflow-hidden
                ${disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-primary-50 cursor-pointer'}
                ${status === 'full' ? 'bg-red-50 text-red-300 line-through' : ''}
                ${status === 'partial' && !selected && !inRange ? 'text-slate-800 border-b-2 border-red-300' : ''}
                ${selected ? 'bg-primary-700 text-white hover:bg-primary-800' : ''}
                ${inRange ? 'bg-primary-100 text-primary-800' : ''}
                ${!disabled && !selected && !inRange && status !== 'partial' ? 'text-slate-700' : ''}
              `}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-primary-700" />
          Selected
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-50 border border-red-200" />
          Fully Booked
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-b-2 border-red-300 bg-white" />
          Partially Booked
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-primary-100" />
          In Range
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
