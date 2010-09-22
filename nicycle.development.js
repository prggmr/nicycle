/*!
 * nicycle Image Slideshow v0.0.0
 * http://www.nwhiting.com/
 *
 * Copyright 2010, Nickolas Whiting
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0.html
 *
 * Date: Wen Sep 22 2010
 */
(function($){
$.nicycle = function(settings){
    
    $.nicycle.config = {
        slideshow : false, // Slideshow ( ul > li )
        navigation: false,  // Navigation Items ( ul > li a )
        animSpeed : 400,
        effect    : 'random',
        boxHeight : function(img) {
            return img.height();
        }, // height of the boxes 
        boxWidth  : 25, // width of the boxes
        mousePause: true, // Pause any animations on mouseover
        cycle     : true, // Cycle the slideshow at a set interval
        cycTimeout: 7500,  // Timeout for the cycle
        zindex    : 5000,
        imagefail : function(slide) { // failed to load the src of an image
            slide.remove();
        },
        generateBoxes: function(cols, rows, box, slide, image) {
            image.css('display', 'none');
            var html = new Array();
            for (var i=0;i!=cols;i++) {
                for (var b=0;b!=rows + 1;b++) {
                    var topPX  = Math.round(i*box.height);
                    var src  = image.attr('src');
                    var leftPX = Math.round(b*box.width);
                    html.push('<div style="position: absolute; top: '+topPX+'px; left: '+leftPX+'px; height: '+box.height+'px; width: '+box.width+'px; background: url('+src+') no-repeat -'+leftPX+'px -'+Math.round(topPX)+'px"></div>');
                }
            }
            slide.append(html.join(''));
        }
    }
    
    $.nicycle.currentSlide   = false;
    $.nicycle.ineffect       = false;
    $.nicycle.effectCallback = false;
    $.nicycle.effectInternalCallback = false;
    
    $.nicycle.events = {
        'internal': {
            'beforeeffect': function() {
                $.nicycle.ineffect = true;
            },
            'aftereffect': function(){
                $.nicycle.ineffect = false;
                if (typeof $.nicycle.effectCallback == 'function') {
                    $.nicycle.effectCallback();
                    $.nicycle.effectCallback = false;
                }
                if (typeof $.nicycle.effectInteralCallback == 'function') {
                    $.nicycle.effectInteralCallback();
                    $.nicycle.effectInteralCallback = false;
                }
            }
        },
        // INIT before loading
        'beforeLoad': false,
        // INIT after Loading
        'afterLoad' : false,
        // Navigation item click callback
        'navCallback': false
    }
    
	if (settings)
        if (settings['events']) {
            eventSetting = settings['events'];
            $.extend($.nicycle.events, eventSetting);
            delete(settings['events']);
        }
		$.nicycle.config = $.extend($.nicycle.config, settings);
    
    $.nicycle.effects = {
        'downfadein': function(a,b) {
            $.nicycle.events.internal.beforeeffect();
            timeBuff = 50;
            // height the element to prepare for effects
            b.css('display', 'none');
            // set element ontop of the current slide
            b.css('z-index', parseFloat(a.css('z-index')) + 1);
            itemHeight = b.attr('nicycle-block-height');
            slides = $('div', b);
            slides.each(function(){
                $(this).css({
                    'opacity': 0.0,
                    'height' : 0
                });
                if (!itemHeight) {
                    itemHeight = $(this).attr('nicycle-block-height');
                }
            });
            b.css('display', 'block');
            slides.each(function(){
                var item = $(this);
                var itemheight = itemHeight;
                setTimeout(function(){
                    item.animate({opacity: 1, height: itemheight}, $.nicycle.config.animSpeed);
                }, (100 + timeBuff));
                timeBuff += 50;
            });
            $.nicycle.events.internal.aftereffect();
        },
        'crossfadein': function(a, b) {
            $.nicycle.events.internal.beforeeffect();
            timeBuff = 50;
            // height the element to prepare for effects
            b.css('display', 'none');
            // set element ontop of the current slide
            b.css('z-index', parseFloat(a.css('z-index')) + 1);
            itemWidth = b.attr('nicycle-block-width');
            itemHeight = b.attr('nicycle-block-height');
            slides = $('div', b);
            slides.each(function(){
                $(this).css({
                    'opacity': 0.0,
                    'width'  : 0,
                    'height' : itemHeight
                });
            });
            b.css('display', 'block');
            slides.each(function(){
                var item = $(this);
                var itemwidth = itemWidth;
                setTimeout(function(){
                    item.animate({opacity: 1, width: itemwidth}, $.nicycle.config.animSpeed);
                }, (100 + timeBuff));
                timeBuff += 50;
            });
            $.nicycle.events.internal.aftereffect();
        },
        'fadeOut': function(a,b) {
            $.nicycle.events.internal.beforeeffect();
            // display the next slide element behind the current
            bzindex = parseFloat(a.css('z-index')) - 1;
            b.css({
                'display': 'block',
                'opacity': 1.0,
                'z-index': bzindex
            });
            itemWidth = b.attr('nicycle-block-width');
            itemHeight = b.attr('nicycle-block-height');
            slides = $('div', b);
            slides.each(function(){
                $(this).css({
                    'opacity': 1,
                    'width'  : itemWidth,
                    'height' : itemHeight
                });
            });
            a.animate({
                opacity: 0.0
            }, $.nicycle.config.animSpeed, function(){
               // bring slide back to opacity but behind new
                a.css({
                    'z-index': bzindex - 2,
                    'opacity': 1.0
                }); 
            });
            $.nicycle.events.internal.aftereffect();
        },
        'fadeIn': function(a,b){
            $.nicycle.events.internal.beforeeffect();
            // display the next slide element behind the current
            bzindex = parseFloat(a.css('z-index')) + 1;
            b.css({
                'display': 'block',
                'opacity': 0.0,
                'z-index': bzindex
            });
            itemWidth = b.attr('nicycle-block-width');
            itemHeight = b.attr('nicycle-block-height');
            slides = $('div', b);
            slides.each(function(){
                $(this).css({
                    'opacity': 1.0,
                    'width'  : itemWidth,
                    'height' : itemHeight
                });
            });
            b.animate({
                opacity: 1.0
            }, $.nicycle.config.animSpeed);
            $.nicycle.events.internal.aftereffect();
        },
        'snakeMidCrossFade': function(a,b){
            timeBuff = 50;
            $.nicycle.events.internal.beforeeffect();
            bzindex = parseFloat(a.css('z-index')) - 1;
            itemWidth = b.attr('nicycle-block-width');
            itemHeight = b.attr('nicycle-block-height');
            b.css({
                'display': 'block',
                'opacity': 0.0
            });
            slides = $('div', b);
            var secondHalf = new Array();
            slides.each(function(){
                secondHalf.push($(this));
            });
            oldslides = $('div', a);
            var firstHalf  = new Array();
            oldslides.each(function(){
                firstHalf.push($(this));
            });
            firstLength  = Math.round(firstHalf.length / 2);
            secondLength = Math.round(secondHalf.length / 2);
            
            for (a=0;a!=secondLength;a++) {
                secondHalf[a].css({
                    'z-index': bzindex,
                    'height' : itemHeight,
                    'width'  : itemWidth,
                    'opacity': 1.0
                });
            }
            for (a=(secondHalf.length-1);a!=secondLength;a--) {
                var item = secondHalf[i];
                var itemwidth = itemWidth;
                secondHalf[a].css({
                    'z-index': bzindex + 2,
                    'height' : itemHeight,
                    'width'  : 0,
                    'opacity': 0.0
                });
                setTimeout(function(){
                    item.animate({opacity: 1, width: itemwidth}, $.nicycle.config.animSpeed);
                }, (100 + timeBuff));
                timeBuff += 25;
            }
            for (var i=0;i!=firstLength;i++) {
                var item = firstHalf[i];
                setTimeout(function(){
                    item.animate({opacity: 0, width: 0}, $.nicycle.config.animSpeed);
                }, (100 + timeBuff));
                timeBuff += 25;
            }
            $.nicycle.events.internal.aftereffect();
        },
        'random': function(a,b){
            var effects = new Array('downfadein', 'crossfadein', 'fadeOut', 'fadeIn');
            effect = Math.floor(Math.random() * effects.length);
            $.nicycle.effects[effects[effect]](a,b);
        }
    };
    
    $.nicycle.random = function() {
        var letters = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        var length  = 8;
        var string  = '';
        for (var i=0; i<length; i++) {
            var sel = Math.round(Math.random() * letters.length);
            string += letters.substring(sel,sel+1);
        }
        return string;
    }
    
    $.nicycle.init = function(config) {
        
        var nicycleid = new Array();
        
        $.nicycle.config.slideshow.each(function(){
            var img = $(this).find('img:first-child');
            //console.log(img);
            if (!img) {} else {
                
                var imageHeight = parseFloat(img.width());
                var imageWidth  = parseFloat(img.height());
                
                // no image laoded
                if (imageHeight == 0 && imageWidth == 0) {
                    $.nicycle.config.imagefail($(this));
                } else {
                    
                    var boxes = {
                        height: typeof $.nicycle.config.boxHeight == 'function'  ? $.nicycle.config.boxHeight(img)  : $.nicycle.config.boxHeight,
                        width : typeof $.nicycle.config.boxWidth  == 'function'  ? $.nicycle.config.boxWidth(img)   : $.nicycle.config.boxWidth
                    }
                    
                    var boxesWidth  = Math.round(parseFloat(Math.round(imageHeight) / parseFloat(boxes.width)));
                    var boxesHeight = Math.round(parseFloat(Math.round(imageWidth) / parseFloat(boxes.height)));
                    
                    var thisRand = $.nicycle.random();
                    $(this).attr('nicycle', thisRand);
                    $(this).attr('ref', thisRand);
                    $(this).attr('nicycle-status', 'hidden');
                    $(this).attr('nicycle-height', imageHeight);
                    $(this).attr('nicycle-width', imageWidth);
                    $(this).attr('nicycle-block-height', boxes.height);
                    $(this).attr('nicycle-block-width', boxes.width);
                    
                    nicycleid.push(thisRand);
                    
                    $.nicycle.config.generateBoxes(boxesHeight, boxesWidth, boxes, $(this), img);
                    
                    if ($.nicycle.currentSlide == false) {
                        $.nicycle.currentSlide = $(this);
                        $(this).css('z-index', $.nicycle.config.zindex);
                        $(this).attr('nicycle-status', 'visible');
                    }
                }
            }
        });
        
        var navigation = $.nicycle.config.navigation;
        if (navigation != false && typeof navigation == 'object') {
            var i = 0;
            navigation.each(function(){
                $(this).attr('nicycle-target', nicycleid[i]);
                $(this).click(function(){
                    if ($.nicycle.config.cycle) {
                        // clear cycle interval
                        window.clearInterval($.nicycle.cycleInterval);
                        $.nicycle.effectInteralCallback = function(){
                            $.nicycle.cycle();
                        }
                    }
                    id = $(this).attr('nicycle-target');
                    if ($.nicycle.currentSlide.attr('nicycle') == id) return false;
                    slide = $('[ref=' + id + ']');
                    $.nicycle.animate(slide);
                    if (typeof $.nicycle.events.navCallback == 'function') {
                        $.nicycle.events.navCallback($(this), $.nicycle.config.navigation);
                    }
                    return false;
                });
                i += 1;
            });
        }
        
        if ($.nicycle.config.mousePause) {
            $.nicycle.config.slideshow.each(function(){
                $(this).hover(function(){
                    $.nicycle.mousepause = true; 
                }, function(){
                    $.nicycle.mousepause = false; 
                });
            });
        }
    
        
        if ($.nicycle.config.cycle) {
            $.nicycle.cycle();
        }
        // trigger the after load effect
        if (typeof $.nicycle.events.afterLoad == 'function') {
            $.nicycle.events.afterLoad($.nicycle.config.slideshow, $.nicycle.config.navigation);
        }
    }
    
    $.nicycle.cycle = function(){
        $.nicycle.cycleInterval = window.setInterval(function(){
            if ($.nicycle.mousepause) return false;
            var slide = false;
            var visible = false;
            var array = new Array();
            $.nicycle.config.slideshow.each(function(){
                array.push($(this));
            });
            for (i=0;i!=array.length;i++) {
                //console.log(array[i].attr('nicycle-status'));
                if (array[i].attr('nicycle-status') == 'hidden') {
                    if (visible) {
                        slide = array[i];
                        break;
                    }
                } else {
                    visible = true;
                }
            }
            if (!slide) {
                // we found a visible but reached the end
                slide = array[0];
            }
            $.nicycle.animate(slide);
        }, $.nicycle.config.cycTimeout);
        return false;
    }
    
    /**
     * Animates the given slide, the slide can be either the ID of the slide generated
     * on init of the container object.
     */
    $.nicycle.animate = function(slide) {
        if (typeof slide != 'object') {
            slide = $('[ref=' + slide + ']', $.nicycle.config.slideshow);
        }
        //console.log($.nicycle.ineffect);
        // current slide status sets to hidden
        $.nicycle.currentSlide.attr('nicycle-status', 'hidden');
        // new slide set as visible
        slide.attr('nicycle-status', 'visible');
        
        // check if effect is custom callback
        if (typeof $.nicycle.config.effect == 'function') {
            
        }
        
        // pass slides to effect function and let it do the rest
        if ($.nicycle.ineffect) {
            $.nicycle.effectCallback = function() {
                if (typeof $.nicycle.config.effect == 'function') {
                    $.nicycle.config.effect($.nicycle.currentSlide, slide);
                } else {
                    $.nicycle.effects[$.nicycle.config.effect]($.nicycle.currentSlide, slide);   
                }
            }
            return false;
        } else {
            if (typeof $.nicycle.config.effect == 'function') {
                $.nicycle.config.effect($.nicycle.currentSlide, slide);
            } else {
                $.nicycle.effects[$.nicycle.config.effect]($.nicycle.currentSlide, slide);   
            }
        }
        // new slide set as current
        $.nicycle.currentSlide = slide;
        return false;
    }
    
    if (typeof $.nicycle.events.beforeLoad == 'function') {
        $.nicycle.events.beforeLoad($.nicycle.config.slideshow, $.nicycle.config.navigation);
    }
    
    // CHROME AND SAFARI IMG LOADING
    
    if (document.readyState && document.readyState != "complete"){
        var interval = window.setInterval(function(){
            if (document.readyState == "complete") {
                $.nicycle.init();
                window.clearInterval(interval);
            }
        }, 1000);
    } else {
        $.nicycle.init();
    }
}
})(jQuery);