#!/bin/sh

echo "window._env_ = {" > /usr/share/nginx/html/config.js
echo "  REACT_APP_BACKEND_URL: \"${REACT_APP_BACKEND_URL}\"" >> /usr/share/nginx/html/config.js
echo "}" >> /usr/share/nginx/html/config.js

echo "Injected runtime environment variables:"
cat /usr/share/nginx/html/config.js
