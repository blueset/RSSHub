import { getNSFWNovelContent } from '../content/nsfw';
import pixivUtils from '../../utils';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import { getToken } from '../../token';
import { config } from '@/config';
import cache from '@/utils/cache';
import searchNovel from './search-novel';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { SearchResultFeed } from './types';

const baseUrl = 'https://www.pixiv.net';

export async function searchNSFWNovels(keyword: string, match: string = 'partial_match_for_tags', mode: string = 'no', limit: number = 10): Promise<SearchResultFeed> {
    if (limit > 30) {
        limit = 30;
    }

    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw new ConfigNotFoundError('This user is an R18 creator, PIXIV_REFRESHTOKEN is required.\npixiv RSS is disabled due to the lack of relevant config.\n該用戶爲 R18 創作者，需要 PIXIV_REFRESHTOKEN。');
    }

    const token = await getToken(cache.tryGet);
    if (!token) {
        throw new ConfigNotFoundError('pixiv not login');
    }

    const searchResult = await searchNovel(keyword, token, match);

    let novels = searchResult.data.novels;
    if (mode === 'safe' || mode === '1') {
        novels = novels.filter((item) => item.x_restrict === 0);
    } else if (mode === 'r18' || mode === '2') {
        novels = novels.filter((item) => item.x_restrict === 1);
    }

    if (novels.length === 0) {
        throw new InvalidParameterError(`${keyword} is not a valid keyword, or the keyword has no novels.\n${keyword} 不是有效的關鍵字，或者該關鍵字沒有小說作品。`);
    }

    const items = await Promise.all(
        novels.map(async (novel) => {
            const novelContent = await getNSFWNovelContent(novel.id.toString(), token);
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
                pubDate: new Date(novel.create_date),
                author: novel.user.name,
                category: novelContent.tags,
            };
        })
    );

    return {
        title: `${keyword}: pixiv Novel search results`,
        link: `${baseUrl}/tags/${keyword}/novels`,
        item: items,
    };
}
