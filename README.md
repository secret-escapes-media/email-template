# Email generator

Using Jekyll and Gulp this system allows us to generate consistent branded emails built on the Secret Escapes DLS foundation. This includes trading emails, general communication, announcements and partnership campaign templates.




## Progressive enhancement
Built following the hybrid email methodology, these templates are fully responsive across all email clients and devices. The framework is built mobile first on a foundation that is strong and reliable on all necessary email clients including Outlook 2007+, Windows 10 Mail and Gmail.

Through progressive enhancement based on classes and styles in `<head>`, we can improve the appearance in supported email clients. This means typography scales up depending on breakpoints, buttons have different scaling for better hierarchy and small stylistic additions like shadows and rounded corners can be applied.




## Template hierarchy

#### 1. Communication
Beginning with the simplest, the communication template is intended to be used for purely information updates that are not focused on conversion or interaction.

Example [here](http://m-stg.secretescapes.com/uk/templates/email-2020/communication.html)


#### 2. Trading
The general trading email is for use in normal day-to-day emailing of deals. It allows for a title and message that is relevant to the days selection before presenting a long list of deals.

Example [here](http://m-stg.secretescapes.com/uk/templates/email-2020/trading.html)


#### 3. Promotion
This is an evolution of the trading template built to carry a stronger promotional message with a high impact design. It is to be used sparingly so that it doesn't begin to feel normal to customers.

The template introduces an image area below the title which can be expanded to any height. This allows for integrating a destination image, or campaign creative as necessary. Along with this is an overlapping content block to present the campaign message in full.

Example [here](http://m-stg.secretescapes.com/uk/templates/email-2020/promotion.html)


#### 4. Super
The premium template, this is to be reserved for truly hero campaigns where we want maximum cut-through. It should be used for important campaigns such as Black Friday or Valentines Day which run across multiple channels as a company-wide initiative.

The differentiator for this template is the high impact banner which presents a large image with the logo overlaid at the top. It can be extended to any height, to house highly engaging imagery or a campaign creative. Text content is kept separate from the image to allow full creative control over image selection, without concern over placement and legibility of text. The logo and text still feel integrated however with fades on top and bottom.

Example [here](http://m-stg.secretescapes.com/uk/templates/email-2020/super.html)




## Foundations

This framework is created in-line with the Secret Escapes DLS foundation styles which ensure designs are visually consistent and we provide a natural user journey from email design to site.

Examples of the foundations in use can be seen [here](http://m-stg.secretescapes.com/uk/templates/email-2020/)




## Content management

#### Locales
Within the `/data/locale` directory we have `.yml` files for all available territories. These can be applied to a template by changing the locale variable. To add a new locale to the builder create a new file within this folder, and it will be accessible within your templates by setting the locale to the name of your new file.

If any strings need to be changed or updated for languages it can be done directly within these `.yml` files.

#### Project setup
Initial steps need to be taken when you begin a new project in the `config.yml`. Choose your locale, and if this is a partnership campaign fill in the variables. If it's not a partnership simply delete or comment the partner variables out.

```yaml
locale: "uk | de"
partner:
  name: Partner Name
  link: "#partner-link"
  logo-width: 110
  logo-min-width: 90 # mobile & fallback
```

#### Page front matter
All emails should begin with the following setup:

```yaml
layout: "communication | trading | promotion | super"
subject-line:
preheader:
page-link: # default link if not set within the components
terms-and-conditions: # this will load into the footer/legal.html component
```

#### Components
To populate components with data we create objects in the page front-matter which consist of config and an array of items. For example:

```yaml
two-col:
  config:
    row-gutter: 30
    col-gutter: 30
    align: center
  items:
    - image: 16-9.jpg
      content:
        - title: Your guide to Marrakech's markets
          style: xl
        - paragraph: Cum sociis natoque penatibus et magnis dis parturient montes.
          style: lg
        - button: Read more
```

##### Component config options
The config settings will apply to all items in the loop so we can define things like spacing, styles and links.

| key | values | description |
| --- | --- | ---
| config.link | url | Applies the URL to applicable elements |
| config.row-gutter | px value | Space below component |
| config.col-gutter | px value | Space between columns |
| config.align | center, left, right | Aligns text & buttons |
| config.height | px value | Sets height on a row for vertical alignment |
| config.background | hex value | Sets background colour of component |
| config.theme | dark, light | Changes the text colour to suit |
| config.alternating | true | Makes a row.html component alternate text/image sides |

##### Component items
When this data is applied to an HTML include, it will loop over the items, applying the config settings and item content & styles. In writing the data for an item the first level defines the object link, image, and content. Content is an array of rows, with each row being an element.

| key | values | description |
| --- | --- | ---
| item.link | url | Applies link to applicable elements in the item |
| item.image | filename + filetype | Places the image into chosen component block |
| item.content | array of elements | List of content elements with styles |

| item.content | description |
| - | -
| title & paragraph | These can receive `style` and `color` attributes |
| text-link | `text-link` is displayed text, `link` is the URL. This can receive `style` and `color` attributes |
| button | `button` is the label, `link` is the URL, `style` is colouring, `scale` is size |
| promo | `promo` is the code, `before` displays text before, `after` displays text after, `color` sets the border colour |
| hr | `hr` sets the total height of the element, `width` sets the width, `color` sets the border colour |
| space | `space` sets the height, `color` sets the background colour |



## Components

#### Sale cards
The sale card components are designed in-line with the core site styles to build brand recognition and inspire confidence through familiarity.

![Offer image](http://m-stg.secretescapes.com/uk/templates/email-2020/example-images/offer.jpg)

Data for a sale needs to be input in the following format which will populate the component includes.
```yaml
- title: Soak in Slovenia's thermal springs
  attribute: Editors pick
  location: Slovenia
  description: Discover Slovenia from the 4-star Riske Terme thermal resort. Incl. half board, car rental, luxury spa entry, thermal baths & return flights!
  price: 389
  price-description: per room per night
  saved: 40%
  expires: 2019/10/26
  image: https://travelbird-images.imgix.net/4c/2a/4c2a5de4b4fd3ce9d3a5b23840afb7aa?auto=compress%2Cformat&crop=faces%2Cedges%2Ccenter&dpr=2&fit=crop&h=700&w=1050
  link: https://co.uk.sales.secretescapes.com/115743/thermal-slovenia/
```

