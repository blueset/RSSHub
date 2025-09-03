import { Route, ViewType } from '@/types';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import { searchNSFWNovels } from './novel-api/search/nsfw';

export const route: Route = {
    path: '/search-novel/:keyword/:match?/:mode?',
    categories: ['social-media'],
    view: ViewType.Articles,
    example: '/pixiv-novel/search-novel/Nezuko/exact_match_for_tags',
    parameters: {
        keyword: 'keyword',
        match: {
            description: 'keyword match mode',
            default: 'partial_match_for_tags',
            options: [
                {
                    label: 'partial match for tags',
                    value: 'partial_match_for_tags',
                },
                {
                    label: 'exact match for tags',
                    value: 'exact_match_for_tags',
                },
                {
                    label: 'title and caption',
                    value: 'title_and_caption',
                },
            ],
        },
        mode: {
            description: 'filte R18 content',
            default: 'no',
            options: [
                {
                    label: 'only not R18',
                    value: 'safe',
                },
                {
                    label: 'only R18',
                    value: 'r18',
                },
                {
                    label: 'no filter',
                    value: 'no',
                },
            ],
        },
    },
    radar: [
        {
            title: 'Tag Novels',
            source: ['www.pixiv.net/tags/:id/novels', 'www.pixiv.net/tags/:id', 'www.pixiv.net/en/tags/:id/novels', 'www.pixiv.net/en/tags/:id'],
            target: '/user/novels/:id/exact_match_for_tags',
        },
    ],
    features: {
        requireConfig: [
            {
                name: 'PIXIV_REFRESHTOKEN',
                optional: false,
                description: `
Pixiv 登錄後的 refresh_token
refresh_token after Pixiv login
[https://docs.rsshub.app/deploy/config#pixiv](https://docs.rsshub.app/deploy/config#pixiv)`,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Keyword',
    maintainers: ['blueset'],
    handler,
};

async function handler(ctx) {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw new ConfigNotFoundError('pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const keyword = ctx.req.param('keyword');
    const match = ctx.req.param('match') || 'partial_match_for_tags';
    const mode = ctx.req.param('mode');
    const { limit } = ctx.req.query();

    return await searchNSFWNovels(keyword, match, mode, limit);
}
