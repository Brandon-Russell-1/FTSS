rm -fR

node_modules\.bin\brunch build -P

pause

node_modules\.bin\jade app\_app.jade

mv app\_app.html _public\app.html