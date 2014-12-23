/*-- author david website http://www.imokya.com --*/
var app = app || {
	init:function(opts) {
		$.extend(this, opts);
		this.threshhold = 50;
		this.page = 1;
		this.index = 1;
		this.dir = 1;
		this.tweening = false;
		var template = $("#template").html();
		this.pages = $(template).filter(".page");
		this.total = this.pages.size();
		this.preload();
	},
	preload:function() {
		var self = this;
		var totalToLoad = imagesToPreload.length;
		var count = 0;
		for(var i = 0; i < totalToLoad; i++) {
			var image = new Image();
			image.onload = function() {
				if(++count == totalToLoad) {
					self.onLoad();
				}
			}
			image.src = "img/"+imagesToPreload[i];
		}
	},
	onLoad:function() {
		$("#loader").remove();
		$(".arrow").show();
		$("#sound").show();
		this.initView();
		this.initListener();
		this.reset();
	},
	initView:function() {
		this.h = $(window).height();
		this.views = $(".view");
		this.curView = this.views.eq(1);
		this.preView = this.views.eq(0);
		this.nexView = this.views.eq(2);
	},
	initListener:function() {
		this.canTouch = !!("ontouchstart" in document);
		this.click = this.canTouch ? "touchstart" : "click";
		var eventBegan = this.canTouch ? "touchstart" : "mousedown";
		var eventMoved = this.canTouch ? "touchmove" : "mousemove";
		var eventEnded = this.canTouch ? "touchend" : "mouseup";
		document.addEventListener(eventBegan, this.onBegan.bind(this), false);
		document.addEventListener(eventMoved, this.onMoved.bind(this), false);
		document.addEventListener(eventEnded, this.onEnded.bind(this), false);
	},
	transitionEnd:function(e) {
		this.views.removeClass("trans");
		this.tweening = false;
		this.reset();
	},
	onBegan:function(e) {
		if(this.tweening) return;
		this.sy = this.canTouch ? e.changedTouches[0].pageY : e.pageY;
	},
	onMoved:function(e) {
		e.preventDefault();
		if(this.tweening) return;
		this.my = this.canTouch ? e.changedTouches[0].pageY : e.pageY;
		this.dy = this.my - this.sy;
		this.ay = Math.abs(this.dy);
		this.dir = this.dy > 0 ? 0 : 1;		
		if(this.type != 3) {
			var lockU = $(this.curPage).hasClass("lockUp");
			var lockD = $(this.curPage).hasClass("lockDown");
			if(this.dir == 1) {
				if(!lockU) this.moveU();
			} else {
				if(!lockD) this.moveD();
			}
		}
	},
	onEnded:function(e) {
		if(this.tweening) return;
		this.views.addClass("trans");
		this.ey = this.canTouch ? e.changedTouches[0].pageY : e.pageY;
		var ay = Math.abs(this.ey - this.sy);
		var ty,ts;
		var lockU = $(this.curPage).hasClass("lockUp");
		var lockD = $(this.curPage).hasClass("lockDown");
		if(this.dir == 1) {
			if(ay < this.threshhold) {
				 this.restoreU();
			} else {
				if(!lockU) this.endU();
			}
			
		} else {
			if(ay < this.threshhold) {
				if(!lockD) this.restoreD();
			} else {
				if(!lockD) this.endD();
			}
		}
		this.tweening = (lockU || lockD) ? false : true;
		this.page = this.page > this.total ? 1 : this.page;
		this.page = this.page < 1 ? this.total : this.page;
		this.index = this.index > 3 ? 1 : this.index;
		this.index = this.index < 1 ? 3 : this.index;
		
	},
	moveU:function() {
		if(this.type == 1) {
			var ty = parseInt(this.h + this.dy);
			var ts = (1-this.ay/this.h*0.1);
			this.nexView.css({
				"-webkit-transform":"translate3d(0px,"+ty+"px,0px)"
			});
			this.curView.css({
				"-webkit-transform":"scale("+ts+")"
			});
		} else {
			var cy = parseInt(this.dy);
			var ny = this.h + cy;
			this.nexView.css({
				"-webkit-transform":"translate3d(0px,"+ny+"px,0px)"
			});
			this.curView.css({
				"-webkit-transform":"translate3d(0px,"+cy+"px,0px)"
			});
		}
	},

	moveD:function() {
		if(this.type == 1) {
			var ty = parseInt(this.dy);
			var ts = 0.8 + (this.ay/this.h*0.2);
			this.preView.css({
				"-webkit-transform":"scale("+ts+")"
			});
			this.curView.css({
				"-webkit-transform":"translate3d(0px,"+ty+"px,0px)"
			});
		} else {
			var cy = parseInt(this.dy);
			var ny = -this.h + cy;
			this.preView.css({
				"-webkit-transform":"translate3d(0px,"+ny+"px,0px)"
			});
			this.curView.css({
				"-webkit-transform":"translate3d(0px,"+cy+"px,0px)"
			});
		}
	},
	restoreU:function() {
		if(this.type == 1) {
			this.nexView.css({
				"-webkit-transform":"translate3d(0px,100%,0px)"
			});
			this.curView.css({
				"-webkit-transform":"scale(1)"
			});
		} else {
			this.nexView.css({
				"-webkit-transform":"translate3d(0px,100%,0px)"
			});
			this.curView.css({
				"-webkit-transform":"translate3d(0px,0px,0px)"
			});
		}
	},
	restoreD:function() {
		if(this.type == 1) {
			this.preView.css({
				"-webkit-transform":"scale(0.8)"
			});
			this.curView.css({
				"-webkit-transform":"translate3d(0px,0px,0px)"
			});
		} else {
			this.preView.css({
				"-webkit-transform":"translate3d(0px,-100%,0px)"
			});
			this.curView.css({
				"-webkit-transform":"translate3d(0px,0px,0px)"
			});
		}
	},
	endU:function() {
		if(this.type == 1) {
			this.nexView.css({
				"-webkit-transform":"translate3d(0px,0px,0px)"
			});
			this.curView.css({
				"-webkit-transform":"scale(0.8)"
			});
		} else {
			var ty = -this.h;
			this.nexView.css({
				"-webkit-transform":"translate3d(0px,0px,0px)"
			});
			this.curView.css({
				"-webkit-transform":"translate3d(0px,"+ty+"px,0px)"
			});
		}
		this.page++ ;
		this.index++;
	},
	endD:function() {
		if(this.type == 1) {
			this.preView.css({
				"-webkit-transform":"scale(1)"
			});
			this.curView.css({
				"-webkit-transform":"translate3d(0px,100%,0px)"
			});
		} else {
			var ty = this.h;
			this.preView.css({
				"-webkit-transform":"translate3d(0px,0px,0px)"
			});
			this.curView.css({
				"-webkit-transform":"translate3d(0px,"+this.h+"px,0px)"
			});
		}
		this.page--;
		this.index--;
	},
	reset:function() {
		var cur = this.page;
		var nex = cur + 1 > this.total ? 1 : cur + 1;
		var pre = cur - 1 < 1 ? this.total : cur - 1;
		this.curPage = this.pages[cur-1];
		this.nexPage = this.pages[nex-1];
		this.prePage = this.pages[pre-1];
		
		var curIndex = this.index;
		var nexIndex = curIndex + 1 > 3 ? 1 : curIndex + 1;
		var preIndex = curIndex - 1 < 1 ? 3 : curIndex - 1;
		
		this.curView = this.views.eq(curIndex-1);
		this.nexView = this.views.eq(nexIndex-1);
		this.preView = this.views.eq(preIndex-1);
		
		this.curView.empty().append(this.curPage);
		this.nexView.empty().append(this.nexPage);
		this.preView.empty().append(this.prePage);
		if(this.type == 1) {
			this.preView.css({
				"-webkit-transform":"translate3d(0px,0px,0px) scale(0.8)",
				zIndex:1
			});
			this.curView.css({
				zIndex:100,
				"-webkit-transform":"translate3d(0px,0px,0px) scale(1)",
			});
			this.nexView.css({
				"-webkit-transform":"translate3d(0px,100%,0) scale(1)",
				 zIndex:101
			});
		} else {
			this.preView.css({
				"-webkit-transform":"translate3d(0px,-100%,0px) scale(1)",
				zIndex:1
			});
			this.curView.css({
				zIndex:100,
				"-webkit-transform":"translate3d(0px,0px,0px) scale(1)",
			});
			this.nexView.css({
				"-webkit-transform":"translate3d(0px,100%,0) scale(1)",
				 zIndex:101
			});
		}
		this.views.off();
		this.curView.on("webkitTransitionEnd", this.transitionEnd.bind(this));
		this.page = cur;
	},
	turnTo:function(page) {
		if(this.tweening) return;
		this.views.addClass("trans");
		var nex = page;
		var nexPage = this.pages[nex-1];
		this.nexView.empty().append(nexPage);
		this.nexView.css({
			"-webkit-transform":"translate3d(0px,0px,0px)"
		});
		this.curView.css({
			"-webkit-transform":"scale(0.8)"
		});
		this.page = page;
		this.tweening = true;
	}
};

$(function() {
	app.init({type:1});
});