rd /s /q _public
start /B "" "\Program Files (x86)\Google\Chrome\Application\chrome.exe" "--disable-web-security"

node_modules/.bin/brunch watch --server
