var canvas, ctx;
var divInfo1, divInfo2, divInfo3, divInfo4;
var btnAddNodeName, btnCancelNodeName, txtNodeName;
var h, w;
var scrDx = 0;
var scrDy = 0;
var scrStep = 20;
var popupNodeName;
var mouse = { x: 0, y: 0 };
var lastClick = { x: 0, y: 0 };
var initTime = Date.now();
var lastUpdateTime = initTime;
var frames = 0;
var fps;
var nextAutoNodeNumber = 0;
var nodePreName = "Node";
var nodes = {
  "President": {
    "x": 106,
    "y": 432,
    "x0": 52.23388671875,
    "y0": 418.5,
    "width": 107.5322265625,
    "height": 27,
    "name": "President"
  },
  "Vice President": {
    "x": 341,
    "y": 339,
    "x0": 260.1416015625,
    "y0": 325.5,
    "width": 161.716796875,
    "height": 27,
    "name": "Vice President"
  },
  "Director": {
    "x": 378,
    "y": 540,
    "x0": 329.65234375,
    "y0": 526.5,
    "width": 96.6953125,
    "height": 27,
    "name": "Director"
  },
  "Manager": {
    "x": 373,
    "y": 401,
    "x0": 330.07080078125,
    "y0": 387.5,
    "width": 85.8583984375,
    "height": 27,
    "name": "Manager"
  },
  "Supervisor": {
    "x": 361,
    "y": 468,
    "x0": 301.8154296875,
    "y0": 454.5,
    "width": 118.369140625,
    "height": 27,
    "name": "Supervisor"
  },
  "Partridge": {
    "x": 686,
    "y": 310,
    "x0": 632.23388671875,
    "y0": 296.5,
    "width": 107.5322265625,
    "height": 27,
    "name": "Partridge"
  },
  "Gold Rings": {
    "x": 685,
    "y": 445,
    "x0": 625.8154296875,
    "y0": 431.5,
    "width": 118.369140625,
    "height": 27,
    "name": "Gold Rings"
  }
};
var edges = {
  "President": [
    "Vice President",
    //"Director",
    //"Manager",
    //"Supervisor"
  ],
  "Vice President": [
    "Partridge"
  ],
  "Manager": [
    "Partridge",
    "Gold Rings"
  ],
  "Gold Rings": [],
  "Partridge": [
    "Gold Rings"
  ],
  "Director": [
    "Gold Rings"
  ]
};
var nodeFontSize = 18;
var selectedNodeName = "";
var isDragging = false;
var isWaitingName = false;
var draggingNode = null;
var boxSideMargin = 5;
var arrowSize = 17;
var arrowAngle = 15 * (2 * Math.PI / 360);
var nodeBkgColor = "rgba(93, 255, 220, 0.3)";
var edgeLineColor = "rgba(32,32,32,0.6)";

window.onload = function () {
  initDomElements();
  initListeners();
  resize();
  animate();
};

function initDomElements() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  divInfo1 = document.getElementById("info1");
  divInfo1.innerHTML = "Mouse";
  divInfo2 = document.getElementById("info2");
  divInfo3 = document.getElementById("info3");
  divInfo3.innerHTML = "Key";
  divInfo4 = document.getElementById("info4");
  popupNodeName = document.getElementById("popup");
  popupNodeName.style.display = "none";
  btnAddNodeName = document.getElementById("addNodeName");
  btnCancelNodeName = document.getElementById("cancelNodeName");
  txtNodeName = document.getElementById("nodeName");
}

function initListeners() {
  window.onresize = resize;
  window.onkeydown = keyDown;
  window.onkeyup = keyUp;
  window.onmousedown = mouseDown;
  window.onmouseup = mouseUp;
  window.onmousemove = mouseMove;
  canvas.addEventListener('click', canvasClick);
  canvas.addEventListener('mousemove', canvasMouseMove);
  btnAddNodeName.onclick = addNodeName;
  btnCancelNodeName.onclick = HideAddNodeName;
  txtNodeName.onkeyup = validateTxtNodeName;
}

function resize() {
  w = canvas.width = window.innerWidth - canvas.offsetLeft * 2;
  h = canvas.height = window.innerHeight - canvas.offsetTop - 47;
  divInfo2.innerHTML = "Width: " + w + "<br>Height: " + h;
}

function validateTxtNodeName(e) {
  txtNodeName.value = txtNodeName.value.replace(/[^a-zA-Z0-9 _\-\(\))]/g, '');
  if (e.key == "Enter") {
    addNodeName();
  } else if (e.key == "Escape") HideAddNodeName();
}

function keyDown(e) {
  divInfo3.innerHTML = "KeyDown: " + e.key + "<br>Code: " + e.code;
  if (!isWaitingName) {
    if (e.key == "ArrowUp" || e.key == "w") {
      scrDy -= scrStep;
    } else if (e.key == "ArrowDown" || e.key == "s") {
      scrDy += scrStep;
    } else if (e.key == "ArrowLeft" || e.key == "a") {
      scrDx -= scrStep;
    } else if (e.key == "ArrowRight" || e.key == "d") {
      scrDx += scrStep;
    }
  }
  if (e.key == "Escape") {
    isDragging = false;
    draggingNode = null;
    selectedNodeName = "";
  }

}

function keyUp(e) {
  divInfo3.innerHTML = "KeyUp: " + e.key + "<br>Code: " + e.code;
}

function mouseDown(e) {
  mouse.x = e.clientX - canvas.offsetLeft;
  mouse.y = e.clientY - canvas.offsetTop;
  divInfo1.innerHTML = "Mouse: Down" + ((e.buttons == 0) ? "" : " - " + e.buttons) + "<br>X: " + e.clientX + "<br>Y: " + e.clientY;
}

function mouseUp(e) {
  mouse.x = e.clientX - canvas.offsetLeft;
  mouse.y = e.clientY - canvas.offsetTop;
  divInfo1.innerHTML = "Mouse: Up" + ((e.buttons == 0) ? "" : " - " + e.buttons) + "<br>Mouse X: " + mouse.x + "<br>Mouse Y: " + mouse.y;
}

function mouseMove(e) {
  mouse.x = e.clientX - canvas.offsetLeft;
  mouse.y = e.clientY - canvas.offsetTop;
  divInfo1.innerHTML = "Mouse" + ((e.buttons == 0) ? "" : " - " + e.buttons) + "<br>Mouse X: " + mouse.x + "<br>Mouse Y: " + mouse.y;
}

function getNodeInPoint(x, y) {
  x -= scrDx;
  y -= scrDy;
  for (var k in nodes) {
    var n = nodes[k];
    if (x >= n.x0 && x <= (n.x0 + n.width) && y >= n.y0 && y <= (n.y0 + n.height)) {
      return n;
    }
  }
  return null;
};

function canvasMouseMove(e) {
  if (e.buttons == 0 && !isDragging) return;
  if (e.buttons != 0) {
    if (draggingNode != null) {
      draggingNode.x += e.movementX;
      draggingNode.x0 += e.movementX;
      draggingNode.y += e.movementY;
      draggingNode.y0 += e.movementY;
    } else if (!isDragging) {
      isDragging = true;
      selectedNodeName = "";
      draggingNode = getNodeInPoint(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    }
  } else {
    isDragging = false;
    draggingNode = null;
  }
}

function canvasClick(e) {
  lastClick.x = e.clientX - canvas.offsetLeft;
  lastClick.y = e.clientY - canvas.offsetTop;

  var nodeClicked = getNodeInPoint(lastClick.x, lastClick.y);
  if (nodeClicked != null) {
    HideAddNodeName();
    if (selectedNodeName != "" && selectedNodeName != nodeClicked.name) {
      if (!(selectedNodeName in edges)) {
        edges[selectedNodeName] = [];
      }
      if (edges[selectedNodeName].indexOf(nodeClicked.name) >= 0) {
        edges[selectedNodeName].splice(edges[selectedNodeName].indexOf(nodeClicked.name));
        selectedNodeName = "";
        return;
      }
      edges[selectedNodeName].push(nodeClicked.name);
      if (nodeClicked.name in edges && edges[nodeClicked.name].indexOf(selectedNodeName) >= 0) {
        edges[nodeClicked.name].splice(edges[nodeClicked.name].indexOf(selectedNodeName));
      }
      selectedNodeName = "";
      return;
    }
    selectedNodeName = nodeClicked.name;
    return;
  } else {
    if (selectedNodeName != "") {
      selectedNodeName = "";
      return;
    }
  }
  ShowAddNodeName(e.clientX, e.clientY)
}

function ShowAddNodeName(x, y) {
  popupNodeName.style.position = "relative";
  popupNodeName.style.top = y;
  popupNodeName.style.left = x;
  isWaitingName = true;
  popupNodeName.style.display = "block";
  txtNodeName.value = nodePreName + nextAutoNodeNumber.toString();

  txtNodeName.focus();
  txtNodeName.select();
}

function HideAddNodeName() {
  isWaitingName = false;
  popupNodeName.style.display = "none";
  txtNodeName.value = "";
}

function addNodeName() {
  var nodeName = txtNodeName.value.toString().trim();
  if (nodeName in nodes) {
    window.alert("Node '" + nodeName + "' already exists");
    return;
  }
  HideAddNodeName();
  ctx.font = nodeFontSize.toString() + "px monospace";

  var width = ctx.measureText(nodeName).width + boxSideMargin * 2;
  console.log(width);
  var height = nodeFontSize * 1.5;
  var x0 = lastClick.x - scrDx - width / 2;
  var y0 = lastClick.y - scrDy - height / 2;
  nodes[nodeName] = { x: lastClick.x - scrDx, y: lastClick.y - scrDy, x0: x0, y0: y0, width: width, height: height, name: nodeName };
  var endText = 0;
  for (var i = nodeName.length - 1; i >= 0; i--) {
    if (nodeName[i] < '0' || nodeName[i] > '9') {
      endText = i + 1;
      break;
    }
  }
  nodePreName = nodeName.substr(0, endText);
  var n = parseInt(nodeName.substr(endText));
  if (!isNaN(n)) {
    nextAutoNodeNumber = n + 1;
    while (nodePreName + nextAutoNodeNumber in nodes) {
      nextAutoNodeNumber++;
    }
  }

  txtNodeName.value = nodePreName + nextAutoNodeNumber;
}

function animate() {
  frames++;
  var deltaTime = Date.now() - lastUpdateTime;
  lastUpdateTime = Date.now();
  fps = Math.round(frames / ((lastUpdateTime - initTime) / 1000));

  ctx.save();
  ctx.translate(scrDx, scrDy);
  draw();
  ctx.restore();

  requestAnimationFrame(animate);
}

function draw() {

  divInfo4.innerHTML = "FPS: " + fps + "<br>Time: " + Math.trunc((lastUpdateTime - initTime) / 1000) + " s";
  ctx.clearRect(0, 0, w, h);
  for (var k in edges) {
    var e = edges[k];
    var n1 = nodes[k];
    for (var p in e) {
      var n2 = nodes[e[p]];
      var p = edgeType2(n1, n2);
      var n1X = p.n1X;
      var n1Y = p.n1Y;
      var n2X = p.n2X;
      var n2Y = p.n2Y;

      if (n1.name == selectedNodeName || n2.name == selectedNodeName) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";

      } else {
        ctx.lineWidth = 1;
        ctx.strokeStyle = edgeLineColor;
        ctx.fillStyle = edgeLineColor;
      }

      varLine(ctx, n1X, n1Y, n2X, n2Y, 1, 3);
      ctx.beginPath();
      ctx.arc(n1X, n1Y, 3, 0, 6.28);
      ctx.stroke();
      var ang = Math.atan2(n1Y - n2Y, n1X - n2X);
      ctx.beginPath();
      ctx.moveTo(n2X + arrowSize * Math.cos(ang + arrowAngle), n2Y + arrowSize * Math.sin(ang + arrowAngle));
      ctx.lineTo(n2X, n2Y);
      ctx.lineTo(n2X + arrowSize * Math.cos(ang - arrowAngle), n2Y + arrowSize * Math.sin(ang - arrowAngle));
      ctx.stroke();

    }

    for (var k in nodes) {
      var n = nodes[k];
      ctx.fillStyle = nodeBkgColor;
      ctx.fillRect(n.x0, n.y0, n.width, n.height);
      ctx.strokeStyle = "black";
      ctx.lineWidth = (k == selectedNodeName) ? 3 : 1;
      ctx.strokeRect(n.x0, n.y0, n.width, n.height);
      ctx.lineWidth = 1;
      ctx.font = nodeFontSize.toString() + "px monospace";

      ctx.fillStyle = "black";
      ctx.fillText(n.name, n.x0 + boxSideMargin, n.y + nodeFontSize / 4);
    };
  }

  function varLine(ctx, x1, y1, x2, y2, w1, w2) {
    var dx = (x2 - x1);
    var dy = (y2 - y1);
    w1 /= 2; w2 /= 2; // we only use w1/2 and w2/2 for computations.
    // length of the AB vector
    var length = Math.sqrt(dx * dx + dy * dy);
    if (!length) return; // exit if zero length
    dx /= length; dy /= length;
    var shiftx = - dy * w1   // compute AA1 vector's x
    var shifty = dx * w1   // compute AA1 vector's y
    ctx.beginPath();
    ctx.moveTo(x1 + shiftx, y1 + shifty);
    ctx.lineTo(x1 - shiftx, y1 - shifty); // draw A1A2
    shiftx = - dy * w2;   // compute BB1 vector's x
    shifty = dx * w2;   // compute BB1 vector's y
    ctx.lineTo(x2 - shiftx, y2 - shifty); // draw A2B1
    ctx.lineTo(x2 + shiftx, y2 + shifty); // draw B1B2
    ctx.closePath(); // draw B2A1
    ctx.fill();
  }

  function edgeType1(n1, n2) {
    var n1X, n1Y, n2X, n2Y;
    if ((Math.abs(n1.x - n2.x) - (n1.width + n2.width) / 2) > (Math.abs(n1.y - n2.y) - (n1.height + n2.height) / 2)) {
      // Edges from sides
      n1Y = n1.y;
      n2Y = n2.y;
      if (n2.x > n1.x) {
        n1X = n1.x0 + n1.width;
        n2X = n2.x0;
      } else {
        n1X = n1.x0;
        n2X = n2.x0 + n2.width;
      }
    } else {
      // Edges from top/bottom
      n1X = n1.x;
      n2X = n2.x;
      if (n2.y > n1.y) {
        n1Y = n1.y0 + n1.height;
        n2Y = n2.y0;
      } else {
        n1Y = n1.y0;
        n2Y = n2.y0 + n2.height;
      }
    }
    return { n1X: n1X, n1Y: n1Y, n2X: n2X, n2Y: n2Y };
  }

  function edgeType2(n1, n2) {
    var n1X, n1Y, n2X, n2Y;
    var edgeAngle = (Math.atan2(n2.y - n1.y, n2.x - n1.x) + 2 * Math.PI) % (2 * Math.PI);
    // Node 1 exit side
    var p = pointInRectangle((edgeAngle + 2 * Math.PI) % (2 * Math.PI), n1, n2);
    n1X = p.nX;
    n1Y = p.nY;
    // Node 2 entry side
    p = pointInRectangle((edgeAngle + 1 * Math.PI) % (2 * Math.PI), n2, n1);
    n2X = p.nX;
    n2Y = p.nY;
    return { n1X: n1X, n1Y: n1Y, n2X: n2X, n2Y: n2Y };
  }

  function pointInRectangle(entryAngle, n1, n2) {
    var intRectAngle = (Math.atan2(n1.height, n1.width) + 2 * Math.PI) % (2 * Math.PI);
    var nX, nY;
    if (entryAngle < Math.PI / 2) {
      if (entryAngle <= intRectAngle) { // right side
        nX = n1.x0 + n1.width;
        nY = n1.y + (nX - n1.x) * (n2.y - n1.y) / (n2.x - n1.x);
      } else { // bottom side
        nY = n1.y0 + n1.height;
        nX = n1.x + (nY - n1.y) * (n2.x - n1.x) / (n2.y - n1.y);
      }
    } else if (entryAngle < Math.PI) {
      if (entryAngle < Math.PI - intRectAngle) { // bottom side
        nY = n1.y0 + n1.height;
        nX = n1.x + (nY - n1.y) * (n2.x - n1.x) / (n2.y - n1.y);
      } else { // left side
        nX = n1.x0;
        nY = n1.y + (nX - n1.x) * (n2.y - n1.y) / (n2.x - n1.x);
      }
    } else if (entryAngle < (3 * Math.PI / 2)) {
      if (entryAngle <= intRectAngle + Math.PI) { // left side
        nX = n1.x0;
        nY = n1.y + (nX - n1.x) * (n2.y - n1.y) / (n2.x - n1.x);
      } else { // top side
        nY = n1.y0;
        nX = n1.x + (nY - n1.y) * (n2.x - n1.x) / (n2.y - n1.y)
      }
    } else {
      if (entryAngle <= 2 * Math.PI - intRectAngle) { // top side
        nY = n1.y0;
        nX = n1.x + (nY - n1.y) * (n2.x - n1.x) / (n2.y - n1.y)
      } else { // right-side
        nX = n1.x0 + n1.width;
        nY = n1.y + (nX - n1.x) * (n2.y - n1.y) / (n2.x - n1.x);
      }
    }
    return { nX: nX, nY: nY }
  }

}

