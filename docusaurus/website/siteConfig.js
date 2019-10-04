// List of projects/orgs using your project for the users page.
const users = [
    {
        caption: 'User1',
        // You will need to prepend the image path with your baseUrl
        // if it is not '/', like: '/test-site/img/logo.svg'.
        image: '/img/logo.svg',
        infoLink: 'https://www.facebook.com',
        pinned: true,
    },
];

const siteConfig = {
    title: 'Linz.js',
    tagline: 'Node.js administration framework',
    url: 'https://http://linzjs.github.io',
    baseUrl: '/linz/',
    projectName: 'linz',
    organizationName: 'linzjs',

    // For no header links in the top nav bar -> headerLinks: [],
    headerLinks: [{ doc: 'getting-started-with-linz', label: 'Docs' }],

    // If you have users set above, you add it here:
    users,

    /* path to images for header/footer */
    headerIcon: 'img/logo.svg',
    footerIcon: 'img/logo.svg',
    favicon: 'img/favicon.png',

    /* Colors for website */
    colors: {
        primaryColor: '#08c',
        secondaryColor: '#08c',
    },

    // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
    copyright: `Copyright © ${new Date().getFullYear()} Linz`,

    highlight: {
        theme: 'default',
    },

    // Add custom scripts here that would be placed in <script> tags.
    scripts: ['https://buttons.github.io/buttons.js'],
    onPageNav: 'separate',
    cleanUrl: true,
};

module.exports = siteConfig;
