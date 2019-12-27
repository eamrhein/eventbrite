import React from "react";
//Day Dropdown list
export const dayOfWeek = () => {
  let days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];
  days = days.map((day, i) => <option key={i}>{day}</option>);
  return days;
};

//Time Dropdown list
export const timeOfDay = () => {
  let times = [];
  let hours, minutes, ampm;
  for (let i = 0; i <= 1440; i += 30) {
    hours = Math.floor(i / 60);
    minutes = i % 60;
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    ampm = hours % 24 < 12 ? "AM" : "PM";
    hours = hours % 12;
    if (hours === 0) {
      hours = 12;
    }
    times.push(
      <option key={i}>
        {hours}:{minutes} {ampm}
      </option>
    );
  }
  return times;
};
