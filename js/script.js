// Custom scripts goes here
(function() {
    
    // Initialize carousel
    carouselInit();  

    // Portfolio filters function
    portfolioFilters();

})();

var KOL_Embed = {
	
  base_api_path : "//api.kickofflabs.com/", 

  api_image_path : function(image)
  {
    return this.base_api_path + 'embed/v1/images/social/' + image;
  }, 

	embedUtilities : {


		getParameterByName : function(name)
		{
		  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		  var regexS = "[\\?&]" + name + "=([^&#]*)";
		  var regex = new RegExp(regexS);
		  var results = regex.exec(window.location.href);
		  if(results == null)
		    {return null;}
		  else
		    {return decodeURIComponent(results[1].replace(/\+/g, " "));}
		},
		
		placeholderIsSupported : function() {
        var test = document.createElement('input');
        return ('placeholder' in test);
    },

    apply_placeholder : function(ph) {

      if(this.placeholderIsSupported()) return true;

      var email = document.getElementById("kol-signup-email");

      email.style.color = "gray";
      email.value = ph;

      email.onfocus = function() {
      if (this.style.color == "gray")
      { this.value = ""; this.style.color = "black" }
      }

      email.onblur = function() {
      if (this.value == "")
      { this.style.color = "gray"; this.value = ph; }
      }

    },

    getSafeSocialParameter : function() {
      return KOL_Embed.embedUtilities.getParameterByName('kid') || KOL_Embed.embedUtilities.getParameterByName('s');
    },
	
	setEmbedDefaults : function (data){
	
		//set defaults. 
		var defaults = {
			signup_text		: "Enter your email to subscribe:", 
			placeholder_text : "Type your email here...",
			button_text : "Subscribe", 
			share_text : "Thanks! Use this link to share with your friends:",
			promote_text: "Check this out!",
			influenced_count_text: "So far you've influenced:", 
			button_css_class: "button", 
	    input_css_class: "input",
	    error_message: "Please enter a valid email address.",
			callback_function: "KOLSubscribeCallback", 
      error_callback_function: "KOLErrorSubscribeCallback", 
      enable_analytics: false, 
      timeout: 10000
			
		};
	
		return jQuery.extend( defaults, data );
	
	}

	},


/*		KickoffLabs API jQuery Plugin	*/
	LoadPlugin : function() {
		(function( jQuery ) {
			jQuery.fn.configure_signup_form = function() {
				// Do your awesome plugin stuff here
				var e = jQuery(this);

				var embedData = KOL_Embed.embedUtilities.setEmbedDefaults(e.data());
			
	
				var html = '<form id="kol-signup-form">';
				html += '<div class="kol-signup-input">';
				html += '<label class="kol-signup-label" for="kol-signup-email">'+embedData.signup_text+'</label></div>';
				html += '<input type="text" size="30" name="email" id="kol-signup-email" class="kol-signup-email '+embedData.input_css_class+'" placeholder="'+embedData.placeholder_text+'" />';
				html += '<button type="submit" id="kol-signup-submit" class="kol-signup-submit '+embedData.button_css_class+'" >'+embedData.button_text+'</button>';
				html += '<input id="social_id" type="hidden" name="social_id" value="'+KOL_Embed.embedUtilities.getSafeSocialParameter() +'" />';
				html += '</div></form>';
        if (embedData.enable_analytics) {
          html += "<div style='display:none;'><img src='" + KOL_Embed.base_api_path + "stats/" + embedData.landing_page_id + "/" + new Date().getTime() + "?r=" + encodeURI(document.referrer || '') +  "' height='1' width='1'/></div>" 
        }
				e.html(html);
				
				setTimeout(function(){
				  KOL_Embed.embedUtilities.apply_placeholder(embedData.placeholder_text);				  
				}, 50);
			};
		})( jQuery );
	
		jQuery('#kickofflabs_embed_form').configure_signup_form();
		jQuery('#kol-signup-form').submit(function(e) {
      e.preventDefault();
	    KOL_Embed.KOLSubscribe();
	  });
	},

  callback_function : function(callback_error, email, data) {
    var fn = window[data.error_callback_function];
    if(typeof fn === 'function'){
      fn(callback_error, email, data);
    }else {
      alert(data.error_message);
    }
  }, 


	KOLSubscribe : function() {
		var form = jQuery('#kickofflabs_embed_form');
		var email = jQuery('#kol-signup-email').val();
		var embedData = KOL_Embed.embedUtilities.setEmbedDefaults(form.data());
		if(email) {			
			var url = KOL_Embed.base_api_path + 'v1/' +embedData.landing_page_id + '/subscribe';
			jQuery.ajax({
				url: url,
				data: jQuery('#kol-signup-form').serialize(), 
				dataType: 'jsonp',
				jsonp: 'jsonp',
				jsonpCallback: embedData.callback_function,
				timeout: embedData.timeout,
				error: function(xhr, ajaxOptions, thrownError) {
          KOL_Embed.callback_function(true, email, embedData);
        }
        
			});
		}
		else {
      KOL_Embed.callback_function(false, email, embedData);
		}
	}


  
};

if (window.jQuery === undefined) {
	//get jQuery
	var script_tag = document.createElement('script');
    script_tag.setAttribute("type","text/javascript");
    script_tag.setAttribute("src","//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js")
    script_tag.onload = function() { KOL_Embed.LoadPlugin(); }; // Run once jQuery has loaded
    script_tag.onreadystatechange = function () { // Same thing but for IE
      if (this.readyState == 'complete' || this.readyState == 'loaded') { KOL_Embed.LoadPlugin(); }
    }
	document.getElementsByTagName("head")[0].appendChild(script_tag);	
}
else{
	KOL_Embed.LoadPlugin();
}

function KOLShareLink(data){
  data = jQuery.extend( {height: 400, width: 800}, data );

	return "<a title='" + data.title + "' class='embed_share embed_service_link' href='#' data-url='" + data.url + "' data-width='" + data.width + "' data-height='" + data.height + "'><img src='" + KOL_Embed.api_image_path(data.image) + "'' alt='"+ data.title + "' height='32' width='32' /></a>";
}

function KOLSubscribeCallback (data) {
	var e = jQuery('#kickofflabs_embed_form');
	var embedData = KOL_Embed.embedUtilities.setEmbedDefaults(e.data());
  var social_url = encodeURIComponent(data.social_url);

	var s = "<div class='kol_embed_share_result'><div id=\"appreciation\" class=\"post_submit\"><p>"+embedData.share_text+"</p></div>";

	s += '<p><a href="'+data.social_url+'">'+data.social_url+'</a></p><p>';

  s += KOLShareLink({
    title: 'Facebook', 
    image: 'facebook.png', 
    url: 'https://www.facebook.com/sharer.php?u=' + social_url+ 't=Caring%20is%20sharing'
  }); 

  s += KOLShareLink({
    title: 'Twitter', 
    image: 'twitter.png', 
    height: 300, 
    url: 'https://twitter.com/share?url='+ social_url + '&text=' + encodeURIComponent(embedData.promote_text) 
  }); 

  s += KOLShareLink({
    title: 'LinkedIn', 
    image: 'linkedin.png', 
    url: '//www.linkedin.com/shareArticle?mini=true&url='+ social_url
  }); 

  s += KOLShareLink({
    title: 'Google+', 
    image: 'google_plus.png', 
    url: 'https://plusone.google.com/_/+1/confirm?hl=en&url='+ social_url + '&title=' + encodeURIComponent(embedData.promote_text)
  }); 

	s += "<a title='Email' class='embed_share' href='mailto:?subject="+encodeURIComponent(embedData.promote_text)+"&body="+encodeURIComponent(data.social_url)+"'><img src='" + KOL_Embed.api_image_path('email.png') + "' alt='Email' height='32' width='32' /></a></p>";

	s +=  "<div class='kol_influenced'><p><span id=\"influence\" class=\"post_submit\">"+embedData.influenced_count_text+"<span class=\"direct_influence\"> "+data.influence.direct+"</span></span></div></p></div>";

	e.html(s);

  $('#kickofflabs_embed_form .embed_service_link').click(function(event){
    event.preventDefault();
    var $link = $(this);
    var dimensions = 'width=' + $link.data('width') + ',height=' + $link.data('height');
	  window.open($link.data('url'), '_blank', dimensions);
  });
}

function KOLErrorSubscribeCallback (callback_error, email, data) {
  alert(data.error_message);
}


// Function to animate the height of carousel in case of slides with different heights
function carouselInit() {
    var carousel = $('#myCarousel'),
        defaultHeight = carousel.find('.active').height();

    // setting the default height
    carousel.css('min-height', defaultHeight);

    // animate the container height on any slider transitiom
    carousel.bind('slid', function() {
        var itemheight = carousel.find('.active').height();

        carousel.css('min-height', itemheight);
        carousel.animate({
            height: itemheight
        }, 50 );
    });
}


// Function to style the map in the contact page, change lat and lng vars to create your own map
function mapInit() {
    // Create an array of styles.
    var styles =   [
        {
            stylers: [      
                { saturation: -100 }
            ]
        },{
            featureType: 'road',
            elementType: 'geometry',
            stylers: [
                { lightness: 100 },
                { visibility: 'simplified' }
            ]
        },{
            featureType: 'road',
            elementType: 'labels',
            stylers: [
                { visibility: 'off' }
            ]
            }
        ],
        // put your locations lat and long here
        lat = 51.607,
        lng = -0.12248,

        // Create a new StyledMapType object, passing it the array of styles,
        // as well as the name to be displayed on the map type control.
        styledMap = new google.maps.StyledMapType(styles,
            {name: 'Styled Map'}),

        // Create a map object, and include the MapTypeId to add
        // to the map type control.
        mapOptions = {
            zoom: 14,
            scrollwheel: false,
            center: new google.maps.LatLng( lat, lng ),
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP]
            }
        },
        map = new google.maps.Map(document.getElementById('map'),
            mapOptions),
        charlotte = new google.maps.LatLng( lat, lng ),

        marker = new google.maps.Marker({
                                        position: charlotte,
                                        map: map,
                                        title: "Hello World!"
                                    });


        //Associate the styled map with the MapTypeId and set it to display.
        map.mapTypes.set('map_style', styledMap);
        map.setMapTypeId('map_style');
}

function portfolioFilters() {
    var filters = $('.thumbnail-filters');
    
    filters.on('click', 'a', function(e) {
        var active = $(this),
            portfolio = filters.next();
            activeClass = active.data('filter');

        
        filters.find('a').removeClass('active');
        active.addClass('active');
        
        if ( activeClass == 'all') {
            portfolio.find('li').removeClass('inactive');
        } else {
            portfolio.find('li').removeClass('inactive').not('.filter-' + activeClass ).addClass('inactive');
        }
        

        e.preventDefault();
    });
}