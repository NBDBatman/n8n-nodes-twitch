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
					{ name: "Get Top Games", value: "getTopGames" },
					{ name: "Search Categories", value: "searchCategories" },
					{ name: "Search Channels", value: "searchChannels" },
					{ name: "Get Users", value: "getUsers" },
					{ name: "Get Clips", value: "getClips" },
					{ name: "Get Videos", value: "getVideos" },
					{ name: "Get App Access Token", value: "getAppAccessToken" },
					{ name: "Get Schedule", value: "getSchedule" },
					{ name: "Get Teams by Channel", value: "getTeamsByChannel" },
				],
			},
			{ displayName: "Channel Name", name: "channel_name", type: "string", required: true, default: "", displayOptions: { show: { operation: ["getChannelStreams"] } } },
			{ displayName: "Broadcaster ID", name: "broadcaster_id", type: "string", required: true, default: "", displayOptions: { show: { operation: ["getChannelInformation", "getClips", "getSchedule", "getTeamsByChannel"] } } },
			{ displayName: "User ID", name: "user_id", type: "string", required: true, default: "", displayOptions: { show: { operation: ["getVideos"] } } },
			{ displayName: "Query", name: "query", type: "string", required: true, default: "", displayOptions: { show: { operation: ["searchChannels", "searchCategories"] } } },
			{ displayName: "Game Name", name: "game_name", type: "string", required: true, default: "", displayOptions: { show: { operation: ["getGameDetails"] } } },
			{ displayName: "Game ID", name: "game_id", type: "string", required: true, default: "", displayOptions: { show: { operation: ["getGamesById"] } } },
			{ displayName: "Limit", name: "limit", type: "number", typeOptions: { minValue: 1 }, default: 50, displayOptions: { show: { operation: ["getTopGames"] } } },
			{ displayName: "Username", name: "username", type: "string", required: true, default: "", displayOptions: { show: { operation: ["getUsers"] } } },
		],
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];

		for (let i = 0; i < items.length; i++) {
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
				else returnData.push(response);
			};

			if (operation === "getChannelStreams") await getRequest("/streams", { user_login: this.getNodeParameter("channel_name", i) });
			if (operation === "getChannelInformation") await getRequest("/channels", { broadcaster_id: this.getNodeParameter("broadcaster_id", i) });
			if (operation === "searchChannels") await getRequest("/search/channels", { query: this.getNodeParameter("query", i) });
			if (operation === "searchCategories") await getRequest("/search/categories", { query: this.getNodeParameter("query", i) });
			if (operation === "getGameDetails") await getRequest("/games", { name: this.getNodeParameter("game_name", i) });
			if (operation === "getGamesById") await getRequest("/games", { id: this.getNodeParameter("game_id", i) });
			if (operation === "getTopGames") await getRequest("/games/top", { first: this.getNodeParameter("limit", i) });
			if (operation === "getUsers") await getRequest("/users", { login: this.getNodeParameter("username", i) });
			if (operation === "getClips") await getRequest("/clips", { broadcaster_id: this.getNodeParameter("broadcaster_id", i) });
			if (operation === "getVideos") await getRequest("/videos", { user_id: this.getNodeParameter("user_id", i) });
			if (operation === "getSchedule") await getRequest("/schedule", { broadcaster_id: this.getNodeParameter("broadcaster_id", i) });
			if (operation === "getTeamsByChannel") await getRequest("/teams/channel", { broadcaster_id: this.getNodeParameter("broadcaster_id", i) });
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
