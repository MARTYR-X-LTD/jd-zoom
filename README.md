# jd-zoom

Zoom-in for images.

## Demo

Look [here](https://martyr.shop/products/torn-paper-definitive) and [here](https://martyr.shop/products/dust-2)

Cool, uh? 😎 

## Features

- Simple
- AN AWESOME ZOOM-IN ANIMATION THAT MAKES SENSE.
- Minimal DOM requirements. Just your image and a container.
- Relies on CSS transform functions — scale and translate.
- Because of that, it is smooth af.
- Scales the image up to 100% their resolution, display scaling aware. Depends on the window width and height. Change that part of the code if you need a different behaviour.
- Super high resolution screen or image already big enough? Forces the image to upscale to a fallback amount (x1.4 default).

### Caveats

- No mobile support. Only desktop. At least for now. I may have to use [hammer.js](https://hammerjs.github.io/) to make it work.
- No configuration. Change parts of the code to suit your need. It should be pretty straightforward anyways, as the code is well commented

jd because I was listening to Joy Division when I thought about the name.

## How to use it

Include the stylesheet in the `head`, or copy it to your .css

```html
<link rel="stylesheet" href="jd-zoom.css">
```

Place the attribute `jd-zoom` in a simple container for the image. And the attribute `jd-zoom-image` for the image to be zoomed.

```html
<div jd-zoom>
  <img jd-zoom-image src="https://images.unsplash.com/photo-1657735794570-c1fa44886b12?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8">
</div>
```

Call the script at the end of `body` tag

```html
<script defer src="jd-zoom.js"></script>
</body>
```

That's it.


The code at the end of jd-zoom.js is responsible to make events for each `jd-zoom` found in the DOM.

```javascript
const jdZoomContainers = document.querySelectorAll("[jd-zoom]")
for (const element of jdZoomContainers) {
  jdZoomEnabler(element)
}

['scroll', 'resize'].forEach(evt =>
  window.addEventListener(evt, e => {
    for (const element of jdZoomContainers) {
      jdZoomOut(element)
    }
  })
)
```

## Configuration

No configuration available for now. Code is well documented and simple enough that making changes should be easy.

## Tips

- As you can see, it also listens for `scroll` and `resize` window events, so it will zoom-out the image if these events happen. Feel free to change any of these to your needs.

- If there's a change in the size or position of the elements while the zoom effect is active, it won't dynamically update. The user needs to zoom-out and zoom-in again to recalculate the values. This is a extremely specific use-case which I don't really know how it could even work from a UX perspective, but you can make it dynamic if you wish. The function `calculateConstants()` should be called inside `moveImg()` for it to work. Beware of possible performance hits.

- In `jd-zoom.css` you can comment out the line `overflow: hidden` to set the zoom effect free from the boundaries of the container. It can look cool. I use it in [martyr—](https://martyr.shop/products/torn-paper-definitive) 🙃