import Quill from 'quill';

const DraggableImage = function(quill, options) {
  this.quill = quill;
  this.options = options;
  this.dragging = false;
  this.resizing = false;
  this.img = null;

  this.quill.root.addEventListener('mousedown', this.handleMouseDown.bind(this), true);
  document.addEventListener('mousemove', this.handleMouseMove.bind(this));
  document.addEventListener('mouseup', this.handleMouseUp.bind(this));

  // Listen for image resize events
  this.quill.on('text-change', (delta, oldDelta, source) => {
    if (source === 'user') {
      delta.ops.forEach(op => {
        if (op.insert && op.insert.image) {
          this.updateQuillContents(this.quill.getSelection().index - 1);
        }
      });
    }
  });
};

DraggableImage.prototype.handleMouseDown = function(event) {
  if (event.target && event.target.tagName === 'IMG') {
    this.img = event.target;
    const rect = this.img.getBoundingClientRect();
    
    // Check if we're in the resize area (bottom-right corner)
    const resizeAreaSize = 20; // px
    if (event.clientX > rect.right - resizeAreaSize && event.clientY > rect.bottom - resizeAreaSize) {
      this.resizing = true;
      this.startWidth = rect.width;
      this.startHeight = rect.height;
    } else {
      this.dragging = true;
      this.startX = event.clientX - rect.left;
      this.startY = event.clientY - rect.top;
    }
    
    event.preventDefault();
  }
};

DraggableImage.prototype.handleMouseMove = function(event) {
  if (this.dragging) {
    event.preventDefault();
    const rect = this.img.parentNode.getBoundingClientRect();
    const newX = event.clientX - rect.left - this.startX;
    const newY = event.clientY - rect.top - this.startY;
    this.updateImagePosition(newX, newY);
  } else if (this.resizing) {
    event.preventDefault();
    const rect = this.img.getBoundingClientRect();
    const newWidth = this.startWidth + (event.clientX - rect.right);
    const newHeight = this.startHeight + (event.clientY - rect.bottom);
    this.updateImageSize(newWidth, newHeight);
  }
};

DraggableImage.prototype.handleMouseUp = function() {
  if (this.dragging || this.resizing) {
    this.updateQuillContents();
  }
  this.dragging = false;
  this.resizing = false;
  this.img = null;
};

DraggableImage.prototype.updateImagePosition = function(x, y) {
  if (this.img) {
    this.img.style.transform = `translate(${x}px, ${y}px)`;
  }
};

DraggableImage.prototype.updateImageSize = function(width, height) {
  if (this.img) {
    this.img.style.width = `${width}px`;
    this.img.style.height = `${height}px`;
  }
};

DraggableImage.prototype.updateQuillContents = function(index) {
  if (this.img) {
    const blot = Quill.find(this.img);
    if (blot) {
      index = index || this.quill.getIndex(blot);
      this.quill.updateContents([
        { retain: index },
        { 
          attributes: { 
            style: this.img.style.cssText,
            width: this.img.width,
            height: this.img.height
          }
        }
      ]);
    }
  }
};

Quill.register('modules/draggableImage', DraggableImage);

export default DraggableImage;