import {
	ICredentialTestFunctions,
	ICredentialsDecrypted,
	IDataObject,
	IHookFunctions,
	INodeCredentialTestResult,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData
} from 'n8n-workflow';

import { twitchApiRequest } from './GenericFunctions.js';

async function twitchAppRequest(
	this: IHookFunctions,
	method: string,
	resource: string,
	body: IDataObject = {},
	query: IDataObject = {},
): Promise<any> {
	const credentials = (await this.getCredentials('twitchApi')) as IDataObject;
	const clientId = credentials.clientId as string;
	const clientSecret = credentials.clientSecret as string;

	const tokenResponse = await this.helpers.request({
		method: 'POST',
		uri: 'https://id.twitch.tv/oauth2/token',
		qs: {
			client_id: clientId,
			client_secret: clientSecret,
			grant_type: 'client_credentials',
		},
		json: true,
	});

	const endpoint = 'https://api.twitch.tv/helix';
	const options = {
		method,
		uri: `${endpoint}${resource}`,
		qs: Object.keys(query).length ? query : undefined,
		body: Object.keys(body).length ? body : undefined,
		headers: {
			'Client-Id': clientId,
			Authorization: `Bearer ${tokenResponse.access_token}`,
			'Content-Type': 'application/json',
		},
		json: true,
	};

	return await this.helpers.request(options);
}

export class TwitchTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Trigger',
		name: 'twitchTrigger',
		icon: 'file:twitch.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Handle Twitch events via webhooks',
		defaults: {
			name: 'Twitch Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'twitchApi',
				required: true,
				testedBy: 'testTwitchAuth',
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				default: 'stream.online',
				options: [
					{
						name: 'Channel Follow',
						value: 'channel.follow',
					},
					{
						name: 'Channel Raid',
						value: 'channel.raid',
					},
					{
						name: 'Channel Subscribe',
						value: 'channel.subscribe',
					},
					{
						name: 'Channel Subscription Gift',
						value: 'channel.subscription.gift',
					},
					{
						name: 'Channel Subscription Message',
						value: 'channel.subscription.message',
					},
					{
						name: 'Channel Goal Begin',
						value: 'channel.goal.begin',
					},
					{
						name: 'Channel Goal Progress',
						value: 'channel.goal.progress',
					},
					{
						name: 'Channel Goal End',
						value: 'channel.goal.end',
					},
					{
						name: 'Channel Hype Train Begin',
						value: 'channel.hype_train.begin',
					},
					{
						name: 'Channel Hype Train Progress',
						value: 'channel.hype_train.progress',
					},
					{
						name: 'Channel Hype Train End',
						value: 'channel.hype_train.end',
					},
					{
						name: 'Channel Charity Campaign Start',
						value: 'channel.charity_campaign.start',
					},
					{
						name: 'Channel Charity Campaign Progress',
						value: 'channel.charity_campaign.progress',
					},
					{
						name: 'Channel Charity Campaign Stop',
						value: 'channel.charity_campaign.stop',
					},
					{
						name: 'Channel Charity Donation',
						value: 'channel.charity_donation',
					},
					{
						name: 'Channel Cheer',
						value: 'channel.cheer',
					},
					{
						name: 'Channel Points Reward Add',
						value: 'channel.channel_points_custom_reward.add',
					},
					{
						name: 'Channel Points Reward Update',
						value: 'channel.channel_points_custom_reward.update',
					},
					{
						name: 'Channel Points Reward Remove',
						value: 'channel.channel_points_custom_reward.remove',
					},
					{
						name: 'Channel Points Redemption Add',
						value: 'channel.channel_points_custom_reward_redemption.add',
					},
					{
						name: 'Channel Points Redemption Update',
						value: 'channel.channel_points_custom_reward_redemption.update',
					},
					{
						name: 'Channel Ban',
						value: 'channel.ban',
					},
					{
						name: 'Channel Unban',
						value: 'channel.unban',
					},
					{
						name: 'Channel Moderator Add',
						value: 'channel.moderator.add',
					},
					{
						name: 'Channel Moderator Remove',
						value: 'channel.moderator.remove',
					},
					{
						name: 'Channel Update',
						value: 'channel.update',
					},
					{
						name: 'Stream Offline',
						value: 'stream.offline',
					},
					{
						name: 'Stream Online',
						value: 'stream.online',
					},
				],
			},
			{
				displayName: 'Channel',
				name: 'channel_name',
				type: 'string',
				required: true,
				default: '',
			},
			{
				displayName: 'Moderator User ID',
				name: 'moderator_user_id',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						event: [
							'channel.follow',
							'channel.ban',
							'channel.unban',
						],
					},
				},
			},
			{
				displayName: 'Reward ID',
				name: 'reward_id',
				type: 'string',
				required: false,
				default: '',
				displayOptions: {
					show: {
						event: [
							'channel.channel_points_custom_reward_redemption.add',
							'channel.channel_points_custom_reward_redemption.update',
						],
					},
				},
			},
		],
	};

	methods = {
		credentialTest: {
			async testTwitchAuth(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				const credentials = credential.data;

				const optionsForAppToken = {
					headers: {
						'Content-Type': 'application/json',
					},
					method: 'POST',
					qs: {
						client_id: credentials!.clientId,
						client_secret: credentials!.clientSecret,
						grant_type: 'client_credentials',
					},
					uri: 'https://id.twitch.tv/oauth2/token',
					json: true,
				};

				try {
					const response = await this.helpers.request(optionsForAppToken);
					if (!response.access_token) {
						return {
							status: 'Error',
							message: 'AccessToken not received',
						};
					}
				} catch (err: unknown) {
					if (err instanceof Error) {
						return {
							status: 'Error',
							message: `Error getting access token; ${err.message}`,
						};
					}
				}

				return {
					status: 'OK',
					message: 'Authentication successful!',
				};
			},
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;
				const { data: webhooks } = await twitchAppRequest.call(
					this,
					'GET',
					'/eventsub/subscriptions',
				);
				for (const webhook of webhooks) {
					if (
						webhook.transport.callback === webhookUrl &&
						webhook.type === event
					) {
						webhookData.webhookId = webhook.id;
						return true;
					}
				}
				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const webhookData = this.getWorkflowStaticData('node');
				const event = this.getNodeParameter('event');
				const channel = this.getNodeParameter('channel_name') as string;
				const moderatorUserId = this.getNodeParameter('moderator_user_id', 0) as string;
				const rewardId = this.getNodeParameter('reward_id', 0) as string;
				const userData = await twitchAppRequest.call(
					this,
					'GET',
					'/users',
					{},
					{ login: channel },
				);
				const condition: IDataObject = {
					broadcaster_user_id: userData.data[0].id ?? '',
				};

				if (event === 'channel.follow' || event === 'channel.ban' || event === 'channel.unban') {
					condition.moderator_user_id = moderatorUserId || condition.broadcaster_user_id;
				}

				if (
					event === 'channel.channel_points_custom_reward_redemption.add' ||
					event === 'channel.channel_points_custom_reward_redemption.update'
				) {
					if (rewardId) condition.reward_id = rewardId;
				}

				const body = {
					type: event,
					version: '1',
					condition,
					transport: {
						method: 'webhook',
						callback: webhookUrl,
						secret: 'n8ncreatedSecret',
					},
				};
				const webhook = await twitchAppRequest.call(
					this,
					'POST',
					'/eventsub/subscriptions',
					body,
				);
				webhookData.webhookId = webhook.data[0].id;
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				try {
					await twitchAppRequest.call(
						this,
						'DELETE',
						'/eventsub/subscriptions',
						{},
						{ id: webhookData.webhookId },
					);
				} catch (error) {
					return false;
				}
				delete webhookData.webhookId;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData() as IDataObject;
		const res = this.getResponseObject();
		const req = this.getRequestObject();

		// Check if we're getting twitch challenge request to validate the webhook that has been created.
		if (bodyData['challenge']) {
			res.status(200).send(bodyData['challenge']).end();
			return {
				noWebhookResponse: true,
			};
		}

		return {
			workflowData: [this.helpers.returnJsonArray(req.body)],
		};
	}
}
