enum TableName {
    /** Stores all the users on the platform. */
    USERS = 'users',
    USER_FOLLOWS = 'user_follows',
    USER_BLOCKS = 'user_blocks',
    /** Stores all the active user sessions on the platform. */
    USER_SESSIONS = 'user_sessions',
    /** Stores all the posts on the platform. */
    POSTS = 'posts',
    POST_LIKES = 'post_likes',
    /** Stores all the post shares on the platform. */
    POST_SHARES = 'post_shares',

    POST_IMAGE_ATTACHMENTS = 'post_image_attachments',
    MESSAGE_IMAGE_ATTACHMENTS = 'message_image_attachments',
    /** Note: As of now only the image attachments are supported.
     * It could've been merged into a single table in the future. */
    // POST_VIDEO_ATTACHMENTS = 'post_video_attachments',

    MESSAGE_CONVERSATIONS = 'message_conversations',
    MESSAGE_CONVERSATION_PARTICIPATIONS = 'message_conversation_participations',
    MESSAGES = 'messages',

    PENDING_USER_EMAIL_SIGNIN_SESSIONS = 'pending_user_email_signin_sessions',
    PENDING_USER_EMAIL_SIGNUP_SESSIONS = 'pending_user_email_signup_sessions',

    REQUESTED_USER_REMOVALS = 'requested_user_removals',

    NOTIFICATIONS = 'notifications',
}

export default TableName
