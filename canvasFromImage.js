var canvasFromImage = (function ( global, document, undefined )
{
    var hasSameOrigin = (function ( global, document ) {

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

    })( global, document );

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

    function loadImage( img, callback ) 
    {
        var onImageLoaded = function( e ){ callback( e.target ); },
            onDataLoaded = function ( obj )
            {
                img.addEventListener( 'load', onImageLoaded, false );
                img.src = obj.data;
            };

        if ( !hasSameOrigin( img.src ) ) {
            getRemoteImageData( img.src, onDataLoaded );
        } else {
            img.complete 
                ? callback( img ) 
                : img.addEventListener( 'load', onImageLoaded, false );
        }
    }

    function canvasFromImage( img, onCanvasReady, onImageLoaded )
    {
        onImageLoaded = onImageLoaded || function ( img )
        {
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage( img, 0, 0 );
            onCanvasReady( canvas, img );
        };

        loadImage( img, onImageLoaded );
    }

    return canvasFromImage;

})(window, document);
