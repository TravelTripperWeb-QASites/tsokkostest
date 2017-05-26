 
    $(document).ready(function() { 
    // added below line to remove default padding of 10px for <p> where <p> tag has <img> tag in it. as <p> tag is added by regions for <img> tag.
    $("img").parent("p").css({margin:0});

    $(".carousel-inner .item").css({
            width: $(window).width(),
            height: $(window).height()
        }); 
           
         

          $("#owl-demo").owlCarousel({
            items : 1,
            loop: true,
            nav:true,
            navText: [  "<i class='fa fa-angle-left' aria-hidden='true'></i>", "<i class='fa fa-angle-right' aria-hidden='true'></i>" ], 
            lazyLoad : true, 
            autoplay:false
          });
          $("#owl-demo2").owlCarousel({
            items : 1,
            loop: true,
            nav:true,
            navText: [  "<i class='fa fa-angle-left' aria-hidden='true'></i>", "<i class='fa fa-angle-right' aria-hidden='true'></i>" ], 
            lazyLoad : true, 
            autoplay:false
          });   

          $("#owl-gallery").owlCarousel({
            items : 1,
            loop: true,
            nav:true,
            navText: [  "<i class='fa fa-angle-left' aria-hidden='true'></i>", "<i class='fa fa-angle-right' aria-hidden='true'></i>" ], 
            lazyLoad : true, 
            autoplay:true
          });  

           smoothScroll.init({
            offset: 120,
           });
		   
		   //Menu Resize function here
		   
		   $(window).scroll(function (event) {
			var y = $(this).scrollTop(); //set position from top in pixels
			if (y >= 300) {
        $('.navbar-right').css("padding-right","0px");
				$('#mainNav').addClass('resized');
			} else {
				$('#mainNav').removeClass('resized');
         $('.navbar-right').css("padding-right","30px");
			}
			});
		
if ($('#back-to-top').length) {
    var scrollTrigger = 100, // px
        backToTop = function () {
            var scrollTop = $(window).scrollTop();
            if (scrollTop > scrollTrigger) {
                $('#back-to-top').addClass('show');
            } else {
                $('#back-to-top').removeClass('show');
            }
        };
    backToTop();
    $(window).on('scroll', function () {
        backToTop();
    });
    $('#back-to-top').on('click', function (e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: 0
        }, 700);
    });
}
    

//dynamic image load on each refresh 
//Add your images, we'll set the path in the next step
    var images = ['/images/details/details_banner1.jpg', '/images/details/details_banners2.jpg', '/images/details/details_banners3.jpg'];
    
//Build the img, then do a bit of maths to randomize load and append to a div. Add a touch off css to fade them badboys in all sexy like.
    $('.inner-banner.details').css('background-image', ' url('+images[Math.floor(Math.random() * images.length)] + ')');


     var getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
                sURLVariables = sPageURL.split('&'),
                sParameterName,
                i;

            for (i = 0; i < sURLVariables.length; i++) {
                sParameterName = sURLVariables[i].split('=');

                if (sParameterName[0] === sParam) {
                    return sParameterName[1] === undefined ? true : sParameterName[1];
                }
            }
    };
   
    var submitsuccess = getUrlParameter('submit');
    if(submitsuccess){
         $('.alert-success').css("display","block");
    }else{
        $('.alert-success').css("display","none");
    }

   
$('.date1, .date2, .date3').datepicker({ dateFormat: 'yy-mm-dd'});
   
});


 