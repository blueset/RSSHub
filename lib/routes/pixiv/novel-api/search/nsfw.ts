import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { getToken } from '../../token';
import pixivUtils from '../../utils';
import { getNSFWNovelContent } from '../content/nsfw';
import searchNovel from './search-novel';

const baseUrl = 'https://www.pixiv.net';

export async function searchNSFWNovels(keyword: string, match = 'partial_match_for_tags', mode = 'no'): Promise<Data> {
    if (!config.pixiv.refreshToken) {
        throw new ConfigNotFoundError('PIXIV_REFRESHTOKEN is required for Pixiv novel search.');
    }

    const token = await getToken();
    if (!token) {
        throw new ConfigNotFoundError('Pixiv login failed. Check PIXIV_REFRESHTOKEN.');
    }

    const searchResult = await searchNovel(keyword, token, match);
    let novels = searchResult.data.novels;
    if (mode === 'safe' || mode === '1') {
        novels = novels.filter((novel) => novel.x_restrict === 0);
    } else if (mode === 'r18' || mode === '2') {
        novels = novels.filter((novel) => novel.x_restrict === 1);
    }

    if (novels.length === 0) {
        throw new InvalidParameterError(`No novels found for "${keyword}" with the selected match and content mode.`);
    }

    const items = await Promise.all(
        novels.map(async (novel) => {
            const novelContent = await getNSFWNovelContent(novel.id, token);
            return {
                title: novel.title,
                description: `
                    <img src="${pixivUtils.getProxiedImageUrl(novelContent.coverUrl)}" />
                    <div>
                    <p>${novelContent.description}</p>
                    <hr>
                    ${novelContent.content}
                    </div>
                `,
                link: `${baseUrl}/novel/show.php?id=${novel.id}`,
                pubDate: parseDate(novel.create_date),
                author: novel.user.name,
                category: novelContent.tags,
            };
        })
    );

    return {
        title: `${keyword}: pixiv Novel search results`,
        link: `${baseUrl}/tags/${encodeURIComponent(keyword)}/novels`,
        item: items,
    };
}
