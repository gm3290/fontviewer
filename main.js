var doc = document.documentElement;
var toload = 0;
var loaded = 0;
var target = document.body;

var createSVG = function (charsvg, ex, em) {
  var svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");

  pathEl.setAttribute("d", charsvg);
  pathEl.setAttribute("transform", "translate(0," + em + ") scale(1, -1)");
  pathEl.style.fill = "currentColor";

  svgEl.setAttribute("viewBox", "0 0 " + (ex * 1 + 256) + " " + (em * 1 + 256)); //FIXME
  svgEl.appendChild(pathEl);

  return svgEl;
};

var createToggleButton = function () {
  target.innerHTML = "";

  p = document.createElement("p");

  a = document.createElement("a");
  a.href =
    "javascript:document.body.setAttribute('class',document.body.getAttribute('class')==='show-code'?'':'show-code');";
  a.innerText = "[code]";
  p.appendChild(a);

  target.appendChild(p);
};

var parserSvg = function (txt) {
  createToggleButton();
  if (window.DOMParser) {
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(txt, "text/xml");
  } // Internet Explorer
  else {
    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = false;
    xmlDoc.loadXML(txt);
  }
  var glyphs = xmlDoc.getElementsByTagName("glyph");
  var src = "";
  fontFamily =
    xmlDoc.getElementsByTagName("font-face")[0].getAttribute("font-family") ||
    xmlDoc.getElementsByTagName("font")[0].id;

  var g = document.createElement("h2");
  g.innerText = fontFamily;
  target.appendChild(g);

  var ff = xmlDoc.getElementsByTagName("font-face")[0];
  var em = ff.getAttribute("units-per-em");
  var g = document.createElement("pre");
  g.innerText =
    "1em = " + em + "\nfont-weight:" + ff.getAttribute("font-weight") + "\n";
  target.appendChild(g);

  src = "";
  for (var n = 0; n < glyphs.length; n++) {
    var glyph = glyphs[n];
    if (glyph) {
      var char = glyph.getAttribute("unicode");
      var unicode = char ? char.charCodeAt(0).toString(16) : null;
      var charname = glyph.getAttribute("glyph-name");
      var charsvg = glyph.getAttribute("d");
      var ex = glyph.getAttribute("horiz-adv-x") || em;
      src =
        '<dt id="' +
        unicode +
        '" class="glyph"><a href="#' +
        unicode +
        '" class="char" id="svg-' +
        unicode +
        '"></a></dt>';
      src += '<dd class="char-code">' + unicode + "</dd>";
      src += '<dd class="char-name">' + charname + "</dd>";
      var g = document.createElement("dl");
      g.innerHTML = src;
      target.appendChild(g);
      if (charsvg) {
        document
          .getElementById("svg-" + unicode)
          .appendChild(createSVG(charsvg, ex, em));
      }
    }
  }
};

var fileLoaded = function (files) {
  for (var x = 0; x < files.length; x++) {
    var file = files[x];
    console.log("Font loading:", file.size, file.name, file.type);
    /*
	If the file is a font and the web browser supports FileReader,
	append css @font-face rule to the page; Change page`s font
*/

    if (typeof FileReader !== "undefined" && /svg/i.test(file.type)) {
      reader = new FileReader();
      reader.type = file.type;
      reader.onload = (function () {
        return function (evt) {
          var txt = evt.target.result;
          parserSvg(txt);
        };
      })();
      reader.readAsText(file);
    }
  }
};

var init = function () {
  xhr = new XMLHttpRequest();
  xhr.open("GET", "icomoon.svg", false);
  xhr.overrideMimeType("image/svg+xml");
  xhr.onload = function (e) {
    parserSvg(xhr.response);
  };
  xhr.send("");
};

doc.ondragover = function () {
  //this.className = 'hover';
  return false;
};
doc.ondragend = function () {
  //this.className = '';
  return false;
};
doc.ondrop = function (event) {
  event.preventDefault && event.preventDefault();
  this.className = "";

  // now do something with:
  var files = event.dataTransfer.files;
  console.log(files);
  toload = files.length;
  loaded = 0;
  fileLoaded(files);
  return false;
};

init();
