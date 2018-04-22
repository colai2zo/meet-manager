'use strict';
function post (path, data) {
  return window.fetch(path, {
    method: 'POST',
    xhrFields: {withCredentials: true},
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
}

