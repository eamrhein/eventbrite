import apikey from '../token';
import { parsePrice } from '../valdiationUtil';

export async function createEvent(data) {
  const res = await fetch(
    `https://www.eventbriteapi.com/v3/organizations/64592771355/events/?token=${apikey}`,
    {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  if (!res.ok) {
    throw new Error('Event Data is Incomplete');
  }
  const resData = await res.json();
  return resData;
}

export async function createSeries(id, occurrence_duration, recurrence_rule) {
  const res = await fetch(
    `https://www.eventbriteapi.com/v3/events/${id}/schedules/?token=${apikey}`,
    {
      method: 'post',
      body: JSON.stringify({
        schedule: {
          occurrence_duration,
          recurrence_rule,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  const data = await res.json();
  console.log(data);
  return data;
}

export async function createTicket(id, cost, count, name) {
  let res;
  cost = parsePrice(cost);
  if (cost === '000') {
    res = await fetch(
      ` https://www.eventbriteapi.com/v3/events/${id}/ticket_classes/?token=${apikey}`,
      {
        method: 'post',
        body: JSON.stringify({
          ticket_class: {
            name,
            quantity_total: count,
            free: true,
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } else {
    res = await fetch(
      ` https://www.eventbriteapi.com/v3/events/${id}/ticket_classes/?token=${apikey}`,
      {
        method: 'post',
        body: JSON.stringify({
          ticket_class: {
            name,
            quantity_total: count,
            cost: `USD, ${cost}`,
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
  if (!res.ok) {
    throw new Error('Ticket Info is Incorrect');
  }
  const data = await res.json();
  return data;
}

export async function publishEvent(id) {
  const res = await fetch(
    `https://www.eventbriteapi.com/v3/events/${id}/publish/?token=${apikey}`,
    {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  if (!res.ok) {
    throw new Error('Could Not Publish Event');
  }
  return res.json();
}
export async function getUploadSignature() {
  const fetchToken = await fetch(
    `https://www.eventbriteapi.com/v3/media/upload/?type=image-event-logo&token=${apikey}`,
  );
  const data = await fetchToken.json();
  return data;
}

export async function uploadImage(img, url, args) {
  const formData = new FormData();
  for (const name in args) {
    formData.append(name, args[name]);
  }
  formData.append('file', img);
  try {
    const config = {
      method: 'POST',
      body: formData,
    };
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response;
  } catch (err) {
    console.log(err.message);
  }
}

export async function getUploadedUrl(token) {
  try {
    const formData = new FormData();
    formData.append('upload_token', token);
    const response = await fetch(
      `https://www.eventbriteapi.com/v3/media/upload/?token=${apikey}`,
      {
        method: 'POST',
        body: formData,
      },
    );
    return await response.json();
  } catch (err) {
    console.log(err.message);
  }
}
