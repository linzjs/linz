if (!linz) {
    var linz = {};
}

(function  () {

    var loadedScripts = [];

    // Append instead of replace the onload process.
    function addLoadEvent (func) {

        if (window.attachEvent) {
            return window.attachEvent('onload', func);
        }

        if (window.addEventListener) {
            return window.addEventListener('load', func, false);
        }

        return document.addEventListener('load', func, false);

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

    linz.loadScript = loadScript;
    linz.addLoadEvent = addLoadEvent;

})();
