// to get the real render size of the image
function getRenderedSize(contains, cWidth, cHeight, width, height, pos) {
  var oRatio = width / height,
    cRatio = cWidth / cHeight;
  return function () {
    if (contains ? (oRatio > cRatio) : (oRatio < cRatio)) {
      this.width = cWidth;
      this.height = cWidth / oRatio;
    } else {
      this.width = cHeight * oRatio;
      this.height = cHeight;
    }
    this.left = (cWidth - this.width) * (pos / 100);
    this.right = this.width + this.left;
    return this;
  }.call({});
}
function getImgSizeInfo(img) {
  var pos = window.getComputedStyle(img).getPropertyValue('object-position').split(' ');
  return getRenderedSize(true,
    img.width,
    img.height,
    img.naturalWidth,
    img.naturalHeight,
    parseInt(pos[0]));
}
//------------------------------------------------------------

function calculateConstants(element) {
  // scaleBrowser calc here because resolution could change when the page is running.
  // Yeah, chances of this happening are < 0.01% but calculating it is cheap
  const scaleBrowser = 1 / window.devicePixelRatio

  const imgZoom = element.querySelector("img[jd-zoom-image]")
  // get the full resolution image size
  const img_height = imgZoom.naturalHeight
  const img_width = imgZoom.naturalWidth

  // get the currently rendered image size
  const img_width_r = getImgSizeInfo(imgZoom).width
  const img_height_r = getImgSizeInfo(imgZoom).height

  // 100 = extra pixels that I want the image to be able to exceed the window width
  const max_width_render = (window.innerWidth * window.devicePixelRatio) + 600
  let compensation_max_width = max_width_render / img_width

  const max_height_render = (window.innerHeight * window.devicePixelRatio) + 800
  let compensation_max_height = max_height_render / img_height

  // compensation will always try to make the image to scale
  // to the width of the screen (plus 100px), no matter if the image is smaller or bigger
  // if the image is smaller than the width of the screen, ignore it
  if (compensation_max_width > 1) {
    compensation_max_width = 1
  }

  if (compensation_max_height > 1) {
    compensation_max_height = 1
  }

  let compensation_max

  if (compensation_max_height <= compensation_max_width) {
    compensation_max = compensation_max_height
  } else {
    compensation_max = compensation_max_width
  }

  // calculate the scale to display it at full res
  // scale at 100% image → let scaleImage = img_width / img_width_r * scaleBrowser
  let scaleImage = img_width / img_width_r * scaleBrowser * compensation_max
  
  // if scaleImage results in a small number (very high resolution/DPI),
  // or image has a small resolution, force a minimum scaling
  if (scaleImage < 1.4) {
    scaleImage = 1.4
  }

  // consider padding and margins from the image
  imgZoom.padLeft = parseFloat(getComputedStyle(imgZoom).paddingLeft)
  imgZoom.padRight = parseFloat(getComputedStyle(imgZoom).paddingRight)
  imgZoom.padTop = parseFloat(getComputedStyle(imgZoom).paddingTop)
  imgZoom.padBottom = parseFloat(getComputedStyle(imgZoom).paddingBottom)
  imgZoom.marginLeft = parseFloat(getComputedStyle(imgZoom).marginLeft)
  imgZoom.marginRight = parseFloat(getComputedStyle(imgZoom).marginRight)
  imgZoom.marginTop = parseFloat(getComputedStyle(imgZoom).marginTop)
  imgZoom.marginBottom = parseFloat(getComputedStyle(imgZoom).marginBottom)

  // all the sides will be simetric and equal in size nonetheless
  const extraWidth = imgZoom.padLeft + imgZoom.padRight + imgZoom.marginLeft + imgZoom.marginRight
  const extraHeight = imgZoom.padTop + imgZoom.padBottom + imgZoom.marginTop + imgZoom.marginBottom

  // extra padding in px when zoom-in. Sometimes adding padding via CSS is messy.
  extraWidth += 50
  extraHeight += 50

  return {
    extraWidth: extraWidth,
    extraHeight: extraHeight,
    scaleImage: scaleImage,
    imgHeightRender: img_height_r,
    imgWidthRender: img_width_r,
  }
}

function moveImg(e) {
  const imgZoom = e.currentTarget.querySelector("img[jd-zoom-image]")
  const bounds = e.currentTarget.getBoundingClientRect()
  const v = e.currentTarget.imgConstants

  // position in px relative to the element
  // e.offsetX and e.offsetY are fucked up. This calc works
  const x = e.clientX - bounds.left
  const y = e.clientY - bounds.top
  // percentage relative to the element
  const xP = x / bounds.width
  const yP = y / bounds.height

  // 0.5 needed because transform-origin is at the center
  const posX_img = (xP - 0.5) * ((-v.imgWidthRender - v.extraWidth) * v.scaleImage + bounds.width)
  const posY_img = (yP - 0.5) * ((-v.imgHeightRender - v.extraHeight) * v.scaleImage + bounds.height)
  if (needForRAF) {
    needForRAF = false;   // no need to call rAF up until next frame
    window.requestAnimationFrame(function() {
      needForRAF = true;  // rAF now consumes the movement instruction so a new one can come
      imgZoom.style.transform = `translate(${posX_img}px, ${posY_img}px) scale(${v.scaleImage})`
    }); // request 60fps animation
  }; 
}

function jdZoomOut(element) {
  element.removeEventListener('mouseleave', jdZoomOut)
  element.removeEventListener('mousemove', moveImg)
  element.classList.remove("on-zoom-in")
  element.jdZoomActive = false
  window.requestAnimationFrame(function() {
    element.querySelector("img[jd-zoom-image]").style.transform = null
  })
}


function jdZoomOutEvent(e) {
  jdZoomOut(e.currentTarget)
}

function jdZoomEnabler(element) {
  element.addEventListener("click", e => {
    e.preventDefault()
    if (element.classList.contains("on-zoom-in")) {
      jdZoomOut(element)
    } 
    else {
      if (e.target.hasAttribute('jd-zoom-image')) {
        element.jdZoomActive = true
        element.classList.add("on-zoom-in")
        // Calculations here, assuming the DOM won't change size
        // while the image is being zoomed-in.
        // A listener to a window resize event to remove
        // jd-zoom from the image could be handy.
        // to make it dynamic relative to the DOM,
        // calculateConstants should be executed inside moveImg()
        element.imgConstants = calculateConstants(element)

        // initial animation from click and then the event
        // will handle it
        moveImg(e)
        element.addEventListener('mousemove', moveImg)
        element.addEventListener('mouseleave', jdZoomOutEvent)

        // timeout to get rid of transition while moving the cursor
        // looks so bad, none of the hacky ways tried work anyway
        // best thing is to just set the transition to a reasonable time
        // and similar to this easing: cubic-bezier(0.22, 0.61, 0.36, 1);
        /*
        setTimeout(function(){
          element.querySelector("img[jd-zoom-image]").style.transition = '.2s';
        }, 200)
        */
      }
    }
  })
}

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