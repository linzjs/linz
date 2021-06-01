'use strict';

module.exports = {
    baseUrl: '/linz/',
    favicon: 'img/favicon.ico',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    organizationName: 'linzjs',
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    editUrl:
                        'https://github.com/linzjs/linz/tree/master/docusaurus/',
                    sidebarPath: require.resolve('./sidebars.js')
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css')
                }
            }
        ]
    ],
    projectName: 'linz',
    tagline: 'Node.js administration framework',
    themeConfig: {
        footer: {
            copyright: `Copyright © ${new Date().getFullYear()} Linz`,
            links: [],
            style: 'dark'
        },
        navbar: {
            items: [
                {
                    activeBasePath: 'docs',
                    label: 'Docs',
                    position: 'left',
                    to: 'docs/'
                },
                {
                    href: 'https://github.com/linzjs/linz',
                    label: 'GitHub',
                    position: 'right'
                }
            ],
            logo: {
                alt: 'Linz Logo',
                src: 'img/logo.svg'
            },
            title: 'Linz.js'
        }
    },
    title: 'Linz.js',
    url: 'https://linzjs.github.io'
};
