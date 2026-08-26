export interface StoreSettings {
    show_social_media: boolean;
    facebook_url: string;
    instagram_url: string;
    tiktok_url: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
    show_social_media: true,
    facebook_url: 'https://www.facebook.com/share/17aJ1mBWHx/',
    instagram_url: 'https://www.instagram.com/nature.hug_nm?igsi=MWljNHAxOW9vYWN2Mg==',
    tiktok_url: 'https://www.tiktok.com/@nature.hug_nm?_r=1&_d=eb4h309mihm4he&sec_uid=MS4wLjABAAAAOgMc79fB9VzxYjtZOvrhHf7nD3S9vbTb_RH7OavNNJsbUGJ6i3ytgdvUmb4p_1g1&share_author_id=7459171842596783112&sharer_language=en&source=h5_m&u_code=d7c7am4fc5ekcf&timestamp=1787737986&user_id=6717618529158628358&sec_user_id=MS4wLjABAAAA4TwAZevpEE-bDrf3dwIjcDvckgZCqjU_zuHQOX49Uq5U8Xd9fTVXZv0foYGqKWga&item_author_type=2&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7677752177666574081&share_link_id=a22e477b-2fb2-456d-874e-11972b7f5dc5&share_app_id=1233&ugbiz_name=ACCOUNT&ug_btm=b6880%2Cb5836&social_share_type=5&share_enter_from=others_homepage&item_author_type=2&enable_checksum=1',
};
