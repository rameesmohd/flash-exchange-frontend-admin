const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

export {
    formatDate
}