(function templatePolyfill (d) {

    // if the browser supports template, we don't need this polyfil
    if('content' in d.createElement('template')) {
        return false;
    }

    // to allow styling
    document.createElement('template');

    // loop through each instance of a template tag, and shim
    $(document).ready(function () {

        var qPlates = d.getElementsByTagName('template'),
            plateLen = qPlates.length,
            elPlate,
            qContent,
            contentLen,
            docContent;

        for(var x=0; x<plateLen; ++x) {

            elPlate = qPlates[x];
            qContent = elPlate.childNodes;
            contentLen = qContent.length;
            docContent = d.createDocumentFragment();

            while(qContent[0]) {
            docContent.appendChild(qContent[0]);
            }

            elPlate.content = docContent;

        }

    });

})(document);
