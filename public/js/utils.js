if (!linz) {
    var linz = {};
}

(function  () {

    var loadedScripts = [];

    function addLoadEvent(func) {

        var oldonload = window.onload;

        if (typeof window.onload != 'function') {

            window.onload = func;

        } else {

            window.onload = function() {
              if (oldonload) {
                oldonload();
              }
              func();
            }

        }

    }

    function loadScript(src) {

        if(loadedScripts.indexOf(src) < 0) {
            // script hasn't been added to page, let's add it now
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = src;
            document.body.appendChild(script);
            loadedScripts.push(src);
        }
    }

    function executeContext (context) {

        var args = Array.call();

        if (typeof linz[context] === 'function') {
            linz[context].call(undefined, args);
        }

    }

    linz.loadScript = loadScript;
    linz.addLoadEvent = addLoadEvent;
    linz.executeContext = executeContext;

})();
