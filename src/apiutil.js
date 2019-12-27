import apikey from "./token";

export function createEvent(data) {
  fetch(
    `https://www.eventbriteapi.com/v3/organizations/64592771355/events/?token=${apikey}`,
    {
      method: "post",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json"
      }
    }
  )
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      console.log(data);
    });
}

export async function getUploadSignature() {
  const fetchToken = await fetch(
    `https://www.eventbriteapi.com/v3/media/upload/?type=image-event-logo&token=${apikey}`
  );
  const data = await fetchToken.json();
  return data;
}

export async function uploadImage(img, url, args) {
  const formData = new FormData();
  for (const name in args) {
    formData.append(name, args[name]);
  }
  formData.append("file", img);
  try {
    const config = {
      method: "POST",
      body: formData
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
    formData.append("upload_token", token);
    const response = await fetch(
      `https://www.eventbriteapi.com/v3/media/upload/?token=${apikey}`,
      {
        method: "POST",
        body: formData
      }
    );
    return await response.json();
  } catch (err) {
    console.log(err.message);
  }
}
