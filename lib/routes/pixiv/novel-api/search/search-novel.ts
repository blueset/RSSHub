import got from '../../pixiv-got';
import { maskHeader } from '../../constants';
import queryString from 'query-string';
import { PixivNovelSearch } from './types';

/**
 * 按时间排序搜索内容
 * @param {string} keyword 关键词
 * @param {string} token pixiv oauth token
 * @returns {Promise<got.AxiosResponse<{novels: novel[]}>>}
 */
export default function searchNovel(keyword: string, token: string, search_target = 'partial_match_for_tags'): Promise<{ data: PixivNovelSearch }> {
    return got('https://app-api.pixiv.net/v1/search/novel', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            word: keyword,
            search_target,
            sort: 'date_desc',
            filter: 'for_ios',
        }),
    });
}
