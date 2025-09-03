export interface SFWNovelsResponse {
    data: {
        error: boolean;
        message: string;
        body: {
            works: Record<string, SFWNovelWork>;
            extraData: {
                meta: {
                    title: string;
                    description: string;
                    canonical: string;
                    ogp: {
                        description: string;
                        image: string;
                        title: string;
                        type: string;
                    };
                    twitter: {
                        description: string;
                        image: string;
                        title: string;
                        card: string;
                    };
                    alternateLanguages: {
                        ja: string;
                        en: string;
                    };
                    descriptionHeader: string;
                };
            };
        };
    };
}

export interface SFWNovelWork {
    id: string;
    title: string;
    genre: string;
    xRestrict: number;
    restrict: number;
    url: string;
    tags: string[];
    userId: string;
    userName: string;
    profileImageUrl: string;
    textCount: number;
    wordCount: number;
    readingTime: number;
    useWordCount: boolean;
    description: string;
    isBookmarkable: boolean;
    bookmarkData: null;
    bookmarkCount: number;
    isOriginal: boolean;
    marker: null;
    titleCaptionTranslation: {
        workTitle: null;
        workCaption: null;
    };
    createDate: string;
    updateDate: string;
    isMasked: boolean;
    aiType: number;
    seriesId: string;
    seriesTitle: string;
    isUnlisted: boolean;
}

export interface NSFWNovelsResponse {
    data: {
        user: PixivUser;
        novels: NSFWNovelWork[];
    };
}

export interface NSFWNovelWork {
    id: string;
    title: string;
    caption: string;
    restrict: number;
    x_restrict: number;
    image_urls: {
        square_medium: string;
        medium: string;
        large: string;
    };
    create_date: string;
    tags: Array<PixivTag>;
    text_length: number;
    user: PixivUser;
    series?: {
        id?: number;
        title?: string;
    };
    total_bookmarks: number;
    total_view: number;
    total_comments: number;
}

export interface NovelList {
    title: string;
    description: string;
    image: string;
    link: string;
    item: Array<{
        title: string;
        description: string;
        author: string;
        pubDate: Date;
        link: string;
        category: string[];
    }>;
}

export interface PixivNovelSearch {
    novels: PixivNovel[];
    nextUrl: string | null;
    privacyPolicy?: unknown;
    searchSpanLimit?: number;
}

export interface PixivNovel {
    id: number;
    title: string;
    caption: string;
    restrict: number;
    x_restrict: number;
    imageUrls: {
        squareMedium: string;
        medium: string;
        large?: string;
    };
    create_date: string;
    tags: PixivTag[];
    pageCount: number;
    textLength: number;
    user: PixivUser;
    series?: {
        id: number;
        title: string;
    };
    isBookmarked: boolean;
    totalBookmarks: number;
    totalView: number;
    visible: boolean;
    totalComments: number;
    isMuted: boolean;
    isMypixivOnly: boolean;
    isXRestricted: boolean;
}

export interface PixivTag {
    name: string;
    translatedName: string | null;
    addedByUploadedUser?: boolean;
    isRegistered?: boolean;
}

export interface PixivUser {
    id: number;
    name: string;
    account: string;
    profileImageUrls: {
        medium: string;
    };
    comment: string;
    isFollowed: boolean;
}

export interface SearchResultFeed {
    title: string;
    link: string;
    item: Array<{
        title: string;
        description: string;
        link: string;
        pubDate?: Date;
        author?: string;
        category?: string[];
    }>;
}
