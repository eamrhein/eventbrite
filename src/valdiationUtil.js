export const isValidTime = (start, end) => {
  return Date.parse(start) >= Date.parse(end) ? false : true;
};

export const checkCharLimit = (str, limit) => {
  if (str.length <= limit) {
    return true;
  } else return false;
};

export const validationSchema = {
  title: {
    valid: null,
    invalid: null
  },
  date: {
    valid: null,
    invalid: null
  },
  image: {
    valid: null,
    invalid: null
  },
  organizer: {
    valid: null,
    invalid: null
  },
  ticketName: {
    valid: null,
    invalid: null
  },
  numberOfTickets: {
    valid: null,
    invalid: null
  },
  price: {
    valid: null,
    invalid: null
  }
};

export const parseEvent = (
  title,
  desc,
  dateStart,
  dateEnd,
  imgid,
  is_series
) => ({
  event: {
    name: {
      html: title
    },
    description: {
      html: desc
    },
    start: {
      timezone: "America/Los_Angeles",
      utc: dateStart.toJSON().slice(0, 19) + "Z"
    },
    end: {
      timezone: "America/Los_Angeles",
      utc: dateEnd.toJSON().slice(0, 19) + "Z"
    },
    currency: "USD",
    logo_id: imgid,
    is_series
  }
});
