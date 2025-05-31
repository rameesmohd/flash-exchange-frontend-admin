import React, { useState, useEffect } from "react";

const UTCClock = () => {
  const [utcTime, setUtcTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setUtcTime(new Date()); // Update the time every second
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const formatUTC = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
      timeZone: "UTC", // Force UTC
    }).format(date);
  };

  return (
    <>
      {formatUTC(utcTime)}
    </>
  );
};

export default UTCClock;
