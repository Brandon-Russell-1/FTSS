rm -fR

node_modules\.bin\brunch build -P

node_modules\.bin\jade app\_app.jade -o _public

mv _public\_app.html _public\app.html