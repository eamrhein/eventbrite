export const isValidTime = (start, end) => (!(Date.parse(start) >= Date.parse(end)));

export const checkCharLimit = (str, limit) => {
  if (str.length <= limit) {
    return true;
  } return false;
};

export const validationSchema = {
  title: {
    valid: null,
    invalid: null,
  },
  date: {
    valid: null,
    invalid: null,
  },
  image: {
    valid: null,
    invalid: null,
  },
  organizer: {
    valid: null,
    invalid: null,
  },
  ticketName: {
    valid: null,
    invalid: null,
  },
  numberOfTickets: {
    valid: null,
    invalid: null,
  },
  price: {
    valid: null,
    invalid: null,
  },
};

export const parseEvent = (
  title,
  desc,
  dateStart,
  dateEnd,
  imgid,
  is_series,
) => ({
  event: {
    name: {
      html: title,
    },
    description: {
      html: desc,
    },
    start: {
      timezone: 'America/Los_Angeles',
      utc: `${dateStart.toJSON().slice(0, 19)}Z`,
    },
    end: {
      timezone: 'America/Los_Angeles',
      utc: `${dateEnd.toJSON().slice(0, 19)}Z`,
    },
    currency: 'USD',
    logo_id: imgid,
    is_series,
  },
});

export const parsePrice = (cost) => {
  if (cost === '' || cost === 0) return 0;
  const priceArr = cost.split('.');
  if (priceArr.length > 1) {
    return priceArr.join('');
  }
  return (parseFloat(cost) * 100);
};
