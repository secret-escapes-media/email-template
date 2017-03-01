Jekyll Email Template
==================

Once site is built and running all email display content is housed in the index.html file. Email settings, e.g subject line, theme colours and campaign links are in config.yml

Theme colours are seperated into the config.yml file to allow it to be used as a variable in inline styling. It is also setup in the core.scss file as SASS variables to be used across the stylesheets.

At the moment CSS styles are setup the same as in the old templates with inline styling per element, and responsive CSS in the <head>. However the <style> section in <head> is set to process and pull in the SCSS files. So this will be explored further to see if we can do some more sophisticated styling with proper CSS. 