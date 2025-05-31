const formatDate = (dateString) => {
  const date = new Date(dateString);

  const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
      timeZone: 'UTC'  // Force UTC
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
};



  const formatDateStringAsDate = (dateString) => {
    const date = new Date(dateString);
    
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const getCurrentWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Calculate the date of the last Sunday (or today if it's Sunday)
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - dayOfWeek); // Sunday

    // Calculate the date of the next Saturday
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // Saturday

    // Format the start and end dates
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const startDate = firstDayOfWeek.toLocaleDateString('en-US', options);
    const endDate = lastDayOfWeek.toLocaleDateString('en-US', options);
    
    // Split the formatted strings
    const startParts = startDate.split(' ');
    const endParts = endDate.split(' ');

    // Extracting month, day, and year to construct the final string
    const startMonth = startParts[0];
    const startDay = startParts[1];
    const endDay = endParts[1];
    const year = startParts[2];

    // Construct the final string without extra commas
    return `${startMonth} ${startDay}–${endDay} ${year}`.replace(/,\s*–/g, '–'); // Remove any comma before the dash
};


const getDateRange = (selectedDate) => {
  const today = new Date();
  let createdAtFrom, createdAtTo;

  switch (selectedDate.key) {
    case '1': // Last 3 days
      createdAtFrom = new Date(today);
      createdAtFrom.setDate(today.getDate() - 3);
      createdAtTo = today;
      break;

    case '2': // Last 7 days
      createdAtFrom = new Date(today);
      createdAtFrom.setDate(today.getDate() - 7);
      createdAtTo = today;
      break;

    case '3': // Last 30 days
      createdAtFrom = new Date(today);
      createdAtFrom.setDate(today.getDate() - 30);
      createdAtTo = today;
      break;

    case '4': // Last 3 months
      createdAtFrom = new Date(today);
      createdAtFrom.setMonth(today.getMonth() - 3);
      createdAtTo = today;
      break;

    case '5': // Custom date
      // Handle custom date logic here, perhaps by prompting the user for input.
      // For simplicity, let's assume it's set to empty.
      createdAtFrom = ''; // Set according to the user's custom input
      createdAtTo = ''; // Set according to the user's custom input
      break;

    default:
      createdAtFrom = '';
      createdAtTo = '';
  }

  // Format the dates to the desired format (e.g., YYYY-MM-DD)
  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // Formats to YYYY-MM-DD
  };

  return {
    createdAtFrom: formatDate(createdAtFrom),
    createdAtTo: formatDate(createdAtTo),
  };
};



export {
    formatDate,
    formatDateStringAsDate,
    getCurrentWeekDates,
    getDateRange
}