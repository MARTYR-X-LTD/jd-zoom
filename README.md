# jd-zoom

Zoom-in for images.

- Simple
- Minimal DOM requirements. Just your image and a container.
- Relies on CSS transform functions — scale and translate.
- Because of that, it is smooth af.
- Scales the image to 100% their resolution, display scaling aware. Crisp images as they should.
- Super high resolution screen or image already big enough? Forces to a fallback scaling ratio.
- WITH A COOL ZOOM-IN ANIMATION THAT MAKES SENSE.

Caveats:

- No mobile support. Only desktop. At least for now. I may have to use [hammer.js](https://hammerjs.github.io/) to make it work.

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

As you can see, it also listens for `scroll` and `resize` window events, so it will zoom-out the image if these events happen. Feel free to change any of these to your needs.

If there's a change in the size or position of the elements while the zoom effect is active, it won't dynamically update. The user needs to zoom-out and zoom-in again to recalculate the values. This is a extremely specific use-case which I don't really know how it could even work from a UX perspective, but you can make it dynamic if you wish. The function `calculateConstants()` should be called inside `moveImg()` for it to work. Beware of possible performance hits.


