var canvasFromImage = (function (global, document, undefined){

    var hasSameOrigin = (function ( window, document ) {

        var page = document.location,
            protocol = page.protocol,
            domain = document.domain,
            port = page.port ? ':' + page.port : '',
            sop_string = protocol + '//' + domain + port,
            sop_regex = new RegExp('^' + sop_string),
            http_regex = /^http(?:s*)/,
            data_regex = /^data:/,
            closure = function ( url )
            {
                var is_local = (!http_regex.test(url)) || data_regex.test(url),
                    is_same_origin = sop_regex.test(url);

                return is_local || is_same_origin;
            };

        return closure;

    })( window, document );

    function getRemoteImageData( img_url, callback )
    {
        var page_url = document.location.href,
            secure_root = "https://img-to-json.appspot.com/",
            insecure_root = "http://img-to-json.maxnov.com/",
            secure_regex = /^https:/,
            is_secure = secure_regex.test(img_url) || secure_regex.test(page_url),
            service_root = is_secure ? secure_root : insecure_root,
            cb_stack_name = "cp_remote_image_callbacks",
            cb_stack = cb_stack_name in global ? global[cb_stack_name] : global[cb_stack_name] = [],
            cb_name = cb_stack_name +'['+ cb_stack.length +']',
            service_url = service_root + "?url=" + escape(img_url) + "&callback=" + cb_name,
            script = document.createElement('script');

            cb_stack.push( callback );
            script.src = service_url;
            document.body.appendChild(script);
    };

    /*
      function closePixelate( img, renderOptions ) 
      {

      var local_img = window.hasSameOrigin ? hasSameOrigin( img.src ) : true,
      onLoadLocal = function ( e ) { renderClosePixels( e.target, renderOptions ) },
      onLoadRemote = function ( e ) { closePixelate( e.target, renderOptions ); },
      onDataLoaded = function ( obj )
      {
      var new_img = img.cloneNode(false);
      new_img.addEventListener( 'load', onLoadRemote, false );
      new_img.src = obj.data;
      img.parentNode.replaceChild( new_img, img );
      };

      if ( !local_img ) {
      if (window.getRemoteImageData){ getRemoteImageData( img.src, onDataLoaded ); }
      } else {
      if (img.complete) { renderClosePixels( img, renderOptions ); } 
      else              { img.addEventListener( 'load', onLoadLocal, false ); }
      }

      }
    */
    var forgeImage = function ( img, callback ) {

        var onImageLoaded = function ( event ) {
            callback( event.target );
        };

        if ( !hasSameOrigin( img.src ) ) {
            // remote
            var onDataLoaded = function ( obj ) {
                img.addEventListener( 'load', onImageLoaded, false );
                img.src = obj.data;
            };
            getRemoteImageData( img.src, onDataLoaded );
        } else {
            // local
            if ( img.complete ) {
                callback( img )
            } else {
                img.addEventListener( 'load', onImageLoaded, false ); 
            }
        }
        
    };

    function canvasFromImage( img, onCanvasReady, onImageLoaded )
    {
        var onImageLoaded = function ( img )
        {
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage( img, 0, 0 );
            onCanvasReady( canvas, img );
        };

        forgeImage( img, onImageLoaded);
    }

    return canvasFromImage;
})(window, document);
