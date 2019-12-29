export const isValidTime = (start, end) => {
  return Date.parse(start) >= Date.parse(end) ? false : true;
};

export const checkCharLimit = (str, limit) => {
  if (str.length <= limit) {
    return true;
  } else return false;
};
