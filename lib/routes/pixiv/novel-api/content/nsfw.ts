import { load } from 'cheerio';
import queryString from 'query-string';

import cache from '@/utils/cache';
import { evaluateScriptCallback, evaluateScriptData } from '@/utils/evaluate-script';
import { parseDate } from '@/utils/parse-date';
import { parseScriptSource } from '@/utils/parse-js';

import { maskHeader } from '../../constants';
import got from '../../pixiv-got';
import type { NovelContent, NSFWNovelDetail } from './types';
import { parseNovelContent } from './utils';

export async function getNSFWNovelContent(novelId: string, token: string): Promise<NovelContent> {
    return await cache.tryGet(`https://app-api.pixiv.net/webview/v2/novel:${novelId}`, async () => {
        const response = await got('https://app-api.pixiv.net/webview/v2/novel', {
            headers: {
                ...maskHeader,
                Authorization: 'Bearer ' + token,
            },
            searchParams: queryString.stringify({
                id: novelId,
                viewer_version: '20221031_ai',
            }),
        });

        const $ = load(response.data);
        const script = $('script')
            .toArray()
            .map((element) => $(element).text())
            .filter((source) => source.includes('pixiv'))
            .join('\n');
        if (!script) {
            throw new Error('No novel data found');
        }
        const { program, errors } = await parseScriptSource(script);
        if (errors.length) {
            throw new Error('Pixiv novel data script could not be parsed');
        }

        let descriptorSource: string | undefined;
        for (const statement of program.body) {
            if (statement.type !== 'ExpressionStatement' || statement.expression.type !== 'CallExpression') {
                continue;
            }
            const expression = statement.expression;
            const callee = expression.callee;
            if (
                callee.type !== 'MemberExpression' ||
                callee.computed ||
                callee.object.type !== 'Identifier' ||
                callee.object.name !== 'Object' ||
                callee.property.type !== 'Identifier' ||
                callee.property.name !== 'defineProperty' ||
                expression.arguments[0]?.type !== 'Identifier' ||
                expression.arguments[0].name !== 'window' ||
                expression.arguments[1]?.type !== 'Literal' ||
                expression.arguments[1].value !== 'pixiv'
            ) {
                continue;
            }
            descriptorSource = script.slice(expression.start, expression.end);
            break;
        }
        const novelDetail = descriptorSource
            ? (await evaluateScriptCallback<{ value?: { novel?: NSFWNovelDetail } }>(descriptorSource, 'Object.defineProperty')).value?.novel
            : await evaluateScriptData<NSFWNovelDetail | undefined>(script, 'window.pixiv.novel');

        if (!novelDetail) {
            throw new Error('No novel data found');
        }

        const images = Object.fromEntries(
            Object.entries(novelDetail.images)
                .filter(([, image]) => image?.urls?.original)
                .map(([id, image]) => [id, image.urls.original])
        );

        const parsedContent = await parseNovelContent(novelDetail.text, images, token);

        return {
            id: novelDetail.id,
            title: novelDetail.title,
            description: novelDetail.caption,
            content: parsedContent,

            userId: novelDetail.userId,
            userName: null, // Not provided in NSFW API

            bookmarkCount: novelDetail.rating.bookmark,
            viewCount: novelDetail.rating.view,
            likeCount: novelDetail.rating.like,

            createDate: parseDate(novelDetail.cdate),
            updateDate: null, // Not provided in NSFW API

            isOriginal: novelDetail.isOriginal,
            aiType: novelDetail.aiType,
            tags: novelDetail.tags,

            coverUrl: novelDetail.coverUrl,
            images,

            seriesId: novelDetail.seriesId || null,
            seriesTitle: novelDetail.seriesTitle || null,
        };
    });
}
