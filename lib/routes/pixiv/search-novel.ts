import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import { ViewType } from '@/types';

import { searchNSFWNovels } from './novel-api/search/nsfw';

async function handler(ctx: Context): Promise<Data> {
    if (!config.pixiv.refreshToken) {
        throw new ConfigNotFoundError('PIXIV_REFRESHTOKEN is required for Pixiv novel search.');
    }

    const keyword = ctx.req.param('keyword');
    if (!keyword) {
        throw new InvalidParameterError('A search keyword is required.');
    }
    return await searchNSFWNovels(keyword, ctx.req.param('match') || 'partial_match_for_tags', ctx.req.param('mode'));
}

export const route: Route = {
    path: '/search-novel/:keyword/:match?/:mode?',
    categories: ['social-media'],
    view: ViewType.Articles,
    example: '/pixiv/search-novel/Nezuko/exact_match_for_tags',
    parameters: {
        keyword: 'Search keyword',
        match: {
            description: 'Keyword match mode',
            default: 'partial_match_for_tags',
            options: [
                { label: 'Partial match for tags', value: 'partial_match_for_tags' },
                { label: 'Exact match for tags', value: 'exact_match_for_tags' },
                { label: 'Title and caption', value: 'title_and_caption' },
            ],
        },
        mode: {
            description: 'Filter restricted content',
            default: 'no',
            options: [
                { label: 'Only unrestricted', value: 'safe' },
                { label: 'Only restricted', value: 'r18' },
                { label: 'No filter', value: 'no' },
            ],
        },
    },
    radar: [
        {
            title: 'Tag Novels',
            source: ['www.pixiv.net/tags/:keyword/novels', 'www.pixiv.net/tags/:keyword', 'www.pixiv.net/en/tags/:keyword/novels', 'www.pixiv.net/en/tags/:keyword'],
            target: '/search-novel/:keyword/exact_match_for_tags',
        },
    ],
    features: {
        requireConfig: [
            {
                name: 'PIXIV_REFRESHTOKEN',
                optional: false,
                description: 'Pixiv login refresh token. See https://docs.rsshub.app/deploy/config#pixiv.',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Novel Keyword Search',
    maintainers: ['blueset'],
    handler,
    description: 'Search Pixiv novels by tags or title and caption. Includes novel text and requires a Pixiv refresh token.',
};
