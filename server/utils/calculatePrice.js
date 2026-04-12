/**
 * Calculate the total price for a booking based on start and end dates.
 * Applies different rates for weekdays vs weekends (Saturday/Sunday).
 *
 * @param {Date} startDate - Booking start date
 * @param {Date} endDate - Booking end date
 * @param {Number} pricePerDay - Weekday price
 * @param {Number} weekendPricePerDay - Weekend price
 * @param {Number} commissionPercent - Platform commission percentage
 * @param {Number} damageDeposit - Optional damage deposit amount
 * @returns {Object} Price breakdown
 */
export const calculateBookingPrice = (
  startDate,
  endDate,
  pricePerDay,
  weekendPricePerDay,
  commissionPercent = 10,
  damageDeposit = 0
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let subtotal = 0;
  const dailyBreakdown = [];

  const diffInMs = end - start;
  const totalDays = Math.max(1, Math.ceil(diffInMs / (1000 * 60 * 60 * 24))); // Minimum 1 day

  for (let i = 0; i < totalDays; i++) {
    const current = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dayPrice = isWeekend ? weekendPricePerDay : pricePerDay;

    subtotal += dayPrice;
    dailyBreakdown.push({
      date: new Date(current),
      price: dayPrice,
      isWeekend,
    });
  }

  const commission = Math.round((subtotal * commissionPercent) / 100 * 100) / 100;
  const totalAmount = Math.round((subtotal + commission + damageDeposit) * 100) / 100;

  return {
    totalDays,
    pricePerDay,
    weekendPricePerDay,
    subtotal: Math.round(subtotal * 100) / 100,
    commission,
    commissionPercent,
    damageDeposit,
    totalAmount,
    dailyBreakdown,
  };
};
