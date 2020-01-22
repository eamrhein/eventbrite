import React from 'react';
// Create Day Dropdown list
export const dayOfWeek = () => {
  let days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  days = days.map((day) => <option>{day}</option>);
  return days;
};

// Crate Time Dropdown list
export const timeOfDay = (offset = 0) => {
  const times = [];
  let hours; let minutes; let
    ampm;
  for (let i = 300 + offset; i <= 1340; i += 30) {
    hours = Math.floor(i / 60);
    minutes = i % 60;
    if (minutes < 10) {
      minutes = `0${minutes}`;
    }
    ampm = hours % 24 < 12 ? 'AM' : 'PM';
    hours %= 12;
    if (hours === 0) {
      hours = 12;
    }
    times.push(
      <option key={i}>
        {hours}
:
        {minutes}
        {' '}
        {ampm}
      </option>,
    );
  }
  return times;
};

// rounds a javascript Date object  to the nearest half hour
export const roundDate = (date, hours) => {
  date.setDate(date.getDate() + 1);
  date.setHours(hours, 0, 0, 0);
  return date;
};

// sets the time of a Date Object
export const appendTime = (date, timeString) => {
  // resets the time
  date.setHours(0, 0, 0, 0);
  // Split hours minutes and am / pm for calculation
  const twelveHourtimeArray = timeString.split(' ');
  const ampm = twelveHourtimeArray[1];
  const timeArray = twelveHourtimeArray[0].split(':');
  let hours = parseInt(timeArray[0]);
  const minutes = parseInt(timeArray[1]);
  // if it is PM add 12 hours
  if (hours === 12) {
    hours = 0;
  }
  if (ampm === 'PM') {
    hours += 12;
  }
  // set hours and minutes to new hours minutes
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// sets the date of a Date object
export const createDate = (date, dateString) => {
  const dateArray = dateString.split('-');
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const year = parseInt(dateArray[0]);
  const month = parseInt(dateArray[1] - 1);
  const day = parseInt(dateArray[2]);
  const newDate = new Date(year, month, day, hours, minutes, 0, 0);
  return newDate;
};

export const parse12htime = (date) => {
  let dateString = date.toLocaleTimeString();
  dateString = dateString.slice(0, 4) + dateString.slice(7);
  return dateString;
};

export const parseDate = (date) => {
  const year = date.getFullYear().toString();
  let month = (date.getMonth() + 1).toString();
  month = month < 10 ? `0${month}` : month;
  let day = date.getDate().toString();
  day = day < 10 ? `0${day}` : day;
  return `${year}-${month}-${day}`;
};

export const calcDuration = (start, end) => (Date.parse(end) - Date.parse(start)) / 1000;
