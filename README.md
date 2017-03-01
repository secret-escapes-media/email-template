Steps to install
==================

1. __Rename microsite__

All microsites on secret escapes are hosted under a unique sub directory. Complete a find and replace across the project for "email-template" and replace all with the new name. Also rename the route folder to the same name.


2. __Gulp & Bower install__

run the following commands in terminal to install all of the components (npm might need sudo):
- npm install
- bower install


3. __Build the site__

Run the default command "gulp" which will build the jekyll site & watch for changes. There is another task, "gulp compress", which should be run before uploading the final site.