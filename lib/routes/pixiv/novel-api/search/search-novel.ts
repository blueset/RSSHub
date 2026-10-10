import queryString from 'query-string';

import { maskHeader } from '../../constants';
import got from '../../pixiv-got';
import type { NSFWNovelWork } from '../user-novels/types';

export default function searchNovel(keyword: string, token: string, searchTarget = 'partial_match_for_tags'): Promise<{ data: { novels: NSFWNovelWork[] } }> {
    return got('https://app-api.pixiv.net/v1/search/novel', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            word: keyword,
            search_target: searchTarget,
            sort: 'date_desc',
            filter: 'for_ios',
        }),
    });
}
