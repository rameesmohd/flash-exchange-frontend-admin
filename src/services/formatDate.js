// const formatDate = (dateString) => {
//     const date = new Date(dateString);
    
//     const options = {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: 'numeric',
//       minute: 'numeric',
//       second: 'numeric',
//       hour12: true
//     };
    
//     return new Intl.DateTimeFormat('en-US', options).format(date);
//   };

export const formatDate = (date, opts) => {
  if (!date) return '—';
 
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
 
  return d.toLocaleString('en-IN', {
    timeZone:  'Asia/Kolkata',
    day:       '2-digit',
    month:     'short',
    year:      'numeric',
    hour:      '2-digit',
    minute:    '2-digit',
    hour12:    true,
    ...opts,
  });
};

export {
    formatDate
}