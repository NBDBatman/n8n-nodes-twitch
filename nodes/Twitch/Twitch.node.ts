import {
	IDataObject,
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
} from "n8n-workflow";

import { twitchApiRequest } from "./GenericFunctions.js";

export class Twitch implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Twitch",
		name: "twitch",
		icon: "file:twitch.svg",
		group: ["transform"],
		version: 1,
		description: "Interact with Twitch",
		defaults: {
			name: "Twitch",
		},
		inputs: ["main"],
		outputs: ["main"],
		credentials: [
			{
				name: "twitchApi",
				required: true,
			},
		],
		properties: [
			{
				displayName: "Run Once (Ignore Item Inputs)",
				name: "runOnce",
				type: "boolean",
				default: false,
				description: "If enabled, the node executes a single request using the first input item.",
			},
			{
				displayName: "Operation",
				name: "operation",
				type: "options",
				noDataExpression: true,
				default: "getChannelStreams",
				options: [
					{ name: "Get Channel Streams", value: "getChannelStreams" },
					{ name: "Get Channel Information", value: "getChannelInformation" },
					{ name: "Get Game Details", value: "getGameDetails" },
					{ name: "Get Games by ID", value: "getGamesById" },
					{ name: "Get Games", value: "getGames" },
					{ name: "Get Top Games", value: "getTopGames" },
					{ name: "Search Categories", value: "searchCategories" },
					{ name: "Search Channels", value: "searchChannels" },
					{ name: "Get Users", value: "getUsers" },
					{ name: "Get Clips", value: "getClips" },
					{ name: "Get Clips Download", value: "getClipsDownload" },
					{ name: "Get Videos", value: "getVideos" },
					{ name: "Get App Access Token", value: "getAppAccessToken" },
					{ name: "Get Schedule", value: "getSchedule" },
					{ name: "Get Channel iCalendar", value: "getChannelIcalendar" },
					{ name: "Get Teams by Channel", value: "getTeamsByChannel" },
					{ name: "Get Teams", value: "getTeams" },
					{ name: "Get Channel Followers", value: "getChannelFollowers" },
					{ name: "Get Bits Leaderboard", value: "getBitsLeaderboard" },
					{ name: "Get Channel Editors", value: "getChannelEditors" },
					{ name: "Get Followed Channels", value: "getFollowedChannels" },
					{ name: "Get Custom Rewards", value: "getCustomRewards" },
					{ name: "Get Custom Reward Redemptions", value: "getCustomRewardRedemptions" },
					{ name: "Get Charity Campaign", value: "getCharityCampaign" },
					{ name: "Get Charity Campaign Donations", value: "getCharityCampaignDonations" },
					{ name: "Get Chatters", value: "getChatters" },
					{ name: "Get Channel Emotes", value: "getChannelEmotes" },
					{ name: "Get Global Emotes", value: "getGlobalEmotes" },
					{ name: "Get Emote Sets", value: "getEmoteSets" },
					{ name: "Get Channel Chat Badges", value: "getChannelChatBadges" },
					{ name: "Get Global Chat Badges", value: "getGlobalChatBadges" },
					{ name: "Get Chat Settings", value: "getChatSettings" },
					{ name: "Get User Emotes", value: "getUserEmotes" },
					{ name: "Get Content Classification Labels", value: "getContentClassificationLabels" },
					{ name: "Get Creator Goals", value: "getCreatorGoals" },
					{ name: "Get AutoMod Settings", value: "getAutoModSettings" },
					{ name: "Get Banned Users", value: "getBannedUsers" },
					{ name: "Get Unban Requests", value: "getUnbanRequests" },
					{ name: "Get Blocked Terms", value: "getBlockedTerms" },
					{ name: "Get Moderated Channels", value: "getModeratedChannels" },
					{ name: "Get Moderators", value: "getModerators" },
					{ name: "Get VIPs", value: "getVips" },
					{ name: "Get Shield Mode Status", value: "getShieldModeStatus" },
					{ name: "Get Polls", value: "getPolls" },
					{ name: "Get Predictions", value: "getPredictions" },
					{ name: "Get Followed Streams", value: "getFollowedStreams" },
					{ name: "Get Stream Markers", value: "getStreamMarkers" },
					{ name: "Get Broadcaster Subscriptions", value: "getBroadcasterSubscriptions" },
					{ name: "Check User Subscription", value: "checkUserSubscription" },
				],
			},
			{ displayName: "Channel Name", name: "channel_name", type: "string", required: true, default: "", displayOptions: { show: { operation: ["getChannelStreams"] } } },
			{ displayName: "Broadcaster ID", name: "broadcaster_id", type: "string", required: true, default: "", displayOptions: { show: { operation: ["getChannelInformation", "getClips", "getClipsDownload", "getSchedule", "getChannelIcalendar", "getTeamsByChannel", "getChannelFollowers", "getBitsLeaderboard", "getChannelEditors", "getCustomRewards", "getCustomRewardRedemptions", "getCharityCampaign", "getCharityCampaignDonations", "getChatters", "getChannelEmotes", "getChannelChatBadges", "getChatSettings", "getCreatorGoals", "getAutoModSettings", "getBannedUsers", "getUnbanRequests", "getBlockedTerms", "getModerators", "getVips", "getShieldModeStatus", "getPolls", "getPredictions", "getBroadcasterSubscriptions", "checkUserSubscription"] } } },
			{ displayName: "User ID", name: "user_id", type: "string", required: true, default: "", displayOptions: { show: { operation: ["getVideos", "getFollowedChannels", "getUserEmotes", "getModeratedChannels", "getFollowedStreams", "getStreamMarkers", "checkUserSubscription"] } } },
			{ displayName: "Query", name: "query", type: "string", required: true, default: "", displayOptions: { show: { operation: ["searchChannels", "searchCategories"] } } },
			{ displayName: "Game Name", name: "game_name", type: "string", required: true, default: "", displayOptions: { show: { operation: ["getGameDetails", "getGames"] } } },
			{ displayName: "Game ID", name: "game_id", type: "string", required: true, default: "", displayOptions: { show: { operation: ["getGamesById", "getGames"] } } },
			{
				displayName: "Limit (min 1, max 100)",
				name: "limit",
				type: "number",
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 50,
				description: "Maximum number of items to return per page (1-100).",
				displayOptions: { show: { operation: ["getTopGames", "getBitsLeaderboard", "getChatters", "getBannedUsers", "getUnbanRequests", "getBlockedTerms", "getModerators", "getVips", "getFollowedStreams", "getStreamMarkers", "getBroadcasterSubscriptions"] } },
			},
			{
				displayName: "Polls Limit (min 1, max 20)",
				name: "polls_limit",
				type: "number",
				typeOptions: { minValue: 1, maxValue: 20 },
				default: 20,
				description: "Maximum number of polls to return per page (1-20).",
				displayOptions: { show: { operation: ["getPolls"] } },
			},
			{
				displayName: "Predictions Limit (min 1, max 25)",
				name: "predictions_limit",
				type: "number",
				typeOptions: { minValue: 1, maxValue: 25 },
				default: 25,
				description: "Maximum number of predictions to return per page (1-25).",
				displayOptions: { show: { operation: ["getPredictions"] } },
			},
			{ displayName: "Username", name: "username", type: "string", required: true, default: "", displayOptions: { show: { operation: ["getUsers"] } } },
			{ displayName: "Moderator ID", name: "moderator_id", type: "string", required: true, default: "", displayOptions: { show: { operation: ["getChatters", "getChatSettings", "getAutoModSettings", "getBannedUsers", "getUnbanRequests", "getBlockedTerms", "getShieldModeStatus"] } } },
			{ displayName: "Reward ID", name: "reward_id", type: "string", required: false, default: "", displayOptions: { show: { operation: ["getCustomRewards", "getCustomRewardRedemptions"] } } },
			{ displayName: "Clip ID", name: "clip_id", type: "string", required: true, default: "", displayOptions: { show: { operation: ["getClipsDownload"] } } },
			{ displayName: "Emote Set ID(s)", name: "emote_set_id", type: "string", required: true, default: "", displayOptions: { show: { operation: ["getEmoteSets"] } }, description: "Comma-separated list of emote set IDs" },
			{ displayName: "Video ID", name: "video_id", type: "string", required: false, default: "", displayOptions: { show: { operation: ["getStreamMarkers"] } } },
			{ displayName: "Team Name", name: "team_name", type: "string", required: false, default: "", displayOptions: { show: { operation: ["getTeams"] } } },
			{ displayName: "Team ID", name: "team_id", type: "string", required: false, default: "", displayOptions: { show: { operation: ["getTeams"] } } },
			{ displayName: "Bits Period", name: "bits_period", type: "options", default: "all", options: [ { name: "All", value: "all" }, { name: "Day", value: "day" }, { name: "Week", value: "week" }, { name: "Month", value: "month" }, { name: "Year", value: "year" } ], displayOptions: { show: { operation: ["getBitsLeaderboard"] } } },
			{
				displayName: "Max Results (min 1, max 100)",
				name: "followers_first",
				type: "number",
				default: 20,
				typeOptions: { minValue: 1, maxValue: 100 },
				displayOptions: { show: { operation: ["getChannelFollowers"] } },
				description: "Maximum number of followers to return per page (1-100). Default is 20.",
			},
		],
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const runOnce = this.getNodeParameter("runOnce", 0) as boolean;
		const returnData: IDataObject[] = [];

		const itemCount = runOnce ? Math.min(1, items.length || 1) : items.length;
		for (let i = 0; i < itemCount; i++) {
			const operation = this.getNodeParameter("operation", i) as string;

			if (operation === "getAppAccessToken") {
				const credentials = await this.getCredentials("twitchApi");
				const response = await this.helpers.request({
					method: "POST",
					url: "https://id.twitch.tv/oauth2/token",
					form: {
						client_id: credentials.clientId,
						client_secret: credentials.clientSecret,
						grant_type: "client_credentials",
					},
					json: true,
				});
				return [this.helpers.returnJsonArray([response])];
			}

			const credentials = await this.getCredentials("twitchApi");
			const headers = {
				Authorization: `Bearer ${credentials.accessToken || credentials.access_token}`,
				"Client-ID": credentials.clientId,
			};

			const getRequest = async (endpoint: string, params: IDataObject = {}) => {
				const response = await twitchApiRequest.call(this, "GET", endpoint, {}, params, headers);
				if (Array.isArray(response.data)) returnData.push(...response.data);
				else if (response.data) returnData.push(response.data);
				if (!response.data) returnData.push(response);
			};

			if (operation === "getChannelStreams") await getRequest("/streams", { user_login: this.getNodeParameter("channel_name", i) });
			if (operation === "getChannelInformation") await getRequest("/channels", { broadcaster_id: this.getNodeParameter("broadcaster_id", i) });
			if (operation === "searchChannels") await getRequest("/search/channels", { query: this.getNodeParameter("query", i) });
			if (operation === "searchCategories") await getRequest("/search/categories", { query: this.getNodeParameter("query", i) });
			if (operation === "getGameDetails") await getRequest("/games", { name: this.getNodeParameter("game_name", i) });
			if (operation === "getGamesById") await getRequest("/games", { id: this.getNodeParameter("game_id", i) });
			if (operation === "getGames") {
				const gameId = this.getNodeParameter("game_id", i) as string;
				const gameName = this.getNodeParameter("game_name", i) as string;
				const params: IDataObject = {};
				if (gameId) params.id = gameId;
				if (gameName) params.name = gameName;
				await getRequest("/games", params);
			}
			if (operation === "getTopGames") await getRequest("/games/top", { first: this.getNodeParameter("limit", i) });
			if (operation === "getUsers") await getRequest("/users", { login: this.getNodeParameter("username", i) });
			if (operation === "getClips") await getRequest("/clips", { broadcaster_id: this.getNodeParameter("broadcaster_id", i) });
			if (operation === "getClipsDownload") await getRequest("/clips", { id: this.getNodeParameter("clip_id", i) });
			if (operation === "getVideos") await getRequest("/videos", { user_id: this.getNodeParameter("user_id", i) });
			if (operation === "getSchedule") await getRequest("/schedule", { broadcaster_id: this.getNodeParameter("broadcaster_id", i) });
			if (operation === "getChannelIcalendar") {
				const response = await twitchApiRequest.call(
					this,
					"GET",
					"/schedule/icalendar",
					{},
					{ broadcaster_id: this.getNodeParameter("broadcaster_id", i) },
					{ json: false, headers: { Accept: "text/calendar" } },
				);
				returnData.push({ icalendar: response });
			}
			if (operation === "getTeamsByChannel") await getRequest("/teams/channel", { broadcaster_id: this.getNodeParameter("broadcaster_id", i) });
			if (operation === "getTeams") {
				const teamName = this.getNodeParameter("team_name", i) as string;
				const teamId = this.getNodeParameter("team_id", i) as string;
				const params: IDataObject = {};
				if (teamName) params.name = teamName;
				if (teamId) params.id = teamId;
				await getRequest("/teams", params);
			}
			if (operation === "getChannelFollowers") {
				const first = this.getNodeParameter("followers_first", i) as number;
				const params: IDataObject = { broadcaster_id: this.getNodeParameter("broadcaster_id", i) };
				if (first) params.first = first;
				const response = await twitchApiRequest.call(this, "GET", "/channels/followers", {}, params, headers);
				if (Array.isArray(response.data)) returnData.push(...response.data);
				else if (response.data) returnData.push(response.data);
				if (response.total !== undefined) returnData.push({ total: response.total });
				if (!response.data && response.total === undefined && response.pagination === undefined) {
					returnData.push(response);
				}
			}
			if (operation === "getBitsLeaderboard") await getRequest("/bits/leaderboard", { broadcaster_id: this.getNodeParameter("broadcaster_id", i), count: this.getNodeParameter("limit", i), period: this.getNodeParameter("bits_period", i) });
			if (operation === "getChannelEditors") await getRequest("/channels/editors", { broadcaster_id: this.getNodeParameter("broadcaster_id", i) });
			if (operation === "getFollowedChannels") await getRequest("/channels/followed", { user_id: this.getNodeParameter("user_id", i) });
			if (operation === "getCustomRewards") {
				const rewardId = this.getNodeParameter("reward_id", i) as string;
				const params: IDataObject = { broadcaster_id: this.getNodeParameter("broadcaster_id", i) };
				if (rewardId) params.id = rewardId;
				await getRequest("/channel_points/custom_rewards", params);
			}
			if (operation === "getCustomRewardRedemptions") {
				const rewardId = this.getNodeParameter("reward_id", i) as string;
				if (!rewardId) {
					throw new Error("Reward ID is required for Get Custom Reward Redemptions");
				}
				await getRequest("/channel_points/custom_rewards/redemptions", { broadcaster_id: this.getNodeParameter("broadcaster_id", i), reward_id: rewardId });
			}
			if (operation === "getCharityCampaign") await getRequest("/charity/campaigns", { broadcaster_id: this.getNodeParameter("broadcaster_id", i) });
			if (operation === "getCharityCampaignDonations") await getRequest("/charity/donations", { broadcaster_id: this.getNodeParameter("broadcaster_id", i) });
			if (operation === "getChatters") await getRequest("/chat/chatters", { broadcaster_id: this.getNodeParameter("broadcaster_id", i), moderator_id: this.getNodeParameter("moderator_id", i), first: this.getNodeParameter("limit", i) });
			if (operation === "getChannelEmotes") await getRequest("/chat/emotes", { broadcaster_id: this.getNodeParameter("broadcaster_id", i) });
			if (operation === "getGlobalEmotes") await getRequest("/chat/emotes/global");
			if (operation === "getEmoteSets") {
				const raw = this.getNodeParameter("emote_set_id", i) as string;
				const ids = raw.split(",").map(s => s.trim()).filter(Boolean);
				await getRequest("/chat/emotes/set", { emote_set_id: ids.length ? ids : raw });
			}
			if (operation === "getChannelChatBadges") await getRequest("/chat/badges", { broadcaster_id: this.getNodeParameter("broadcaster_id", i) });
			if (operation === "getGlobalChatBadges") await getRequest("/chat/badges/global");
			if (operation === "getChatSettings") await getRequest("/chat/settings", { broadcaster_id: this.getNodeParameter("broadcaster_id", i), moderator_id: this.getNodeParameter("moderator_id", i) });
			if (operation === "getUserEmotes") await getRequest("/chat/emotes/user", { user_id: this.getNodeParameter("user_id", i) });
			if (operation === "getContentClassificationLabels") await getRequest("/content_classification_labels");
			if (operation === "getCreatorGoals") await getRequest("/goals", { broadcaster_id: this.getNodeParameter("broadcaster_id", i) });
			if (operation === "getAutoModSettings") await getRequest("/moderation/automod/settings", { broadcaster_id: this.getNodeParameter("broadcaster_id", i), moderator_id: this.getNodeParameter("moderator_id", i) });
			if (operation === "getBannedUsers") await getRequest("/moderation/banned", { broadcaster_id: this.getNodeParameter("broadcaster_id", i), moderator_id: this.getNodeParameter("moderator_id", i), first: this.getNodeParameter("limit", i) });
			if (operation === "getUnbanRequests") await getRequest("/moderation/unban_requests", { broadcaster_id: this.getNodeParameter("broadcaster_id", i), moderator_id: this.getNodeParameter("moderator_id", i), first: this.getNodeParameter("limit", i) });
			if (operation === "getBlockedTerms") await getRequest("/moderation/blocked_terms", { broadcaster_id: this.getNodeParameter("broadcaster_id", i), moderator_id: this.getNodeParameter("moderator_id", i), first: this.getNodeParameter("limit", i) });
			if (operation === "getModeratedChannels") await getRequest("/moderation/channels", { user_id: this.getNodeParameter("user_id", i) });
			if (operation === "getModerators") await getRequest("/moderation/moderators", { broadcaster_id: this.getNodeParameter("broadcaster_id", i), first: this.getNodeParameter("limit", i) });
			if (operation === "getVips") await getRequest("/channels/vips", { broadcaster_id: this.getNodeParameter("broadcaster_id", i), first: this.getNodeParameter("limit", i) });
			if (operation === "getShieldModeStatus") await getRequest("/moderation/shield_mode", { broadcaster_id: this.getNodeParameter("broadcaster_id", i), moderator_id: this.getNodeParameter("moderator_id", i) });
			if (operation === "getPolls") await getRequest("/polls", { broadcaster_id: this.getNodeParameter("broadcaster_id", i), first: this.getNodeParameter("polls_limit", i) });
			if (operation === "getPredictions") await getRequest("/predictions", { broadcaster_id: this.getNodeParameter("broadcaster_id", i), first: this.getNodeParameter("predictions_limit", i) });
			if (operation === "getFollowedStreams") await getRequest("/streams/followed", { user_id: this.getNodeParameter("user_id", i), first: this.getNodeParameter("limit", i) });
			if (operation === "getStreamMarkers") {
				const params: IDataObject = { user_id: this.getNodeParameter("user_id", i), first: this.getNodeParameter("limit", i) };
				const videoId = this.getNodeParameter("video_id", i) as string;
				if (videoId) params.video_id = videoId;
				await getRequest("/streams/markers", params);
			}
			if (operation === "getBroadcasterSubscriptions") await getRequest("/subscriptions", { broadcaster_id: this.getNodeParameter("broadcaster_id", i), first: this.getNodeParameter("limit", i) });
			if (operation === "checkUserSubscription") await getRequest("/subscriptions/user", { broadcaster_id: this.getNodeParameter("broadcaster_id", i), user_id: this.getNodeParameter("user_id", i) });
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
