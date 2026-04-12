/**
 * Convert an array of booking objects to CSV format.
 * @param {Array} bookings - Array of booking documents (populated)
 * @returns {String} CSV string
 */
export const bookingsToCSV = (bookings) => {
  const headers = [
    'Booking ID',
    'Car Title',
    'Customer Name',
    'Customer Email',
    'Start Date',
    'End Date',
    'Total Days',
    'Subtotal',
    'Commission',
    'Damage Deposit',
    'Total Amount',
    'Status',
    'Payment Status',
    'Created At',
  ];

  const rows = bookings.map((booking) => [
    booking._id.toString(),
    booking.car?.title || 'N/A',
    booking.user?.name || 'N/A',
    booking.user?.email || 'N/A',
    new Date(booking.startDate).toLocaleDateString(),
    new Date(booking.endDate).toLocaleDateString(),
    booking.totalDays,
    booking.subtotal,
    booking.commission,
    booking.damageDeposit,
    booking.totalAmount,
    booking.status,
    booking.paymentStatus,
    new Date(booking.createdAt).toLocaleDateString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((field) => {
        // Escape fields containing commas or quotes
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ),
  ].join('\n');

  return csvContent;
};
