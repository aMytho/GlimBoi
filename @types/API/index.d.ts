type glimeshMutation = "shortTimeoutUser" | "longTimeoutUser" | "deleteMessage" | "ban" | "unBan"

declare interface AuthError {
    data: string;
    status: "AUTHNEEDED"
}

declare interface GLimeshMutationError {
    error: string;
    status: "PERMISSIONDENIED" | "UNKNOWN" | "AUTHNEEDED"
}

interface Auth {
    access_token: accessToken;
    scope: string;
    creation: string;
    clientID?: string;
    secret?: string
    _id?: string;
}

/**
 * The client ID of the users dev app on glimesh
 */
type clientID = string

/**
 * The secret key of the users dev app on glimesh
 */
type secretKey = string

/**
 * A token that lets you connect to the Glimesh API. Valid for 6 hours
 */
type accessToken = string

/**
 * Number representing the state of authentication. 0none, 1, id, 2 authed
 */
type authStatusNumber = 0 | 1 | 2

/**
 * String representing the type of webhook.
 */
type webhookType = "discord" | "guilded"

type glimeshRequest = "userID" | "channelID"

/**
 * The event we want to listen for
 */
type glimeshEvent = "chat" | "followers" | "subscribers"

interface incomingGlimeshMessage {
    id: string; // We convert this to a number as soon as possible.
    message: string; // The message that was recieved
    user: {
        avatarUrl: string;
        id: string;
        username: string;
    }
}

declare namespace Glimesh {
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * The `Naive DateTime` scalar type represents a naive date and time without
   * timezone. The DateTime appears in a JSON response as an ISO8601 formatted
   * string.
   */
  NaiveDateTime: any;
  /** Represents an uploaded file. */
  Upload: any;
};

type GlimeshError = {
    locations: Array<GlimeshErrorLocation>;
    message: string;
    path: any;
}

type GlimeshErrorLocation = {
    column: number;
    line: number;
}

type error = null | false

/** Categories are the containers for live streaming content. */
export type Category = {
  __typename?: 'Category';
  id?: Maybe<Scalars['ID']>;
  insertedAt: Scalars['NaiveDateTime'];
  /** Name of the category */
  name?: Maybe<Scalars['String']>;
  /** Slug of the category */
  slug?: Maybe<Scalars['String']>;
  subcategories?: Maybe<SubcategoryConnection>;
  tags?: Maybe<TagConnection>;
  updatedAt: Scalars['NaiveDateTime'];
};


/** Categories are the containers for live streaming content. */
export type CategorySubcategoriesArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


/** Categories are the containers for live streaming content. */
export type CategoryTagsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};

/** A channel is a user's actual container for live streaming. */
export type Channel = {
  __typename?: 'Channel';
  bans?: Maybe<ChannelBanConnection>;
  /** Toggle for blocking anyone from posting links */
  blockLinks?: Maybe<Scalars['Boolean']>;
  category?: Maybe<Category>;
  chatBgUrl?: Maybe<Scalars['String']>;
  chatMessages?: Maybe<ChatMessageConnection>;
  chatRulesHtml?: Maybe<Scalars['String']>;
  chatRulesMd?: Maybe<Scalars['String']>;
  /** Toggle for links automatically being clickable */
  disableHyperlinks?: Maybe<Scalars['Boolean']>;
  hmacKey?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  inaccessible?: Maybe<Scalars['Boolean']>;
  insertedAt: Scalars['NaiveDateTime'];
  /** The language a user can expect in the stream */
  language?: Maybe<Scalars['String']>;
  /** If the streamer has flagged this channel as only appropriate for Mature Audiences */
  matureContent?: Maybe<Scalars['Boolean']>;
  /** Minimum account age length before chatting */
  minimumAccountAge?: Maybe<Scalars['Int']>;
  moderationLogs?: Maybe<ChannelModerationLogConnection>;
  moderators?: Maybe<ChannelModeratorConnection>;
  posterUrl?: Maybe<Scalars['String']>;
  /** Toggle for requiring confirmed email before chatting */
  requireConfirmedEmail?: Maybe<Scalars['Boolean']>;
  /** Toggle for homepage visibility */
  showOnHomepage?: Maybe<Scalars['Boolean']>;
  showRecentChatMessagesOnly?: Maybe<Scalars['Boolean']>;
  /** The current status of the channnel */
  status?: Maybe<ChannelStatus>;
  /** If the channel is live, this will be the current Stream */
  stream?: Maybe<Stream>;
  streamKey?: Maybe<Scalars['String']>;
  streamer: User;
  streams?: Maybe<StreamConnection>;
  subcategory?: Maybe<Subcategory>;
  tags?: Maybe<Array<Maybe<Tag>>>;
  /** The title of the channel */
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['NaiveDateTime'];
};


/** A channel is a user's actual container for live streaming. */
export type ChannelBansArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


/** A channel is a user's actual container for live streaming. */
export type ChannelChatMessagesArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


/** A channel is a user's actual container for live streaming. */
export type ChannelModerationLogsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


/** A channel is a user's actual container for live streaming. */
export type ChannelModeratorsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


/** A channel is a user's actual container for live streaming. */
export type ChannelStreamsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};

/** A channel timeout or ban */
export type ChannelBan = {
  __typename?: 'ChannelBan';
  channel: Channel;
  expiresAt?: Maybe<Scalars['NaiveDateTime']>;
  id: Scalars['ID'];
  insertedAt: Scalars['NaiveDateTime'];
  reason?: Maybe<Scalars['String']>;
  updatedAt: Scalars['NaiveDateTime'];
  user: User;
};

export type ChannelBanConnection = {
  __typename?: 'ChannelBanConnection';
  count?: Maybe<Scalars['Int']>;
  edges?: Maybe<Array<Maybe<ChannelBanEdge>>>;
  pageInfo: PageInfo;
};

export type ChannelBanEdge = {
  __typename?: 'ChannelBanEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<ChannelBan>;
};

export type ChannelConnection = {
  __typename?: 'ChannelConnection';
  count?: Maybe<Scalars['Int']>;
  edges?: Maybe<Array<Maybe<ChannelEdge>>>;
  pageInfo: PageInfo;
};

export type ChannelEdge = {
  __typename?: 'ChannelEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Channel>;
};

/** A moderation event that happened */
export type ChannelModerationLog = {
  __typename?: 'ChannelModerationLog';
  action?: Maybe<Scalars['String']>;
  channel: Channel;
  id: Scalars['ID'];
  insertedAt: Scalars['NaiveDateTime'];
  moderator: User;
  updatedAt: Scalars['NaiveDateTime'];
  user: User;
};

export type ChannelModerationLogConnection = {
  __typename?: 'ChannelModerationLogConnection';
  count?: Maybe<Scalars['Int']>;
  edges?: Maybe<Array<Maybe<ChannelModerationLogEdge>>>;
  pageInfo: PageInfo;
};

export type ChannelModerationLogEdge = {
  __typename?: 'ChannelModerationLogEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<ChannelModerationLog>;
};

/** A channel moderator */
export type ChannelModerator = {
  __typename?: 'ChannelModerator';
  canBan?: Maybe<Scalars['Boolean']>;
  canDelete?: Maybe<Scalars['Boolean']>;
  canLongTimeout?: Maybe<Scalars['Boolean']>;
  canShortTimeout?: Maybe<Scalars['Boolean']>;
  canUnTimeout?: Maybe<Scalars['Boolean']>;
  canUnban?: Maybe<Scalars['Boolean']>;
  channel: Channel;
  id: Scalars['ID'];
  insertedAt: Scalars['NaiveDateTime'];
  updatedAt: Scalars['NaiveDateTime'];
  user: User;
};

export type ChannelModeratorConnection = {
  __typename?: 'ChannelModeratorConnection';
  count?: Maybe<Scalars['Int']>;
  edges?: Maybe<Array<Maybe<ChannelModeratorEdge>>>;
  pageInfo: PageInfo;
};

export type ChannelModeratorEdge = {
  __typename?: 'ChannelModeratorEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<ChannelModerator>;
};

export enum ChannelStatus {
  Live = 'LIVE',
  Offline = 'OFFLINE'
}

/** A chat message sent to a channel by a user. */
export type ChatMessage = {
  __typename?: 'ChatMessage';
  channel: Channel;
  id: Scalars['ID'];
  insertedAt: Scalars['NaiveDateTime'];
  /**
   * Was this message generated by our system for a follow
   * @deprecated We're going to replace this shortly after launch
   */
  isFollowedMessage?: Maybe<Scalars['Boolean']>;
  /**
   * Was this message generated by our system for a subscription
   * @deprecated We're going to replace this shortly after launch
   */
  isSubscriptionMessage?: Maybe<Scalars['Boolean']>;
  /** The chat message contents, be careful to sanitize because any user input is allowed */
  message?: Maybe<Scalars['String']>;
  tokens?: Maybe<Array<Maybe<ChatMessageToken>>>;
  updatedAt: Scalars['NaiveDateTime'];
  user: User;
};

export type ChatMessageConnection = {
  __typename?: 'ChatMessageConnection';
  count?: Maybe<Scalars['Int']>;
  edges?: Maybe<Array<Maybe<ChatMessageEdge>>>;
  pageInfo: PageInfo;
};

export type ChatMessageEdge = {
  __typename?: 'ChatMessageEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<ChatMessage>;
};

export type ChatMessageInput = {
  message?: Maybe<Scalars['String']>;
};

export type ChatMessageToken = {
  text?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

export type EmoteToken = ChatMessageToken & {
  __typename?: 'EmoteToken';
  src?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

/** A follower is a user who subscribes to notifications for a particular user's channel. */
export type Follower = {
  __typename?: 'Follower';
  hasLiveNotifications: Scalars['Boolean'];
  id: Scalars['ID'];
  insertedAt: Scalars['NaiveDateTime'];
  streamer: User;
  updatedAt: Scalars['NaiveDateTime'];
  user: User;
};

export type FollowerConnection = {
  __typename?: 'FollowerConnection';
  count?: Maybe<Scalars['Int']>;
  edges?: Maybe<Array<Maybe<FollowerEdge>>>;
  pageInfo: PageInfo;
};

export type FollowerEdge = {
  __typename?: 'FollowerEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Follower>;
};

export type RootMutationType = {
  __typename?: 'RootMutationType';
  /** Ban a user from a chat channel. */
  banUser?: Maybe<ChannelModerationLog>;
  /** Create a chat message */
  createChatMessage?: Maybe<ChatMessage>;
  /** Deletes a specific chat message from channel. */
  deleteChatMessage?: Maybe<ChannelModerationLog>;
  /** End a stream */
  endStream?: Maybe<Stream>;
  /** Update a stream's metadata */
  logStreamMetadata?: Maybe<Stream>;
  /** Long timeout (15 minutes) a user from a chat channel. */
  longTimeoutUser?: Maybe<ChannelModerationLog>;
  /** Short timeout (5 minutes) a user from a chat channel. */
  shortTimeoutUser?: Maybe<ChannelModerationLog>;
  /** Start a stream */
  startStream?: Maybe<Stream>;
  /** Unban a user from a chat channel. */
  unbanUser?: Maybe<ChannelModerationLog>;
  /** Update a stream's thumbnail */
  uploadStreamThumbnail?: Maybe<Stream>;
};


export type RootMutationTypeBanUserArgs = {
  channelId: Scalars['ID'];
  userId: Scalars['ID'];
};


export type RootMutationTypeCreateChatMessageArgs = {
  channelId: Scalars['ID'];
  message: ChatMessageInput;
};


export type RootMutationTypeDeleteChatMessageArgs = {
  channelId: Scalars['ID'];
  messageId: Scalars['ID'];
};


export type RootMutationTypeEndStreamArgs = {
  streamId: Scalars['ID'];
};


export type RootMutationTypeLogStreamMetadataArgs = {
  metadata: StreamMetadataInput;
  streamId: Scalars['ID'];
};


export type RootMutationTypeLongTimeoutUserArgs = {
  channelId: Scalars['ID'];
  userId: Scalars['ID'];
};


export type RootMutationTypeShortTimeoutUserArgs = {
  channelId: Scalars['ID'];
  userId: Scalars['ID'];
};


export type RootMutationTypeStartStreamArgs = {
  channelId: Scalars['ID'];
};


export type RootMutationTypeUnbanUserArgs = {
  channelId: Scalars['ID'];
  userId: Scalars['ID'];
};


export type RootMutationTypeUploadStreamThumbnailArgs = {
  streamId: Scalars['ID'];
  thumbnail: Scalars['Upload'];
};


export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
};

export type RootQueryType = {
  data: {
    __typename?: 'RootQueryType';
    /** List all categories */
    categories?: Maybe<Array<Maybe<Category>>>;
    /** Query individual category */
    category?: Maybe<Category>;
    /** Query individual channel */
    channel?: Maybe<Channel>;
    /** List all channels */
    channels?: Maybe<ChannelConnection>;
    /** List all follows or followers */
    followers?: Maybe<FollowerConnection>;
    /** Get yourself */
    myself?: Maybe<User>;
    /** Query individual user */
    user?: Maybe<User>;
    /** List all users */
    users?: Maybe<UserConnection>;
  }
  /** Glimesh Error, schema error or not found */
  errors?: Array<GlimeshError>;
};


export type RootQueryTypeCategoryArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type RootQueryTypeChannelArgs = {
  id?: Maybe<Scalars['ID']>;
  streamerId?: Maybe<Scalars['Int']>;
  streamerUsername?: Maybe<Scalars['String']>;
};


export type RootQueryTypeChannelsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  categorySlug?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<ChannelStatus>;
};


export type RootQueryTypeFollowersArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  streamerId?: Maybe<Scalars['Int']>;
  userId?: Maybe<Scalars['Int']>;
};


export type RootQueryTypeUserArgs = {
  id?: Maybe<Scalars['Int']>;
  username?: Maybe<Scalars['String']>;
};


export type RootQueryTypeUsersArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};

/** A stream is a single live stream in, either current or historical. */
export type Stream = {
  __typename?: 'Stream';
  category: Category;
  channel: Channel;
  /** Concurrent viewers during last snapshot */
  countViewers?: Maybe<Scalars['Int']>;
  /** Datetime of when the stream was ended, or null if still going */
  endedAt?: Maybe<Scalars['NaiveDateTime']>;
  id?: Maybe<Scalars['ID']>;
  insertedAt: Scalars['NaiveDateTime'];
  metadata?: Maybe<StreamMetadataConnection>;
  /** Peak concurrent viewers */
  peakViewers?: Maybe<Scalars['Int']>;
  /** Datetime of when the stream was started */
  startedAt: Scalars['NaiveDateTime'];
  thumbnailUrl?: Maybe<Scalars['String']>;
  /** The title of the channel when the stream was started */
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['NaiveDateTime'];
};


/** A stream is a single live stream in, either current or historical. */
export type StreamMetadataArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};

export type StreamConnection = {
  __typename?: 'StreamConnection';
  count?: Maybe<Scalars['Int']>;
  edges?: Maybe<Array<Maybe<StreamEdge>>>;
  pageInfo: PageInfo;
};

export type StreamEdge = {
  __typename?: 'StreamEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Stream>;
};

/** A single instance of stream metadata. */
export type StreamMetadata = {
  __typename?: 'StreamMetadata';
  audioCodec?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  ingestServer?: Maybe<Scalars['String']>;
  ingestViewers?: Maybe<Scalars['String']>;
  insertedAt: Scalars['NaiveDateTime'];
  lostPackets?: Maybe<Scalars['Int']>;
  nackPackets?: Maybe<Scalars['Int']>;
  recvPackets?: Maybe<Scalars['Int']>;
  sourceBitrate?: Maybe<Scalars['Int']>;
  sourcePing?: Maybe<Scalars['Int']>;
  stream: Stream;
  streamTimeSeconds?: Maybe<Scalars['Int']>;
  updatedAt: Scalars['NaiveDateTime'];
  vendorName?: Maybe<Scalars['String']>;
  vendorVersion?: Maybe<Scalars['String']>;
  videoCodec?: Maybe<Scalars['String']>;
  videoHeight?: Maybe<Scalars['Int']>;
  videoWidth?: Maybe<Scalars['Int']>;
};

export type StreamMetadataConnection = {
  __typename?: 'StreamMetadataConnection';
  count?: Maybe<Scalars['Int']>;
  edges?: Maybe<Array<Maybe<StreamMetadataEdge>>>;
  pageInfo: PageInfo;
};

export type StreamMetadataEdge = {
  __typename?: 'StreamMetadataEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<StreamMetadata>;
};

export type StreamMetadataInput = {
  audioCodec?: Maybe<Scalars['String']>;
  ingestServer?: Maybe<Scalars['String']>;
  ingestViewers?: Maybe<Scalars['Int']>;
  lostPackets?: Maybe<Scalars['Int']>;
  nackPackets?: Maybe<Scalars['Int']>;
  recvPackets?: Maybe<Scalars['Int']>;
  sourceBitrate?: Maybe<Scalars['Int']>;
  sourcePing?: Maybe<Scalars['Int']>;
  streamTimeSeconds?: Maybe<Scalars['Int']>;
  vendorName?: Maybe<Scalars['String']>;
  vendorVersion?: Maybe<Scalars['String']>;
  videoCodec?: Maybe<Scalars['String']>;
  videoHeight?: Maybe<Scalars['Int']>;
  videoWidth?: Maybe<Scalars['Int']>;
};

/** Subcategories are specific games, topics, or genre's that exist under a Category. */
export type Subcategory = {
  __typename?: 'Subcategory';
  backgroundImageUrl?: Maybe<Scalars['String']>;
  category?: Maybe<Category>;
  id?: Maybe<Scalars['ID']>;
  insertedAt: Scalars['NaiveDateTime'];
  /** Name of the subcategory */
  name?: Maybe<Scalars['String']>;
  /** URL friendly name of the subcategory */
  slug?: Maybe<Scalars['String']>;
  source?: Maybe<Scalars['String']>;
  sourceId?: Maybe<Scalars['String']>;
  updatedAt: Scalars['NaiveDateTime'];
  userCreated?: Maybe<Scalars['Boolean']>;
};

export type SubcategoryConnection = {
  __typename?: 'SubcategoryConnection';
  count?: Maybe<Scalars['Int']>;
  edges?: Maybe<Array<Maybe<SubcategoryEdge>>>;
  pageInfo: PageInfo;
};

export type SubcategoryEdge = {
  __typename?: 'SubcategoryEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Subcategory>;
};

export type RootSubscriptionType = {
  __typename?: 'RootSubscriptionType';
  channel?: Maybe<Channel>;
  chatMessage?: Maybe<ChatMessage>;
  followers?: Maybe<Follower>;
};


export type RootSubscriptionTypeChannelArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type RootSubscriptionTypeChatMessageArgs = {
  channelId?: Maybe<Scalars['ID']>;
};


export type RootSubscriptionTypeFollowersArgs = {
  streamerId?: Maybe<Scalars['ID']>;
};

/** Tags are user created labels that are either global or category specific. */
export type Tag = {
  __typename?: 'Tag';
  category?: Maybe<Category>;
  /** The number of streams started with this tag */
  countUsage?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['ID']>;
  insertedAt: Scalars['NaiveDateTime'];
  /** Name of the tag */
  name?: Maybe<Scalars['String']>;
  /** URL friendly name of the tag */
  slug?: Maybe<Scalars['String']>;
  updatedAt: Scalars['NaiveDateTime'];
};

export type TagConnection = {
  __typename?: 'TagConnection';
  count?: Maybe<Scalars['Int']>;
  edges?: Maybe<Array<Maybe<TagEdge>>>;
  pageInfo: PageInfo;
};

export type TagEdge = {
  __typename?: 'TagEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Tag>;
};

export type TextToken = ChatMessageToken & {
  __typename?: 'TextToken';
  text?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};


export type UrlToken = ChatMessageToken & {
  __typename?: 'UrlToken';
  text?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

/** A user of Glimesh, can be a streamer, a viewer or both! */
export type User = {
  __typename?: 'User';
  allowGlimeshNewsletterEmails: Scalars['Boolean'];
  allowLiveSubscriptionEmails: Scalars['Boolean'];
  /** URL to the user's avatar */
  avatarUrl?: Maybe<Scalars['String']>;
  /** A user's channel, if they have one */
  channel?: Maybe<Channel>;
  /** Datetime the user confirmed their email address */
  confirmedAt?: Maybe<Scalars['NaiveDateTime']>;
  countFollowers?: Maybe<Scalars['Int']>;
  countFollowing?: Maybe<Scalars['Int']>;
  /** Exactly the same as the username, but with casing the user prefers */
  displayname: Scalars['String'];
  /** Email for the user, hidden behind a scope */
  email?: Maybe<Scalars['String']>;
  followers?: Maybe<FollowerConnection>;
  following?: Maybe<FollowerConnection>;
  /** Shortcut to a user's followed channels */
  followingLiveChannels?: Maybe<ChannelConnection>;
  id: Scalars['ID'];
  /** Account creation date */
  insertedAt: Scalars['NaiveDateTime'];
  /** HTML version of the user's profile, should be safe for rendering directly */
  profileContentHtml?: Maybe<Scalars['String']>;
  /** Markdown version of the user's profile */
  profileContentMd?: Maybe<Scalars['String']>;
  /** Qualified URL for the user's Discord server */
  socialDiscord?: Maybe<Scalars['String']>;
  /** Qualified URL for the user's Guilded server */
  socialGuilded?: Maybe<Scalars['String']>;
  /** Qualified URL for the user's Instagram account */
  socialInstagram?: Maybe<Scalars['String']>;
  /** Qualified URL for the user's YouTube account */
  socialYoutube?: Maybe<Scalars['String']>;
  /** A list of linked social accounts for the user */
  socials?: Maybe<Array<Maybe<UserSocial>>>;
  /** The primary role the user performs on the Glimesh team */
  teamRole?: Maybe<Scalars['String']>;
  /** Account last updated date */
  updatedAt: Scalars['NaiveDateTime'];
  /** Lowercase user identifier */
  username: Scalars['String'];
  /** YouTube Intro URL for the user's profile */
  youtubeIntroUrl?: Maybe<Scalars['String']>;
};


/** A user of Glimesh, can be a streamer, a viewer or both! */
export type UserFollowersArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


/** A user of Glimesh, can be a streamer, a viewer or both! */
export type UserFollowingArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


/** A user of Glimesh, can be a streamer, a viewer or both! */
export type UserFollowingLiveChannelsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};

export type UserConnection = {
  __typename?: 'UserConnection';
  count?: Maybe<Scalars['Int']>;
  edges?: Maybe<Array<Maybe<UserEdge>>>;
  pageInfo: PageInfo;
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<User>;
};

/** A linked social account for a Glimesh user. */
export type UserSocial = {
  __typename?: 'UserSocial';
  id: Scalars['ID'];
  /** Platform unique identifier, usually a ID, made into a string */
  identifier?: Maybe<Scalars['String']>;
  insertedAt: Scalars['NaiveDateTime'];
  /** Platform that is linked, eg: twitter */
  platform?: Maybe<Scalars['String']>;
  updatedAt: Scalars['NaiveDateTime'];
  /** Username for the user on the linked platform */
  username?: Maybe<Scalars['String']>;
};

}